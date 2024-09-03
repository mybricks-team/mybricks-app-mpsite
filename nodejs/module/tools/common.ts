import { APPType } from "../types";
import { Logger } from "@mybricks/rocker-commons";
export const getAppTypeFromTemplate = (template: string) => {
  let app_type = APPType.React;
  try {
    const APP_TYPE_COMMIT = Array.from(template.match(/<!--(.*?)-->/g)).find(
      (matcher) => matcher.includes("_APP_TYPE_")
    );
    if (APP_TYPE_COMMIT.includes(APPType.Vue2)) {
      app_type = APPType.Vue2;
    }
    if (APP_TYPE_COMMIT.includes(APPType.React)) {
      app_type = APPType.React;
    }
  } catch (error) {
    Logger.error("template need appType");
  }
  return app_type;
};
