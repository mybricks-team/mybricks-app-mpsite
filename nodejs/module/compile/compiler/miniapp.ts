import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import { BaseCompiler } from "./base";
import * as pako from "pako";

import { CompileType, DepModules } from "./types";

class MiniappCompiler extends BaseCompiler {
  validateData = (data) => {
    this.transformData({ data });
  };

  /** 根据页面Json生成每个页面的CSS */
  genCssFromPageJson = (pageJson) => {
    let targetStyleContent = [];

    const jsonComs = this.getComsFromPageJson(pageJson);

    Object.keys(jsonComs).forEach((key) => {
      let styleAry = jsonComs[key]?.model?.style?.styleAry || [];
      styleAry.forEach((item) => {
        let { selector, css } = item;
        targetStyleContent.push(`
        .${key} ${selector} {
          ${transformStyle(css)} 
        }
        `);
      });
    });

    function transformStyle(obj) {
      let result = [];
      Object.keys(obj).forEach((key) => {
        if (key !== "styleEditorUnfold") {
          result.push(`${camelToKebab(key)}: ${px2rpx(obj[key])};`);
        }
      });
      return result.join("\n");
    }

    function camelToKebab(str) {
      return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    }

    function px2rpx(value) {
      const regex = /(\d*\.?\d+)px/g;
      const result = value.replace(regex, (match, p1) => {
        const pxValue = parseFloat(p1);
        if (pxValue <= 2) {
          return `${pxValue}px`;
        } else {
          const rpxValue = pxValue * 2;
          return `${rpxValue}rpx`;
        }
      });
      return result;
    }

    return targetStyleContent.join("\n");
  };

  genAllComponentsDefs = (allComponents) => {
    const { map } = allComponents;

    const componentsFolder = path.resolve(this.projectPath, "./components");
    fse.ensureDirSync(componentsFolder);

    let comDefHeader: string[] = [];
    let comDefBody: string[] = [];

    Object.keys(map).forEach((nameAndVer, index) => {
      const [namespace, version] = nameAndVer.split("@");
      const { runtime } = map[nameAndVer];
      // JS计算特殊处理
      if (
        ["mybricks.taro._muilt-inputJs", "mybricks.taro.systemTabbar"].includes(
          namespace
        )
      ) {
        comDefBody.push(`
        "${namespace}-${version}":{
          "namespace": "${namespace}",
          "version": "${version}",
        }
      `);
        comDefBody.push(`
          "${namespace}":{
            "namespace": "${namespace}",
            "version": "${version}",
          }
        `);
        return;
      }

      let comFileName = namespace.replace(/\./g, "_");
      comDefHeader.push(
        `var com${index} = require("./${comFileName}").default;`
      );

      comDefBody.push(`
        "${namespace}-${version}":{
          "namespace": "${namespace}",
          "version": "${version}",
          "runtime": com${index}
        }
      `);
      comDefBody.push(`
        "${namespace}":{
          "namespace": "${namespace}",
          "version": "${version}",
          "runtime": com${index}
        }
      `);

      fse.writeFileSync(
        path.resolve(componentsFolder, `./${comFileName}.js`),
        decodeURIComponent(runtime),
        "utf-8"
      );
    });

    let content = "";
    content += `${comDefHeader.join("\r")}`;
    content += "\r";
    content += `module.exports = { ${comDefBody.join(",")} };`;
    fs.writeFileSync(
      path.resolve(componentsFolder, "./comDefs.js"),
      content,
      "utf-8"
    );
  };
}

