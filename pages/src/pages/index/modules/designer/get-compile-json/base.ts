import cloneDeep from "lodash/cloneDeep";
import { getAllModulesJsCode, getPageCssCode } from "../getAllModules";
// import { transformToJSON, transformSingleToJSON } from '../json-util'
import { Css, getComsFromPageJson } from "./utils";
import { transformToJSON } from "@mybricks/render-utils";
import axios from "axios";

interface SceneToJson {}

interface FxToJson {}

interface GeneratePageJson {
  id: string;
  /** 页面路由 */
  pagePath: string;
  /** 页面配置 */
  pageConfig: any;
  /** 页面toJson，包含其依赖的 popup 和 modules */
  pageToJson: SceneToJson[];
  cssContent: string;
}

interface GenerateJsons {
  appConfig: any;
  pages: GeneratePageJson[];
  fxFrames: FxToJson[];
  scenes: any;
  tabBarJson: any;
  depModules: any;
  pageCssMap: any;
}

function log(...args) {
  console.error("[toJson2Json]", ...args);
}

const Babel = window.Babel as any;
const Terser = window.Terser as any;

/** 目前只编译有限的几个API */
const babelScript = (code) => {
  return Babel.transform(code, {
    presets: ["env", "typescript"], // 设置需要使用的预设（这里使用env预设）
    filename: "types.d.ts",
    // sourceType: 'script', // 这里设置sourceType的值为script，可以让Babel输出常规类型的输出文件
    // plugins: [
    //   Babel.availablePlugins['proposal-optional-chaining'],
    //   Babel.availablePlugins['proposal-nullish-coalescing-operator'],
    //   Babel.availablePlugins['proposal-object-rest-spread']
    // ]
  }).code;
};

export class BaseJson {
  json: any = {};

  initJson = async ({
    toJson,
    events,
    comlibs,
    status,
  }): Promise<GenerateJsons> => {
    toJson = cloneDeep(toJson);
    log("before toJson", JSON.parse(JSON.stringify(toJson)));

    log("处理全局变量和FX中");
    events?.onBeforeTransformJson?.();

    if (window.__type__ === "spa") {
      transformToJSON(toJson);
    }
    // log("处理全局变量和FX中完成");
    log("toJson", toJson);

    this.json = {};

    /**
     * app.json 配置
     */
    const appConfig = getAppConfig(toJson, status);
    // app.json 配置
    this.json.appConfig = appConfig;

    const pageDepsMap = getPageDepsMap(toJson);
    console.log("pageDepsMap", JSON.parse(JSON.stringify(pageDepsMap)));

    const pageCssMap = {};

    // 获取页面信息，其中包含依赖的 popups 和 modules
    let pages = toJson.scenes
      .filter((item) => {
        return isPageScene(item);
      })
      .map((item) => {
        let pageConfig = {} as any;

        switch (true) {
          // login 页面使用无导航
          case item.id === "login":
            pageConfig.navigationStyle = "custom";
            break;
          // 其他页面使用自定义配置
          default: {
            /**
             * start
             */
            let config = findCom(item, "mybricks.taro.systemPage")?.model?.data;

            // 网页页面可能没有这个组件，需要从 systemWebview 中获取
            if (!config) {
              config = findCom(item, "mybricks.taro.systemWebview")?.model
                ?.data;
            }

            switch (config.useNavigationStyle) {
              case "default":
                pageConfig.navigationStyle = "default";
                pageConfig.navigationBarBackgroundColor = rgbaToHex(
                  config.navigationBarBackgroundColor
                );
                pageConfig.navigationBarTextStyle =
                  config.navigationBarTextStyle;
                pageConfig.navigationBarTitleText =
                  config.navigationBarTitleText;
                pageConfig.backgroundColorTop =
                  config.backgroundColorTop || "#ffffff";
                pageConfig.backgroundColorBottom =
                  config.backgroundColorBottom || "#ffffff";
                pageConfig.disableScroll = config.disableScroll;
                pageConfig.homeButton = config.homeButton;
                break;
              case "custom":
                pageConfig.navigationStyle = "custom";
                pageConfig.navigationBarTextStyle =
                  config.navigationBarTextStyle;
                pageConfig.backgroundColorTop =
                  config.backgroundColorTop || "#ffffff";
                pageConfig.backgroundColorBottom =
                  config.backgroundColorBottom || "#ffffff";
                pageConfig.disableScroll = config.disableScroll;
                pageConfig.homeButton = config.homeButton;
                break;
              case "none":
                pageConfig.navigationStyle = "custom";
                pageConfig.navigationBarTextStyle =
                  config.navigationBarTextStyle;
                pageConfig.backgroundColorTop =
                  config.backgroundColorTop || "#ffffff";
                pageConfig.backgroundColorBottom =
                  config.backgroundColorBottom || "#ffffff";
                pageConfig.disableScroll = config.disableScroll;
                pageConfig.homeButton = config.homeButton;
                break;
            }
            /**
             * end
             */
          }
        }

        const pageToJson = {
          scenes: [
            item,
            ...(Array.isArray(pageDepsMap[item.id])
              ? pageDepsMap[item.id].map((sid) =>
                  toJson.scenes.find((p) => p.id === sid)
                )
              : []),
          ],
        };

        // 生成并删除每个页面的css
        pageCssMap[item.id] = Css.getPageCssMap(pageToJson);

        console.log(pageCssMap, pageToJson);

        return {
          id: item.id,
          pagePath: `pages/${item.id}/index`,
          pageConfig: pageConfig,
          pageToJson,
        };
      });

    // tabBarJson
    let tabBarJson = getTabbarJson(toJson);
    this.json.tabBarJson = tabBarJson;

    this.json.pages = pages;
    // ----- 全局逻辑编排使用场景，不可或缺
    // 全局FX的Json
    this.json.fxFrames = toJson.global.fxFrames;
    // 用于生成pageContext的变量，main放在第一位，因为render-web默认用第一个做全局逻辑处理，
    // this.json.scenes = toJson.scenes.map(s => ({ id: s.id, type: s.type })).sort((a, b) => a.id === 'main' ? -1 : 1);
    this.json.scenes = toJson.scenes
      .map((s) => ({ id: s.id }))
      .sort((a, b) => (a.id === "main" ? -1 : 1));
    // ----- 全局逻辑编排使用场景，不可或缺

    events?.onBeforeTransformCode?.();

    return {
      appConfig,
      /** 页面信息，其中包含依赖的 popups 和 modules */
      pages: this.json.pages,
      fxFrames: this.json.fxFrames,
      scenes: this.json.scenes,
      tabBarJson: this.json.tabBarJson,
      depModules: getDepModules(comlibs),
      pageCssMap,
    };
  };

