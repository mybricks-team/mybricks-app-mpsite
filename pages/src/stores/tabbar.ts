import { observable } from "rxui-t";
import logger from "@/utils/logger";

class Tabbar {
  initFromFileContent = (fileContent) => {
    let tabbar = fileContent.tabbar || [];
    logger("tabbar").log("初始化", tabbar);

    // 事件监听列表
    let handlers = [];

    // 全局事件
    (window as any).__tabbar__ = {};

    // 获取 tabbar
    window.__tabbar__.get = () => {
      return tabbar;
    };

    // 增加 tabbar
    window.__tabbar__.set = (value) => {
      tabbar = value;
      handlers.forEach((item) => {
        item.handler(tabbar);
      });
    };

    // 删除 tabbar 项
    window.__tabbar__.remove = (id) => {
      tabbar = tabbar.filter((item) => item.scene.id !== id);

      handlers.forEach((item) => {
        item.handler(tabbar);
      });
    };

    // 监听 tabbar
    window.__tabbar__.on = (key, handler) => {
      handlers.push({
        key,
        handler,
      });
    };

    // 取消监听 tabbar
    window.__tabbar__.off = (key) => {
      handlers = handlers.filter((item) => item.key !== key);
    };
  };
}

export const tabbarModel: Tabbar = observable(new Tabbar());
