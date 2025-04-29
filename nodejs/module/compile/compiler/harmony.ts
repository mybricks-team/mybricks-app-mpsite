import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import { BaseCompiler } from "./base";

import { CompileType, DepModules } from "./types";

class HarmonyCompiler extends BaseCompiler {
  validateData = (data) => {
    this.transformData({ data });
  };

  get pagesPath () {
    return path.join(this.projectPath, './entry/src/main/ets/pages')
  }

  get baseAppPath () {
    return path.join(this.projectPath, './entry/src/main/ets')
  }

  get mainPath () {
    return path.join(this.projectPath, './entry/src/main')
  }
}


export const compilerHarmony = async (
  { data, projectPath, projectName, fileName, depModules, origin, type }: any,
  { Logger }
) => {
  const compiler = new HarmonyCompiler({ projectPath });

  compiler.validateData(data);

  // 修正tabbr数据，去除已经不存在的tabbar页面
  const tabBarJson = (data.tabBarJson || []).filter((t) => {
    return (
      (data.appConfig?.pages || []).findIndex((p) => p === t.pagePath) > -1
    );
  });

  // list被赋值的话，必须要大于2的数组
  if (Array.isArray(tabBarJson) && tabBarJson.length > 1) {
    data.appConfig.tabBar = data.appConfig.tabBar || {};
    data.appConfig.tabBar.list = (tabBarJson || []).map((c) => ({
      pagePath: c.pagePath,
    }));
  }

  //写入口文件
  await writeAppEntryFile(compiler.baseAppPath, { entryPagePath: data.appConfig.entryPagePath })

  //写入APP配置
  await writeAppConfigFile(compiler.mainPath, data.appConfig)

  // 定义路由跳转的map，分包后
  let routeMap = {};

  const pagesPath = compiler.pagesPath

  // 创建页面文件夹
  for (let i = 0; i < data.pages.length; i++) {
    let page = data.pages[i];
    const pageId = page.pagePath.split("/")[1];

    routeMap[pageId] = {
      path: `/${page.pagePath}`,
      isTabbar: (tabBarJson || []).some(
        (b) => b?.pagePath?.indexOf(pageId) > -1
      ),
    };

    const indexPath = path.join(pagesPath, `./index`);
    const target = path.join(pagesPath, `./${pageId}`);
    await fse.copy(indexPath, target, { overwrite: true })

    // 写入页面Json
    await writePageJsonFile(target, page.pageToJson);

    // 注入页面级JS
    writePageJs(target, data.allModules?.pages?.[pageId])

    // 替换
    await modifyFileContent(path.join(target, 'index.ets'), (str) => {
      return str.replace('pages/index/index', page.pagePath)
    })

    // 写入页面配置
    await writePageConfigFile(target, page.pageConfig)
    // 替换页面配置内容
    await modifyFileContent(path.join(target, 'index_taro_comp.js'), (str) => {
      return str.replace('pages/index/index', page.pagePath)
    })

    // // 写入特殊的 fxFrame
    // let pageOnLoadFx = data.fxFrames.find((fxFrame) => {
    //   return fxFrame.name === "pageOnLoad";
    // });
    // writePageFx(
    //   target,
    //   pageId,
    //   JSON.stringify({
    //     pageOnLoad: pageOnLoadFx,
    //   })
    // );

    // // 注入页面级JS
    // writePageJs(target, pageId, data.allModules?.pages?.[pageId])

    // //注入页面级CSS，主要是Style声明的部分
    // let targetStylePath = path.resolve(
    //   target,
    //   `./index${getExtName(FileType.css, type)}`
    // );
    // fse.writeFileSync(targetStylePath, page.cssContent || "", "utf-8");
  }


  /** 注入所有动态JS */
  writeProjectJs(compiler.baseAppPath, data.allModules?.all)
  delete data.allModules;

  // 删除 index 和 404 页面
  fse.removeSync(path.resolve(pagesPath, "./index"));
  fse.removeSync(path.resolve(pagesPath, "./404"));

  // //注入全局配置
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
    compiler.baseAppPath,
    {
      status: cloneStatus,
      routeMap,
      scenes: data.scenes, // 用于给render-taro创建全局多场景的交互
      fxFrames: data.fxFrames, // 用于给render-taro创建全局Fx的实现
      globalVarMap: data.globalVarMap, // 全局变量默认值
    }
  );

};

async function writeAppConfigFile(mainPath, appConfig) {
  const content = `import { initPxTransform } from './npm/@tarojs/taro';
import { createReactApp } from './npm/@tarojs/plugin-framework-react/dist/runtime';
import App from './app_comp.js';
import * as React from './npm/react';
import ReactDom from './npm/@tarojs/react';

const config = ${JSON.stringify(appConfig, null, 2)};
initPxTransform({
  designWidth: 375,
  deviceRatio: {
    "375": 1
  },
  baseFontSize: undefined,
  unitPrecision: undefined,
  targetUnit: undefined
});
const app = () => createReactApp(App, React, ReactDom, config);

export { config, app as default };
//# sourceMappingURL=app_taro_comp.js.map
`
  await fse.writeFile(path.join(mainPath, 'ets', 'app_taro_comp.js'), content, { encoding: "utf8" });

  const mainPageJson = {
    src: appConfig.pages,
    window: {
      designWidth: 375,
      autoDesignWidth: false
    }
  }
  await fse.writeJSON(path.join(mainPath, 'resources', 'base', 'profile', 'main_pages.json'), mainPageJson, { encoding: "utf8" });
}

