import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Popover,
  Spin,
  Divider,
  Modal,
  Steps,
  Button,
  Form,
  Input,
  Switch,
  message,
} from "antd";
import { globalModal } from "@/components";
import { pageModel, userModel } from "@/stores";

import styles from "./index.less";

const WeappRequireForm = ({ onCancel, onOk }) => {
  const [form] = Form.useForm();
  return (
    <div className={styles.weappRequire}>
      <div className={styles.help}>
         <div className={styles.title}>如何查看在线版本号</div>
         <div className={styles.listItem}>1.登录微信小程序后台:<a href="https://mp.weixin.qq.com/" target="_blank">https://mp.weixin.qq.com/</a></div>
         <div className={styles.listItem}>2.左侧菜单：管理-版本管理-线上版本 进行查看</div>
        </div>
      <Form form={form} layout="vertical">
        <Form.Item
          name="version"
          label="版本号"
          rules={[{ required: true, message: "请输入版本号！" }]}
        >
          <Input placeholder="请输入本次发布的版本号，如 1.0.0" />
        </Form.Item>
        <Form.Item
          name="description"
          label="版本描述"
          rules={[{ required: true, message: "请输入版本描述！" }]}
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
                onOk?.(values);
              })
              .catch((res) => {});
          }}
        >
          确认
        </Button>
      </div>
    </div>
  );
};

export const showWeappRequireModal = ({ onSubmit }) => {
  globalModal.show({
    title: "发布为微信小程序",
    footer: null,
    width: 480,
    children: (
      <div className="fangzhou-theme">
        <WeappRequireForm onCancel={() => globalModal.hide()} onOk={onSubmit} />
      </div>
    ),
  });
};

export const showWeappPublishSuccessModal = () => {
  globalModal.show({
    title: "🎉 发布成功",
    footer: null,
    width: 700,
    children: (
      <div className="fangzhou-theme">
        <div>
          <span>访问</span>
          <a
            style={{ margin: "0px 3px" }}
            target="_blank"
            href="https://mp.weixin.qq.com/"
          >
            微信公众平台
          </a>
          - 版本管理，
          <span>去查看刚刚推送的新版本吧～</span>
        </div>
        <div style={{ margin: "10px 0px" }}>
          <img
            style={{ width: "100%" }}
            src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-2fbd5720-4bfb-4851-b326-caddf49020bc.png"
            alt=""
          />
        </div>
      </div>
    ),
  });
};
