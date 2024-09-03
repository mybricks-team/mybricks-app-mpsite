import React, { useEffect, useMemo } from 'react'
import { Popover, Spin, Divider } from 'antd'
import QrCode from 'react-qr-code';

import { observable, useComputed } from 'rxui-t'

import styles from './index.less'

enum PreviewStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  FAIL = 'fail',
}

class Model {
  previewQrcode = ''
  previewStatusTips: string[] = []

  title = '预览'

  successConfig: any

  status: PreviewStatus = PreviewStatus.IDLE

  content: any

  /** 打开高级模式，一般一些隐藏功能放在这里 */
  constructor() {}
}

export const model: Model = observable(new Model())

export const previewModel = {
  close: () => {
    model.status = PreviewStatus.IDLE
  },
  loading: ({ title }) => {
    model.title = title;
    model.status = PreviewStatus.LOADING;

    console.warn(model.status);
  },
  success: (config) => {
    model.successConfig = config;
    model.status = PreviewStatus.SUCCESS
  },
  fail: () => {
    model.status = PreviewStatus.FAIL
  },
  isLoading: () => {
    return model.status === PreviewStatus.LOADING
  }
}


export const PreviewPopOver = ({ children, onCompile }) => {
  useEffect(() => {
    const callback = () => {
      model.status = PreviewStatus.IDLE
    }
    document.body.addEventListener('click', callback)
    return () => {
      document.body.removeEventListener('click', callback)
    }
  }, [])

  const title = useComputed(() => model.title)
  const status = useComputed(() => model.status)

  const successConfig = useComputed(() => model.successConfig)

  const $wrapperContent = useMemo(() => {
    return (
      <div className={styles.preview} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>{title}</div>
        <Divider style={{ width: '100%', margin: '10px 0px' }} />
        <Spin spinning={status === PreviewStatus.LOADING} tip="构建中...">
          {status === PreviewStatus.FAIL && (
            <div className={styles.block}>
              构建失败，<a onClick={onCompile}>点击重试</a>
            </div>
          )}
          {status === PreviewStatus.SUCCESS && successConfig.qrcodeUrl && (
            <div
              className={styles.block}
              style={{ backgroundImage: `url(${successConfig.qrcodeUrl})` }}
            >
              <div className={styles.retry}>
                <a onClick={onCompile}>刷新</a>
              </div>
            </div>
          )}
          {status === PreviewStatus.SUCCESS && successConfig.webUrl && (
            <>
              <div
                className={styles.block}
              >
                <QrCode style={{ width: 170, height: 170 }} value={fillUrl(successConfig.webUrl) ?? ''} />
                <div className={styles.retry}>
                  <a onClick={onCompile}>刷新</a>
                </div>
              </div>
              <div className={styles.open} onClick={() => window.open(fillUrl(successConfig.webUrl))}>点击浏览器打开</div>
            </>
          )}
          {[PreviewStatus.LOADING, PreviewStatus.IDLE].includes(status) && (
            <div className={styles.block}></div>
          )}
        </Spin>
        {/* <Divider style={{ width: '100%', margin: '10px 0px' }} /> */}
        {/* <div className={styles.footer}>
        二维码失效？
				<a onClick={onRefreshCompile}>清除缓存重新构建</a>
			</div> */}
      </div>
    )
  }, [title, status, successConfig, onCompile])

  return (
    <Popover
      style={{ margin: 12 }}
      content={$wrapperContent}
      destroyTooltipOnHide
      open={status !== PreviewStatus.IDLE}
      placement="bottom"
    >
      <div onClick={(e) => e.stopPropagation()} style={{ marginRight: 5 }}>
        {children}
      </div>
    </Popover>
  )
}

function fillUrl(urlString) {
  const url = new URL(urlString, window.location); // 用当前页面的URL对象补全相对路径
  return /^\/[^/]/.test(urlString) ? url.href : urlString;
}