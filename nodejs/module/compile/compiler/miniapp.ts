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

  genSubComponentsDefs = async (pkgTarget: string, pkgId: string, depComponents: [{ namespace: string, version: string, runtimePath: string }]) => {
    if (!Array.isArray(depComponents) || depComponents.length < 1) {
      return false
    }

    // 添加分包级的comDef文件
    const subPkgComponentsPath = path.join(pkgTarget, 'components');
    await fse.ensureDir(subPkgComponentsPath);

    // 复制组件文件
    depComponents.map(dep => fse.copyFile(dep.runtimePath, path.join(subPkgComponentsPath, path.basename(dep.runtimePath))));

    let comDefBody: string[] = [];

    depComponents.map((com) => {
      comDefBody.push(`
"${com.namespace}":{
  "namespace": "${com.namespace}",
  "version": "${com.version}",
  "runtime": require("./${path.basename(com.runtimePath)}").default
}`)
    })

    let content = "function polyfill(obj){for(var key in obj)obj[obj[key].namespace+'-'+obj[key].version]=obj[key];return obj}";
    content += "\r";
    content += `var pkgComDefs = polyfill({ ${comDefBody.join(",")} })`;
    content += "\r";
    content += `module.exports = Object.assign(pkgComDefs, require('./../../components/comDefs'));`

    await fse.writeFile(
      path.resolve(subPkgComponentsPath, `./${pkgId}_comDefs.js`),
      content,
      "utf-8"
    );

    return true
  }

  genAllComponentsDefs = (componenstMap: any, blackList?: string[]) => {
    const componentsFolder = path.resolve(this.projectPath, "./components");
    fse.ensureDirSync(componentsFolder);

    let comDefBody: string[] = [];

    const componentsWithFileList = [];

    Object.keys(componenstMap).forEach((nameAndVer, index) => {
      const [namespace, version] = nameAndVer.split("@");
      const { runtime } = componenstMap[nameAndVer];
      // JS计算特殊处理
      if (
        ["mybricks.taro._muilt-inputJs", "mybricks.taro.systemTabbar"].includes(
          namespace
        )
      ) {
        comDefBody.push(`
          "${namespace}":{
            "namespace": "${namespace}",
            "version": "${version}",
          }
        `);
        return;
      }

      const comFileName = namespace.replace(/\./g, "_");
      const runtimePath = path.resolve(componentsFolder, `./${comFileName}.js`);

      // 跳过黑名单，如果路径里有，还需要删除
      if (Array.isArray(blackList) && blackList.includes(namespace)) {
        fse.removeSync(runtimePath)
        return
      }

      comDefBody.push(`
        "${namespace}":{
          "namespace": "${namespace}",
          "version": "${version}",
          "runtime": require("./${comFileName}").default
        }
      `);

      const runtimeCode = decodeURIComponent(runtime);

      fse.writeFileSync(
        runtimePath,
        runtimeCode,
        "utf-8"
      );

      fse.stat(runtimePath).then(({ size }) => {
        componentsWithFileList.push({
          namespace,
          version,
          runtimePath,
          runtimeSize: size
        })
      })
    });

    let content = "function polyfill(obj){for(var key in obj)obj[obj[key].namespace+'-'+obj[key].version]=obj[key];return obj}";
    content += "\r";
    content += `module.exports = polyfill({ ${comDefBody.join(",")} });`;
    fs.writeFileSync(
      path.resolve(componentsFolder, "./comDefs.js"),
      content,
      "utf-8"
    );

    return {
      componentsWithFileList
    }
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
      { encoding: "utf-8" }
    );
  }

  // 多端window配置兼容
  adpter.pageJsonTransform(data.appConfig.window, type);

  // 获取小程序的插件配置，如果有的话，否则就是undefined
  const { appPluginConfig, pageMapPluginConfig } = handlePluginsConfig(data.allComponents.map, data.pages, type, projectPath)

  // 写入全局配置
  fse.writeJSONSync(path.resolve(projectPath, "./app.json"), Object.assign({}, data.appConfig, appPluginConfig ? { plugins: appPluginConfig } : {}));

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

  //查找开启强制分包的页面
  let forceMainPackageList = [];
  for (let i = 0; i < data?.pages?.length; i++) {
    if (data.pages?.[i].pageConfig?.forceMainPackage) {
      forceMainPackageList.push(data.pages?.[i].pagePath?.split("/")?.[1])
    }
  }
  /** 主包的页面列表 */
  const mainPackagePageList = [...new Set([
    "404",
    "index",
    "login",
    "main",
    ...(tabBarJson || []).map((t) => t?.pagePath?.split("/")?.[1]),
    ...forceMainPackageList
  ])];

  // 如果首页不在白名单内，添加首页
  if (data.appConfig.entryPagePath) {
    let sceneId = data.appConfig.entryPagePath.split("/")[1];
    if (!mainPackagePageList.includes(sceneId)) {
      mainPackagePageList.push(sceneId);
    }
  }

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
      }),
      data.pageAliasMap
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

    // 注入页面级JS
    writePageJs(target, pageId, data.allModules?.pages?.[pageId])

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
          usingComponents: Object.assign({
            comp: "../../comp",
          }, pageMapPluginConfig[pageId]?.usingComponents ?? {}),
        }
        : {}),
      ...page.pageConfig,
    });
    fse.writeFileSync(targetConfigPath, configContent, "utf-8");
  }

  // 写入所有组件
  const { componentsWithFileList } = await compiler.genAllComponentsDefs(data.allComponents.map);

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
  writeProjectJs(projectPath, data.allModules?.all)
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
      return str.replace(/\/mybricks\/page-fx/g, `/mybricks/${pageId}-fx`);
    });

    // 修改index.js 中的引入的config名称，保证每次个config都是独立的，因为external名称一样的话都是一个引用
    modifyFileContent(path.resolve(target, "./index.js"), (str) => {
      return str.replace(
        /\/mybricks\/page-config/g,
        `/mybricks/${pageId}-config`
      );
    });

    // 修改index.js 中的引入的config名称，保证每次个config都是独立的，因为external名称一样的话都是一个引用
    modifyFileContent(path.resolve(target, "./index.js"), (str) => {
      return str.replace(/\/mybricks\/page-code/g, `/mybricks/${pageId}-code`);
    });
  }

  console.log("==========================");
  console.log();
  console.log("==========================");

  // --- 分包逻辑 ---
  /** 所有页面的大小阈值 */
  const SPLIT_PACK_LIMIT = 400 * 1024;
  /** 单个分包大小阈值 */
  const SINGLE_PACK_LIMIT = 1.7 * 1024 * 1024;
  /** 单个组件大小合理值 */
  const SINGLE_COMPONENT_LIMIT = 80 * 1024;

  const { total, pageSizes } = await getFolderSize(
    path.resolve(projectPath, "./pages")
  );

  // 寻找不在主包，且超过单个组件大小阈值的组件，这类组件需要被处理
  const shouldSplitComponents = componentsWithFileList.filter(c => {
    let shouldSplited = c.runtimeSize > SINGLE_COMPONENT_LIMIT;
    mainPackagePageList.forEach((pageId) => {
      const { pageDeps } = data.pages.find(page => page.id === pageId) ?? {};
      if (Array.isArray(pageDeps) && pageDeps.some(d => d === c.namespace)) {
        shouldSplited = false
      }
    })
    return shouldSplited
  })

  // 大于 800KB pages开启分包
  // 开发模式下暂不分包，避免小程序 IDE 经常 GG
  if (total > SPLIT_PACK_LIMIT) {
    Logger.info(
      `[miniapp-compiler] 小程序${projectName}大小为${total}，使用分包策略`
    );

    const subPages = data.pages.map(t => ({
      id: t.id,
      pageDeps: t.pageDeps,
      pageAllSize: pageSizes.find(p => p.name === t.id)?.size
    })).filter(t => !mainPackagePageList.includes(t.id));

    let subPackages = groupPages(subPages, shouldSplitComponents, SINGLE_PACK_LIMIT);

    // 修改目录结构为分包结构
    await Promise.all(subPackages.map(async (pkg) => {
      const pkgTarget = path.resolve(projectPath, `./${pkg.root}`);
      await fse.ensureDir(pkgTarget);

      // 写入子包组件
      const hasSubPackageComDef = await compiler.genSubComponentsDefs(pkgTarget, pkg.name, pkg.deps);

      pkg.pages.forEach((pageId) => {
        fse.moveSync(
          path.resolve(projectPath, `./pages/${pageId}`),
          path.resolve(pkgTarget, `./pages/${pageId}`),
          { overwrite: true }
        );

        const newPagePath = `${pkg.root}/pages/${pageId}/index`;
        // 重新修改页面的index.js
        modifyFileContent(
          path.resolve(pkgTarget, `./pages/${pageId}`, "./index.js"),
          (str) => {
            return str.replace(
              new RegExp(`pages/${pageId}/index`, "g"),
              newPagePath
            );
          }
        );

        routeMap[pageId] = {
          path: `/${newPagePath}`,
          isTabbar: false, // 分包的都是非tabbar页面
        };

        // 修改相对路径
        modifyFileContent(
          path.resolve(
            pkgTarget,
            `./pages/${pageId}`,
            `./index${getExtName(FileType.html, type)}`
          ),
          (str) => {
            return str.replace(/..\/..\//g, "../../../");
          }
        );

        // 修改相对路径
        modifyFileContent(
          path.resolve(pkgTarget, `./pages/${pageId}`, "./index.json"),
          (str) => {
            return str.replace(/..\/..\//g, "../../../");
          }
        );

        // 修改 components/comDefs 相对路径
        if (hasSubPackageComDef) {
          modifyFileContent(
            path.resolve(pkgTarget, `./pages/${pageId}`, "./index.js"),
            (str) => {
              return str.replace(
                /\.\/\.\.\/\.\.\/components\/comDefs/g,
                `./../../components/${pkg.name}_comDefs` // 注意每个包要单独的name，因为external名称一样的话都是一个引用
              );
            }
          );
        }else{
          //有些小程序触发了分包逻辑了，但是又没有hasSubPackageComDef，这个时候直接引用根目录的components/comDefs
          modifyFileContent(
            path.resolve(pkgTarget, `./pages/${pageId}`, "./index.js"),
            (str) => {
              return str.replace(
                /\.\/\.\.\/\.\.\/components\/comDefs/g,
                `./../../../components/comDefs`
              );
            }
          );
        }

      });
    }));

    // 重新写入全局comDef，剔除被分包的组件
    const movedToPackageComponents = subPackages.reduce((acc, pkg) => {
      return [...(pkg.deps ?? []).map(c => c.namespace), ...acc]
    }, []); // 获取实际被分包的组件
    await compiler.genAllComponentsDefs(data.allComponents.map, movedToPackageComponents);

    // 格式化成小程序的subPackages
    const subPackagesJson = subPackages.map((pkg) => {
      return {
        root: pkg.root,
        name: pkg.name,
        pages: pkg.pages.map((p) => `pages/${p}/index`),
      };
    });

    // 修改app.json
    let appJson: any = fse.readJsonSync(
      path.resolve(projectPath, "./app.json")
    );
    appJson.subPackages = subPackagesJson;

    // 剔除在子包的页面
    appJson.pages = appJson.pages.filter((p) =>
      !subPackages.some(pkg => pkg.pages.includes(p.split("/")[1]))
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
    env: data.status.apiEnv,
  };

  writeRootConfig(
    projectPath,
    JSON.stringify({
      status: cloneStatus,
      routeMap,
      scenes: data.scenes, // 用于给render-taro创建全局多场景的交互
      fxFrames: data.fxFrames, // 用于给render-taro创建全局Fx的实现
      globalVarMap: data.globalVarMap, // 全局变量默认值
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

  // 替换页面别名
  replacePageAliasMap(projectPath, data.pageAliasMap);
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

  //str 压缩
  const compressed = pako.deflate(str, { to: "string" });
  const compressedString = Buffer.from(compressed).toString("base64");

  fse.writeFileSync(filePath, `module.exports = "${compressedString}"`, { encoding: "utf8" });
}

/** 写page级，config文件 */
function writePageConfig(dir, pageId, str, pageAliasMap) {
  const filePath = path.resolve(dir, `./mybricks/${pageId}-config.js`);
  fse.ensureDirSync(path.resolve(dir, "./mybricks"));

  //str 压缩之前，需要先进行字符串替换
  Object.keys(pageAliasMap).forEach((key) => {
    str = str.replace(new RegExp(key, "g"), pageAliasMap[key]);
  });

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

function writePageJs(dir, pageId, str) {
  const filePath = path.resolve(dir, `./mybricks/${pageId}-code.js`);
  fse.ensureDirSync(path.resolve(dir, "./mybricks"));

  fse.writeFileSync(filePath, `module.exports = (function(comModules) {
    ${decodeURIComponent(str)};
    return comModules;
  })({})`, {
    encoding: "utf8",
  });
}


function writeProjectJs(dir, str) {
  const injectCodePath = path.resolve(dir, "./mybricks/inject-code.js");
  fse.ensureDirSync(path.resolve(dir, "./mybricks"));
  fse.writeFileSync(injectCodePath, `module.exports = (function(comModules) {
    ${decodeURIComponent(str)};
    return comModules;
  })({})`,
    { encoding: "utf8" }
  );
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

// 递归将该目录下的所有文件夹名称，文件名称或文件内容中的进行替换
function replacePageAliasMap(projectPath, pageAliasMap) {
  // 递归处理目录
  function processDirectory(directory) {
    const items = fs.readdirSync(directory);

    items.forEach((item) => {
      const itemPath = path.join(directory, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        // 处理目录名称
        const newDirectoryName = replaceString(item, pageAliasMap);
        const newDirectoryPath = path.join(directory, newDirectoryName);
        if (newDirectoryPath !== itemPath) {
          fs.renameSync(itemPath, newDirectoryPath);
        }
        // 递归处理子目录
        processDirectory(newDirectoryPath);
      } else if (stats.isFile()) {
        // 处理文件名称
        const newFileName = replaceString(item, pageAliasMap);
        const newFilePath = path.join(directory, newFileName);
        if (newFilePath !== itemPath) {
          fs.renameSync(itemPath, newFilePath);
        }
        // 处理文件内容
        const fileContent = fs.readFileSync(newFilePath, "utf8");
        const newFileContent = replaceString(fileContent, pageAliasMap);
        fs.writeFileSync(newFilePath, newFileContent, "utf8");
      }
    });
  }

  // 字符串替换函数
  function replaceString(str, map) {
    let result = str;
    for (const [key, value] of Object.entries(map)) {
      const regex = new RegExp(key, "g");
      result = result.replace(regex, value);
    }
    return result;
  }

  // 开始处理项目目录
  processDirectory(projectPath);
}

/**
 * 
 * @param {*} pages 页面，需要剔除主包页面
 * @param {*} shouldSplitComponents 仅处理超过阈值大小且不在主包的组件
 * @param {*} maxSize 单包最大尺寸，默认为1.5MB
 * @description 分包逻辑，首先根据需要分包的组件列表，找到覆盖
 * @returns 
 */
function groupPages(pages, shouldSplitComponents, maxSize = 1.5 * 1024 * 1024) {
  // 构建组件依赖关系图和组件大小映射
  const componentToPages = new Map();
  const componentSizeMap = new Map(
    shouldSplitComponents.map(comp => [comp.namespace, comp.runtimeSize])
  );

  pages.forEach(page => {
    page.pageDeps.forEach(dep => {
      if (!componentToPages.has(dep)) {
        componentToPages.set(dep, new Set());
      }
      componentToPages.get(dep).add(page.id);
    });
  });

  /** 计算剩下的页面中，对给定namespace的页面覆盖数量 */
  function getComponentCoverage(namespace, unassignedPages) {
    const pagesWithComponent = componentToPages.get(namespace) || new Set();
    return new Set([...pagesWithComponent].filter(pageId =>
      unassignedPages.has(pageId)
    )).size;
  }

  /** 计算添加新页面后的分包总大小，包含页面和组件的大小 */
  function calculatePackageSizeWhenAddPage({ currentPackage, newPage }) {
    let totalSize = currentPackage.totalSize;
    newPage.pageDeps.forEach(comp => {
      if (!currentPackage.deps.has(comp) && componentSizeMap.has(comp)) {
        totalSize += componentSizeMap.get(comp);
      }
    });
    return totalSize + newPage.pageAllSize;
  }

  // 尝试将页面添加到分包中
  function tryAddPageToPackage(page, currentPackage, assignedPages) {
    if (assignedPages.has(page.id)) {
      return false;
    }

    // 计算添加新页面和其组件后的总大小
    const newSize = calculatePackageSizeWhenAddPage({
      currentPackage,
      newPage: page
    });

    if (newSize > maxSize) {
      return false;
    }

    // 添加页面到包中
    currentPackage.pages.push(page);
    currentPackage.totalSize = newSize;
    page.pageDeps.forEach(dep => currentPackage.deps.add(dep));
    assignedPages.add(page.id);
    return true;
  }

  const packages = [];
  const assignedPages = new Set();
  const pagesMap = new Map(pages.map(p => [p.id, p]));

  // 开始遍历直到所有页面都被分配
  while (assignedPages.size < pages.length) {
    const startSize = assignedPages.size;

    let currentPackage = {
      pages: [],
      totalSize: 0,
      deps: new Set()
    };
    packages.push(currentPackage);

    // ===== 寻找下一个页面的逻辑 ====
    // 目前用的是找覆盖度最高的组件，其实不太合理，后面再改改

    // 获取未分配的页面集合
    const unassignedPages = new Set(
      pages.filter(p => !assignedPages.has(p.id)).map(p => p.id)
    );

    let bestComponent = null;
    let maxCoverage = 0;

    // 找到覆盖最多未分配页面的组件
    shouldSplitComponents.forEach(component => {
      const coverage = getComponentCoverage(component.namespace, unassignedPages);
      if (coverage > maxCoverage) {
        maxCoverage = coverage;
        bestComponent = component.namespace;
      }
    });

    // ===== 寻找下一个页面的逻辑 ====

    if (!bestComponent) {
      // 如果没有找到最佳组件，取第一个未分配的页面
      const firstUnassigned = pages.find(p => !assignedPages.has(p.id));
      tryAddPageToPackage(firstUnassigned, currentPackage, assignedPages);
    }

    // 将所有包含最佳组件的页面添加到当前包
    Array.from(componentToPages.get(bestComponent) || [])
      .map(pageId => pagesMap.get(pageId))
      .forEach(page => {
        tryAddPageToPackage(page, currentPackage, assignedPages)
      });

    // 尝试添加其他页面
    let changed = true;
    while (changed) {
      changed = false;
      for (const page of pages) {
        const wasAdded = tryAddPageToPackage(page, currentPackage, assignedPages);
        if (wasAdded) {
          changed = true;
        }
      }
    }

    // 说明一个包都分不出来，肯定是一直溢出，结束吧，不然死循环了
    if (assignedPages.size === startSize) {
      break
    }
  }

  return packages.map((pkg, index) => ({
    name: `package_${index}`,
    root: `package_${index}`,
    pages: pkg.pages.map(p => p.id),
    deps: Array.from(pkg.deps).map(t => shouldSplitComponents.find(c => c.namespace === t)).filter(c => !!c),
    totalSize: pkg.totalSize
  }));
}
interface ComPluginItem {
  provider: string,
  version: string,
  usingComponents: { // 参考小程序文档
    [comp: string]: string
  }
}

/**
 * @description 小程序插件逻辑，比较临时
 */
function handlePluginsConfig (componenstMap, pages, type, projectPath) {
  if (type !== 'weapp') { // 非微信小程序，目前不支持插件
    return {}
  }

  const appPlugins = {}
  const pagePlugins = {}

  let compHtml = '';
  let componentTags = []

  pages.forEach(page => {
    const { id, pageDeps } = page;

    pagePlugins[id] = {}

    Object.keys(componenstMap).forEach(key => {
      const [namespace, version] = key.split('@') ?? []
      if (pageDeps.includes(namespace)) {
        const com = componenstMap[key]
        if (com?.miniapp?.plugin) {
          for (const pluginName in com.miniapp.plugin) {
            const { provider, version, usingComponents } = com.miniapp.plugin[pluginName] as ComPluginItem;
            Object.assign(appPlugins, { [pluginName]: { provider, version } })
            Object.assign(pagePlugins[id], { usingComponents })

            // TODO，目前先写死怎么生成wxml的，后面替换下
            let appendHtml = ''
            for (const componentTag in usingComponents) {
              componentTags.push(componentTag)
              switch (true) {
                case componentTag === 'xzb-video': {
                  for (let index = 0; index < 15; index++) {
                    appendHtml += `
<template name="tmpl_${index}_xzb-video">
  <xzb-video  src="{{i.src}}" controls="{{i.controls}}" style="{{i.st}}" autoplay="{{i.autoplay}}" title="{{i.title}}" loop="{{i.loop}}" poster="{{i.poster}}" bindvideoloaded="eh" id="{{i.uid||i.sid}}" data-sid="{{i.sid}}">
    <block wx:for="{{i.cn}}" wx:key="sid">
      ${index === 14 ? '<template is="{{xs.e(15)}}" data="{{i:item,c:c,l:l}}" />' : '<template is="{{xs.a(c, item.nn, l)}}" data="{{i:item,c:c+1,l:xs.f(l,item.nn)}}" />'}
      <template is="{{xs.a(c, item.nn, l)}}" data="{{i:item,c:c+1,l:xs.f(l,item.nn)}}" />
    </block>
  </xzb-video>
</template>
`
                  }
                }
              }
            }
            compHtml += appendHtml
          }
        }
      }
    })

    if (Object.keys(pagePlugins[id]).length === 0) {
      delete pagePlugins[id]
    }
  })

  // 替换comp.wxml文件 和 utils.wxs文件
  if (!!compHtml) {
    const content = fse.readFileSync(path.resolve(projectPath, 'base.wxml'), 'utf-8');
    fse.writeFileSync(path.resolve(projectPath, 'base.wxml'), content + compHtml, 'utf-8');

    const utilsContent = fse.readFileSync(path.resolve(projectPath, 'utils.wxs'), 'utf-8');
    fse.writeFileSync(
      path.resolve(projectPath, 'utils.wxs'),
      utilsContent.replace('["7","0","21","5","2","12","6","4","62","63","31","24","59","68","69","57"]', `["7","0","21","5","2","12","6","4","62","63","31","24","59","68","69","57",${componentTags.map(t => `"${t}"`).join(',')}]`),
      'utf-8'
    );
  }

  return {
    appPluginConfig: Object.keys(appPlugins).length > 0 ? appPlugins : void 0,
    pageMapPluginConfig: pagePlugins,
  }
}