import React, { useCallback, useState } from 'react';
import { openFilePanel } from '@mybricks/sdk-for-app/ui';
import API from "@mybricks/sdk-for-app/api";
import { Spin } from "antd";
import styles from './file-reader.less'


export default ({ editConfig }) => {
  const { value, options = {} } = editConfig;
  const [loading, setLoading] = useState(false);

  const [state, setState] = useState({
    val: value.get()
  })

  const handleClick = useCallback(() => {
    openFilePanel({
      fileId: options.fileId,
      ...options,
    }).then((file: any) => {
      if (file) {
        setLoading(true)

        API.File.getLatestPub({ fileId: file.id }).then((res) => {
          const filePub = res[0]
          const content = JSON.parse(decodeURIComponent(filePub.content))
          value.set({
            fileId: file.id,
            name: file.name,
            extName: file.extName,
            filePubId: filePub.id,
            version: filePub.version,
            domainModel: content.domainModel,
          })
          setState({ val: file })
        }).catch((err) => {
          console.error("失败: ", err)
        }).finally(() => {
          setLoading(false);
        })
      }
    })
  }, [options])

  return (
    <div className={styles.fileReader} onClick={handleClick}>
      <Spin spinning={loading} size="small">
        <div className={styles.button}>选择{editConfig.title}</div>
      </Spin>
      
      {state.val && <div className={styles.selected}><span>当前选择{editConfig.title}</span>{`${state.val?.name}.${state.val?.extName}`}</div>}
    </div>
  )
}