export const compilerMiniapp = async (
  { data, projectPath, projectName, fileName, depModules, origin, type }: any,
  { Logger }
) => {
  const compiler = new MiniappCompiler({ projectPath });

  const adpter = new Adapter();

  compiler.validateData(data);

  // 修正tabbr数据，去除已经不存在的tabbar页面
  const tabBarJson = (data.tabBarJson || []).filter((t) => {
    return (
      (data.appConfig?.pages || []).findIndex((p) => p === t.pagePath) > -1
    );
  });

  // 写入全局依赖
  await writeDeps(projectPath, depModules);

  // 写入全局Tabbar配置，务必在全局配置之前，要生成tabbar
  if (
    [CompileType.alipay, CompileType.dd].includes(type) &&
    tabBarJson.length
  ) {
    // 不支持自定义tabbar的修改为非自定义
    const { tabBar } = data.appConfig;
    tabBar.textColor = tabBarJson?.[0]?.normalTextStyle?.color;
    tabBar.selectedColor = tabBarJson?.[0]?.selectedTextStyle?.color;
    tabBar.items = (tabBarJson || []).map((c) => ({
      pagePath: c.pagePath,
      name: c.text,
      icon: c.normalIconPath,
      activeIcon: c.selectedIconPath,
    }));
  } else {
    // list被赋值的话，必须要大于2的数组
    if (Array.isArray(tabBarJson) && tabBarJson.length > 1) {
      data.appConfig.tabBar = data.appConfig.tabBar || {};
      data.appConfig.tabBar.list = (tabBarJson || []).map((c) => ({
        pagePath: c.pagePath,
      }));
    }

    const filePath = path.resolve(
      path.resolve(projectPath, "./custom-tab-bar"),
      "./mybricks/tabbar-config.js"
    );
    await fse.ensureDir(
      path.resolve(path.resolve(projectPath, "./custom-tab-bar"), "./mybricks")
    );
    fse.writeFileSync(
      filePath,
      `module.exports = ${JSON.stringify(tabBarJson)}`,
      { encoding: "utf8" }
    );
  }

  // 多端window配置兼容
  adpter.pageJsonTransform(data.appConfig.window, type);

  // 写入全局配置
  fse.writeJSONSync(path.resolve(projectPath, "./app.json"), data.appConfig);

  // 全局样式添加
  let css = fs.readFileSync(
    path.resolve(projectPath, `./app${getExtName(FileType.css, type)}`),
    { encoding: "utf-8" }
  );
  css += `Page{--primary-color: #fa6400}`;
  if ([CompileType.alipay, CompileType.dd].includes(type)) {
    //
    css += "button{padding-left: 14px;padding-right:14px}";
  }
  fs.writeFileSync(
    path.resolve(projectPath, `./app${getExtName(FileType.css, type)}`),
    css
  );

  // 定义路由跳转的map，分包后
  let routeMap = {};

  // 创建页面文件夹
  for (let i = 0; i < data.pages.length; i++) {
    let page = data.pages[i];
    const pageId = page.pagePath.split("/")[1];
    const source = path.resolve(projectPath, "./pages/index");
    const target = path.resolve(projectPath, `./pages/${pageId}`);

    if (source !== target) {
      // index无需替换
      fse.copySync(source, target);
    }

    // 写入页面级注入的数据
    writePageConfig(
      target,
      pageId,
      JSON.stringify({
        toJson: page.pageToJson,
      })
    );

    // 写入特殊的 fxFrame
    let pageOnLoadFx = data.fxFrames.find((fxFrame) => {
      return fxFrame.name === "pageOnLoad";
    });
    writePageFx(
      target,
      pageId,
      JSON.stringify({
        pageOnLoad: pageOnLoadFx,
      })
    );

    //注入页面级CSS，主要是Style声明的部分
    let targetStylePath = path.resolve(
      target,
      `./index${getExtName(FileType.css, type)}`
    );
    fse.writeFileSync(targetStylePath, page.cssContent || "", "utf-8");

    // 更新页面级别的 index.json
    let targetConfigPath = path.resolve(target, "./index.json");

    // 多端window配置兼容
    adpter.pageJsonTransform(page.pageConfig, type);

    const configContent = JSON.stringify({
      ...(type === "weapp"
        ? {
            // 不支持递归的小程序需要添加全局的comp
            usingComponents: {
              comp: "../../comp",
            },
          }
        : {}),
      ...page.pageConfig,
    });
    fse.writeFileSync(targetConfigPath, configContent, "utf-8");
  }

  // 写入所有组件
  if (data.allComponents.map) {
    await compiler.genAllComponentsDefs(data.allComponents);
  }

  // 写入所有组件Css
  if (data.allComponents?.css) {
    let allCompCss = fs.readFileSync(
      path.resolve(projectPath, `./app${getExtName(FileType.css, type)}`),
      { encoding: "utf-8" }
    );
    allCompCss += data.allComponents?.css;
    fs.writeFileSync(
      path.resolve(projectPath, `./app${getExtName(FileType.css, type)}`),
      allCompCss
    );
  }

  /** 注入所有动态JS */
  const injectCodePath = path.resolve(projectPath, "./mybricks/inject-code.js");
  fse.ensureDirSync(path.resolve(projectPath, "./mybricks"));
  fse.writeFileSync(
    injectCodePath,
    `module.exports = (function(comModules) {
    ${decodeURIComponent(data.allModules)};
    console.log('allComModules', comModules)
    return comModules;
  })({})`,
    { encoding: "utf8" }
  );
  delete data.allModules;

  // 替换页面js文件
  for (let i = 0; i < data.pages.length; i++) {
    let page = data.pages[i];

    const pageId = page.pagePath.split("/")[1];
    const target = path.resolve(projectPath, `./pages/${pageId}`);

    // 修改index.js 中的pagepath，保证taro能够加载正常的页面
    modifyFileContent(path.resolve(target, "./index.js"), (str) => {
      return str.replace(/pages\/index/g, page.pagePath);
    });

    routeMap[pageId] = {
      path: `/${page.pagePath}`,
      isTabbar: (tabBarJson || []).some(
        (b) => b?.pagePath?.indexOf(pageId) > -1
      ),
    };

    // 修改index.js 中的引入的config名称，保证每次个config都是独立的，因为external名称一样的话都是一个引用
    modifyFileContent(path.resolve(target, "./index.js"), (str) => {
      return str.replace(
        /\/mybricks\/page-fx/g,
        `/mybricks/${pageId}-fx`
      );
    });

    // 修改index.js 中的引入的config名称，保证每次个config都是独立的，因为external名称一样的话都是一个引用
    modifyFileContent(path.resolve(target, "./index.js"), (str) => {
      return str.replace(
        /\/mybricks\/page-config/g,
        `/mybricks/${pageId}-config`
      );
    });
  }

  // --- 分包逻辑 ---
  const SPLIT_PACK_LIMIT = 500 * 1024,
    SINGLE_PACK_LIMIT = 400 * 1024; //
  const whiteList = [
    "404",
    "index",
    "login",
    "main",
    ...(tabBarJson || []).map((t) => t?.pagePath?.split("/")?.[1]),
  ];

  const { total, pageSizes } = await getFolderSize(
    path.resolve(projectPath, "./pages")
  );

  // 大于 800KB pages开启分包
  // 开发模式下暂不分包，避免小程序 IDE 经常 GG
  if (total > SPLIT_PACK_LIMIT) {
    Logger.info(
      `[miniapp-compiler] 小程序${projectName}大小为${total}，使用分包策略`
    );

    let mainPackageSize = 0;
    const subPages = pageSizes.filter((t) => {
      return !whiteList.includes(t.name);
      // if (!whiteList.includes(t.name)) {
      //   return true;
      // }

      // // 避免白名单内的包体积总和过大
      // if (mainPackageSize + t.size < SINGLE_PACK_LIMIT) {
      //   mainPackageSize += t.size;
      // } else {
      //   console.log(`主包过大，${t.name} 分包`);
      //   return true;
      // }
    });

    let subPackages: any[] = [];
    let subIndex = 0;

    // 规划分几个包
    for (let index = 0; index < subPages.length; index++) {
      const subPage = subPages[index];

      if (!subPackages[subIndex]) {
        subPackages.push({
          root: `package${subIndex}`,
          name: `package${subIndex}`,
          pages: [],
        });
      }
      subPackages[subIndex].pages.push(subPage);

      if (
        (subPackages[subIndex]?.pages || []).reduce((a, c) => a + c.size, 0) >
        SINGLE_PACK_LIMIT
      ) {
        subIndex++;
        continue;
      }
    }

    // 修改目录结构为分包结构
    subPackages.forEach((pkg) => {
      const pkgTarget = path.resolve(projectPath, `./${pkg.root}`);
      fse.ensureDirSync(pkgTarget);
      pkg.pages.forEach((page) => {
        fse.moveSync(
          path.resolve(projectPath, `./pages/${page.name}`),
          path.resolve(pkgTarget, `./pages/${page.name}`),
          { overwrite: true }
        );

        const newPagePath = `${pkg.root}/pages/${page.name}/index`;
        // 重新修改页面的index.js
        modifyFileContent(
          path.resolve(pkgTarget, `./pages/${page.name}`, "./index.js"),
          (str) => {
            return str.replace(
              new RegExp(`pages/${page.name}/index`, "g"),
              newPagePath
            );
          }
        );
        routeMap[page.name] = {
          path: `/${newPagePath}`,
          isTabbar: false, // 分包的都是非tabbar页面
        };

        // 修改相对路径
        modifyFileContent(
          path.resolve(
            pkgTarget,
            `./pages/${page.name}`,
            `./index${getExtName(FileType.html, type)}`
          ),
          (str) => {
            return str.replace(/..\/..\//g, "../../../");
          }
        );

        // 修改相对路径
        modifyFileContent(
          path.resolve(pkgTarget, `./pages/${page.name}`, "./index.json"),
          (str) => {
            return str.replace(/..\/..\//g, "../../../");
          }
        );
      });
    });

    // 格式化成小程序的subPackages
    subPackages = subPackages.map((pkg) => {
      return {
        ...pkg,
        pages: pkg.pages.map((p) => `pages/${p.name}/index`),
      };
    });

    // 修改app.json
    let appJson: any = fse.readJsonSync(
      path.resolve(projectPath, "./app.json")
    );
    appJson.subPackages = subPackages;
    appJson.pages = appJson.pages.filter((p) =>
      whiteList.includes(p.split("/")[1])
    );
    fse.writeJsonSync(path.resolve(projectPath, "./app.json"), appJson);
  } else {
    Logger.info(
      `[miniapp-compiler] 小程序${projectName}大小为${total}，无需分包`
    );
  }

  // --- 分包逻辑 ---

  // 删除 index 和 404 页面
  fse.removeSync(path.resolve(projectPath, "./pages/index"));
  fse.removeSync(path.resolve(projectPath, "./pages/404"));

  //注入全局配置
  let cloneStatus = JSON.parse(JSON.stringify(data.status));
  delete cloneStatus.appsecret;

  // 注入全局的域名配置
  if (!cloneStatus.serviceDomain) {
    cloneStatus.serviceDomain = data.status?.callServiceHost || origin;
  }

  // 服务
  cloneStatus.serviceFx = {
    url: data.serviceFxUrl,
    env: data.status.apiEnv
  };

  writeRootConfig(
    projectPath,
    JSON.stringify({
      status: cloneStatus,
      routeMap,
      scenes: data.scenes, // 用于给render-taro创建全局多场景的交互
      fxFrames: data.fxFrames, // 用于给render-taro创建全局Fx的实现
    })
  );

  // 写入项目project.config.json，只影响开发者工具
  const projectConfigJsonPath = path.resolve(
    projectPath,
    "./project.config.json"
  );
  if (await fse.exists(projectConfigJsonPath)) {
    const projectConfigJson = await fse.readJson(projectConfigJsonPath);
    const newProjectConfigJson = Object.assign(
      projectConfigJson,
      adpter.getProjectJson({ fileName, appId: cloneStatus.appid }, type)
    );
    await fse.writeJSON(projectConfigJsonPath, newProjectConfigJson, {
      encoding: "utf-8",
    });
  }
};

/** 写入依赖 */
async function writeDeps(projectPath, depModules) {
  let depHeaders = ``;
  let depExports = ``;

  const folderPath = path.resolve(projectPath, "./dynamic-externals");

  await fse.ensureDir(folderPath);

  for (let index = 0; index < depModules.length; index++) {
    const dep = depModules[index];
    const basename = path.basename(dep.urls?.[0]);

    await fse.copyFile(dep.urls?.[0], path.resolve(folderPath, basename));

    const importName = dep.library ?? dep.name;
    depHeaders += `const ${importName} = require('./${basename}');
    `;
    depExports += `F2: F2,
    `;
  }

  await fse.writeFile(
    path.resolve(projectPath, "./dynamic-externals/index.js"),
    `${depHeaders}
module.exports = {
  ${depExports}
}
`
  );
}

/** 写tabbar，config文件 */
function writeTabbarConfig(dir, str) {
  const filePath = path.resolve(dir, "./mybricks/tabbar-config.js");
  fse.ensureDirSync(path.resolve(dir, "./mybricks"));
  fse.writeFileSync(filePath, `module.exports = ${str}`, { encoding: "utf8" });
}

/** 写app级，config文件 */
function writeRootConfig(dir, str) {
  const filePath = path.resolve(dir, "./mybricks/root-config.js");
  fse.ensureDirSync(path.resolve(dir, "./mybricks"));
  fse.writeFileSync(filePath, `module.exports = ${str}`, { encoding: "utf8" });
}

/** 写page级，config文件 */
function writePageConfig(dir, pageId, str) {
  const filePath = path.resolve(dir, `./mybricks/${pageId}-config.js`);
  fse.ensureDirSync(path.resolve(dir, "./mybricks"));

  //str 压缩
  const compressed = pako.deflate(str, { to: "string" });
  const compressedString = Buffer.from(compressed).toString("base64");

  fse.writeFileSync(filePath, `module.exports = "${compressedString}"`, {
    encoding: "utf8",
  });
}

function writePageFx(dir, pageId, str) {
  const filePath = path.resolve(dir, `./mybricks/${pageId}-fx.js`);
  fse.ensureDirSync(path.resolve(dir, "./mybricks"));

  fse.writeFileSync(filePath, `module.exports = ${JSON.stringify(str)}`, {
    encoding: "utf8",
  });
}

function modifyFileContent(path, callback) {
  let str = fs.readFileSync(path, "utf8");
  str = callback?.(str);
  fs.writeFileSync(path, str, { encoding: "utf8" });
}

async function getFolderSize(folderPath, pageSizes = [], len = 0) {
  try {
    const stats = await fse.stat(folderPath);
    // 如果是文件，则直接返回大小
    if (stats.isFile()) {
      return {
        total: stats.size,
        name: "file",
      };
    }
    // 如果是文件夹，则递归计算子文件和子文件夹的大小
    else if (stats.isDirectory()) {
      let totalSize = 0;
      const files = await fse.readdir(folderPath);
      for (const file of files) {
        const filePath = `${folderPath}/${file}`;
        const folderSize = await getFolderSize(filePath, pageSizes, len + 1);
        if (len === 0) {
          pageSizes.push({
            name: file,
            size: folderSize.total,
          });
        }
        totalSize += folderSize.total;
      }
      return {
        total: totalSize,
        pageSizes,
      };
    }
  } catch (error) {
    return {
      total: 0,
      name: "error",
    };
  }
}

enum FileType {
  css = "css",
  html = "html",
}

function getExtName(fileType: FileType, type: CompileType) {
  switch (true) {
    case type === CompileType.weapp && fileType === FileType.css: {
      return `.wxss`;
    }
    case [CompileType.alipay, CompileType.dd].includes(type) &&
      fileType === FileType.css: {
      return `.acss`;
    }
    case type === CompileType.weapp && fileType === FileType.html: {
      return `.wxml`;
    }
    case [CompileType.alipay, CompileType.dd].includes(type) &&
      fileType === FileType.html: {
      return `.axml`;
    }
  }
}

// 按引用值，将微信小程序的配置转为其他平台的配置，其实默认是微信小程序不合理，但是已经实现了咋办呢，默认理论上应该是taro配置
class Adapter {
  pageJsonTransform = (window, target: CompileType) => {
    if (!window) {
      return;
    }
    switch (true) {
      case [CompileType.alipay, CompileType.dd].includes(target): {
        delete window.navigationStyle;

        window.allowsBounceVertical = false; // 默认关闭

        // 标题转换
        window.defaultTitle = window.navigationBarTitleText;
        delete window.navigationBarTitleText;

        // 窗口背景色
        window.backgroundColor = window.backgroundColor;

        // 导航栏背景色
        window.titleBarColor = window.navigationBarBackgroundColor;
        delete window.navigationBarBackgroundColor;

        // 导航栏前景色
        window.navigationBarFrontColor = window.navigationBarTextStyle;
        delete window.navigationBarTextStyle;
        return;
      }
    }
  };

  getProjectJson = ({ fileName, appId }, target: CompileType) => {
    switch (true) {
      case [CompileType.weapp].includes(target): {
        return {
          projectname: fileName,
          description: `MyBricks搭建的项目 ${fileName}`,
          appid: appId,
        };
      }
    }

    return {};
  };
}
