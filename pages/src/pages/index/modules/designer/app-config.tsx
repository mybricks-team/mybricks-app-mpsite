import React from "react";
import { pageModel, userModel, contentModel } from "@/stores";
import servicePlugin, {
  call as callConnectorHttp,
} from "@mybricks/plugin-connector-http";
import notePlugin from "@mybricks/plugin-note";
import axios from "axios";
import toolsPlugin from "./plugin/tools";
import VarBind from "@mybricks/plugin-varbind";

import { render as renderUI } from "@mybricks/render-web";
import comlibLoaderFunc from "./configs/comlibLoader";
import { comLibAdderFunc } from "./configs/comLibAdder";
import versionPlugin from "mybricks-plugin-version";

import { editorAppenderFn } from "./editorAppender";

import { LOCAL_EDITOR_ASSETS } from "@/constants";
import { MpConfig, CompileConfig } from "./custom-configs";
import { getAiEncryptData } from "./utils/get-ai-encrypt-data";
import extendsConfig from "./configs/extends";
// import typeConfig from "./configs/type";
// import { PcEditor } from "/Users/stuzhaoxing-office/Program/editors-pc-common/src/index";

// 加密展示
// 输入一个字符串，一行或者多行，需要把中间的内容隐藏，只显示前面几个字符和后面几个字符，中间用*号代替
// 对于字符串特别长的情况，* 的数量不要太多
const encryptStr = (str, frontLen, endLen) => {
  const len = str.length - frontLen - endLen;
  let xing = "";
  for (let i = 0; i < Math.min(len, 30); i++) {
    xing += "*";
  }
  return str.substring(0, frontLen) + xing + str.substring(str.length - endLen);
};

function getComs() {
  const comDefs = {};
  const regAry = (comAray) => {
    comAray.forEach((comDef) => {
      if (comDef.comAray) {
        regAry(comDef.comAray);
      } else {
        comDefs[`${comDef.namespace}-${comDef.version}`] = comDef;
      }
    });
  };

  const comlibs = [
    ...(window["__comlibs_edit_"] || []),
    ...(window["__comlibs_rt_"] || []),
  ];
  comlibs.forEach((lib) => {
    const comAray = lib.comAray;
    if (comAray && Array.isArray(comAray)) {
      regAry(comAray);
    }
  });
  return comDefs;
}

