import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useComputed } from "rxui-t";
import { Input } from "antd";
import { pageModel } from "@/stores";
import { showMpConfig } from "../../publishModal";
import {
  selectRootDirectory,
  getCacheRootDirectoryHandle,
  showRootDirectoryHandle,
  supportFSAccess,
} from "./../readwrite-to-local";

import css from "./index.less";
import { DEV_MODE } from "@/types";

import UnboundedCard from "./components/unbounded-card";
import BoundedCard from "./components/bounded-card";

const Item = ({ title, style = {}, children }) => {
  return (
    <div className={css.item} style={style}>
      <div className={css.title}>{title}</div>
      {children}
    </div>
  );
};

const DevToolsConfig = () => {
  return (
    <div className={css.devtools}>
      <Item title={"小程序产物路径"}>
        <Input
          readOnly
          size="small"
          className={css.distPath}
          value={pageModel.file.distPath}
        />
        <div
          style={{
            fontStyle: "italic",
            marginTop: 5,
            opacity: 0.7,
          }}
        >
          可将路径复制到小程序开发者工具中，
          <strong>打开并预览小程序</strong>
        </div>
      </Item>
    </div>
  );
};

export const MpConfig = () => {
  const devMode = useComputed(() => {
    return pageModel.devMode;
  });

  const hasBind = useComputed(() => {
    return pageModel?.wxConfig?.appid && pageModel?.wxConfig?.privateKey;
  });

  if (devMode === DEV_MODE.devtools) {
    return <DevToolsConfig />;
  }

  return (
    <div className={css.bindPanel}>
      <div className={css.desc}>目前只支持微信小程序，支付宝、钉钉小程序请点击右上角「下载」直接构建到本地</div>
      <div>
        {hasBind ? (
          <>
            {/* 当前已绑定小程序，AppId：
            <strong> {pageModel?.wxConfig?.appid}</strong>，
            <a
              target="_blank"
              onClick={(e) => {
                e.preventDefault();
                showMpConfig();
              }}
            >
              查看/修改小程序绑定配置
            </a> */}
            <BoundedCard
              appid={pageModel?.wxConfig?.appid}
              onBind={(e) => {
                console.log(e);
                e.preventDefault();
                showMpConfig();
              }}
            ></BoundedCard>
          </>
        ) : (
          <>
            {/* 当前未绑定小程序，将
            <strong> 无法预览/发布小程序</strong>，
            <a
              target="_blank"
              onClick={(e) => {
                e.preventDefault();
                showMpConfig();
              }}
            >
              绑定小程序
            </a> */}
            <UnboundedCard
              onBind={(e) => {
                console.log(e);
                e.preventDefault();
                showMpConfig();
              }}
            ></UnboundedCard>
          </>
        )}
      </div>
    </div>
  );
};

export const CompileConfig = () => {
  const compileLocalPath = useComputed(() => {
    return pageModel.compileLocalPath;
  });

  /** 用useEffect rxui会有bug，不要使用 */
  useMemo(async () => {
    const handle = await getCacheRootDirectoryHandle({
      fileId: pageModel.fileId,
    });
    if (handle?.name) {
      pageModel.compileLocalPath = handle.name;
    } else {
      pageModel.compileLocalPath = "";
    }
  }, []);

  if (!supportFSAccess) {
    return null;
  }

  return (
    <div className={css.compileConfig}>
      <div className={css.title}>编译配置</div>
      <div className={css.desc}>绑定后，编译代码将直接写入本地文件夹</div>
      {/* <Item title={'编译文件夹'}> */}
      {!!compileLocalPath ? (
        <div className={css.content}>
          当前已绑定本地文件夹：
          <strong
            data-mybricks-tip={"点击查看"}
            onClick={() =>
              showRootDirectoryHandle({ fileId: pageModel.fileId })
            }
          >
            ~/{compileLocalPath}
          </strong>
          ，
          <a
            onClick={() =>
              selectRootDirectory({ fileId: pageModel.fileId }).then(
                (handle) => {
                  pageModel.compileLocalPath = handle.name;
                }
              )
            }
          >
            点击切换
          </a>
        </div>
      ) : (
        <div className={css.content}>
          当前未绑定本地文件夹，
          <a
            onClick={() =>
              selectRootDirectory({ fileId: pageModel.fileId }).then(
                (handle) => {
                  pageModel.compileLocalPath = handle.name;
                }
              )
            }
          >
            点击绑定
          </a>
        </div>
      )}
      {/* </Item> */}
    </div>
  );
};