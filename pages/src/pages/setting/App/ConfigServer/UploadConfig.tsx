import React, { useEffect, useRef, useState } from 'react'
import { Form, Input, Card, Button, Popconfirm } from 'antd'
import API from "@mybricks/sdk-for-app/api";
import { _NAMESPACE_ } from "..";
import dayjs from "dayjs";
import { TConfigProps } from '../useConfig';
const { Meta } = Card;

export default ({ config, mergeUpdateConfig, loading, user }: TConfigProps) => {
  const [form] = Form.useForm();

  const uploadConfig = config?.uploadServer || {}
  useEffect(() => {
    form.setFieldsValue(uploadConfig)
  }, [uploadConfig])

  const onSubmit = (values) => {
    const updateTime = dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    mergeUpdateConfig({
      uploadServer: { ...values, updateTime, user: user?.email }
    })
  }

  const onReset = () => {
    const updateTime = dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    mergeUpdateConfig({
      uploadServer: { uploadService: '', updateTime, user: user?.email }
    }).finally(() => {
      form.resetFields()

    })
  }

  return <>
    <Form form={form} onFinish={onSubmit}>
      <Form.Item
        name="uploadService"
        label="搭建态文件上传接口"
        required
        rules={[{ required: true, message: '请输入服务接口' }]}
        tooltip="该接口用于上传静态文件，如：搭建时的图片、文件上传"
      >
        <Input />
      </Form.Item>
      <Form.Item style={{ textAlign: 'right' }}>
        {Object.keys(uploadConfig).length > 0 && <Meta description={`${uploadConfig.user} 更新于 ${uploadConfig.updateTime}`} />}
        <Popconfirm
          title={`确定清空服务接口吗？`}
          onConfirm={onReset}
          okText="确定"
          cancelText="再想想"
        >
          <Button style={{ marginRight: 8 }}>清空</Button>

        </Popconfirm>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  </>
}