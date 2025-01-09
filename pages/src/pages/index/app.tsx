import React, { useCallback } from "react";
import qs from "qs";
import { View as App } from "@mybricks/sdk-for-app/ui";
import { pageModel, userModel, tabbarModel, EntryPagePath, versionModel } from "@/stores";
import MyDesigner from "./modules/designer";
import logger from "@/utils/logger";
import "./app.less";

function mpa() {
  // 弹出提示，二次确认是否切换到 MPA 模式
  const confirm = window.confirm("是否切换到 MPA 模式？\n如果切换，将会导致三个问题：\n1、底部标签栏（Tabbar）会失效，需要重新设置；\n2、所有的页面跳转、打开对话框会失效，需要重新连线；\n3、所有的页面路径会发生变化，如果是已对外分享或设置的路径，可以先记录原ID，切换后通过页面别名进行重置。");
  if (!confirm) {
    return;
  }

  // 切换到 MPA 模式
  window.__type__ = "mpa";

  let tabbar = window.__tabbar__.get();

  // 将 tabbar 信息复制到剪切板
  const input = document.createElement("input");
  input.value = JSON.stringify(tabbar);
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);

  window.__tabbar__.set([]);
  // 提示已复制到剪切板
  alert("已切换到 MPA 模式，并已复制底部标签栏数据复制剪切板。\n请点击保存后，刷新页面，手动修改scene.id 字段后，通过 window.__tabbar__.set() 将数据回填。");

}

window.mpa = mpa;

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

    // 老页面继续走 spa，新页面走 mpa，避免 spa 升级到 mpa 时出现问题
    if (
      data.fileContent.content.type?.toLowerCase() === "mpa" ||
      (JSON.stringify(data.fileContent.content) === "{}" &&
        !data.fileContent.content?.type?.toLowerCase())
    ) {
      window.__type__ = "mpa";
    } else {
      window.__type__ = "spa";
    }

    console.log("type", window.__type__);

    //
    userModel.setUser(data.user);

    versionModel.file = { version: data.fileContent.version };

    pageModel.file = data.fileContent;
    pageModel.fileContent = data.fileContent.content || {};

    if (data.fileContent.content.dumpJson) {
      pageModel.isInit = false
      // 初始化页面没有content
      const { pages, meta } = data.fileContent.content.dumpJson
      const { pageAry } = meta;

      const res = {};

      pageAry.forEach(({ id, title, type }) => {
        if (!type || type === "module") {
          // 记录页面和模块
          const pageInfo = pages.find((page) => id === page.id)
          if (pageInfo?.fileId) {
            res[id] = {
              id,
              title,
              type,
              ...pageInfo
            }
          }
        }
      })

      pageModel.pages = res;
    } else {
      pageModel.isInit = true
    }

    pageModel.pageConfig = data.fileContent.content?.pageConfig || {};
    pageModel.sdk = data;
    pageModel.fileId = data.fileId;
    pageModel.projectId = data.projectId;

    pageModel.appConfig = data.fileContent.content?.appConfig || {};
    pageModel.wxConfig = data.fileContent.content?.wxConfig || {};
    pageModel.debug = data.fileContent.content?.debug || {};

    // 首页配置
    new EntryPagePath(data.fileContent.content?.entryPagePath || "");

    // 底部导航栏
    tabbarModel.initFromFileContent(data.fileContent.content);

    // 组件库开发模式
    const urlParams = qs.parse(location.href.split("?")[1]);
    if (
      urlParams["debugServerUrl"] &&
      urlParams["packageName"] &&
      urlParams["namespace"]
    ) {
      logger("launch").log("组件开发模式", urlParams["namespace"]);

      window.__DEBUG_COMLIB__ = {
        id: urlParams["packageName"],
        namespace: urlParams["namespace"],
        version: "0.0.0",
        editJs: `${urlParams["debugServerUrl"]}/libEdt.js`,
        rtJs: `${urlParams["debugServerUrl"]}/rt.js`,
        coms: `${urlParams["debugServerUrl"]}/rtCom.js`,
      };
    }
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