  /** 清理Json中的脏数据，一般最后调用 */
  cleanPagesFromJson = (json) => {
    // 最后再清理一次 json
    // 最后再清理一次 json
    // 最后再清理一次 json

    json.pages = json.pages.map((item) => {
      let pageToJson = cloneDeep(item.pageToJson);

      if (pageToJson.scenes) {
        pageToJson.scenes.forEach((page) => deleteUnuseDataFromPage(page));
      } else {
        deleteUnuseDataFromPage(pageToJson);
      }

      return {
        ...item,
        pageToJson,
      };
    });
    // 最后再清理一次 json
    // 最后再清理一次 json
    // 最后再清理一次 json
  };

  /** babel + 压缩 JS 代码 */
  babelJs = async (javascript) => {
    const miniJScode = await Terser.minify(babelScript(javascript));
    return miniJScode.code;
  };
}

function getAppConfig(toJson, status) {
  toJson = cloneDeep(toJson);

  // resutl
  let result = {} as any;

  //
  // let tabBarPageToJson = toJson.scenes.find((item) => {
  //   return item.id === "main";
  // });

  // const config = findCom(tabBarPageToJson, "mybricks.taro.systemPage").model
  //   .data;

  // let tabBar = config.tabBar.filter((item) => {
  //   return !!item.scene.id;
  // });

  let tabBar = toJson.tabbar.filter((item) => {
    return !!item.scene.id;
  });

  let useTabBar = tabBar.length >= 2 && tabBar.length <= 5;
  const entryPagePathSceneId = window.__entryPagePath__?.get() || "";

  if (entryPagePathSceneId) {
    // 当设置了 entryPagePath 时，首页为 entryPagePath 指定的页面
    result.entryPagePath = `pages/${entryPagePathSceneId}/index`;
  } else {
    // 否则走老逻辑
    if (useTabBar) {
      // 启用 tabbar 时，首页为 tabbar 的第一个页面
      result.entryPagePath = `pages/${tabBar[0].scene.id}/index`;
    } else {
      // 未启用 tabbar 时，如果 main 页面存在，则首页为 main 页面，否则为第一个页面
      const isMainPageExist = toJson.scenes.some((item) => {
        return item.id === "main";
      });

      if (isMainPageExist) {
        result.entryPagePath = `pages/main/index`;
      } else {
        result.entryPagePath = `pages/${toJson.scenes[0].id}/index`;
      }
    }
  }

  // pages
  result.pages = toJson.scenes
    .filter((item) => {
      return isPageScene(item);
    })
    .map((item) => {
      return `pages/${item.id}/index`;
    });

  // window
  // let mainPageToJson = toJson.scenes.find((item) => {
  //   return item.id === 'main'
  // });

  result.window = {};

  // 不设置 app 级 navigationStyle
  // switch (config.useNavigationStyle) {
  //   case 'default':
  //     result.window.navigationStyle = 'default';
  //     result.window.navigationBarBackgroundColor = rgbaToHex(config.navigationBarBackgroundColor);
  //     result.window.navigationBarTextStyle = config.navigationBarTextStyle;
  //     result.window.navigationBarTitleText = config.navigationBarTitleText;
  //     result.window.homeButton = config.homeButton;
  //     break;
  //   case 'custom':
  //     result.window.navigationStyle = 'custom';
  //     break;
  //   case 'none':
  //     result.window.navigationStyle = 'custom';
  //     break;
  // }

  // tabBar
  // config.tabBar = config.tabBar.filter(item => {
  //   return item.scene.id;
  // });

  if (useTabBar) {
    result.tabBar = {
      custom: true,
      list: tabBar.map((item) => {
        return {
          pagePath: `pages/${item.scene.id}/index`,
          text: item.scene.title,
        };
      }),
      color: "#ffffff", //无效
      selectedColor: "#ffffff", //无效
      backgroundColor: "#ffffff", //无效
    };
  }

  // 全局中是否有用到特殊组件
  let isContainChooseLocation = false;
  let isContainGetLocation = false;

  toJson.scenes.forEach((scene) => {
    if (findCom(scene, "mybricks.taro._chooseLocation")) {
      isContainChooseLocation = true;
    }
    if (findCom(scene, "mybricks.taro._get-location")) {
      isContainGetLocation = true;
    }
    if (findCom(scene, "mybricks.taro._open-location")) {
      isContainGetLocation = true;
    }
  });

  // 全局 Fx 中是否有用到特殊组件
  toJson.global.fxFrames.forEach((fx) => {
    if (findCom(fx, "mybricks.taro._chooseLocation")) {
      isContainChooseLocation = true;
    }
    if (findCom(fx, "mybricks.taro._get-location")) {
      isContainGetLocation = true;
    }
    if (findCom(fx, "mybricks.taro._open-location")) {
      isContainGetLocation = true;
    }
  });

  if (isContainChooseLocation) {
    if (!result.requiredPrivateInfos) {
      result.requiredPrivateInfos = [];
    }
    result.requiredPrivateInfos.push("chooseLocation");
  }

  if (isContainGetLocation) {
    if (!result.requiredPrivateInfos) {
      result.requiredPrivateInfos = [];
    }
    if (!result.permission) {
      result.permission = {};
    }
    result.requiredPrivateInfos.push("getLocation");

    result.permission["scope.userLocation"] = {
      desc: "您的位置信息仅在本小程序必要时被使用",
    };
  }

  // 自定义注入 header
  if (status?.h5Head) {
    result.h5Head = status?.h5Head;
  }

  return result;
}