export default function ({ ctx, pageModel, save, designerRef, FxService }) {
  return {
    type: window.__type__,
    shortcuts: {
      "ctrl+s": [() => save()],
    },
    plugins: [
      servicePlugin({
        pure: true,
      }),
      notePlugin(ctx),
      versionPlugin({
        file: { id: pageModel.fileId },
        user: userModel.user,
        onInit: (versionApi) => {
          pageModel.versionApi = versionApi;
        },
        needSavePreview: true,
        saveConfig: {
          limit: 0,
        },
      }),
      toolsPlugin({
        dump: contentModel.dump,
        loadContent: (importData) => contentModel.loadContent(importData, ctx),
      }),
      VarBind(),
    ],
    // comLibLoader: comlibLoader(ctx),
    // comLibLoader: () => {
    //   return new Promise((resolve) => {
    //     resolve([ctx.comlibs[0].editJs])
    //   })
    // },
    pageMetaLoader(...args) {
      //加载页面元数据
      // return Promise.resolve(undefined)
      return contentModel.getMetaContent();
    },
    ...(ctx.hasMaterialApp
      ? {
          comLibAdder: comLibAdderFunc(ctx),
        }
      : {}),
    comLibLoader: comlibLoaderFunc(ctx),
    pageContentLoader: async (sceneId) => {
      await contentModel.isOpenedPagesContentLoad();
      const cont = await contentModel.getPageContent({ sceneId });
      // console.log(`load scene ==> ${sceneId}`, cont);
      return cont;
    },
    editView: {
      // editorAppender(editConfig) {
      //   return PcEditor({editConfig})
      // },
      editorAppender(editConfig) {
        return editorAppenderFn(editConfig, pageModel);
      },
      // eslint-disable-next-line no-empty-pattern
      items({}, cate0, cate1, cate2) {
        cate0.title = "配置";
        cate0.items = [
          {
            title: "微信小程序配置",
            items: [
              {
                type: "editorRender",
                options: {
                  render: () => {
                    return <MpConfig />;
                  },
                },
              },
            ],
          },
          {
            title: "H5 配置",
            items: [
              {
                title: "head 注入",
                description: "内容将被插入到页面的 <head> 标签中",
                type: "code",
                options: ({ data, output }) => {
                  return {
                    language: "html",
                  };
                },
                value: {
                  get() {
                    return pageModel.appConfig.h5Head;
                  },
                  set(_, value) {
                    pageModel.appConfig.h5Head = value;
                  },
                },
              },
            ],
          },
          {
            title: "连接器",
            items: [
              {
                title: "直连（仅在调试模式下生效）",
                type: "Switch",
                description:
                  "直连模式下「服务接口」直接由浏览器发起网络请求，通常用于请求本地接口或者其他网络情况",
                value: {
                  get() {
                    return pageModel.appConfig.directConnection;
                  },
                  set(_, value) {
                    pageModel.appConfig.directConnection = value;
                  },
                },
              },
              {},
              {
                title: "默认域名",
                description:
                  "接口允许单独配置域名。如未设置特定域名，则默认使用预设域名；若已配置特定域名，则会优先使用您所设定的域名。",
                type: "array",
                options: {
                  getTitle: (item) => {
                    return (
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          lineHeight: "30px",
                        }}
                        title={item.host}
                      >
                        {item.host || "未设置"}
                      </div>
                    );
                  },
                  items: [
                    {
                      title: "域名",
                      type: "text",
                      value: "host",
                    },
                  ],
                  editable: false,
                  selectable: true,
                  onSelect(_id) {
                    let item = pageModel.appConfig.hostList.find((hostItem) => {
                      return hostItem._id === _id;
                    });

                    if (!item) {
                      return;
                    }

                    if (!item?.host) {
                      window.antd.message.warn("请先设置域名");
                      return;
                    }

                    window.antd.message.success(
                      `默认域名已切换为: ${item.host}`
                    );
                    pageModel.appConfig.defaultCallServiceHost = item.host;
                  },
                  onRemove(_id) {
                    let item = pageModel.appConfig.hostList.find((hostItem) => {
                      return hostItem._id === _id;
                    });

                    if (!item) {
                      return;
                    }

                    if (
                      item.host === pageModel.appConfig.defaultCallServiceHost
                    ) {
                      pageModel.appConfig.defaultCallServiceHost = undefined;
                    }
                  },
                  customOptRender({ item, setList }) {
                    return (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {pageModel.appConfig.defaultCallServiceHost ===
                          item.host &&
                          item.host && (
                            <div
                              style={{
                                fontSize: "9px",
                                border: "1px solid #FA6400",
                                borderRadius: "20px",
                                color: "white",
                                fontWeight: "700",
                                backgroundColor: "#FA6400",
                                padding: "2px 4px",
                              }}
                            >
                              使用该域名
                            </div>
                          )}
                        <div
                          style={{
                            margin: "3px 0px 3px 5px",
                            height: "22px",
                            width: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();

                            const host = window.prompt(
                              "请输入域名，使用 https:// 或 http:// 开头",
                              item.host
                            );

                            // 校验域名
                            if (host && !/^https?:\/\/.*/.test(host)) {
                              alert("请输入正确的域名");
                              return;
                            }

                            // 重复域名校验
                            if (
                              host &&
                              pageModel.appConfig.hostList.find(
                                (hostItem) => hostItem.host === host
                              )
                            ) {
                              alert("域名已存在");
                              return;
                            }

                            if (host) {
                              setList((c) =>
                                c.map((t) => {
                                  if (t._id === item._id) {
                                    return {
                                      ...t,
                                      host,
                                    };
                                  }
                                  return t;
                                })
                              );
                            }
                          }}
                        >
                          <svg viewBox="0 0 1024 1024" width="15" height="15">
                            <path
                              d="M341.108888 691.191148 515.979638 616.741529 408.633794 511.126097 341.108888 691.191148Z"
                              p-id="5509"
                            ></path>
                            <path
                              d="M860.525811 279.121092 749.7171 164.848489 428.544263 481.69274 543.68156 601.158622 860.525811 279.121092Z"
                              p-id="5510"
                            ></path>
                            <path
                              d="M951.813934 142.435013c0 0-29.331026-32.462343-63.091944-57.132208-33.759895-24.670889-59.729359 0-59.729359 0l-57.132208 57.132208 115.996874 115.565039c0 0 48.909943-49.342802 63.957661-66.222237C966.861652 174.897356 951.813934 142.435013 951.813934 142.435013L951.813934 142.435013z"
                              p-id="5511"
                            ></path>
                            <path
                              d="M802.174845 946.239985 176.165232 946.239985c-61.635779 0-111.786992-50.151213-111.786992-111.786992L64.37824 208.443379c0-61.635779 50.151213-111.786992 111.786992-111.786992l303.856449 0c12.357446 0 22.357194 10.011005 22.357194 22.357194s-9.999748 22.357194-22.357194 22.357194L176.165232 141.370775c-36.986379 0-67.072605 30.086226-67.072605 67.072605l0 626.009613c0 36.986379 30.086226 67.072605 67.072605 67.072605l626.009613 0c36.985356 0 67.072605-30.086226 67.072605-67.072605L869.24745 530.596544c0-12.347213 9.999748-22.357194 22.357194-22.357194s22.357194 10.011005 22.357194 22.357194l0 303.856449C913.961838 896.088772 863.810624 946.239985 802.174845 946.239985z"
                              p-id="5512"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    );
                  },
                },

                value: {
                  get({ data, focusArea }) {
                    return pageModel.appConfig.hostList;
                  },
                  set({ data, focusArea, output, input, ...res }, value) {
                    pageModel.appConfig.hostList = value;
                  },
                },
              },
            ],
          },
          {
            title: "服务",
            description: "服务配置",
            items: [
              {
                title: "数据源",
                description: "选择数据源后，可以对数据源进行增删改查操作",
                type: "filereader",
                options: {
                  fileId: pageModel.fileId,
                  allowedFileExtNames: ["datasource"],
                },
                value: {
                  get() {
                    return pageModel.appConfig.datasource;
                  },
                  set(_, value) {
                    console.log("数据源 set: ", value);
                    pageModel.appConfig.datasource = value;
                  },
                },
              },
              {
                title: "服务部署地址",
                description: "默认为：https://{host}/runtime/service/{fileId}",
                type: "text",
                value: {
                  get() {
                    return pageModel.appConfig.serviceFxUrl;
                  },
                  set(_, value) {
                    pageModel.appConfig.serviceFxUrl = value;
                  },
                },
              },
            ],
          },
          {
            title: "",
            type: "editorRender",
            options: {
              render: () => {
                return <CompileConfig />;
              },
            },
          },
        ];

        cate1.title = "调试";
        cate1.items = [
          {
            title: "注意",
            items: [
              {
                type: "editorRender",
                options: {
                  render: () => {
                    return (
                      <div
                        style={{
                          color: "#333333",
                          padding: 12,
                          fontSize: 12,
                          lineHeight: 1.5,
                          background: "#ffffff",
                          borderColor: "#f0f0f0",
                          borderStyle: "solid",
                          borderWidth: 1,
                          borderRadius: 3,
                        }}
                      >
                        以下配置仅在
                        <span
                          style={{
                            fontWeight: 500,
                            color: "#ea732e",
                            marginLeft: 2,
                            marginRight: 2,
                          }}
                        >
                          调试时
                        </span>
                        作为默认值生效，并且可能被其他组件的设置所覆盖。在
                        <span style={{ fontWeight: 500 }}>预览</span>、
                        <span style={{ fontWeight: 500 }}>发布</span>、
                        <span style={{ fontWeight: 500 }}>编译到本地等</span>
                        情况下均失效。
                      </div>
                    );
                  },
                },
              },
            ],
          },
          {
            title: "默认全局请求头",
            description: "每当页面刷新时会，将会在每次请求时自动携带",
            type: "code",
            options: ({ data, output }) => {
              return {
                language: "json",
              };
            },
            value: {
              get() {
                return pageModel?.debug?.mybricksGlobalHeaders;
              },
              set(context, val) {
                pageModel.debug.mybricksGlobalHeaders = val;

                let data = {};
                try {
                  data = decodeURIComponent(val);
                  data = JSON.parse(data);
                } catch (e) {
                  data = {};
                }

                try {
                  localStorage.setItem(
                    "_MYBRICKS_GLOBAL_HEADERS_",
                    JSON.stringify({ data })
                  );
                } catch (e) {}
              },
            },
          },
        ];
        // cate0.items = cate0.items.concat([
        //   {
        //     type: "editorRender",
        //     options: {
        //       render: () => {
        //         return <CompileConfigPanel />;
        //       },
        //     },
        //   },
        // ]);
      },
      editorOptions: mergeEditorOptions([
        !!ctx.setting?.system.config?.isPureIntranet && LOCAL_EDITOR_ASSETS,
        DESIGN_MATERIAL_EDITOR_OPTIONS(ctx),
      ]),
    },
    geoView: {
      type: "mobile",
      width: 375,
      height: 667,
      theme: {
        css: [
          "./public/brickd-mobile/0.0.46/index.css",
          "./public/weui/1.1.3/weui.min.css",
          "./public/edit-reset.css",
        ],
      },
      scenes: {
        presets: [
          // {
          //   id: "tabbar",
          //   title: "底部导航栏",
          //   template: {
          //     namespace: "mybricks.taro.systemTabbar",
          //     deletable: false,
          //     asRoot: true,
          //   },
          // },
          // {
          //   id: "main",
          //   title: "首页",
          //   template: {
          //     namespace: "mybricks.taro.systemPage",
          //     deletable: false,
          //     asRoot: true,
          //   },
          //   inputs: [
          //     {
          //       id: "open",
          //       title: "打开",
          //       schema: {
          //         type: "object",
          //       },
          //     },
          //   ],
          // },
          // {
          //   id: "login",
          //   title: "登录",
          //   template: {
          //     namespace: "mybricks.taro.systemLogin",
          //     deletable: false,
          //     asRoot: true,
          //   },
          //   inputs: [
          //     {
          //       id: "open",
          //       title: "打开",
          //       schema: {
          //         type: "object",
          //       },
          //     },
          //   ]
          // },
        ],
        adder: [
          {
            type: "normal",
            title: "小程序标签页",
            template: {
              namespace: "mybricks.taro.systemPage",
              deletable: false,
              asRoot: true,
            },
            inputs: [
              {
                id: "open",
                title: "打开",
                schema: {
                  type: "object",
                },
              },
            ],
          },
          {
            type: "normal",
            title: "小程序页面",
            template: {
              namespace: "mybricks.taro.systemPage",
              deletable: false,
              asRoot: true,
              data: {
                useTabBar: false,
              },
            },
            inputs: [
              {
                id: "open",
                title: "打开",
                schema: {
                  type: "object",
                },
              },
            ],
          },
          {
            type: "popup",
            title: "对话框",
            template: {
              namespace: "mybricks.taro.popup",
              deletable: false,
              asRoot: true,
            },
            inputs: [
              {
                id: "open",
                title: "打开",
                schema: {
                  type: "object",
                },
              },
            ],
          },
          {
            type: "normal",
            title: "网页",
            template: {
              namespace: "mybricks.taro.systemWebview",
              deletable: false,
              asRoot: true,
            },
            inputs: [
              {
                id: "open",
                title: "打开",
                schema: {
                  type: "object",
                },
              },
            ],
          },
        ],
      },
    },
    toplView: {
      title: "交互",
      vars: {},
      fx: {},
      useService: {
        debug(toJSON) {
          // return new Promise((resolve, reject) => {
          //   resolve();
          // });

          let database = null;

          if (pageModel?.appConfig.datasource) {
            const { domainModel, ...config } = pageModel?.appConfig.datasource;
            database = config;
          }

          const toJson = {
            ...toJSON,
            plugins: {
              // '@mybricks/plugins/service': designerRef.current.getPluginData('@mybricks/plugins/service')
            },
          };

          return FxService.serviceDebug({
            database,
            fileId: pageModel?.fileId,
            toJSON: toJson,
          });

          // return new Promise((resolve, reject) => {
          //   axios
          //     .post("/paas/api/project/service/push", {
          //       target: "debug",
          //       version: "1.0.0",
          //       fileId: pageModel.fileId,
          //       json: toJSON,
          //       database,
          //     })
          //     .then((res) => {
          //       // debugErrMessageRef.current = "";
          //       scopeIdRef.current = res.data.data.scopeId;
          //       resolve("");
          //     })
          //     .catch((err) => {
          //       let message = "";
          //       if (err?.response && err.response.status === 404) {
          //         message = "调试服务异常：找不到调试服务，请联系平台管理员";
          //       } else {
          //         message = `调试服务异常：${err?.response?.data?.message ?? err?.message ?? "未知错误"}`;
          //       }
          //       // debugErrMessageRef.current = message;
          //       resolve("");
          //     });
          // });
        },
        outline: FxService.getServiceOutline(),
      },
      extends: extendsConfig,
    },
    aiView: {
      async request(messages) {
        try {
          let res = await axios({
            method: "POST",
            url: `//ai.mybricks.world/chat`,
            withCredentials: false,
            data: getAiEncryptData({
              messages,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }).then((res) => {
            return res.data;
          });

          let content = res.choices[0].message.content;

          return content;
        } catch (e) {
          console.error(e);
          return "系统开小差了，请重试";
        } finally {
          // console.log(`prompts: ${prompts},
          // question: ${question},
          // 返回结果: ${content}`);
        }
      },
      async requestAsStream(messages, { write, complete, error }) {
        try {
          const response = await fetch("//ai.mybricks.world/stream", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              getAiEncryptData({
                messages,
              })
            ),
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            write(chunk);
          }

          complete();
        } catch (ex) {
          error(ex);
        }
      },
    },
    com: {
      env: {
        callConnector(connector, params, connectorConfig) {
          const plugin = designerRef.current?.getPlugin(
            connector.connectorName || "@mybricks/plugins/service"
          );

          if (plugin) {
            return plugin.callConnector(
              { ...connector, useProxy: !pageModel.appConfig.directConnection },
              params,
              {
                ...connectorConfig,
                before(options) {
                  let newOptions = { ...options };

                  newOptions.headers = newOptions.headers || {};
                  let mybricksGlobalHeaders =
                    localStorage.getItem("_MYBRICKS_GLOBAL_HEADERS_") ||
                    '{"data": {}}';
                  mybricksGlobalHeaders = JSON.parse(mybricksGlobalHeaders);
                  Object.assign(newOptions.headers, mybricksGlobalHeaders.data);

                  /**
                   * 如果 url 不以 http 开头，添加默认域名
                   */
                  if (
                    !/^(http|https):\/\/.*/.test(newOptions.url) &&
                    pageModel.appConfig.defaultCallServiceHost
                  ) {
                    newOptions.url = `${pageModel.appConfig.defaultCallServiceHost}${newOptions.url}`;
                  }
                  // end

                  return newOptions;
                },
              }
            );
          } else {
            return Promise.reject("错误的连接器类型.");
          }
        },
        async uploadFile(params) {
          let {
            url,
            name,
            filePath,
            fileName,
            formData,
            fail,
            success,
            ...others
          } = params;

          /* headers */
          let headers = {
            "Content-Type": "multipart/form-data",
          };

          let mybricksGlobalHeaders =
            localStorage.getItem("_MYBRICKS_GLOBAL_HEADERS_") || '{"data": {}}';
          mybricksGlobalHeaders = JSON.parse(mybricksGlobalHeaders);
          Object.assign(headers, mybricksGlobalHeaders.data);

          /**
           * 如果 url 不以 http 开头，添加默认域名
           */
          if (
            !/^(http|https):\/\/.*/.test(url) &&
            pageModel.appConfig.defaultCallServiceHost
          ) {
            url = `${pageModel.appConfig.defaultCallServiceHost}${url}`;
          }

          const myFormData = new FormData();

          const response = await fetch(filePath);
          const blob = await response.blob();
          const file = new File([blob], name);

          if (fileName) {
            myFormData.append(name, file, fileName);
          } else {
            myFormData.append(name, file);
          }

          Object.keys(formData).forEach((key) => {
            myFormData.append(key, formData[key]);
          });

          /* 是否使用代理 */
          if (!pageModel.appConfig.directConnection) {
            headers["x-target-url"] = url;
            url = "/paas/api/proxy";
          }

          //
          axios
            .post(url, myFormData, {
              headers,
              ...others,
            })
            .then((res) => {
              success(res);
            })
            .catch((err) => {
              fail(err);
            });
        },
        callServiceFx(id, params) {
          return FxService.callServiceFx({ id, params });
        },
        renderCom(json, opts, coms) {
          return renderUI(json, {
            comDefs: { ...getComs(), ...coms },
            ...(opts || {}),
            env: {
              ...(opts?.env || {}),
              edit: false,
              runtime: true,
            },
            callConnector(connector, params) {
              //调用连接器
              if (["http", "http-sql"].indexOf(connector.type) !== -1) {
                //服务接口类型
                return callConnectorHttp({ script: connector.script }, params, {
                  before(options) {
                    let newOptions = { ...options };

                    newOptions.headers = newOptions.headers || {};
                    let mybricksGlobalHeaders =
                      localStorage.getItem("_MYBRICKS_GLOBAL_HEADERS_") ||
                      '{"data": {}}';
                    mybricksGlobalHeaders = JSON.parse(mybricksGlobalHeaders);
                    Object.assign(
                      newOptions.headers,
                      mybricksGlobalHeaders.data
                    );

                    return newOptions;
                  },
                });
              } else {
                return Promise.reject("错误的连接器类型.");
              }
            },
          });
        },
      },
    },
  };
}

