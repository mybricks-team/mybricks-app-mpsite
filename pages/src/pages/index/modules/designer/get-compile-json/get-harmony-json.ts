import { COMPONENT_NAMESPACE } from "@/constants";
import { getAllModulesJsCode } from "../getAllModules";
import { isPageScene, findComFromToJson, rgbaToHex } from "./utils";

export class GetHarmonyJson {

  private getTabbarConfig = () => {
    const tabbarJson = window.__tabbar__.get()
    if (!Array.isArray(tabbarJson)) {
      return []
    }

    let tabBar = tabbarJson.filter((item) => {
      return !!item.scene.id;
    });

    let useTabBar = tabBar.length >= 2 && tabBar.length <= 5;

    if (useTabBar) {
      return tabBar.map((item) => {
        return {
          id: item.scene.id,
          pagePath: `pages/${item.scene.id}/index`,
          type: item.type,
          text: item.text,
          selectedIconPath: item.selectedIconPath,
          selectedIconStyle: item.selectedIconStyle,
          selectedTextStyle: item.selectedTextStyle,
          selectedBackgroundStyle: item.selectedBackgroundStyle,
          normalIconPath: item.normalIconPath,
          normalIconStyle: item.normalIconStyle,
          normalTextStyle: item.normalTextStyle,
          normalBackgroundStyle: item.normalBackgroundStyle,
        };
      });
    } else {
      return [];
    }
  }

  private getEntryPage = (toJson) => {
    const tabbarJson = window.__tabbar__.get()
    let tabBar = tabbarJson.filter((item) => {
      return !!item.scene.id;
    });

    let entryPageId

    let useTabBar = tabBar.length >= 2 && tabBar.length <= 5;
    entryPageId = window.__entryPagePath__?.get() || "";

    if (!!!entryPageId) {
      entryPageId = useTabBar ? tabBar[0].scene.id : toJson.scenes[0].id
    }
    return entryPageId
  }

  private getPages = (toJson) => {
    return toJson.scenes
      .filter((item) => {
        return isPageScene(item);
      })
      .map((item) => {
        let pageConfig = {} as any;

        switch (true) {
          // 其他页面使用自定义配置
          default: {
            /**
             * start
             */
            let config = findComFromToJson(item, COMPONENT_NAMESPACE.systemPage)?.model?.data;

            // 网页页面可能没有这个组件，需要从 systemWebview 中获取
            if (!config) {
              config = findComFromToJson(item, COMPONENT_NAMESPACE.systemWebview)?.model?.data;
            }

            switch (config.navigationStyle) {
              case "default":
                pageConfig.navigationStyle = "default";
                pageConfig.navigationBarStyle = config.navigationBarStyle;
                pageConfig.statusBarStyle = config.statusBarStyleStyle;
                pageConfig.navigationBarTitleText = config.navigationBarTitleText;
                pageConfig.disableScroll = config.disableScroll;
                pageConfig.homeButton = config.homeButton;
                pageConfig.showBackIcon = config.showBackIcon;
                break;
              case "custom":
                pageConfig.navigationStyle = "custom";
                pageConfig.navigationBarStyle = config.navigationBarStyle;
                pageConfig.statusBarStyle = config.statusBarStyleStyle;
                pageConfig.disableScroll = config.disableScroll;
                pageConfig.homeButton = config.homeButton;
                break;
              case "none":
                pageConfig.navigationStyle = "none";
                pageConfig.statusBarStyle = config.statusBarStyleStyle;
                break;
            }
            /**
             * end
             */
          }
        }

        return {
          id: item.id,
          pageConfig: pageConfig,
        };
      });
  }

  getJson = async ({ toJson, comlibs, events = {} }) => {
    const pages = this.getPages(toJson);
    const tabBarJson = this.getTabbarConfig();
    const entryPageId = this.getEntryPage(toJson);

    // popup已经被包含到pages里了，所以不要重复提取
    const forAllModules = [...(toJson.global.fxFrames ?? [])].map((j) => ({ pageToJson: j }));
    // 提取 js计算 连接器 等组件，并删除 pages, popups,fxFrames中的代码
    let allModules = await getAllModulesJsCode(
      [...toJson.scenes?.map(t => ({ pageToJson: t })), ...forAllModules],
      toJson.plugins,
      {
        isHarmony: true,
      }
    );

    const params = {
      pages,
      entryPageId,
      tabBarJson,
      allModules,
    };

    return params;
  };
}
