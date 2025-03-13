import React, { useCallback, useEffect, useState } from "react";
import { useComputed } from "rxui-t";
import { Locker, Toolbar } from "@mybricks/sdk-for-app/ui";
import { pageModel, versionModel } from "@/stores";
import { showH5RequireModal, showWeappRequireModal } from "./../modals";
import { PreviewPopOver } from "./../pop-overs";
import { Dropdown, message, Alert, Tooltip } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import cx from "classnames";
// import Marquee from 'react-fast-marquee';
import {
  DownOutlined,
  EyeOutlined,
  ToTopOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { CompileType } from "@/types";
import { CompileButtonGroups, CompileButton } from "./compile-buttons";
import PopContact from "../pop-contact";
import css from "./web.less";

import help from "./icons/help"

import { showDownloadConfig } from "./model/downloadModel"

interface PublishParams {
  type: string;
  version: string;
  description: string;
}

interface WebToolbarProps {
  operable: boolean;
  globalOperable: boolean;
  statusChange: any;
  isModify?: boolean;
  designerRef: any;
  onSave: any;
  onCompile: any;
  onPreview: any;
  onPublish: (params: PublishParams) => void;
  onH5Publish?: any;
  onH5Preview?: any;
}

const DescMap = {
  [CompileType.weapp]: "微信小程序",
  [CompileType.h5]: "H5",
  [CompileType.alipay]: "支付宝小程序(Beta)",
  [CompileType.dd]: "钉钉小程序(Beta)",
};

class SelectTypeStorage {
  key = `_mybricks_mpsite_${new URL(location.href).searchParams.get(
    "id"
  )}_type_`;

  set = (selectType: CompileType) => {
    localStorage.setItem(this.key, selectType);
  };

  get = (): CompileType => {
    return localStorage.getItem(this.key) as CompileType;
  };
}

const selectTypeStorage = new SelectTypeStorage();

export const WebToolbar: React.FC<WebToolbarProps> = ({
  operable,
  globalOperable,
  statusChange,

  isModify = false,
  designerRef,

  onSave,
  onPreview,
  onCompile,
  onPublish,
  onH5Publish,
  onH5Preview,

  onAlipayPreview,
}) => {
  const [selectType, setSelectType] = useState<CompileType>(
    (selectTypeStorage.get() || window.__PLATFORM__) ?? CompileType.weapp
  );

  const handleSwitch2SaveVersion = useCallback(() => {
    designerRef.current?.switchActivity?.("@mybricks/plugins/version");
    setTimeout(() => {
      pageModel?.versionApi?.switchAciveTab?.("save");
    }, 0);
  }, []);

  const publishLoading = useComputed(() => {
    return pageModel.publishLoading;
  });

  useEffect(() => {
    if (publishLoading) {
      message.loading({
        content: "产物发布中，请稍等...",
        key: "loading",
        duration: 0,
      });
    } else {
      message.destroy("loading");
    }
  }, [publishLoading]);

  useEffect(() => {
    selectTypeStorage.set(selectType);
    window.__PLATFORM__ = selectType
  }, [selectType]);

  const previewHandle = () => {
    if ([CompileType.weapp].includes(selectType)) {
      onPreview?.();
    }

    if ([CompileType.alipay].includes(selectType)) {
      // onAlipayPreview?.();
      onPreview?.();
      //支付宝的预览还没做，暂时先用微信小程序的预览
    }

    if (selectType === CompileType.h5) {
      onH5Preview?.();
    }
  };

  const compileHandle = () => {
    showDownloadConfig({onCompile})
    // onCompile?.({
    //   type: selectType,
    //   // version: version,
    //   // description: description,
    // });
  };

  const publishHandle = () => {
    if (!globalOperable) {
      return;
    }
    if ([CompileType.weapp, CompileType.alipay].includes(selectType)) {
      //支付宝小程序发布还没做，所以点击后暂时先用小程序的发布逻辑
      showWeappRequireModal({
        onSubmit: ({ version, description }) => {
          onPublish?.({
            type: selectType,
            version: version,
            description: description,
          });
        },
      });
    }
    if (selectType === CompileType.h5) {
      showH5RequireModal({
        onSubmit: (formValues) => {
          onH5Publish?.(formValues);
        },
      });
    }
  };

  const getExtraFileIds = () => {
    return true;
    // return Object.entries(pageModel.pages).map(([,value]) => {
    //   return value.fileId
    // }).filter((fileId) => fileId)
  };

  return (
    <>
      <Toolbar
        title={pageModel.file?.name}
        updateInfo={<Toolbar.LastUpdate onClick={handleSwitch2SaveVersion} />}
      >
        {/* <Alert
          style={{ maxWidth: 350 }}
          banner
          message={
            <Marquee pauseOnHover gradient={false} speed={30}>
              I can be a React component, multiple React components, or just some text.
            </Marquee>
          }
        /> */}

        {/* <div
          className="ant-divider ant-divider-vertical"
          style={{ marginLeft: 10, marginRight: -13 }}
        ></div> */}
        {/* <PopContact></PopContact> */}
        <Locker
          statusChange={statusChange}
          compareVersion={false}
          getExtraFileIds={window.__type__ === "mpa" ? getExtraFileIds : null}
          autoLock={window.__type__ === "mpa" ? false : true}
          beforeToggleLock={
            window.__type__ === "mpa"
              ? () => {
                if (versionModel.file.updated) {
                  message.info("当前应用版本落后，不允许上锁，请刷新后再试");
                  return false;
                }
                return true;
              }
              : null
          }
        // pollable={false} // 测试
        />


        <Tooltip
          placement="bottom"
          title={"查看教程文档"}
        >
          <div
            className={css.help_btn}
            onClick={() => {
              window.open(
                "https://docs.mybricks.world/docs/miniprogram/basic/addComponent/"
              );
            }}
          >
            <img
              src={help}
              alt=""
            />
          </div>
        </Tooltip>

        {pageModel.isNew &&
          window.__type__ === "mpa" &&
          (globalOperable || operable) ? (
          <Tooltip
            placement="bottom"
            title={
              globalOperable
                ? "当前保存包含应用内容以及上锁画布"
                : "当前保存仅包含上锁画布"
            }
          >
            <ExclamationCircleOutlined
              style={{ color: isModify ? "#FA6400" : "inherit", opacity: 0.5 }}
            />
          </Tooltip>
        ) : null}


        <Toolbar.Save disabled={!operable} onClick={onSave} dotTip={isModify} />

        {/* 预览 */}
        <PreviewPopOver onCompile={previewHandle}>
          <Toolbar.Button onClick={previewHandle}>预览</Toolbar.Button>
        </PreviewPopOver>

        {/* 发布 */}
        <Toolbar.Button disabled={!globalOperable} onClick={publishHandle}>发布</Toolbar.Button>

        {[CompileType.weapp, CompileType.alipay, CompileType.dd].includes(
          selectType
        ) && <Toolbar.Button onClick={compileHandle}>下载</Toolbar.Button>}


      </Toolbar>
    </>
  );
};
