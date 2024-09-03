import { getAllModulesJsCode, getPageCssCode } from "../getAllModules";
import axios from "axios";
import { BaseJson } from './base'
import { Css } from "./utils";

export class GetH5Json extends BaseJson {

  constructor() {
    super()
  }

  getJson = async ({ toJson, comlibs, status, title = '', events = {} }) => {

    const { pages, fxFrames, tabBarJson, scenes, depModules, pageCssMap, appConfig } = await this.initJson({ toJson, events, comlibs })

    const rootConfig = {
      scenes,
      fxFrames,
      status,
    }

    let cssContent: any = [];
    pages.forEach(({ id }) => {
      const cssMap = pageCssMap[id];
      Css.forEachCssMap(cssMap, (key, selector, css) => {
        cssContent.push(`
        .${key} ${selector} {
          ${transformStyleToCss(css)} 
        }
        `)
      })
    })
    cssContent = cssContent.join('\n');

    // popup已经被包含到pages里了，所以不要重复提取
    const forAllModules = [...(fxFrames ?? [])].map(j => ({ pageToJson: j }));
    // 提取 js计算 连接器 等组件，并删除 pages, popups,fxFrames中的代码
    let allModules = await getAllModulesJsCode([...pages, ...forAllModules], toJson.plugins);

    const injectScriptContent = await genInjectScript({
      pages,
      tabBarJson,
      rootConfig,
      appConfig,
    });
    this.json.injectScriptContent = await this.babelJs(injectScriptContent);

    // 最后再清理一次 json
    // 最后再清理一次 json
    // 最后再清理一次 json
    this.cleanPagesFromJson(this.json)

    delete this.json.pages;
    delete this.json.tabBarJson;
    delete this.json.fxFrames;
    delete this.json.scenes;

    const params = {
      ...this.json,
      title,
      allComponents: {
        comlibs
      },
      allModules,
      cssContent,
      depModules
    }

    console.warn("toJson2Json", params);
    return params;
  }
}

async function genInjectScript({ tabBarJson, pages, rootConfig, appConfig }) {
  let scriptContent = ``;

  /** 注入全局配置和路由 */
  scriptContent += `
      const tabBarJson = ${JSON.stringify(tabBarJson)};
      const pages = ${JSON.stringify(pages)};

      // 注入全局信息
      window._mybricks_root_config_ = ${JSON.stringify(rootConfig)};

      window._mybricks_inject_ = function(config) {
        // 调整页面信息
        config.entryPagePath = "${appConfig.entryPagePath}";
        config.pages = pages.map(t => t.pagePath);
  
        // 调整路由信息
        const load = config.routes[0].load;
        config.routes = config.pages.map(t => {
          return {
            path: t,
            load,
          }
        })
  
        // 调整Tabbar配置
        if (tabBarJson[0] && tabBarJson[0].normalTextStyle) {
          config.tabBar.color = tabBarJson[0].normalTextStyle.color;
          config.tabBar.selectedColor = tabBarJson[0].selectedTextStyle.color;
        }

        var tabBarList = tabBarJson;
        if (tabBarJson.length < 2) {
          tabBarList = [
            {
              pagePath: '__place__1',
              text: '系统占位1_没有这个占位，跳转会报错',
            },
            {
              pagePath: '__place__2',
              text: '系统占位2_没有这个占位，跳转会报错',
            }
          ]
        }
        config.tabBar.list = tabBarList.map(c => ({
          pagePath: c.pagePath,
          text: c.text,
          iconPath: c.normalIconPath,
          selectedIconPath: c.selectedIconPath,
        }))
  
        console.warn('config ==>', config)
      }
  
      // 注入页面Json
      window._mybricks_page_config_ = {};
      pages.forEach(p => {
        const sceneId = p.pagePath.split('/').reverse()[1];
        _mybricks_page_config_[sceneId]= p;
      })
    `;

  // /** 注入所有组件Rt */
  // scriptContent += `
  //   // 注入组件信息
  //   window._mybricks_loaded_comlibs_ = () => new Promise((resolve, reject) => {
  //     const script = document.createElement('script');
  //     script.src = "http://localhost:5500/dist/lib/rt.js";

  //     let comdefs = {}
  //     script.onload = () => {
  //       __comlibs_rt_[0].comAray.forEach(com => {
  //         if (Array.isArray(com.comAray)) {
  //           com.comAray.forEach(com => {
  //             comdefs[com.namespace + '-' + com.version] = com;
  //             comdefs[com.namespace] = com;
  //           })
  //           return
  //         }
  //         comdefs[com.namespace + '-' + com.version] = com;
  //         comdefs[com.namespace] = com;
  //       })
  //       console.log(comdefs)
  //       resolve(comdefs)
  //     }

  //     document.body.appendChild(script)
  //   })
  // `;

  return `
      (function() {
        ${scriptContent}
      })(window);
  `;
}

function transformStyleToCss(obj) {
  let result = [];
  Object.keys(obj).forEach((key) => {
    if (key !== "styleEditorUnfold") {
      result.push(`${Css.camelToKebab(key)}: ${Css.px2Vw(obj[key])};`);
    }
  });
  return result.join("\n");
}