function findCom(pageToJson, namespace) {
  pageToJson = cloneDeep(pageToJson);

  if (!pageToJson.coms) {
    console.log(pageToJson);
  }

  return Object.values(pageToJson.coms).find((item) => {
    return item.def.namespace.toLowerCase() === namespace.toLowerCase();
  });
}

function rgbaToHex(rgbaStr) {
  if (rgbaStr.startsWith("rgba") === false) {
    return rgbaStr;
  }

  let rgba = rgbaStr.slice(5, -1).split(",");
  let r = parseInt(rgba[0]);
  let g = parseInt(rgba[1]);
  let b = parseInt(rgba[2]);
  let a = parseFloat(rgba[3]);
  let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  if (a === 1) {
    return hex;
  }
  return (
    hex +
    Math.round(a * 255)
      .toString(16)
      .padStart(2, "0")
  );
}

function deleteUnuseDataFromPage(pageToJson) {
  const jsonComs = pageToJson?.coms || {};
  Object.keys(jsonComs).forEach((key) => {
    let value = jsonComs[key];

    if (value.def.namespace === "mybricks.taro.systemPage") {
      value.model.data.tabBar = value.model.data.tabBar.map((tab) => {
        delete tab.selectedIconPath;
        delete tab.normalIconPath;
        delete tab.selectedIconStyle;
        delete tab.selectedTextStyle;
        delete tab.normalIconStyle;
        delete tab.normalTextStyle;

        return {
          ...tab,
        };
      });
    }

    pageToJson.coms[key] = {
      ...value,
    };
  });

  // 删除所有的搭建的CSS数据
  Object.keys(jsonComs).forEach((key) => {
    delete jsonComs[key]?.model?.style?.styleAry;
  });
}