export const DESIGN_MATERIAL_EDITOR_OPTIONS = (ctx) => {
  return {
    imageselector: {
      fileSizeLimit: 2 * 1024,
      extras: [
        {
          title: "选择素材",
          key: "MaterialCenter",
          event() {
            return new Promise((resolve) => {
              ctx.sdk.openUrl({
                url: "MYBRICKS://mybricks-material/materialSelectorPage",
                params: {
                  userId: ctx.user?.id,
                  combo: false,
                  title: "选择图片素材",
                  type: "picture",
                  tags: ["image"],
                },
                onSuccess: async ({ materials }) => {
                  function getBaseUrl(url) {
                    try {
                      const parsedUrl = new URL(url);
                      return `${parsedUrl.protocol}//${parsedUrl.host}`;
                    } catch (e) {
                      console.error("Invalid URL:", e);
                      return null;
                    }
                  }
                  if (materials.length > 0) {
                    let url = window.location.href;
                    const baseUrl = getBaseUrl(url);
                    resolve(baseUrl + materials[0].preview_img);
                  }
                },
              });
            });
          },
        },
      ],
    },
  };
};

export function mergeEditorOptions(
  editorOptions: (Record<string, any> | boolean)[]
): Record<string, any> {
  const options: Record<string, any> = {};
  for (let i = 0; i < editorOptions.length; i++) {
    const element = editorOptions[i];
    if (typeof element === "boolean") {
      continue;
    } else {
      Object.assign(options, element);
    }
  }
  return options;
}
