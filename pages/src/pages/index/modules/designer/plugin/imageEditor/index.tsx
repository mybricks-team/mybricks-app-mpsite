import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { ImgTab } from './components/imgTab';
import css from './index.less';

export const ImageEditor = ({ picUrlProps, picUrlSet, show, onConfirm, onCancel }) => {
  const [picUrl, setPicUrl] = useState('');
  const [picUrlSets, setPicUrlSets] = useState(picUrlSet);

  useEffect(()=>{
    setPicUrlSets(picUrlSet)
  },[picUrlSet])

  const getPicUrl = (url: string) => {
    setPicUrl(url);
  };
  const previewOk = () => {
    onConfirm();
    picUrlProps(picUrl);
  };

  return (
    <>
      <Modal
        bodyStyle={{ padding: '5px 20px', borderRadius: '30px !important', overflow: 'hidden', boxShadow: 'none' }}
        wrapClassName={css.modalOuter}
        style={{ borderRadius: '10px', overflow: 'hidden', height: '730px' }}
        className={css.modal}
        visible={show}
        onOk={onConfirm}
        onCancel={onCancel}
        footer={null}
      >
        <div className={css.box}>
          <ImgTab
            picUrlProp={getPicUrl}
            picUrlSet={picUrlSets}
            onPreviewOk={previewOk}
            onPreviewCancel={onCancel}
          ></ImgTab>
        </div>
      </Modal>
    </>
  );
};
