import { Injectable } from '@nestjs/common';
import { name as pkgName } from "./../../../package.json";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import { PublishError, PublishErrCode } from './utils'
import { Logger } from '@mybricks/rocker-commons'

@Injectable()
export default class CompileService {
  async compileMiniapp({
    data,
    projectPath,
    origin,
  }, projectName: string) {

    const staticCompiler = new StaticCompiler({
      pkgName,
      projectPath,
      projectId: data.projectId,
    });

    staticCompiler.handlData({ data })

    // 修改app.json
    fse.writeJSONSync(path.resolve(projectPath, './app.json'), data.appConfig);

    // 修改app.wxss
    staticCompiler.modifyAppCssFromAppConfig({ data });

    // 替换tabBar.json
    writeTabbarConfig(path.resolve(projectPath, './custom-tab-bar'), JSON.stringify(data.tabBarJson))

    // 定义路由跳转的map，分包后
    let routeMap = {}

    // 创建页面文件夹
    for (let i = 0; i < data.pages.length; i++) {
      let page = data.pages[i];
      const pageId = page.pagePath.split('/')[1]
      const source = path.resolve(projectPath, './pages/index');
      const target = path.resolve(projectPath, `./pages/${pageId}`);

      if (source !== target) { // index无需替换
        fse.copySync(source, target);
      }

      // 写入页面级注入的数据
      writePageConfig(target, pageId, JSON.stringify({
        toJson: page.pageToJson,
      }))

      //注入页面级CSS，主要是Style声明的部分
      let targetStylePath = path.resolve(target, "./index.wxss");
      fse.writeFileSync(targetStylePath, page.cssContent || '', "utf-8");

      // 更新页面级别的 index.json
      let targetConfigPath = path.resolve(target, "./index.json");
      const configContent = JSON.stringify({
        "usingComponents": {
          "comp": "../../comp"
        },
        ...page.pageConfig
      });
      fse.writeFileSync(targetConfigPath, configContent, "utf-8");
    }

    // 写入所有组件
    if (data.allComponents.map) {
      await staticCompiler.genAllComponentsDefs(data.allComponents)
    }

    // 写入所有组件Css
    if (data.allComponents?.css) {
      appendAppCss(projectPath, data.allComponents?.css)
    }

    /** 注入所有动态JS */
    modifyFileContent(path.resolve(projectPath, './app.js'), str => {
      let allModules = decodeURIComponent(data.allModules)
      allModules = `
        (function(comModules) {
          ${allModules};
          console.log('allComModules', comModules)
          return comModules;
        })({});
      `;
      return str.replace(/\'TEMPLATE\:COMMODULES\'/g, allModules).replace(/\"TEMPLATE\:COMMODULES\"/g, allModules)
    })
    delete data.allModules;

    // 替换页面js文件
    for (let i = 0; i < data.pages.length; i++) {
      let page = data.pages[i];

      const pageId = page.pagePath.split('/')[1]
      const target = path.resolve(projectPath, `./pages/${pageId}`);

      // 修改index.js 中的pagepath，保证taro能够加载正常的页面
      modifyFileContent(path.resolve(target, './index.js'), str => {
        return str.replace(/pages\/index/g, page.pagePath)
      })
      routeMap[pageId] = `/${page.pagePath}`

      // 修改index.js 中的引入的config名称，保证每次个config都是独立的，因为external名称一样的话都是一个引用
      modifyFileContent(path.resolve(target, './index.js'), str => {
        return str.replace(/\/mybricks\/page-config/g, `/mybricks/${pageId}-config`)
      })
    }

    // --- 分包逻辑 ---
    const SPLIT_PACK_LIMIT = 800 * 1024, SINGLE_PACK_LIMIT = 300 * 1024;
    const whiteList = ['404', 'index', 'login', 'main', ...(data.tabBarJson || []).map(t => t?.pagePath?.split('/')?.[1])]
    const { total, pageSizes } = await getFolderSize(path.resolve(projectPath, './pages'))

    // 大于 800KB pages开启分包
    // 开发模式下暂不分包，避免小程序 IDE 经常 GG
    if (total > SPLIT_PACK_LIMIT) {
      Logger.info(`[miniapp-compiler] 小程序${projectName}大小为${total}，使用分包策略`)
      const subPages = pageSizes.filter(t => !whiteList.includes(t.name));

      let subPackages: any[] = []
      let subIndex = 0

      // 规划分几个包
      for (let index = 0; index < subPages.length; index++) {
        const subPage = subPages[index];

        if (!subPackages[subIndex]) {
          subPackages.push({
            root: `package${subIndex}`,
            name: `package${subIndex}`,
            pages: []
          })
        }
        subPackages[subIndex].pages.push(subPage)

        if ((subPackages[subIndex]?.pages || []).reduce((a, c) => a + c.size, 0) > SINGLE_PACK_LIMIT) {
          subIndex++
          continue
        }
      }

      // 修改目录结构为分包结构
      subPackages.forEach(pkg => {
        const pkgTarget = path.resolve(projectPath, `./${pkg.root}`)
        fse.ensureDirSync(pkgTarget)
        pkg.pages.forEach(page => {
          fse.moveSync(path.resolve(projectPath, `./pages/${page.name}`), path.resolve(pkgTarget, `./pages/${page.name}`), { overwrite: true })

          const newPagePath = `${pkg.root}/pages/${page.name}/index`
          // 重新修改页面的index.js
          modifyFileContent(path.resolve(pkgTarget, `./pages/${page.name}`, './index.js'), str => {
            return str.replace(new RegExp(`pages/${page.name}/index`, 'g'), newPagePath)
          })
          routeMap[page.name] = `/${newPagePath}`;

          // 修改相对路径
          modifyFileContent(path.resolve(pkgTarget, `./pages/${page.name}`, './index.wxml'), str => {
            return str.replace(/..\/..\//g, '../../../')
          })

          // 修改相对路径
          modifyFileContent(path.resolve(pkgTarget, `./pages/${page.name}`, './index.json'), str => {
            return str.replace(/..\/..\//g, '../../../')
          })
        })
      })


      // 格式化成小程序的subPackages
      subPackages = subPackages.map(pkg => {
        return {
          ...pkg,
          pages: pkg.pages.map(p => `pages/${p.name}/index`)
        }
      })

      // 修改app.json
      let appJson: any = fse.readJsonSync(path.resolve(projectPath, './app.json'))
      appJson.subPackages = subPackages
      appJson.pages = appJson.pages.filter(p => whiteList.includes(p.split('/')[1]))
      fse.writeJsonSync(path.resolve(projectPath, './app.json'), appJson)
    } else {
      Logger.info(`[miniapp-compiler] 小程序${projectName}大小为${total}，无需分包`)
    }

    // --- 分包逻辑 ---

    // 删除 index 和 404 页面
    fse.removeSync(path.resolve(projectPath, './pages/index'));
    fse.removeSync(path.resolve(projectPath, './pages/404'));

    //注入全局配置
    let cloneStatus = JSON.parse(JSON.stringify(data.status));
    delete cloneStatus.appsecret;

    // 注入全局的域名配置
    if (!cloneStatus.serviceDomain) {
      cloneStatus.serviceDomain = data.status?.callServiceHost || origin;
    }

    writeRootConfig(projectPath, JSON.stringify({
      status: cloneStatus,
      routeMap,
      scenes: data.scenes, // 用于给render-taro创建全局多场景的交互
      fxFrames: data.fxFrames, // 用于给render-taro创建全局Fx的实现
    }))
  }
}

/** 对app级wxss文件增加内容 */
function appendAppCss(dir, str) {
  let css = fs.readFileSync(path.resolve(dir, './app.wxss'), { encoding: 'utf-8' });
  css += str
  fs.writeFileSync(path.resolve(dir, './app.wxss'), css);
}

/** 写tabbar，config文件 */
function writeTabbarConfig(dir, str) {
  const filePath = path.resolve(dir, './mybricks/tabbar-config.js')
  fse.ensureDirSync(path.resolve(dir, './mybricks'))
  fse.writeFileSync(filePath, `module.exports = ${str}`, { encoding: 'utf8' });
}

/** 写app级，config文件 */
function writeRootConfig(dir, str) {
  const filePath = path.resolve(dir, './mybricks/root-config.js')
  fse.ensureDirSync(path.resolve(dir, './mybricks'))
  fse.writeFileSync(filePath, `module.exports = ${str}`, { encoding: 'utf8' });
}

/** 写page级，config文件 */
function writePageConfig(dir, pageId, str) {
  const filePath = path.resolve(dir, `./mybricks/${pageId}-config.js`)
  fse.ensureDirSync(path.resolve(dir, './mybricks'))
  fse.writeFileSync(filePath, `module.exports = ${str}`, { encoding: 'utf8' });
}

function modifyFileContent(path, callback) {
  let str = fs.readFileSync(path, 'utf8');
  str = callback?.(str)
  fs.writeFileSync(path, str, { encoding: 'utf8' });
}

async function getFolderSize(folderPath, pageSizes = [], len = 0) {
  try {
    const stats = await fse.stat(folderPath);
    // 如果是文件，则直接返回大小
    if (stats.isFile()) {
      return {
        total: stats.size,
        name: 'file'
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
          })
        }
        totalSize += folderSize.total
      }
      return {
        total: totalSize,
        pageSizes,
      };
    }
  } catch (error) {
    Logger.error(error);
    return {
      total: 0,
      name: 'error'
    };
  }
}

