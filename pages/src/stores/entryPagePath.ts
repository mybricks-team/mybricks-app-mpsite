import logger from "@/utils/logger";

export class EntryPagePath {
  // 当前值
  value: string = "";

  // 事件监听列表
  handlers = [];

  constructor(defaultValue) {
    this.value = defaultValue;
    logger("entryPagePath").log("init", this.value);

    // 全局事件
    (window as any).__entryPagePath__ = {};

    // 获取 entryPagePath
    window.__entryPagePath__.get = () => {
      return this.value;
    };

    // 修改 entryPagePath
    window.__entryPagePath__.set = (value) => {
      this.value = value;
      logger("entryPagePath").log("set", this.value);
      this.handlers.forEach((item) => {
        item.handler(this.value);
      });
    };

    // 监听 entryPagePath
    window.__entryPagePath__.on = (key, handler) => {
      this.handlers.push({
        key,
        handler,
      });
    };

    // 取消监听 entryPagePath
    window.__entryPagePath__.off = (key) => {
      this.handlers = this.handlers.filter((item) => item.key !== key);
    };
  }
}
