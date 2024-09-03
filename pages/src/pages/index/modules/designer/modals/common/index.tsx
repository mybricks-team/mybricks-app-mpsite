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
  message,
} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { globalModal } from '@/components'
import { pageModel, userModel } from '@/stores'

import styles from "./index.less";


export const showPublishLoading = ({ text }) => {
  globalModal.show({
    // title: '🎉 ',
    footer: null,
    width: 380,
    closable: false,
    maskClosable: false,
    children: (
      <div className="fangzhou-theme">
        <div className={styles.publishLoading}>
          <LoadingOutlined style={{ fontSize: 18 }} spin /><div className={styles.text}>{text}</div>
        </div>
      </div>
    ),
  })
}

export const hidePublishLoading = () => {
  globalModal.hide();
}