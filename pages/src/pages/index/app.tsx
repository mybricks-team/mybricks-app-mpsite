import React, { useCallback } from "react";
import { View as App } from "@mybricks/sdk-for-app/ui";
import { pageModel, userModel, tabbarModel } from "@/stores";
import MyDesigner from "./modules/designer";
import logger from "@/utils/logger";
import "./app.less";

const Application = () => {
  const handleRef = useCallback((ref) => {
    logger("init").log(ref);

    userModel.setUser(ref.user);
    pageModel.file = ref.fileContent;
    pageModel.fileContent = ref.fileContent.content || {};
    pageModel.pageConfig = ref.fileContent.content?.pageConfig || {};
    pageModel.sdk = ref;
    pageModel.fileId = ref.fileId;
    pageModel.projectId = ref.projectId;

    pageModel.appConfig = ref.fileContent.content?.appConfig || {};
    pageModel.wxConfig = ref.fileContent.content?.wxConfig || {};
    pageModel.customComlib = ref.fileContent.content?.customComlib || {};
    pageModel.debug = ref.fileContent.content?.debug || {};

    // 底部导航栏
    tabbarModel.initFromFileContent(ref.fileContent.content);
  }, []);

  return (
    <App
      onLoad={(appData) => {
        handleRef(appData);
        return <MyDesigner appData={appData} />;
      }}
    />
  );
};
export default Application;