async function writeAppEntryFile(appPath, {
  entryPagePath
}) {
  const content = `import type Want from "@ohos.app.ability.Want"
import type ohWindow from "@ohos.window"
import type { AppInstance } from "./npm/@tarojs/runtime"


import UIAbility from "@ohos.app.ability.UIAbility"
import AbilityConstant from "@ohos.app.ability.AbilityConstant"
import { callFn, context, Current, ObjectAssign, TaroAny, window } from "./npm/@tarojs/runtime"
import { initHarmonyElement, hooks } from "./npm/@tarojs/runtime"
import createComponent, { config } from "./app_taro_comp"


window.__taroAppConfig = config
export default class EntryAbility extends UIAbility {
  app?: AppInstance

  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam) {
    AppStorage.setOrCreate('__TARO_ENTRY_PAGE_PATH', '${entryPagePath}')
    AppStorage.setOrCreate('__TARO_PAGE_STACK', [])
    // 引入
    initHarmonyElement()
    this.app = createComponent()
    callFn(this.app?.onLaunch, this, ObjectAssign(want, launchParam))
  }

  onDestroy() {}

  onWindowStageCreate(stage: ohWindow.WindowStage) {
    context.resolver(this.context)

    this.context.getApplicationContext().on('environment', {
      onConfigurationUpdated(config) {
        AppStorage.setOrCreate('__TARO_APP_CONFIG', config)
      },
      onMemoryLevel(level) {
        hooks.call('getMemoryLevel', { level })
      }
    })

    stage.loadContent('${entryPagePath}', (err, data) => {
      const windowClass = stage.getMainWindowSync()
      Current.uiContext = windowClass.getUIContext()
      windowClass.setWindowLayoutFullScreen(true)

      if (err.code) {
        return callFn(this.app?.onError, this, err)
      }
    })
  }

  onForeground() {
    callFn(this.app?.onShow, this)
  }

  onBackground() {
    callFn(this.app?.onHide, this)
  }

  onMemoryLevel(level: AbilityConstant.MemoryLevel) {
    let levelRes: number

    switch (level) {
      case AbilityConstant.MemoryLevel.MEMORY_LEVEL_MODERATE:
        levelRes = 5
        break
      case AbilityConstant.MemoryLevel.MEMORY_LEVEL_LOW:
        levelRes = 10
        break
      case AbilityConstant.MemoryLevel.MEMORY_LEVEL_CRITICAL:
        levelRes = 15
        break
    }

    if (levelRes) {
      hooks.call('getMemoryLevel', { level: levelRes })
    }
  }
}`

  await fse.writeFile(path.join(appPath, 'app.ets'), content, { encoding: "utf8" });
}

async function modifyFileContent(path, callback) {
  let str = await fse.readFile(path, "utf8");
  str = callback?.(str);
  await fse.writeFile(path, str, { encoding: "utf8" });
}

/** 写app级，config文件 */
async function writeRootConfig(dir, config) {
  const filePath = path.resolve(dir, "mybricks/root-config.js");
  await fse.ensureDir(path.resolve(dir, "mybricks"));

  await fse.writeFile(filePath, `export default ${JSON.stringify(config, null, 2)}`, { encoding: "utf8" });
}

async function writePageJsonFile (dir, toJson) {
  const pageJsonFilePath = path.join(dir, 'mybricks/page-config.js')
  await fse.writeFile(pageJsonFilePath, `
export default ${JSON.stringify({
  toJson
}, null, 2)}`, { encoding: 'utf-8' })
}

async function writePageConfigFile(dir, pageConfig: {
  navigationBarBackgroundColor: string,
  navigationBarTextStyle: string,
  navigationBarTitleText: string,
  backgroundColor: string,
}) {
  const content = `import { createPageConfig } from '../../npm/@tarojs/plugin-framework-react/dist/runtime';
import component from './index_comp.js';
import '../../npm/react';
import '../../npm/@tarojs/react';

const config = ${JSON.stringify(pageConfig, null, 2)};
const index = () => createPageConfig(component, 'pages/index/index', config);

export { config, index as default };
//# sourceMappingURL=index_taro_comp.js.map
`
  await fse.writeFile(path.join(dir, 'index_taro_comp.js'), content, 'utf-8')
}

function writeProjectJs(dir, str) {
  const injectCodePath = path.resolve(dir, "mybricks/inject-code.js");
  fse.ensureDirSync(path.resolve(dir, "mybricks"));
  fse.writeFileSync(injectCodePath, `module.exports = (function(comModules) {
    ${decodeURIComponent(str)};
    return comModules;
  })({})`,
    { encoding: "utf8" }
  );
}

function writePageJs(dir, str) {
  const filePath = path.resolve(dir, `mybricks/page-code.js`);
  fse.ensureDirSync(path.resolve(dir, "mybricks"));

  fse.writeFileSync(filePath, `module.exports = (function(comModules) {
    ${decodeURIComponent(str)};
    return comModules;
  })({})`, {
    encoding: "utf8",
  });
}
