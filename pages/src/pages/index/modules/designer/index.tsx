import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { message, Modal } from "antd";
import { pageModel, userModel, contentModel } from "@/stores";
import axios from "axios";
import dayjs from "dayjs";
import API from "@mybricks/sdk-for-app/api";
import { previewModel } from "./pop-overs";
import styles from "./index.less";
import { writeLocalProject, supportFSAccess } from "./readwrite-to-local";
import { getH5Json, getMiniappJson } from "./get-compile-json";
import { handlePublishErrCode, showCompileSuccess } from "./../publishModal";
import {
  showH5PublishSuccessModal,
  showWeappPublishSuccessModal,
} from "./modals";
import AppToolbar from "./toolbar";

import config from "./app-config";
import { useFxServices } from "../utils/use-fx-services";

import { getLibsFromConfig } from "@/utils/getComlibs";
import { sleep } from "@/utils";
import { CompileType } from "@/types";
import { DESIGNER_STATIC_PATH } from "../../../../constants";

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

const Designer = ({ appData }) => {
  const [beforeunload, setBeforeunload] = useState(false);
  const [operable, setOperable] = useState(false);
  const designerRef = useRef<{ switchActivity; dump; toJSON }>();
  const [SPADesigner, setSPADesigner] = useState(null);

  const [ctx] = useState({
    sdk: appData,
    user: appData.user,
    comlibs: getLibsFromConfig(appData),
    latestComlibs: [],
    hasMaterialApp: appData.hasMaterialApp,
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
      {
        url: `/paas/api/project/download?fileId=${pageModel.fileId}&target=prod`,
        filename: `node-app-${pageModel.fileId}-prod.zip`,
      },
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

  /**
   * 保存
   */
  const onSave = useCallback(async (tip = true) => {
    await contentModel
      .save(ctx)
      .then((res) => {
        !!tip && message.success("保存完成");
        setBeforeunload(false);
      })
      .catch((e) => {
        !!tip && message.error(`保存失败：${e.message}`);
        setBeforeunload(false);
      });

    // 同时保存下图片
    API.App.getPreviewImage({
      element: designerRef.current?.geoView.canvasDom?.firstChild,
    })
      .then((res) => {
        // @ts-ignore
        return API.File.save({
          userId: userModel.user?.id,
          fileId: pageModel.fileId,
          icon: res,
        });
      })
      .catch((err) => {
        console.error(err);
      });
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
      if (pageModel?.publishLoading) {
        return;
      }
      pageModel.publishLoading = true;

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
    if (pageModel?.publishLoading) {
      return;
    }
    pageModel.publishLoading = true;

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
        },
        withCredentials: false,
      });

      let data = res.data;

      if (data.code !== 1) {
        handlePublishErrCode(data);
        pageModel.publishLoading = false;

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
      if (pageModel?.publishLoading) {
        return;
      }
      pageModel.publishLoading = true;

      try {
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
          url: "/api/compile/miniapp/compile",
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
        pageModel.publishLoading = false;
        if (data.code !== 1) {
          handlePublishErrCode(data);
          return;
        }
        if (supportFSAccess && false) {
          // 临时关闭 fs access API 的下载，文件多了后太慢了

          // 支持 fs acess API 的浏览器走直接下载
          message.loading({
            key: "compile",
            content: "正在构建到本地文件夹",
          });
          await downloadProjectToLocal({ type });
          message.success({
            key: "compile",
            content: "已构建至本地文件夹",
          });
        } else {
          showCompileSuccess({
            type,
            onDownload: () =>
              download({
                type,
                backEndProjectPath: data?.data?.backEndProjectPath,
              }),
          });
        }
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
        statusChange={(status) => {
          setOperable(status === 1);
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
            })}
            ref={designerRef}
            onEdit={onEdit}
            onMessage={onMessage}
          />
        )}
      </div>
    </div>
  );
};

export default Designer;