function getRealHostName(requestHeaders) {
  let hostName = requestHeaders.host;
  if (requestHeaders["x-forwarded-host"]) {
    hostName = requestHeaders["x-forwarded-host"];
  } else if (requestHeaders["x-host"]) {
    hostName = requestHeaders["x-host"].replace(":443", "");
  }
  return hostName;
}

export function getRealDomain(request) {
  let hostName = getRealHostName(request.headers);
  let protocol = request.headers["x-scheme"] ? "https" : "http";
  // let protocol = request.headers['connection'] === 'upgrade' ? 'https' : 'http'
  return `${protocol}://${hostName}`;
}

/**
 * @description 公共的小程序构建方法，收集公共参数，防止每个函数的特殊参数传来传去
 */
class MpCompiler {
  pkgName: string;
  projectPath: string;
  projectId: number;

  constructor({
    pkgName,
    projectPath,
    projectId,
  }) {
    this.pkgName = pkgName;
    this.projectPath = projectPath;
    this.projectId = projectId;
  }

  /**
   *
   * @description data合法性校验以及修正
   */
  handlData = ({ data }) => {
    if (!data.appConfig) {
      throw new Error("无效的data.appConfig");
    }

    /** tabbar数量小于2删除tabbar */
    if (
      Array.isArray(data?.appConfig?.tabBar?.list) &&
      data?.appConfig?.tabBar?.list.length < 2
    ) {
      delete data.appConfig.tabBar;
    }

    /** data.pages多余的pagePath */
    if (
      Array.isArray(data.pages) &&
      Array.isArray(data?.appConfig?.pages) &&
      data.pages.length !== data?.appConfig?.pages.length
    ) {
      throw new Error("请检查页面pages相关配置");
    }

    if (!data?.ci?.appid || !data?.ci.privateKey) {
      throw new PublishError(PublishErrCode.NoAppIdAndUploadKey, "请先配置小程序ID和小程序上传密钥")
    }

    /** customTabBar 删除冗余数据 */
    // if (
    //   Array.isArray(data.tabBarJson)
    // ) {
    //   data.tabBarJson.forEach(t => {
    //     if (t?.fileToJson?.content) {
    //       delete t?.fileToJson?.content
    //     }

    //     if (t?.fileToJson?.toJson) {
    //       delete t?.fileToJson?.toJson
    //     }
    //   })
    // }

    /** 删除Json里的冗余信息 */
    // if (Array.isArray(data.pages)) {
    //   data.pages.forEach(page => {
    //     this.utils.transformComsFromPageJson(page.json, com => {
    //       if (["mybricks.taro.appConfig"].indexOf(com.def.namespace) !== -1) {
    //         delete com.model.data
    //       }
    //     })
    //   })
    // }
  }

