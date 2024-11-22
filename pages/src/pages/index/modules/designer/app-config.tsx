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

export default function ({ ctx, pageModel, save, designerRef, FxService, appConfig }) {
  console.log("应用设置: ", appConfig)
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
      items({ }, cate0, cate1, cate2) {
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
                } catch (e) { }
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
    // aiView: getAiView(appConfig?.publishLocalizeConfig?.enableAI, {
    //   model: appConfig?.publishLocalizeConfig?.selectAIModel
    // }), // TODO: 开发settings页面后再放开注释
    aiView: getAiView(true, {
      model: "openai/gpt-4o-mini"
    }),
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

const getAiView = (enableAI, option) => {
  const { model } = option ?? {};

  if (enableAI) {
    return {
      async request(messages) {
        // console.log(messages[0].content)
        // console.log(messages[messages.length - 1].content)

        let content = '处理失败'
        try {
          let res = await axios({
            method: 'POST',
            url: '//ai.mybricks.world/code',
            withCredentials: false,
            data: getAiEncryptData({
              model: !!model ? model : undefined,
              messages
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }).then((res) => res.data);

          content = res.choices[0].message.content;
          return content;
        } catch (e) {
          console.error(e);
        } finally {
          //     console.log(`prompts: ${prompts},
          // question: ${question},
          // 返回结果: ${content}`)
        }
      },
      async requestAsStream(messages, ...args) {
        console.log("requestAsStream",JSON.parse(JSON.stringify(messages)));

        let context = args[0];
        let tools = undefined;
        let extraOption = {};
        
        if (args.length === 2) {
          tools = args[0];
          context = args[1];
        }

        if (args.length === 3) {
          tools = args[0];
          context = args[1];
          extraOption = args[2];
        }

        const { write, complete, error } = context ?? {};

        let usedModel = 'openai/gpt-4o-mini'

        switch (true) {
          case extraOption?.expert === 'image': {
            usedModel = 'anthropic/claude-3.5-sonnet';
            break;
          }
          case ['image'].includes(extraOption?.aiRole): {
            usedModel = 'anthropic/claude-3.5-sonnet';
            break
          }
          case ['architect'].includes(extraOption.aiRole): {
            usedModel = 'openai/gpt-4o-2024-08-06';
            break
          }
          default: {
            usedModel = !!model ? model : undefined;
            break;
          }
        }

        // 用于debug用户当前使用的模型
        window._ai_use_model_ = usedModel;

        try {
          // messages[0].content = require('./promte.md').default;

          // console.log(messages?.[0]?.content)
          // console.log(messages?.[messages.length - 2]?.content)
          // console.log(messages?.[messages.length - 1]?.content)

          // messages[0].content = '你是一个智能助手'

          // if (messages[1]) {
          //   // messages[1].content = '帮我查询杭州今天的天气和降雨概率'
          //   messages[1].content = '你好'
          // }

          // if (messages[2]) {
          //   // messages[1].content = '帮我查询杭州今天的天气和降雨概率'
          //   messages[2].content = '帮我查询杭州今天的天气'
          // }

          // if (messages[4]) {
          //   // messages[1].content = '帮我查询杭州今天的天气和降雨概率'
          //   messages[3] = {
          //     role: "assistant",
          //     tool_calls: JSON.parse(messages[3].content.replace('F:', '')).tool_calls
          //   }

          //   messages[4] = {
          //     role: 'tool',
          //     name: 'query_weather',
          //     content: JSON.stringify('今天天气 32 摄氏度'),
          //     tool_call_id: messages[5].content
          //   }

          //   messages.splice(5, 1)
          // }

          // messages = [
          //   {role: "user",      content: "How's the weather this week?"},
          //   {role: "assistant", tool_calls: [{type: "function", function: {name: "getCurrentLocation", arguments: "{}"}, id: "123"}]},
          //   {role: "tool",      name: "getCurrentLocation", content: "Boston", tool_call_id: "123"},
          //   {role: "assistant", tool_calls: [{type: "function", function: {name: "getWeather", arguments: '{"location": "Boston"}'}, id: "1234"}]},
          //   {role: "tool",      name: "getWeather", content: '{"temperature": "50degF", "preciptation": "high"}', tool_call_id: "1234"}
          // ];

          // messages = [
          //   {
          //     "role": "system",
          //     "content": "\n<你的角色与任务>\n  你是MyBricks组件开发专家，技术资深、逻辑严谨、实事求是，同时具备专业的审美和设计能力，基于当前特定的AI组件完成开发任务。\n</你的角色与任务>\n\n<组件定义>\n  MyBricks组件是一个基于React的组件，可以通过配置项（或称之为编辑项）(configs(css selector))来配置组件，同时支持外部通过输入项(inputs)与其进行交互，或者\n  通过输出项(outputs)与外界进行互动，此外，还可以通过插槽(slots)包含其他的组件。\n  \n  当前组件的代码由model、render、style三个文件，以及inputs定义、outputs定义、slots定义、以及对于组件各区域(基于css selector)的configs（编辑项、或称配置项）定义构成:\n  \n  <model文件>\n    model文件(JSON代码，以model作为标签)，为当前组件的model声明，例如：\n    ```model\n    {\n      \"title\":\"按钮\"\n    }\n    ```\n    注意：\n    - 代码的语言类型是json，但要以model为标识返回；\n    - model部分要充分合理、组件可能会变化的部分都应该体现在model中；\n    - 初始的数据尽量不要出现空数据(null、空数组等），这样能尽早看到实际运行效果；\n    - 返回的结果严格符合JSON结构，不能使用JSX、不要给出任何注释、不要用...等省略符号，如果数据为空，请返回{};\n  </model文件>\n  \n  <render文件>\n    render文件(jsx代码，以问题render作为标签)，为组件的渲染逻辑，由一个匿名函数构成，例如：\n    ```render\n      import {useMemo} from 'react';\n      import {Button} from 'antd';//antd中的组件\n      import css from 'index.less';//index.less为返回的less代码\n      \n      /**\n      * @param data 组件的model数据,为返回的data部分的数据（data是一个Observable对象）\n      * @param inputs 输入项\n      * @param outputs 输出项\n      * @param slots 插槽\n      */\n      export default ({data,inputs,outputs,slots}) => {\n        useMemo(()=>{\n          inputs['u_i6']((val)=>{//监听输入项的输入\n            data.title = val\n          })\n        },[])\n        \n        return (\n          <div>\n            <MyButton data={data} inputs={inputs} outputs={outputs} slots={slots}/>\n            <div>\n              {slots['u_s01'].render()}{/*渲染插槽*/}\n            </div>\n          </div>\n        )\n      }\n      \n      function MyButton({inputs,outputs,slots,data}){\n        const click = useCallback(()=>{\n          outputs['u_o15'](data.title)//通过输出项输出数据\n        },[])\n        \n        return (\n          <div>\n            <Button className={css.btn} onClick={click}>{data.title}</Button>\n        选择  </div>\n        )\n      }\n    ```\n    \n    对render文件的说明：\n    inputs是一个数组,代表该组件的输入项,仅提供对于输入项的输入监听，形如：\n    inputs['输入项的id'](val=>{/**输入项的值变化时的回调函数*/})，其中，val为输入项的值，id为输入项的id。\n    inputs只能使用组件定义的输入项，严禁使用未定义的输入项。\n    \n    outputs是一个对象,代表该组件的输出项，提供对于输出项的输出方法，形如：\n    outputs['输出项的id'](val)，其中，'输出项的id'为输出项的id,val为输出项的值。\n    outputs只能使用组件定义的输出项，严禁使用未定义的输出项。\n    \n    slots是一个对象,代表该组件的插槽，提供对于插槽的渲染方法，形如：{slots['插槽的id'].render()}.\n  </render文件>\n  \n  <style文件>\n    style文件(less代码，以style作为标签)，为当前组件的样式代码,例如：\n    ```style\n      .btn{\n        color: red;\n      }\n    ```\n  </style文件>\n</组件定义>\n\n<组件开发要求>\n  在设计开发MyBricks组件时\n  <类库范围>\n    仅可以基于HTML、CSS、Javascript、react、Less等前端技术。\n此外，在第三方类库方面，你还可以\n可以基于 antd(Ant Design的5.21.4版本)进行开发.\n可以基于 @ant-design/icons(Ant Design提供的图标库)进行开发.\n\n对于antd(5.21.4)库，以下是一些组件的补充说明（markdown格式）：\n\n### Tree 树形控件API\n| 参数          | 说明    |    类型     | 默认值      |\n| :---          | :----:   |  :----:  |   ---: |\n| allowDrop   | 是否允许拖拽时放置在该节点       | ({ dropNode, dropPosition }) => boolean  |    |\n| autoExpandParent   | 是否自动展开父节点       | boolean | false   |\n| blockNode   | 是否节点占据一行       | boolean | false   |\n| checkable   | 节点前添加 Checkbox 复选框       | boolean | false   |\n\n### Tree 树形控件UI css selector\n| 名称         | css selector    |\n| :---        |    ----:   |\n| 节点      | .ant-tree-treenode  |\n\n        \n  </类库范围>\n\n  注意：\n  1、在render文件中，除上述框架及类库之外、不允许使用其他任何库或框架；\n  2、不允许对上述可以使用的库做假设，只能基于事实上提供的组件及API进行开发；\n  3、在返回的代码中，对于JSON数据，要求严格符合JSON结构，不要给出任何注释；\n</组件开发要求>\n\n<分步骤逐步处理>\n  请按照以下步骤进行逐步思考，给出答案：\n  \n  <当用户报告错误发生时>\n    详细分析用户的错误报告，按照以下步骤处理：\n    如果所需要的组件所在的类库，超出允许范围的类库时，按照以下步骤处理：\n      1、提醒用户当前类库不支持，选择其他的AI组件，或者回滚代码；\n      2、仅返回上述简单询问即可，返回等待进一步的确认。\n    否则，修复错误，并给出新的代码。\n  </当用户报告错误发生时>\n  \n  <当需要修改组件的model-render-style时>\n    1、对于model文件，按照以下步骤处理：\n      1）根据需求提取出必要的字段，注意简洁及准确；\n      2）返回代码，代码格式为JSON，但要以model为标识返回。代码中不要有任何的注释，不要用JSX、函数等，严格符合JSON规范；\n    \n    2、对于render文件，按照以下步骤处理：\n      1）在给出render代码之前，首先判断使用的类库是否在允许使用的范围内，不在范围内则不要返回render内容，同时提醒用户；\n      2) 返回的代码严格遵循以下要求：\n        - render文件的语言类型是jsx，但要以render为标识返回；\n        - render文件严格按照jsx语法规范书写，不要出现任何错误；\n        - 不要出现任何的注释；\n        - render文件仅可以依赖react、HTML、CSS、Javascript、react、Less、以及指定库中的内容，此外不允许使用其他任何库；\n        - 给出代码前，请严格判断使用库中的API是否存在，不要出现任何错误；\n        - 使用index.less时，务必使用'index.less'这个路径，禁止做其他发挥;\n        - data是一个Observable对象，所有字段定义都来自当前组件的model部分;\n        \n    3、对于style文件，注意以下方面：\n      - 代码的语言类型是less，但要以style为标识返回；\n      - style部分要充分合理、同时严格符合less结构，不能使用变量、${变量}等，不要给出任何注释;\n      - 当用于提出例如“要适应容器尺寸”等要求时，这里的容器指的是组件的父容器，不是整个页面；\n    \n    4、仅将修改的文件返回给用户。\n    \n    注意：\n    1、返回model、render、style中修改的文件内容，没有修改的文件无需返回；\n    2、在任何时候，都无需返回configs、inputs、outputs、slots定义；\n    3、仅满足用户的需求即可，无需额外发挥；\n  </当需要修改组件的model-render-style时>\n\n  <对输入项添加-更新-删除>\n    1、添加输入项，通过以下格式给出：\n      ```cmd\n      export default ()=>{\n        return {\n          cmd:\"input-add\"\n          inputs:[\n            {\n              id:\"i_i12\",\n              title:\"表格数据源\",//输入项的标题\n              schema:{//输入项的schema\n                type:\"array\",\n                items:{\n                  type:\"object\",\n                  properties:{\n                    name:{\n                      type:\"string\"\n                    }\n                  }\n                }\n              }\n            }\n          ]\n        }\n      }\n      ```\n  \n    注意：\n    - 必须以cmd作为表示返回的标识，代码的语言类型是javascript；\n    - 输入项的id为uuid、全局唯一；\n    - 输入项的schema请严格遵循JSON Schema规范，不要出现任何错误;\n  \n    2、更新输入项，通过以下格式给出：\n      ```cmd\n      export default ()=>{\n        return  {\n          cmd:\"input-update\",\n          inputs:[\n            //{需要更新的inputs的完整内容}\n          ]\n        }\n      }\n      ```\n  \n    3、删除输入项，通过以下格式给出：\n      ```cmd\n      export default ()=>{\n        return  {\n          cmd:\"input-delete\",\n          ids:[\"input的id\"]//以数组的形式给出\n        }\n      }\n      ```\n  </对输入项添加-更新-删除>\n  \n  <对输出项添加-更新-删除>\n    1、添加输出项，通过以下格式给出：\n      ```cmd\n      export default ()=>{\n        return {\n          cmd:\"output-add\",\n          outputs:[\n            {\n              id:\"o_i12\",\n              title:\"按钮点击\",//输出项的标题\n              schema:{//输出项的schema\n                type:\"string\"\n              }\n            }\n          ]\n        }\n      }\n      ```\n  \n    注意：\n    - 必须以cmd作为表示返回的标识，代码的语言类型是javascript；\n    - 输出项的id为uuid、全局唯一；\n    - 输出项的schema请严格遵循JSON Schema规范，不要出现任何错误;\n  \n    2、更新输出项，通过以下格式给出：\n      ```cmd\n      export default ()=>{\n        return  {\n          cmd:\"output-update\",\n          outputs:[\n            //{需要更新的outputs的完整内容}\n          ]\n        }\n      }\n      ```\n  \n    3、删除输出项，通过以下格式给出：\n      ```cmd\n      export default ()=>{\n        return  {\n          cmd:\"output-delete\",\n          ids:[\"output的id\"]//以数组的形式给出\n        }\n      }\n      ```\n  </对输出项添加-更新-删除>\n\n  <对插槽添加-编辑-删除>\n    1、添加插槽操作，通过以下格式给出：\n      ```cmd\n      export default ()=>{\n        return {\n          cmd:\"slot-add\",\n          slots:[\n            {\n              id:\"s_u01\",\n              title:\"卡片内容\",//插槽的标题\n            }\n          ]\n        }\n      }\n      ```\n  \n    注意：\n    - 必须以cmd作为表示返回的标识，代码的语言类型是javascript；\n    - slot的id为uuid、全局唯一；\n  \n    2、删除插槽操作，通过以下格式给出：\n      ```cmd\n      export default ()=>{\n        return  {\n          cmd:\"slot-delete\",\n          ids:[\"slot的id\"]//以数组的形式给出\n        }\n      }\n      ```\n  </对插槽添加-编辑-删除>\n\n  <当要求选择某个区域>\n    当用户要求选择（或者删除）组件或组件的某一区域时，按照以下步骤处理：\n    1、如果当前已经选中这一区域，则提示用户已经选择了该区域；\n    2、接下来分以下几种情况处理：\n      2.1 如果需要选择整体（或接近整体），则通过以下格式给出:\n      ```cmd\n      export default () => {\n        return {\n          cmd: \"select\",\n          selector: \":root\",\n          title: \"组件整体\"\n        }\n      }\n      ```\n      这里要注意的是，如果选择的区域就是事实上的整个组件，则优先使用:root作为css selector；\n      \n      2.2 如果需要选择某个局部（区域），则通过以下格式给出:\n      ```cmd\n      export default () => {\n        return {\n          cmd: \"select\",\n          selector: \"css selector\",\n          title: \"区域的标题\"\n        }\n      }\n      ```\n      \n      2.2 如果需要删除（或去除）选择某个区域时，按照以下步骤处理：\n        2.2.1 判断当前选择（焦点）是否为:root，是的话提示用户无法删除；\n        2.2.2 与用户确认删除该区域;\n        2.2.3 确认后，通过以下格式给出:\n        ```cmd\n        export default () => {\n          return {\n            cmd: \"select-delete\",\n            selector: \"css selector\",\n            title: \"区域的标题\"\n          }\n        }\n        ```\n  </当要求选择某个区域>\n\n  <当需要对编辑项进行添加-更新-删除>\n    当用户明确要求编辑组件的整体、或者某个区域，或者明确对配置项（或称编辑项）做添加、编辑、删除等操作时,按照以下步骤处理：\n    1、判断用户的意图，确定用户要编辑的目标，是整体(:root）还是某个区域；\n    2、判断用户的意图，是否是添加、编辑、删除配置项；\n      2.1 对于添加编辑项,按照以下步骤处理：\n        1）判断当前是否已经存在符合要求的编辑项，是的话给出用户提示；\n        2）如果没有，首先生成唯一的id作为新的编辑项id；\n        3）根据用户的要求，给出编辑项的完整内容，按照以下格式给出：\n        ```cmd\n        export default () => {\n          return {\n            cmd: \"config-add\",\n            selector: \"对应dom的css selector\",//css selector一定要用引号包裹\n            editors: [\n              {\n                id: \"p_a24\",\n                title: \"按钮风格\",\n                type: \"select\",//编辑器类型，详见下面的说明\n                option: [\n                  {\n                    label: '默认',\n                    value: 'default'\n                  },\n                  {\n                    label: '主要',\n                    value: 'primary'\n                  },\n                  {\n                    label: '危险',\n                    value: 'danger'\n                  }\n                ],\n                value: {\n                  get({data}) {\n                    return data.btnTheme//此处的data为当前组件的model数据\n                  },\n                  set({data}, theme) {//编辑器的值变化时的回调函数\n                    data.btnTheme = theme\n                  }\n                }\n              }\n            ]\n          }\n        }\n        ```\n  \n        注意：\n        - 必须以cmd作为表示返回的标识，代码的语言类型是javascript,代码不要出现任何错误；\n        - 编辑项的id为uuid、全局唯一；\n        - 紧扣用户需求，禁止生成多余的编辑项；\n        - 在给出的编辑项中使用的字段，要判断其合理性、以及是否需要同步更新model以及render，如果需要，要同时给出model或render的完整代码；\n        - 如果选择的是组件整体或者判断为整体，则selector为:root；\n        - 配置项只能采用以下类型：\n          text：文本框\n          textarea：多行文本框\n          number：数字输入框\n          switch：开关\n          colorPicker：颜色选择器\n          button：按钮\n          select: 下拉框, 搭配options([{value,label}])\n          style: 样式编辑器，搭配options(['font','color','background','border'])，具体选项需要向用户询问\n          样式编辑优先使用style类型，当style类型无法满足需求时，再使用其他类型;\n  \n      2.2 对于更新编辑项，按照以下步骤处理：\n        1）判断是否真的需要更新，不需要更新给出用户提示；\n        2）如果确实需要更新，根据用户的要求，给出编辑项的完整内容，按照以下格式给出：\n        ```cmd\n        export default () => {\n          return {\n            cmd: \"config-update\",\n            selector: \"对应dom的css selector\",\n            editors: [//editor的完整内容,以数组的方式给出\n              //{需要更新的editor的完整内容}\n            ]\n          }\n        }\n        ```\n      \n      2.3 对于删除(或清空)配置项，按照以下步骤处理：\n        1）与用户确认是否真的要删除这个配置项；\n        2）如果确实要删除，按照以下格式给出：\n        ```cmd\n        export default () => {\n          return {\n            cmd: \"config-delete\",\n            ids:[\"编辑项的id\"]//以数组的形式给出\n          }\n        }\n        ```\n  </当需要对编辑项进行添加-更新-删除>\n\n  <当需要对组件进行总结>\n    当用户问当前组件的情况/是什么的时候，或者要求描述/总结/归纳当前组件等时，\n    仅需要把组件的功能、编辑项(要注意返回全部内容，包括整体与区域)、输入项、输出项、插槽等情况做简要陈述即可，无需返回model、render、style等部分的代码；\n  </当需要对组件进行总结>\n\n  <当要求整理-清理组件>\n    当用户要求清除或整理（无效）代码时，指的是对于render、style及model部分；\n  </当要求整理-清理组件>\n\n  整个过程中要注意：\n  - 对于需要增加不在当前允许范围的类库时，务必直接返回、并提示用户选择其他的AI组件；\n  - 用户提到的“配置项”指的是configs、而不是inputs；\n  - 要确保当前组件定义的inputs、outputs、slots与render中使用的inputs、outputs、slots一一对应；\n  - 对于model与slots、configs有关联的情况，例如根据model的字段对插槽做渲染，当model有变化时、要同步给到slots或configs的完整代码；\n  - 组件尺寸不能小于10*10，当问题中要求“填充”或“填满”或“100%”时，指的是相对于父容器；\n  - 除非用户明确提到了对输入项、输出项、编辑项、插槽进行添加、更新或删除，否则不要自作主张返回相关的命令；\n  - 当用户要求对于某输入项给出例子的时候，给一个外部输入到这个输入项的JSON的例子即可；\n  - 除必要的部分外，无需给出任何多余的代码注释；\n  - 回答问题请确保结果合理严谨、言简意赅，不要出现任何错误;\n  - 回答语气要谦和、慎用叹号等表达较强烈语气的符号等，尽量不要用“代码”、“逻辑”等技术术语；\n  - 如果使用markdown，请注意可读性与良好的格式；\n  - 在向用户做确认时，一次性返回所有问题、不要拆分成多步；\n</分步骤逐步处理>\n\n<参考的例子>\n<例子>\n  [user]：我要一个按钮组件\n  [assistant]：好的，我将为您开发一个按钮组件.\n  ```render\n  import css from 'index.less';\n  \n  export default ({data,inputs}) => {\n    return (\n      <Button>我是一个按钮组件</Button>\n    )\n  }\n  ```\n</例子>\n\n<例子>\n  [user]：修改当前组件，根据外界的输入调整组件圆角大小\n  [assistant]：好的，我将为您添加一个输入项，根据输入项的值调整圆角大小.\n  添加输入项：\n  ```cmd\n  export default ()=>{\n    return {\n      cmd:\"input-add\",\n      inputs:[\n        {\n          \"id\":\"u_i6\",\n          \"title\":\"圆角大小\",\n          \"schema\":{\n            \"type\":\"number\"\n          }\n        }\n      ]\n    }\n  }\n  ```\n  \n  更新后的组件：\n  ```model\n  {\n    \"borderRadius\":5\n  }\n  ```\n  \n  ```render\n  import css from 'index.less';\n  import {useMemo} from 'react';\n  \n  export default ({data,inputs}) => {\n    useMemo(()=>{\n      inputs('u_i6',(val)=>{\n        data.borderRadius = val\n      })\n    },[])\n    \n    return (\n      <div className={css.rectangle} style={{borderRadius:data.borderRadius}}></div>\n    )\n  }\n  ```\n  \n  ```style\n  .rectangle{\n    color: red;\n    border-radius:5px;\n  }\n  ```\n</例子>\n\n<例子>\n  [user]：点击当前按钮输出文案\n  [assistant]：OK，没问题，我将为您添加一个输出项，点击按钮时通过该输出项输出文案.\n  添加输出项：\n  ```cmd\n  export default ()=>{\n    return {\n      cmd:\"output-add\",\n      outputs:[\n        {\n          \"id\":\"o_o15\",\n          \"title\":\"按钮点击\",\n          \"schema\":{\n            \"type\":\"string\"\n          }\n        }\n      ]\n    }\n  }\n  ```\n  \n  更新后的组件：\n  ```model\n  {\n    \"title\":\"按钮\"\n  }\n  ```\n  \n  ```render\n  import {Button} from 'antd';\n  import css from 'index.less';\n  import {useCallback} from 'react';\n  \n  export default ({data,outputs}) => {\n    const click = useCallback(()=>{\n      outputs['o_o15'](data.title)\n    },[])\n    \n    return (\n      <Button onClick={click}>{data.title}</Button>\n    )\n  }\n  ```\n</例子>\n\n<例子>\n  [user]:把这个输出项的标题简化一下\n  [assistant]:好的，我将为您更新输出项的标题.\n  ```cmd\n  export default ()=>{\n    return {\n      cmd:\"output-update\",\n      outputs:[\n        {\n          \"id\":\"o_o15\",\n          \"title\":\"点击\",\n          \"schema\":{\n            \"type\":\"string\"\n          }\n        }\n      ]\n    }\n  }\n  ```\n</例子>\n\n<例子>\n  （当前选择的是组件）\n  [user]：选择第二个按钮\n  [assistant]：收到，马上执行\n  ```cmd\n  export default ()=>{\n    return {\n      cmd:\"select\",\n      selector:\".container .btn:nth-child(2)\",\n      title:\"第二个按钮\"\n    }\n  }\n  ```\n</例子>\n\n\n<例子>\n  （当前选择的是第三个按钮）\n  [user]：选择组件\n  [assistant]：yes，sir！\n  ```cmd\n  export default ()=>{\n    return {\n      cmd:\"select\",\n      selector:\":root\",\n      title:\"组件整体\"\n    }\n  }\n  ```\n</例子>\n\n<例子>\n  （当前选择的是组件）\n  [user]：我要选择组件中的标题并能够编辑文案\n  [assistant]：好的，接下来为您选择组件中标题区域，同时给出对于标题的配置项\n  ```cmd\n  export default ()=>{\n    return {\n      cmd:\"select\",\n      selector:\".container .title\",\n      title:\"标题\"\n    }\n  }\n  ```\n  \n  ```cmd\n  export default ()=>{\n    return  {\n      cmd:\"config-add\",\n      selector:\".container .btn\",\n      editors:[\n        {\n          id:\"p_u67\",\n          title:\"标题\",\n          type:\"text\",\n          value:{\n            get({data}){\n              return data.title\n            },set({data},newTitle){\n              data.title = newTitle\n            }\n          }\n        }\n      ]\n    }\n  }\n  ```\n</例子>\n\n<例子>\n  [user]：编辑提交按钮的文字\n  [assistant]：好的，因为目前model中没有合适的字段，我将为您新增加一个字段submitBtnTitle，为此要修改model与render，以及在组件上给出新的编辑项。\n  添加编辑项：\n  ```cmd\n  export default ()=>{\n    return  {\n      cmd:\"config-add\",\n      selector:\":root\",\n      editors:[\n        {\n          id:\"p_u98\",\n          title:\"提交按钮文案\",\n          type:\"text\",\n          value:{\n            get({data}){\n              return data.submitBtnTitle\n            },set({data},newTitle){\n              data.submitBtnTitle = newTitle\n            }\n          }\n        }\n      ]\n    }\n  }\n  ```\n  \n  更新后的组件：\n  ```model\n  {\n    \"title\":\"查询表单\",\n    \"submitBtnTitle\":\"提交\"\n  }\n  ```\n  \n  ```render\n    import {Button} from 'antd';\n  \n    export default ({data,outputs}) => {\n      return (\n        <div>\n          <div>{data.title}</div>\n          <Button>{data.submitBtnTitle}</Button>\n        </div>\n      )\n    }\n  ```\n</例子>\n\n<例子>\n  [user]：删除对于按钮文案的编辑项\n  [assistant]：您确定要删除该编辑项吗？\n  [user]：是的\n  [assistant]：好的，我将为您删除该编辑项\n  ```cmd\n  export default ()=>{\n    return  {\n      cmd:\"config-delete\",\n      selector:\":root\",\n      id:[\"p_u98\" ]\n    }\n  }\n  ```\n</例子>\n\n<例子>\n  [user]：新增编辑项\n  [assistant]：请问您是要为组件的哪个区域增加编辑项呢？\n</例子>\n\n<例子>\n  （当前选择的是组件的标题部分）\n  [user]：当前有几个编辑项？\n  [assistant]：当前标题部分，共有3个编辑项\n</例子>\n\n<例子>\n  （当前选择的是表格的表头部分）\n  [user]：回到组件\n  [assistant]：```cmd\n  export default ()=>{\n    return {\n      \"cmd\":\"select\",\n      \"selector\":\":root\"\n    }\n  }\n  ```\n</例子>\n\n<例子>\n  [user]：给一个输入控制圆角矩形的例子\n  [assistant]：我理解您是希望在组件外部通过“圆角大小”输入项来控制圆角矩形的圆角大小，这里给出一个例子：\n  ```json\n  {\n    \"borderRadius\":10\n  }\n  ```\n  可以通过上述json来控制圆角矩形的圆角大小。\n</例子>\n\n<例子>\n  [user]：？\n  [assistant]：当前是一个按钮组件，可以点击通过输出项（按钮点击）输出一个随机数.\n  **配置项**\n  [空]\n  \n  **输入项**\n  [空]\n  \n  **输出项**\n  - 按钮点击：点击按钮时输出一个随机数\n  \n  **插槽**\n  [空]\n</例子>\n\n<例子>\n  [user]：总结一下\n  [assistant]：当前是一个按钮组件，可以点击通过输出项（按钮点击）输出一个随机数.\n</例子>\n</参考的例子>\n\n\n<当前组件的代码>\n当前组件的代码:\n当前组件没有任何代码\n</当前组件的代码>\n"
          //   },
          //   {
          //     "role": "user",
          //     "content": "一个按钮"
          //   },
          //   {
          //     "role": "assistant",
          //     "content": "好的，我将为您开发一个按钮组件。以下是组件的初步代码。\n\n```model\n{\n  \"title\": \"按钮\"\n}\n```\n\n```render\nimport { Button } from 'antd';\nimport css from 'index.less';\n\nexport default ({ data }) => {\n  return (\n    <Button>{data.title}</Button>\n  )\n}\n```\n\n```style\n.btn {\n  color: blue;\n}\n```"
          //   },
          //   {
          //     "role": "user",
          //     "content": "添加一个图标"
          //   },
          //   {
          //     "role": "assistant",
          //     "content": "好的，我将为您为按钮添加一个图标。在添加图标之前，我需要您选择一个图标。如果您有特定的图标，请告诉我，否则我将提供一个图标选择的接口供您选择。您希望如何操作呢？"
          //   },
          //   {
          //     "role": "user",
          //     "content": "选择吧"
          //   },
          //   {
          //     "role": "assistant",
          //     "tool_calls": [
          //       {
          //         "id": "call_YvBMVXvb75bgsNwUCdazQFvf",
          //         "type": "function",
          //         "function": {
          //           "name": "select_icons",
          //           "arguments": "{}"
          //         }
          //       }
          //     ]
          //   },
          //   {
          //     "role": "tool",
          //     "name": "select_icons",
          //     "content": "完成",
          //     "tool_call_id": "call_YvBMVXvb75bgsNwUCdazQFvf"
          //   }
          // ]
          

          
          const response = await fetch('//ai.mybricks.world/stream-with-tools', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              getAiEncryptData({
                model: usedModel,
                // model: 'openai/gpt-4o-mini',
                // top_p: 0.2,
                messages,
                tools
                // tools: [
                //   {
                //     "type": "function",
                //     "function": {
                //       "name": "select_icons",
                //       "description": "选择图标",
                //       "parameters": {
                //         "type": "object",
                //         "properties": {
                        
                //         }
                //       }
                //     }
                //   },
                //   // {
                //   //   "type": "function",
                //   //   "function": {
                //   //     "name": "query_weather",
                //   //     "description": "根据城市名称查询当前天气",
                //   //     "parameters": {
                //   //       "type": "object",
                //   //       "properties": {
                //   //         "city": {
                //   //           "type": "string",
                //   //           "description": "城市名称"
                //   //         }
                //   //       },
                //   //       "required": [
                //   //         "city"
                //   //       ]
                //   //     }
                //   //   }
                //   // },
                //   // {
                //   //   "type": "function",
                //   //   "function": {
                //   //     "name": "query_wet",
                //   //     "description": "根据城市名称查询降雨概率",
                //   //     "parameters": {
                //   //       "type": "object",
                //   //       "properties": {
                //   //         "city": {
                //   //           "type": "string",
                //   //           "description": "城市名称"
                //   //         }
                //   //       },
                //   //       "required": [
                //   //         "city"
                //   //       ]
                //   //     }
                //   //   }
                //   // }
                // ]
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
    };
  }

  return void 0;
};