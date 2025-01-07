import React, { useCallback, useEffect, useState } from "react";
import { useComputed } from "rxui-t";
import { Locker, Toolbar } from "@mybricks/sdk-for-app/ui";
import { pageModel, versionModel } from "@/stores";
import { showH5RequireModal, showWeappRequireModal } from "./../modals";
import { PreviewPopOver } from "./../pop-overs";
import { Dropdown, message, Alert, Tooltip } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons"
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
    selectTypeStorage.get() ?? CompileType.weapp
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
      message.loading({ content: "产物发布中，请稍等...", key: "loading", duration: 0 });
    } else {
      message.destroy("loading");
    }
  }, [publishLoading]);

  useEffect(() => {
    selectTypeStorage.set(selectType);
  }, [selectType]);

  const previewHandle = () => {
    if ([CompileType.weapp].includes(selectType)) {
      onPreview?.();
    }

    if ([CompileType.alipay].includes(selectType)) {
      onAlipayPreview?.();
    }

    if (selectType === CompileType.h5) {
      onH5Preview?.();
    }
  };

  const compileHandle = () => {
    onCompile?.({
      type: selectType,
      // version: version,
      // description: description,
    });
  };

  const publishHandle = () => {
    if (!globalOperable) {
      return
    }
    if ([CompileType.weapp].includes(selectType)) {
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
    return Object.entries(pageModel.pages).map(([,value]) => {
      return value.fileId
    }).filter((fileId) => fileId)
  }

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
        <div
          className={css.help_btn}
          onClick={() => {
            window.open(
              "https://docs.mybricks.world/docs/miniprogram/basic/addComponent/"
            );
          }}
        >
          <img
            src="https://assets.mybricks.world/iFuRygS1BayUQRdkzq57nurLy0CR9PYd-1715416429457.png"
            alt=""
          />
          帮助文档
        </div>
        {/* <PopContact></PopContact> */}
        <Locker
          statusChange={statusChange}
          compareVersion={false}
          getExtraFileIds={window.__type__ === "mpa" ? getExtraFileIds : null}
          autoLock={false}
          beforeToggleLock={() => {
            if (versionModel.file.updated) {
              message.info("当前应用版本落后，不允许上锁，请刷新后再试")
              return false
            }
            return true;
          }}
          // pollable={false} // 测试
        />
        <Toolbar.Save disabled={!operable} onClick={onSave} dotTip={isModify}/>
        {(pageModel.isNew && window.__type__ === "mpa" && (globalOperable || operable)) ? <Tooltip placement="bottom" title={globalOperable ? "当前保存包含应用内容以及上锁画布" : "当前保存仅包含上锁画布"}>
          <ExclamationCircleOutlined style={{color: isModify ? "#FA6400" : "inherit"}}/>
        </Tooltip> : null}
        

        <CompileButtonGroups>
          <Dropdown
            menu={{
              items: Object.keys(DescMap).map((type) => ({
                label: DescMap[type],
                key: type,
                // disabled: !operable,
                style: { fontSize: 13 },
              })),
              onClick: (e) => {
                // pageModel.previewStatus = PreviewStatus.LOADING
                setSelectType(e.key);
              },
            }}
            trigger={["click"]}
          >
            <CompileButton onClick={() => {}}>
              构建平台：
              <span style={{ color: "#ea732e", fontWeight: "bold" }}>
                {DescMap[selectType]}
              </span>
              <DownOutlined style={{ marginLeft: 3, color: "#ea732e" }} />
            </CompileButton>
          </Dropdown>

          {/* h5 */}
          {[CompileType.h5].includes(selectType) && (
            <PreviewPopOver onCompile={previewHandle}>
              <CompileButton onClick={previewHandle}>
                预览
                <EyeOutlined style={{ marginLeft: 3 }} />
              </CompileButton>
            </PreviewPopOver>
          )}
          {[CompileType.h5].includes(selectType) && (
            <CompileButton disabled={!globalOperable} onClick={publishHandle}>
              发布
              <ToTopOutlined style={{ marginLeft: 3 }} />
            </CompileButton>
          )}

          {/* weapp */}
          {[CompileType.weapp].includes(selectType) && (
            <PreviewPopOver onCompile={previewHandle}>
              <CompileButton onClick={previewHandle}>
                预览开发版
                <EyeOutlined style={{ marginLeft: 3 }} />
              </CompileButton>
            </PreviewPopOver>
          )}
          {[CompileType.weapp].includes(selectType) && (
            <CompileButton disabled={!globalOperable} onClick={publishHandle}>
              发布体验版
              <ToTopOutlined style={{ marginLeft: 3 }} />
            </CompileButton>
          )}

          {[CompileType.weapp, CompileType.alipay, CompileType.dd].includes(
            selectType
          ) && (
            <CompileButton onClick={compileHandle}>
              编译到本地
              <DownloadOutlined style={{ marginLeft: 3 }} />
            </CompileButton>
          )}
        </CompileButtonGroups>
      </Toolbar>
    </>
  );
};
