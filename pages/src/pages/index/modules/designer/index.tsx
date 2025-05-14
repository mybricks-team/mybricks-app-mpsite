import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { message, Modal, notification } from "antd";
import { pageModel, userModel, contentModel, versionModel } from "@/stores";
import axios from "axios";
import dayjs from "dayjs";
import API from "@mybricks/sdk-for-app/api";
import { previewModel } from "./pop-overs";
import styles from "./index.less";
import { writeLocalProject, supportFSAccess } from "./readwrite-to-local";
import { getH5Json, getMiniappJson, getHarmonyJson } from "./get-compile-json";
import { handlePublishErrCode, showCompileSuccess } from "./../publishModal";
import {
  showH5PublishSuccessModal,
  showWeappPublishSuccessModal,
} from "./modals";
import AppToolbar from "./toolbar";

import config from "./app-config";
import { useFxServices } from "../utils/use-fx-services";

import { getLibsFromConfig } from "@/utils/getComlibs";
import { sleep, isDesignFilePlatform } from "@/utils";
import { CompileType } from "@/types";
import { DESIGNER_STATIC_PATH } from "../../../../constants";
import { ExclamationCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import hmdownloadtmp from "./hmdownloadtmp";

// message.success(
//  "保存成功",
//  null
// )

// notification.open({
//   message: (
//     <div>
//       <CheckCircleFilled style={{color: "#52c41a", marginRight: 8}}/>
//       <span>保存完成</span>
//     </div>
//   ),
//   placement: "top",
//   description: (
//     <>
//       {/* <div style={{ marginLeft: 24 }}>
//         保存内容：应用配置，<b style={{ color: "#FA6400" }}>画布3</b>，<b style={{ color: "#FA6400" }}>画布4</b>
//       </div> */}
//       {/* <div style={{ display: 'flex' }}>
//         <div><ExclamationCircleFilled style={{color: "#faad14", marginRight: 8, marginLeft: 2}}/>注意：</div>
//         <div>
//           <div>以下内容未保存</div>
//           <div>
//             <b style={{ color: "#FA6400" }}>全局配置</b>，<b style={{ color: "#FA6400" }}>画布1</b>，<b style={{ color: "#FA6400" }}>画布2</b>
//           </div>
//         </div>
//       </div> */}
//       <div style={{ marginLeft: 24 }}>修改内容都已保存</div>
//     </>
//   ),
//   duration: null
// });

function extractVersion(url = "") {
  // 使用正则表达式匹配版本号
  const regex = /\/(\d+\.\d+\.\d+)\/index\.min\.js/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function compareVersions(version1, version2) {
  // 将版本号分割成数组
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);

  // 获取最长版本号的长度
  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  // 比较每一位版本号
  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0; // 如果版本号位数不够，则使用 0
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) {
      return 1; // version1 大于 version2
    }
    if (v1Part < v2Part) {
      return -1; // version1 小于 version2
    }
  }

  return 0; // version1 等于 version2
}

/** 获取Script脚本的具体内容 */
const getScrtptContentFromNetwork = async (url) => {
  const response = await fetch(url, { method: "GET", mode: "cors" });
  if (!response.ok) {
    throw new Error(`Network response was not ok ${response.statusText}`);
  }
  const content = await response.text();
  return { content };
};

const injectComlibsScriptContent = async (data) => {
  if (!Array.isArray(data?.allComponents?.comlibs)) {
    return;
  }
  const res = await Promise.all(
    data?.allComponents?.comlibs
      .map((t) => t.rtJs)
      .filter((t) => !!t)
      .map((t) => getScrtptContentFromNetwork(t))
  );
  // 这里只需要让_mybricks_loaded_comlibs_调用的时候执行组件初始化就行，这个时机才有React、Taro依赖的东西，同时不需要返回有意义的对象，因为rendertaro会去获取_comlib_rt_的东西
  const scriptContent = `
      function execComlibs() {
          ${res.map((r) => r.content).join("\n")}
      }
      window._mybricks_loaded_comlibs_ = function() { execComlibs(); return Promise.resolve({}) }
  `;
  return scriptContent;
};

let lastCooperationAry;