/**
 * @description 生成一个依赖Map，Map包含一个页面关联的所有 popup、module 的 toJson
 */
function getPageDepsMap(toJson) {
  console.log("getPageDepsMap", JSON.parse(JSON.stringify(toJson)));

  let pages = toJson.scenes.filter((item) => {
    return isPageScene(item);
  });

  function findOpenPopupIdsFromJson(json, popupIds = []) {
    // 判断Fx的堆栈中是否有popup
    Object.values(json?.pinProxies || {}).forEach((p: any) => {
      if (p?.type === "frame") {
        const fx = toJson.global.fxFrames.find((fx) => fx.id === p?.frameId);
        // 说明连接上这个fx函数了，判断目前比较粗糙，不确定是不是靠谱
        if (fx) {
          findOpenPopupIdsFromJson(fx, popupIds);
        }
      }
    });
    Object.values(json?.coms || {}).forEach((com) => {
      if (
        com.def?.namespace === "mybricks.core-comlib.scenes" &&
        com?.model?.data?._sceneShowType === "popup"
      ) {
        popupIds.push(com?.model?.data?._sceneId);
      }

      // 模块里面的 popup
      if (com.def?.namespace === "mybricks.core-comlib.module") {
        let moduleSceneJson = toJson.scenes.find((scene) => {
          console.log("scene.id", scene);
          return scene.id === com?.model?.data?.definedId;
        });
        findOpenPopupIdsFromJson(moduleSceneJson, popupIds);
      }
    });

    return popupIds;
  }

  function findUsedModuleIdFromJson(json, moduleIds = []) {
    Object.values(json.coms).forEach((com) => {
      if (
        com.def?.namespace === "mybricks.core-comlib.module" &&
        com?.model?.data?.definedId
      ) {
        moduleIds.push(com?.model?.data?.definedId);
      }
    });

    return moduleIds;
  }

  let depsMap = {};

  pages.forEach((pageJson) => {
    const pagePopups = findOpenPopupIdsFromJson(pageJson);
    const pageModules = findUsedModuleIdFromJson(pageJson);
    depsMap[pageJson.id] = Array.from(new Set([...pagePopups, ...pageModules]));
  });

  return depsMap;
}

/**
 * 从 main 页面的 systemPage 中提取 tabBar
 */
function getTabbarJson(toJson) {
  toJson = cloneDeep(toJson);

  // let tabBarPageToJson = toJson.scenes.find((item) => {
  //   return item.id === "main";
  // });

  // const config = findCom(tabBarPageToJson, "mybricks.taro.systemPage").model
  //   .data;

  // let tabBar = config.tabBar.filter((item) => {
  //   return !!item.scene.id;
  // });

  let tabBar = toJson.tabbar.filter((item) => {
    return !!item.scene.id;
  });

  let useTabBar = tabBar.length >= 2 && tabBar.length <= 5;

  if (useTabBar) {
    return tabBar.map((item) => {
      return {
        pagePath: `pages/${item.scene.id}/index`,
        type: item.type,
        text: item.text,
        selectedIconPath: item.selectedIconPath,
        selectedIconStyle: item.selectedIconStyle,
        selectedTextStyle: item.selectedTextStyle,
        normalIconPath: item.normalIconPath,
        normalIconStyle: item.normalIconStyle,
        normalTextStyle: item.normalTextStyle,
        subMenu:
          item.subMenu &&
          item.subMenu.map((item) => {
            return {
              pagePath: `pages/${item.scene.id}/index`,
              text: item.scene.title,
              normalIconPath: item.normalIconPath,
              normalIconStyle: item.normalIconStyle,
              normalTextStyle: item.normalTextStyle,
            };
          }),
      };
    });
  } else {
    return [];
  }
}

function getDepModules(comlibs) {
  if (!Array.isArray(comlibs)) {
    return [];
  }

  if (comlibs.some((lib) => lib?.namespace === "mybricks.normal-chart.taro")) {
    return [
      {
        name: "F2",
        version: "3.8.12",
        library: "F2",
      },
    ];
  }
}

function isPageScene(sceneToJson) {
  return (
    !isPopupScene(sceneToJson) &&
    !isModuleScene(sceneToJson) &&
    sceneToJson.id !== "tabbar"
  );
}

function isPopupScene(sceneToJson) {
  return sceneToJson.type === "popup";
}
function isModuleScene(sceneToJson) {
  return sceneToJson.type === "module";
}
