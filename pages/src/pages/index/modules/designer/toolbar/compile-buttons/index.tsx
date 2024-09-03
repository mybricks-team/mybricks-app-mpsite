import React, { useCallback, useEffect, useState } from 'react'
import { useComputed } from 'rxui-t'
import { Locker, Toolbar, openFilePanel } from '@mybricks/sdk-for-app/ui'
import API from '@mybricks/sdk-for-app/api'
import { pageModel } from '@/stores'
import { Button, Modal, Form, Input, Radio, Dropdown } from 'antd'
import { DownOutlined, EyeOutlined } from '@ant-design/icons'
import { CompileType } from '@/types'

import css from './index.less'

const DescMap = {
  [CompileType.weapp]: "微信小程序"
}

export default ({ operable }) => {
  const [selectType, setSelectType] = useState(CompileType.weapp)

  return (
    <div className={css.compile}>
      <Dropdown
        menu={{
          items: [
            {
              label: '预览微信小程序',
              key: CompileType.weapp,
              disabled: !operable,
              style: { fontSize: 13 },
            },
            {
              label: '预览H5（Beta）',
              key: CompileType.h5,
              disabled: !operable,
              style: { fontSize: 13 },
            },
          ],
          onClick: (e) => {
            // pageModel.previewStatus = PreviewStatus.LOADING
          },
        }}
        trigger={['click']}
      >
        <div className={css.btn}>
          构建平台：{DescMap[selectType]}
        </div>
      </Dropdown>
      <div className={css.btn}>
        预览
        <EyeOutlined />
      </div>
      <div className={css.btn}>
        发布
      </div>
    </div>
  )
}


export const CompileButtonGroups = ({ children }) => {

  return (
    <div className={css.compile}>
      {children}
    </div>
  )
}

export const CompileButton = ({ children, onClick }) => {
  return (
    <div className={css.btn} onClick={onClick}>
      {children}
    </div>
  )
}