  genAllComponentsDefs = (allComponents) => {
    const { map } = allComponents;

    const componentsFolder = path.resolve(this.projectPath, './components');
    fse.ensureDirSync(componentsFolder);

    let comDefHeader = [];
    let comDefBody = []

    Object.keys(map).forEach((nameAndVer, index) => {
      const [namespace, version] = nameAndVer.split('@');
      const { runtime } = map[nameAndVer];
      // JS计算特殊处理
      if (['mybricks.taro._muilt-inputJs', 'mybricks.taro.systemTabbar'].includes(namespace)) {
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
        return
      }

      let comFileName = namespace.replace(/\./g, '_');
      comDefHeader.push(`var com${index} = require("./${comFileName}").default;`);

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

      fse.writeFileSync(path.resolve(componentsFolder, `./${comFileName}.js`), decodeURIComponent(runtime), 'utf-8')
    })

    let content = '';
    content += `${comDefHeader.join('\r')}`;
    content += '\r';
    content += `module.exports = { ${comDefBody.join(',')} };`;
    fs.writeFileSync(path.resolve(componentsFolder, './comDefs.js'), content, 'utf-8');
  }

  /** 部分全局样式修改app.wxss  */
  modifyAppCssFromAppConfig = ({ data }) => {
    let css = fs.readFileSync(path.resolve(this.projectPath, './app.wxss'), { encoding: 'utf-8' });
    css += `Page{--primary-color: #fa6400}`
    fs.writeFileSync(path.resolve(this.projectPath, './app.wxss'), css);
  }

