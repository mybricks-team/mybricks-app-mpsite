import React, { useEffect, useRef, useState } from 'react'
import { Form, Input, Card, Button, Popconfirm } from 'antd'
import API from "@mybricks/sdk-for-app/api";
import { _NAMESPACE_ } from "..";
import dayjs from "dayjs";
import { TConfigProps } from '../useConfig';
const { Meta } = Card;

const fieldName = `sendAtsEmailApi`

export default ({ config, mergeUpdateConfig, loading, user }: TConfigProps) => {
  const [form] = Form.useForm();

  const emailApiConfig = config?.emailApiConfig || {}
  useEffect(() => {
    form.setFieldsValue(emailApiConfig)
  }, [emailApiConfig])

  const onSubmit = (values) => {
    const updateTime = dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    mergeUpdateConfig({
      emailApiConfig: { ...values, updateTime, user: user?.email }
    })
  }

  const onReset = () => {
    const updateTime = dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    mergeUpdateConfig({
      emailApiConfig: { [fieldName]: '', updateTime, user: user?.email }
    }).finally(() => {
      form.resetFields()
    })
  }

  return <>
    <Form form={form} onFinish={onSubmit} style={{ marginTop: 12 }}>
      <Form.Item
        name={fieldName}
        label="@消息评论通知接口"
        required
        rules={[{ required: true, message: '请输入接收@消息的评论接口' }]}
        tooltip="评论中@用户后，会自动调用该接口，传递评论相关内容（如页面id，评论内容，主题、等）"
      >
        <Input placeholder='https://my.mybricks.world/' />
      </Form.Item>
      <Form.Item style={{ textAlign: 'right' }}>
        {Object.keys(emailApiConfig).length > 0 && <Meta description={`${emailApiConfig.user} 更新于 ${emailApiConfig.updateTime}`} />}
        <Popconfirm
          title={`确定清空评论通知接口吗？`}
          onConfirm={onReset}
          okText="确定"
          cancelText="再想想"
        >
          <Button htmlType='reset' style={{ marginRight: 8 }}>清空</Button>
        </Popconfirm>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  </>
}