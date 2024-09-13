import React, { useCallback } from "react";
import { View as App } from "@mybricks/sdk-for-app/ui";
import { pageModel, userModel, tabbarModel, EntryPagePath } from "@/stores";
import MyDesigner from "./modules/designer";
import logger from "@/utils/logger";
import "./app.less";

const Application = () => {
  const handler = useCallback((data) => {
    /**
     * data
     *  - fileId 文件ID
     *  - user 登录用户信息
     *  - config 配置信息
     *  - defaultComlibs 默认组件库
     *  - fileContent
     *    - name 文件名
     *    - version 当前版本号
     *    - content
     *      - dumpJson 页面协议
     *      - appConfig 应用级配置
     *      - debug 应用级调试配置
     *      - comlibs 组件库配置
     *      - tabbar 底部导航栏
     *      - wxConfig 微信配置
     */
    logger("launch").log(data);

    userModel.setUser(data.user);

    pageModel.file = data.fileContent;
    pageModel.fileContent = data.fileContent.content || {};
    pageModel.pageConfig = data.fileContent.content?.pageConfig || {};
    pageModel.sdk = data;
    pageModel.fileId = data.fileId;
    pageModel.projectId = data.projectId;

    pageModel.appConfig = data.fileContent.content?.appConfig || {};
    pageModel.wxConfig = data.fileContent.content?.wxConfig || {};
    pageModel.customComlib = data.fileContent.content?.customComlib || {};
    pageModel.debug = data.fileContent.content?.debug || {};

    // 首页配置
    new EntryPagePath(data.fileContent.content?.entryPagePath || "");

    // 底部导航栏
    tabbarModel.initFromFileContent(data.fileContent.content);
  }, []);

  return (
    <App
      onLoad={(appData) => {
        handler(appData);
        return <MyDesigner appData={appData} />;
      }}
    />
  );
};
export default Application;