  utils = {
    /** 按引用值遍历所有coms，一般用来删除JS计算之类的代码 */
    transformComsFromPageJson: (pageJson, callback) => {
      /** 多场景 */
      if (Array.isArray(pageJson?.scenes)) {
        pageJson?.scenes.forEach(scene => {
          Object.keys(scene?.coms || {}).forEach?.(key => callback(scene?.coms[key]))
        })
      }
      /** 非多场景 */
      Object.keys(pageJson?.coms || {}).forEach?.(key => callback(pageJson?.coms[key]))
    },
    /** 从page的原始Json获取当前页面用的组件定义，主要是为了兼容多场景弹框 */
    getComsFromPageJson: (pageJson) => {
      /** 多场景 */
      if (Array.isArray(pageJson?.scenes)) {
        return pageJson?.scenes.reduce((acc, cur) => {
          return {
            ...acc,
            ...(cur?.coms || {})
          }
        }, {})
      }
      /** 非多场景 */
      return pageJson?.coms || {}
    },
    /** 从page的原始Json获取当前页面用的组件依赖，主要是为了兼容多场景弹框 */
    getDepsFromPageJson: (pageJson) => {
      /** 多场景 */
      if (Array.isArray(pageJson?.scenes)) {
        return pageJson?.scenes.reduce((acc, cur) => {
          return [
            ...acc,
            ...(cur?.deps || [])
          ].filter(dep => dep.namespace !== 'mybricks.core-comlib.scenes')
        }, [])
      }
      /** 非多场景 */
      return (pageJson?.deps || []).filter(dep => dep.namespace !== 'mybricks.core-comlib.scenes')
    }
  }
}

/**
 * @description 静态编译，动态JS以及云组件都是静态编译成文件的
 */
class StaticCompiler extends MpCompiler {
  constructor(params) {
    super(params);
  }
}

class LackAppConfigError extends Error {

  errCode = '10001'

  constructor(params) {
    super(params)
  }
}