const Designer = ({ appData }) => {
  const [beforeunload, setBeforeunload] = useState(false);
  const [operable, setOperable] = useState(false);
  const [globalOperable, setGlobalOperable] = useState(false);
  const designerRef = useRef<{ switchActivity; dump; toJSON }>();
  const [SPADesigner, setSPADesigner] = useState(null);

  useMemo(() => {
    (window as any).designerRef = designerRef
  }, [])

  const [ctx] = useState({
    sdk: appData,
    user: appData.user,
    comlibs: getLibsFromConfig(appData, isDesignFilePlatform('harmony')),
    latestComlibs: [],
    hasMaterialApp: appData.hasMaterialApp,
    setting: appData.config || {},
  });

  const [latestComlibs, setLatestComlibs] = useState<[]>();

  const appConfig = useMemo(() => {
    let config = null;
    try {
      const originConfig = appData.config[APP_NAME]?.config || {};
      config =
        typeof originConfig === "string"
          ? JSON.parse(originConfig)
          : originConfig;
    } catch (error) {
      console.error("get appConfig error", error);
    }
    return config || {};
  }, [appData.config[APP_NAME]?.config]);

  const designer = useMemo(() => {
    const staticDesignerVerion = extractVersion(DESIGNER_STATIC_PATH);
    const dynamicDesignerVerion = extractVersion(appConfig?.designer?.url);

    // 如果静态版本号大于动态版本号，使用静态版本号
    if (staticDesignerVerion && dynamicDesignerVerion) {
      if (compareVersions(staticDesignerVerion, dynamicDesignerVerion) > 0) {
        return DESIGNER_STATIC_PATH;
      } else {
        return appConfig.designer?.url || DESIGNER_STATIC_PATH;
      }
    }
    return DESIGNER_STATIC_PATH;
  }, [appConfig]);

  useMemo(() => {
    if (designer) {
      const script = document.createElement("script");
      script.src = designer;
      document.head.appendChild(script);
      script.onload = () => {
        (window as any).mybricks.SPADesigner &&
          setSPADesigner((window as any).mybricks.SPADesigner);
      };
    }
  }, [designer]);

  useEffect(() => {
    const needSearchComlibs = ctx.comlibs.filter(
      (lib) => lib.id !== "_myself_"
    );
    if (!!needSearchComlibs?.length) {
      API.Material.getLatestComponentLibrarys(
        needSearchComlibs.map((lib) => lib.namespace)
      ).then((res: any) => {
        const latestComlibs = (res || []).map((lib) => ({
          ...lib,
          ...JSON.parse(lib.content),
        }));
        setLatestComlibs(latestComlibs);
      });
    } else {
      setLatestComlibs([]);
    }
  }, [JSON.stringify(ctx.comlibs.map((lib) => lib.namespace))]);

  useMemo(() => {
    contentModel.initFromFileContent(pageModel.fileContent);
    contentModel.preloadOpenedPagesContent();
  }, []);

  useEffect(() => {
    contentModel.initDesigner(designerRef);
  }, []);

  useEffect(() => {
    if (beforeunload) {
      window.onbeforeunload = () => {
        return true;
      };
    } else {
      window.onbeforeunload = null;
    }
  }, [beforeunload]);

  const download = useCallback(({ type, backEndProjectPath, localize = 0 }) => {
    // const loadingKey = 'donwload'
    // message.loading({
    //   content: '下载中...',
    //   key: loadingKey,
    // })

    const urls = [
      {
        url: `/api/compile/download?fileId=${pageModel.fileId}&type=${type}&localize=${localize}`,
        filename: `${pageModel.fileId}-${type}.zip`,
      },
      // {
      //   url: `/paas/api/project/download?fileId=${pageModel.fileId}&target=prod`,
      //   filename: `node-app-${pageModel.fileId}-prod.zip`,
      // },
    ];

    urls.forEach((item) => {
      let a = document.createElement("a");
      a.style = "display: none"; // 创建一个隐藏的a标签
      a.download = item.filename;
      a.href = item.url;
      document.body.appendChild(a);
      a.click(); // 触发a标签的click事件
      a.onload = () => {};
      a.onerror = (err) => {
        console.error(err);
      };
      document.body.removeChild(a);
    });

    // (() => {
    //   let a = document.createElement("a");
    //   a.style = "display: none"; // 创建一个隐藏的a标签
    //   a.download = filename;
    //   a.href = `/api/compile/download?fileId=${pageModel.fileId}&type=${type}&localize=${localize}`;
    //   document.body.appendChild(a);
    //   a.click(); // 触发a标签的click事件
    //   a.onload = () => {};
    //   a.onerror = (err) => {
    //     console.error(err);
    //   };
    //   document.body.removeChild(a);
    // })()
    //   .catch((err) => {
    //     message.error(err?.message ?? "下载失败");
    //   })
    //   .finally(() => {
    //     // message.destroy(loadingKey)
    //   });
  }, []);

  const showPublishLoading = useCallback(async () => {
    pageModel.publishLoading = true;
    // 有一些大项目后面会CPU 100%，先让loading展示出来
    await sleep(300);
  }, []);

  /**
   * 保存
   */
  const onSave = useCallback(async (tip = true) => {
    const userId = userModel.user?.id;
    if (!userId) {
      return true;
    }

    if (!pageModel.canSave) {
      return true;
    }

    await contentModel
      .save(ctx)
      .then((res) => {
        if (pageModel.isNew && window.__type__ === "mpa") {
          if (!!tip) {
            if (!res || !res.saves) {
              // const { canvas } = contentModel.editRecord;
              // const notSaves = []

              // Array.from(canvas).forEach((id, index) => {
              //   const page = pageModel.pages[id]
              //   if (page) {
              //     if (index === canvas.size - 1) {
              //       notSaves.push(<b style={{ color: "#FA6400" }}>{page.title}</b>)
              //     } else {
              //       notSaves.push(<><b style={{ color: "#FA6400" }}>{page.title}</b>，</>)
              //     }
              //   }
              // })
              const { notCanvasSaves, notModuleSaves } = res;

              notification.open({
                message: (
                  <div>
                    <CheckCircleFilled
                      style={{ color: "#52c41a", marginRight: 8 }}
                    />
                    <span>没有内容保存</span>
                  </div>
                ),
                placement: "top",
                description:
                  contentModel.editRecord.global ||
                  notCanvasSaves.length ||
                  notModuleSaves.length ? (
                    <div style={{ display: "flex" }}>
                      <div>
                        <ExclamationCircleFilled
                          style={{
                            color: "#faad14",
                            marginRight: 8,
                            marginLeft: 2,
                          }}
                        />
                        注意：
                      </div>
                      <div style={{ flex: 1 }}>
                        <div>以下内容未保存</div>
                        <div>
                          <div>
                            {contentModel.editRecord.global ? (
                              <>
                                <b style={{ color: "#FA6400" }}>
                                  应用配置(全局、插件)
                                  <span
                                    style={{
                                      fontWeight: 400,
                                      color: "black",
                                      fontSize: 12,
                                    }}
                                  >
                                    {" "}
                                    - 没有应用锁
                                  </span>
                                </b>
                              </>
                            ) : null}
                          </div>
                          <div>
                            {notCanvasSaves.map(({ title }, index) => (
                              <>
                                <b style={{ color: "#FA6400" }}>{title}</b>
                                {notCanvasSaves.length - 1 === index
                                  ? ""
                                  : "，"}
                              </>
                            ))}
                            {notCanvasSaves.length ? (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "black",
                                  fontSize: 12,
                                }}
                              >
                                {" "}
                                - 没有画布锁
                              </span>
                            ) : null}
                          </div>
                          <div>
                            {notModuleSaves.map(({ title }, index) => (
                              <>
                                <b style={{ color: "#FA6400" }}>{title}</b>
                                {notModuleSaves.length - 1 === index
                                  ? ""
                                  : "，"}
                              </>
                            ))}
                            {notModuleSaves.length ? (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "black",
                                  fontSize: 12,
                                }}
                              >
                                {" "}
                                - 没有模块锁
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null,
              });
            } else {
              const { notCanvasSaves, notModuleSaves } = res;
              if (pageModel.globalOperable) {
                // 还要判断下有没有全局的修改
                notification.open({
                  message: (
                    <div>
                      <CheckCircleFilled
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />
                      <span>保存完成</span>
                    </div>
                  ),
                  placement: "top",
                  description:
                    notCanvasSaves.length || notModuleSaves.length ? (
                      <div style={{ display: "flex" }}>
                        <div>
                          <ExclamationCircleFilled
                            style={{
                              color: "#faad14",
                              marginRight: 8,
                              marginLeft: 2,
                            }}
                          />
                          注意：
                        </div>
                        <div style={{ flex: 1 }}>
                          <div>以下内容未保存</div>
                          <div>
                            {notCanvasSaves.map(({ title }, index) => (
                              <>
                                <b style={{ color: "#FA6400" }}>{title}</b>
                                {notCanvasSaves.length - 1 === index
                                  ? ""
                                  : "，"}
                              </>
                            ))}
                            {notCanvasSaves.length ? (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "black",
                                  fontSize: 12,
                                }}
                              >
                                {" "}
                                - 没有画布锁
                              </span>
                            ) : null}
                          </div>
                          <div>
                            {notModuleSaves.map(({ title }, index) => (
                              <>
                                <b style={{ color: "#FA6400" }}>{title}</b>
                                {notModuleSaves.length - 1 === index
                                  ? ""
                                  : "，"}
                              </>
                            ))}
                            {notModuleSaves.length ? (
                              <span
                                style={{
                                  fontWeight: 400,
                                  color: "black",
                                  fontSize: 12,
                                }}
                              >
                                {" "}
                                - 没有模块锁
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginLeft: 24 }}>修改内容都已保存</div>
                    ),
                });
                if(notCanvasSaves.length || notModuleSaves.length){
                  setBeforeunload(true)
                }else{
                  setBeforeunload(false)
                }
              } else {
                notification.open({
                  message: (
                    <div>
                      <CheckCircleFilled
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />
                      <span>保存完成</span>
                    </div>
                  ),
                  placement: "top",
                  // description: notSaves.length ? (
                  //   <div style={{ display: 'flex' }}>
                  //     <div><ExclamationCircleFilled style={{color: "#faad14", marginRight: 8, marginLeft: 2}}/>注意：</div>
                  //     <div style={{ flex: 1 }}>
                  //       <div>以下内容未保存</div>
                  //       <div>
                  //         {contentModel.editRecord.global ? <><b style={{ color: "#FA6400" }}>应用配置(全局、插件) <span style={{fontWeight: 400, color: "black", fontSize: 12}}>- 没有应用锁</span></b>，</> : null}
                  //         {notSaves.map(({ title }, index) => {
                  //           return (
                  //             <>
                  //               <b style={{ color: "#FA6400" }}>{title}</b>{index === notSaves.length - 1 ? "" : "，"}
                  //             </>
                  //           )
                  //         })}
                  //       </div>
                  //     </div>
                  //   </div>
                  // ) : (contentModel.editRecord.global ? (
                  //   <div style={{ display: 'flex' }}>
                  //     <div><ExclamationCircleFilled style={{color: "#faad14", marginRight: 8, marginLeft: 2}}/>注意：</div>
                  //     <div style={{ flex: 1 }}>
                  //       <div>以下内容未保存</div>
                  //       <div>
                  //         <b style={{ color: "#FA6400" }}>应用配置(包含全局、模块、插件) <span style={{fontWeight: 400, color: "black", fontSize: 12}}>- 没有应用锁</span></b>
                  //       </div>
                  //     </div>
                  //   </div>
                  // ) : (
                  //   <div style={{ marginLeft: 24 }}>修改内容都已保存</div>
                  // ))
                  description:
                    contentModel.editRecord.global ||
                    notCanvasSaves.length ||
                    notModuleSaves.length ? (
                      <div style={{ display: "flex" }}>
                        <div>
                          <ExclamationCircleFilled
                            style={{
                              color: "#faad14",
                              marginRight: 8,
                              marginLeft: 2,
                            }}
                          />
                          注意：
                        </div>
                        <div style={{ flex: 1 }}>
                          <div>以下内容未保存</div>
                          <div>
                            <div>
                              {contentModel.editRecord.global ? (
                                <>
                                  <b style={{ color: "#FA6400" }}>
                                    应用配置(全局、插件)
                                    <span
                                      style={{
                                        fontWeight: 400,
                                        color: "black",
                                        fontSize: 12,
                                      }}
                                    >
                                      {" "}
                                      - 没有应用锁
                                    </span>
                                  </b>
                                </>
                              ) : null}
                            </div>
                            <div>
                              {notCanvasSaves.map(({ title }, index) => (
                                <>
                                  <b style={{ color: "#FA6400" }}>{title}</b>
                                  {notCanvasSaves.length - 1 === index
                                    ? ""
                                    : "，"}
                                </>
                              ))}
                              {notCanvasSaves.length ? (
                                <span
                                  style={{
                                    fontWeight: 400,
                                    color: "black",
                                    fontSize: 12,
                                  }}
                                >
                                  {" "}
                                  - 没有画布锁
                                </span>
                              ) : null}
                            </div>
                            <div>
                              {notModuleSaves.map(({ title }, index) => (
                                <>
                                  <b style={{ color: "#FA6400" }}>{title}</b>
                                  {notModuleSaves.length - 1 === index
                                    ? ""
                                    : "，"}
                                </>
                              ))}
                              {notModuleSaves.length ? (
                                <span
                                  style={{
                                    fontWeight: 400,
                                    color: "black",
                                    fontSize: 12,
                                  }}
                                >
                                  {" "}
                                  - 没有模块锁
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginLeft: 24 }}>修改内容都已保存</div>
                    ),

                });
                if(contentModel.editRecord.global ||
                  notCanvasSaves.length ||
                  notModuleSaves.length){
                  setBeforeunload(true)
                }else{
                  setBeforeunload(false)
                }
              }
            }
          }
        } else {
          !!tip && message.success("保存完成");
          setBeforeunload(false);
        }

      })
      .catch((e) => {
        !!tip && message.error(`保存失败：${e.message}`);
        setBeforeunload(false);
      });

    // 同时保存下图片
    // 如果不保存图片呢？保存图片有点bug
    // API.App.getPreviewImage({
    //   element: designerRef.current?.geoView.canvasDom?.firstChild,
    // })
    //   .then((res) => {
    //     // @ts-ignore
    //     return API.File.save({
    //       userId: userModel.user?.id,
    //       fileId: pageModel.fileId,
    //       icon: res,
    //     });
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
  }, []);

  const onPreview = useCallback(async (compileLevel?) => {
    if (previewModel.isLoading()) {
      return;
    }

    previewModel.loading({
      title: "微信扫码预览",
    });

    // 对一些大项目，babel时间比较久，会假死，先停一下把loading展示出来先，后面优化一下去掉
    await sleep(300);

    (async () => {
      // pageModel.previewStatusTips.push("正在加载所有搭建数据...");
      const toJson = await contentModel.toJSON();

      let comlibs = [...ctx.comlibs];
      if (window.__DEBUG_COMLIB__) {
        let containIndex = comlibs.findIndex((lib) => {
          return (
            lib.id === window.__DEBUG_COMLIB__.id ||
            lib.namespace === window.__DEBUG_COMLIB__.namespace
          );
        });

        if (containIndex > -1) {
          comlibs.splice(containIndex, 1, window.__DEBUG_COMLIB__);
        } else {
          comlibs.push(window.__DEBUG_COMLIB__);
        }
      }

      const json = await getMiniappJson({
        toJson: {
          ...toJson,
          tabbar: window.__tabbar__.get(),
        },
        ci: {
          appid: pageModel.wxConfig.appid,
          privateKey: decodeURIComponent(pageModel.wxConfig.privateKey || ""),
          type: "miniProgram",
          version: "1.0.0",
          desc: "版本说明",
        },
        status: {
          projectId: pageModel.sdk.projectId,
          ...pageModel.appConfig,
          apiEnv: "staging",
          appid: pageModel.wxConfig.appid,
          appsecret: pageModel.wxConfig.appsecret,
        },
        comlibs: comlibs,
        events: {
          onBeforeTransformJson: () => {
            // pageModel.previewStatusTips.push("正在处理搭建数据...");
          },
          onBeforeTransformCode: () => {
            // pageModel.previewStatusTips.push("正在处理和压缩代码...");
          },
        },
      });

      // pageModel.previewStatusTips.push("正在构建及上传小程序...");

      const res = await axios({
        url: "/api/compile/miniapp/preview",
        method: "POST",
        data: {
          userId: userModel.user?.id,
          fileId: pageModel.fileId,
          fileName: pageModel.file.name,
          data: {
            ...json,
            services: toJson.services,
            serviceFxUrl: pageModel.appConfig.serviceFxUrl,
            database: pageModel.appConfig.datasource,
          },
          compileLevel,
        },
        withCredentials: false,
      });

      let data = res.data;

      if (data.code !== 1) {
        previewModel.close();
        handlePublishErrCode(data);

        if (data.innerMessage) {
          message.error(data.innerMessage);
        }
        return;
        // throw new Error(data?.message ?? "构建失败，请重试");
      }

      previewModel.success({
        qrcodeUrl: data?.qrcode,
      });
    })().catch((err) => {
      previewModel.fail();
      message.error({ content: err.message ?? "构建小程序失败，请重试" });
      console.error(err);
    });
  }, []);

  const onPublish = useCallback(
    async ({
      type = CompileType.weapp,
      version = "1.0.0",
      description = "版本说明",
    }: {
      type: CompileType;
      version: string;
      description: string;
    }) => {
      if (!pageModel.operable) {
        // 没有页面级权限
        return true;
      }
      if (pageModel?.publishLoading) {
        return;
      }
      await showPublishLoading();

      await onSave(false);

      try {
        const toJson = await contentModel.toJSON();

        //
        let comlibs = [...ctx.comlibs];
        if (window.__DEBUG_COMLIB__) {
          let containIndex = comlibs.findIndex((lib) => {
            return (
              lib.id === window.__DEBUG_COMLIB__.id ||
              lib.namespace === window.__DEBUG_COMLIB__.namespace
            );
          });

          if (containIndex > -1) {
            comlibs.splice(containIndex, 1, window.__DEBUG_COMLIB__);
          } else {
            comlibs.push(window.__DEBUG_COMLIB__);
          }
        }

        const json = await getMiniappJson({
          toJson: {
            ...toJson,
            tabbar: window.__tabbar__.get(),
          },
          ci: {
            appid: pageModel.wxConfig.appid,
            privateKey: decodeURIComponent(pageModel.wxConfig.privateKey || ""),
            type: "miniProgram",
            version,
            desc: description,
          },
          status: {
            projectId: pageModel.sdk.projectId,
            fileId: pageModel.fileId,
            apiEnv: "prod",
            ...pageModel.appConfig,
            appid: pageModel.wxConfig.appid,
            appsecret: pageModel.wxConfig.appsecret,
          },
          comlibs: comlibs,
        });

        const res = await axios({
          url: "/api/compile/miniapp/publish",
          method: "POST",
          data: {
            userId: userModel.user?.id,
            fileId: pageModel.fileId,
            fileName: pageModel.file.name,
            type,
            data: {
              ...json,
              services: toJson.services,
              serviceFxUrl: pageModel.appConfig.serviceFxUrl,
              database: pageModel.appConfig.datasource,
            },
          },
          withCredentials: false,
        });
        let data = res.data;

        if (data.code !== 1) {
          handlePublishErrCode(data);
          pageModel.publishLoading = false;

          if (data.innerMessage) {
            message.error(data.innerMessage);
          }
          return;
          // throw new Error(data?.data ?? data?.message);
        }
        showWeappPublishSuccessModal();
      } catch (e) {
        console.error(e);
        message.error(e?.message ?? "构建小程序失败，请重试");
        console.error(e?.message ?? "构建小程序失败，请重试");
      }

      pageModel.publishLoading = false;
    },
    [onSave]
  );

  /**
   * 支付宝预览
   */
  const onAlipayPreview = useCallback(async (compileLevel?) => {
    if (previewModel.isLoading()) {
      return;
    }

    previewModel.loading({
      title: "支付宝扫码预览",
    });

    // 对一些大项目，babel时间比较久，会假死，先停一下把loading展示出来先，后面优化一下去掉
    await sleep(300);

    (async () => {
      const toJson = await contentModel.toJSON();

      let comlibs = [...ctx.comlibs];
      if (window.__DEBUG_COMLIB__) {
        let containIndex = comlibs.findIndex((lib) => {
          return (
            lib.id === window.__DEBUG_COMLIB__.id ||
            lib.namespace === window.__DEBUG_COMLIB__.namespace
          );
        });

        if (containIndex > -1) {
          comlibs.splice(containIndex, 1, window.__DEBUG_COMLIB__);
        } else {
          comlibs.push(window.__DEBUG_COMLIB__);
        }
      }

      const json = await getMiniappJson({
        toJson: {
          ...toJson,
          tabbar: window.__tabbar__.get(),
        },
        ci: {
          appid: pageModel.wxConfig.appid,
          privateKey: decodeURIComponent(pageModel.wxConfig.privateKey || ""),
          type: "miniProgram",
          version: "1.0.0",
          desc: "版本说明",
        },
        status: {
          projectId: pageModel.sdk.projectId,
          ...pageModel.appConfig,
          apiEnv: "staging",
          appid: pageModel.wxConfig.appid,
          appsecret: pageModel.wxConfig.appsecret,
        },
        comlibs: comlibs,
        events: {
          onBeforeTransformJson: () => {
            // pageModel.previewStatusTips.push("正在处理搭建数据...");
          },
          onBeforeTransformCode: () => {
            // pageModel.previewStatusTips.push("正在处理和压缩代码...");
          },
        },
      });

      // pageModel.previewStatusTips.push("正在构建及上传小程序...");

      const res = await axios({
        url: "/api/compile/alipay/preview",
        method: "POST",
        data: {
          userId: userModel.user?.id,
          fileId: pageModel.fileId,
          fileName: pageModel.file.name,
          data: {
            ...json,
          },
          compileLevel,
        },
        withCredentials: false,
      });

      let data = res.data;

      if (data.code !== 1) {
        previewModel.close();
        handlePublishErrCode(data);

        if (data.innerMessage) {
          message.error(data.innerMessage);
        }
        return;
        // throw new Error(data?.message ?? "构建失败，请重试");
      }

      previewModel.success({
        qrcodeUrl: data?.qrcode,
      });
    })().catch((err) => {
      previewModel.fail();
      message.error({ content: err.message ?? "构建小程序失败，请重试" });
      console.error(err);
    });
  }, []);

  const onH5Publish = useCallback(async ({ commitInfo }) => {
    if (!pageModel.operable) {
      // 没有页面级权限
      return true;
    }
    if (pageModel?.publishLoading) {
      return;
    }
    await showPublishLoading();

    await onSave(false);

    try {
      const toJson = await contentModel.toJSON();
      const json = await getH5Json({
        toJson: {
          ...toJson,
          tabbar: window.__tabbar__.get(),
        },
        status: {
          ...pageModel.appConfig,
        },
        title: pageModel.file?.name,
        comlibs: ctx.comlibs,
      });
      const ComlibsScriptContent = await injectComlibsScriptContent(json);

      const res = await axios({
        url: "/api/compile/h5/publish",
        method: "POST",
        data: {
          userId: userModel.user?.id,
          fileId: pageModel.fileId,
          fileName: pageModel.file.name,
          data: {
            ...json,
          },
          injectComlibsScriptContent: encodeURIComponent(ComlibsScriptContent),
          injectH5Head: pageModel.appConfig.h5Head,
        },
        withCredentials: false,
      });

      let data = res.data;

      if (data.code !== 1) {
        handlePublishErrCode(data);
        pageModel.publishLoading = false;

        if (data.innerMessage) {
          message.error(data.innerMessage);
        }
        return;
        // throw new Error(data?.data ?? data?.message);
      }

      if (data?.data) {
        showH5PublishSuccessModal({
          url: data?.data?.url,
          onDownload: ({ localize = 0 }) => download({ type: "h5", localize }),
        });
      }
    } catch (e) {
      console.error(e);
      message.error(e?.message ?? "构建H5失败，请重试");
      console.error(e?.message ?? "构建H5失败，请重试");
    }

    pageModel.publishLoading = false;
  }, []);

  const onH5Preview = useCallback(async () => {
    if (previewModel.isLoading()) {
      return;
    }

    previewModel.loading({
      title: "手机扫码预览",
    });

    // 对一些大项目，babel时间比较久，会假死，先停一下把loading展示出来先，后面优化一下去掉
    await sleep(300);
    (async () => {
      const toJson = await contentModel.toJSON();

      //
      let comlibs = [...ctx.comlibs];
      if (window.__DEBUG_COMLIB__) {
        let containIndex = comlibs.findIndex((lib) => {
          return (
            lib.id === window.__DEBUG_COMLIB__.id ||
            lib.namespace === window.__DEBUG_COMLIB__.namespace
          );
        });

        if (containIndex > -1) {
          comlibs.splice(containIndex, 1, window.__DEBUG_COMLIB__);
        } else {
          comlibs.push(window.__DEBUG_COMLIB__);
        }
      }

      const json = await getH5Json({
        toJson: {
          ...toJson,
          tabbar: window.__tabbar__.get(),
        },
        status: {
          ...pageModel.appConfig,
        },
        title: pageModel.file?.name,
        comlibs: comlibs,
      });
      const ComlibsScriptContent = await injectComlibsScriptContent(json);

      const res = await axios({
        url: "/api/compile/h5/preview",
        method: "POST",
        data: {
          userId: userModel.user?.id,
          fileId: pageModel.fileId,
          fileName: pageModel.file.name,
          data: {
            ...json,
          },
          injectComlibsScriptContent: encodeURIComponent(ComlibsScriptContent),
        },
        withCredentials: false,
      });

      let data = res.data;

      if (data.code !== 1) {
        previewModel.fail();
        return;
      }

      previewModel.success({
        webUrl: data?.data?.url,
      });
    })().catch((err) => {
      previewModel.fail();
      message.error({ content: err.message ?? "构建H5失败，请重试" });
      console.error(err);
    });
  }, []);

  const downloadProjectToLocal = useCallback(async ({ type = "weapp" }) => {
    const res = await axios({
      url: "/api/compile/queryFiles",
      method: "GET",
      params: {
        userId: userModel.user?.id,
        fileId: pageModel.fileId,
        type,
      },
      withCredentials: false,
    });

    let data = res.data;

    if (data.code !== 1) {
      return;
    }

    await writeLocalProject(data.data, {
      fileId: pageModel.fileId,
      type,
    });
  }, []);

  const onCompile = useCallback(
    async ({
      type = CompileType.weapp,
      version = "1.0.0",
      description = "版本说明",
    }: {
      type: CompileType;
      version: string;
      description: string;
    }) => {
      // if (type === CompileType.harmony) {
      //   const toJson = await contentModel.toJSON({ withDiagrams: true });
      //   hmdownloadtmp(toJson);
      //   return;
      // }

      if (pageModel?.publishLoading) {
        return;
      }
      await showPublishLoading();

      try {
        const isHarmony = type === CompileType.harmony
        const toJson = await contentModel.toJSON(isHarmony ? { withDiagrams: true } : null);

        let comlibs = [...ctx.comlibs];
        if (window.__DEBUG_COMLIB__) {
          let containIndex = comlibs.findIndex((lib) => {
            return (
              lib.id === window.__DEBUG_COMLIB__.id ||
              lib.namespace === window.__DEBUG_COMLIB__.namespace
            );
          });

          if (containIndex > -1) {
            comlibs.splice(containIndex, 1, window.__DEBUG_COMLIB__);
          } else {
            comlibs.push(window.__DEBUG_COMLIB__);
          }
        }

        let json: any

        if (type === CompileType.harmony) {
          json = await getHarmonyJson({
            toJson: {
              ...toJson,
              tabbar: window.__tabbar__.get(),
            },
            comlibs: comlibs,
          })
        } else {
          json = await getMiniappJson({
            toJson: {
              ...toJson,
              tabbar: window.__tabbar__.get(),
            },
            ci: {
              appid: pageModel.wxConfig.appid,
              privateKey: decodeURIComponent(pageModel.wxConfig.privateKey || ""),
              type: "miniProgram",
              version,
              desc: description,
            },
            status: {
              projectId: pageModel.sdk.projectId,
              fileId: pageModel.fileId,
              apiEnv: "prod",
              ...pageModel.appConfig,
              appid: pageModel.wxConfig.appid,
              appsecret: pageModel.wxConfig.appsecret,
            },
            comlibs: comlibs,
          })
        }

        const url = type === CompileType.harmony ? "/api/compile/harmony/compile" : "/api/compile/miniapp/compile"

        const res = await axios({
          url,
          method: "POST",
          data: {
            userId: userModel.user?.id,
            fileId: pageModel.fileId,
            fileName: pageModel.file.name,
            type,
            data: {
              ...json,
              services: toJson.services,
              serviceFxUrl: pageModel.appConfig.serviceFxUrl,
              database: pageModel.appConfig.datasource,
              toJson: isHarmony ? toJson : undefined
            },
          },
          withCredentials: false,
        });
        let data = res.data;
        pageModel.publishLoading = false;
        if (data.code !== 1) {
          handlePublishErrCode(data);

          if (data.innerMessage) {
            message.error(data.innerMessage);
          }
          return;
        }
        // if (supportFSAccess && false) {
        //   // 临时关闭 fs access API 的下载，文件多了后太慢了

        //   // 支持 fs acess API 的浏览器走直接下载
        //   message.loading({
        //     key: "compile",
        //     content: "正在构建到本地文件夹",
        //   });
        //   await downloadProjectToLocal({ type });
        //   message.success({
        //     key: "compile",
        //     content: "已构建至本地文件夹",
        //   });
        // } else {
        download({
          type,
          backEndProjectPath: data?.data?.backEndProjectPath,
        })
          // showCompileSuccess({
          //   type,
          //   onDownload: () =>
          //     download({
          //       type,
          //       backEndProjectPath: data?.data?.backEndProjectPath,
          //     }),
          // });
        // }
      } catch (e) {
        pageModel.publishLoading = false;
        console.error(e);
        message.error(e?.message ?? "构建小程序失败，请重试");
        console.error(e?.message ?? "构建小程序失败，请重试");
      }
    },
    []
  );

  const onEdit = useCallback((info) => {
    // console.log("info => ", info)
    const { id, type } = info;
    switch (type) {
      case "global":
        contentModel.editRecord.global = true;
        break;
      case "module":
        contentModel.editRecord.module.add(id);
        break;
      case "canvas":
        contentModel.editRecord.canvas.add(id);
        break;
    }
    contentModel.operationList.current.push({
      ...info,
      detail: info.title,
      updateTime: dayjs(),
    });
    setBeforeunload(true);
  }, []);

  const onMessage = useCallback((type, msg) => {
    message.destroy();
    message[type](msg);
  }, []);

  const checkIsMiniCIReady = useCallback(async () => {
    const result = await axios({
      url: "/api/compile/wx/ready",
      method: "GET",
      withCredentials: false,
    });
    return result?.data?.code === 1;
  }, []);

  const FxService = useFxServices();

  return (
    <div className={styles.show}>
      <AppToolbar
        operable={operable}
        globalOperable={globalOperable}
        statusChange={(status, file, extraFiles, isNew) => {
          // setOperable(status === 1);
          let operable = status === 1;
          pageModel.operable = status === 1;
          pageModel.globalOperable = status === 1;
          pageModel.extraFiles = extraFiles;
          pageModel.isNew = isNew;
          versionModel.compare(file);

          if (!isNew || window.__type__ === "spa") {
            pageModel.canSave = operable;
            setOperable(operable);
            setGlobalOperable(operable);
            return;
          }

          const user = userModel.user;
          const cooperationAry = [];
          if (status === 1) {
            cooperationAry.push({
              type: "global",
              users: [
                {
                  id: user.id,
                  name: user.name || user.email,
                  isMe: true,
                  avatarUrl:
                    user.avatar === "/default_avatar.png" ? null : user.avatar,
                  readable: true,
                  writeable: true,
                },
              ],
            });
            setGlobalOperable(true);
          } else {
            cooperationAry.push({
              type: "global",
              users: [],
            });
            setGlobalOperable(false);
          }

          Object.entries(pageModel.pages).forEach(([pageId, pageInfo]) => {
            const extraFile = pageModel.extraFiles[pageInfo.fileId];
            if (extraFile.id) {
              if (user.id === extraFile.id) {
                operable = true;
              }
              cooperationAry.push({
                type: "canvas",
                canvasId: pageId,
                users: [
                  {
                    id: extraFile.id,
                    name: extraFile.name || extraFile.email || extraFile.userId,
                    isMe: user.id === extraFile.id,
                    avatarUrl:
                      extraFile.avatar === "/default_avatar.png"
                        ? null
                        : extraFile.avatar,
                    readable: true,
                    writeable: true,
                  },
                ],
              });
            } else {
              cooperationAry.push({
                type: "canvas",
                canvasId: pageId,
                // users: []
                users: [
                  // {
                  //   id: user.id,
                  //   name: user.name,
                  //   isMe: false,
                  //   avatarUrl: user.avatar,
                  //   readable: true,
                  //   writeable: false
                  // },
                  // {
                  //   id: user.id,
                  //   name: "H",
                  //   isMe: true,
                  //   avatarUrl: user.avatar,
                  //   readable: true,
                  //   writeable: false
                  // }
                ],
                // users: [
                //   {
                //     id: extraFile.id,
                //     name: extraFile.name,
                //     isMe: user.id === extraFile.id,
                //     avatarUrl: extraFile.avatar,
                //     // avatarUrl: 'https://resources-live.sketch.cloud/default_avatars/s/3.png',
                //     readable: true,
                //     writeable: user.id === extraFile.id
                //   }
                // ]
              });
            }
          });

          pageModel.canSave = operable;
          setOperable(operable);

          // console.log("cooperationAry => ", cooperationAry)

          if (!designerRef.current) {
            lastCooperationAry = cooperationAry;
          } else {
            designerRef.current?.setCooperationAry(cooperationAry);
          }
        }}
        checkIsMiniCIReady={checkIsMiniCIReady}
        isModify={beforeunload}
        onSave={onSave}
        onCompile={onCompile}
        onPreview={onPreview}
        onPublish={(params) => onPublish(params)}
        onH5Publish={onH5Publish}
        onH5Preview={onH5Preview}
        onAlipayPreview={onAlipayPreview}
        designerRef={designerRef}
      />
      <div className={styles.designer}>
        {SPADesigner && latestComlibs && window?.mybricks?.createObservable && (
          <SPADesigner
            config={config({
              ctx: window?.mybricks?.createObservable(
                Object.assign(ctx, { latestComlibs })
              ),
              pageModel: window?.mybricks?.createObservable(pageModel),
              save: onSave,
              designerRef,
              FxService,
              appConfig,
              setOperable,
            })}
            ref={designerRef}
            onEdit={onEdit}
            onMessage={onMessage}
            onLoad={() => {
              if (
                pageModel.isNew &&
                lastCooperationAry &&
                window.__type__ === "mpa"
              ) {
                designerRef.current.setCooperationAry(lastCooperationAry);
                lastCooperationAry = null;
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Designer;
