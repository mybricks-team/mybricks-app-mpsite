import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Popover,
  Spin,
  Divider,
  Modal,
  Steps,
  Checkbox,
  Button,
  Form,
  Input,
  message,
} from 'antd'
import QRCode from 'react-qr-code'
import { globalModal } from '@/components'
import { pageModel, userModel } from '@/stores'

import styles from './index.less'

const H5RequireForm = ({ onCancel, onOk }) => {
  const [form] = Form.useForm()
  return (
    <div className={styles.h5Require}>
      <Form form={form} layout="vertical">
        {/* <Form.Item
          name="envType"
          label="版本号"
          rules={[{ required: true, message: '请输入版本号！' }]}
        >
          <Input placeholder="请输入本次发布的版本号，如 1.0.0" />
        </Form.Item> */}
        <Form.Item
          name="commitInfo"
          label="版本描述"
          rules={[{ required: true, message: '请输入版本描述！' }]}
        >
          <Input.TextArea
            rows={3}
            maxLength={100}
            placeholder="请输入版本描述"
          />
        </Form.Item>
      </Form>

      <div className={styles.footer}>
        <Button onClick={onCancel}>取消</Button>
        <Button
          type="primary"
          onClick={() => {
            form
              .validateFields()
              .then((values) => {
                onOk?.(values)
              })
              .catch((res) => {})
          }}
        >
          确认
        </Button>
      </div>
    </div>
  )
}

export const showH5RequireModal = ({ onSubmit }) => {
  globalModal.show({
    title: '发布',
    footer: null,
    width: 480,
    children: (
      <div className="fangzhou-theme">
        <H5RequireForm onCancel={() => globalModal.hide()} onOk={onSubmit} />
      </div>
    ),
  })
}

const H5PublishForm = ({ onDownload, url }) => {
  const openURL = () => {
    window.open(url)
  }
  const [localize, setLocalize] = useState(0)

  return (
    <div className={styles.h5Publish}>
      {/* <div className={styles.desc}>H5发布成功</div> */}
      <div className={styles.body}>
        <div className={styles.qrcode}>
          <QRCode style={{ width: '100%', height: '100%' }} value={url} />
        </div>
        <div className={styles.url}>
          <strong>地址为</strong>
          <div>{url}</div>
          <a onClick={openURL}>点击访问</a>
        </div>
      </div>
      <Divider style={{ margin: '20px 0px 14px 0px' }} />
      <div className={styles.footer}>
        <Checkbox  value={!!localize} onChange={(v) => setLocalize(v ? 1 : 0)}>
          下载时将图片等静态资源本地化
        </Checkbox>
        <a className={styles.second} onClick={() => onDownload({ localize })}>
          点击下载
        </a>
      </div>
    </div>
  )
}

export const showH5PublishSuccessModal = ({ url = '', onDownload }) => {
  const _url = fillUrl(url)

  globalModal.show({
    title: '🎉 发布成功',
    footer: null,
    width: 480,
    children: (
      <div className="fangzhou-theme">
        <H5PublishForm url={_url} onDownload={onDownload} />
      </div>
    ),
  })
}

function fillUrl(urlString) {
  const url = new URL(urlString, window.location) // 用当前页面的URL对象补全相对路径
  return /^\/[^/]/.test(urlString) ? url.href : urlString
}
