import React, { useState, useContext, useEffect } from 'react';
import css from './CutoutTab.less';
import { Button, message, Modal, Radio, Spin } from 'antd';
import ModalFooterSingle from '../modalFooterSingle';
import Context from '../../context/index';

export const CutoutTab = ({ setActiveKeyFromComp }) => {
  const { url, setUrl } = useContext(Context);
  const [ processingUrl, setProcessingUrl ] = useState('');
  console.log('抠图页面的url', url);
  return (
    <>
      <div className={css.mattingModal}>
        <div className={css.operation}>
          <Radio.Group
            defaultValue="commodity"
            // value={activeMode}
            onChange={(e) => {
              // setActiveMode(e.target.value);
            }}
          >
            <Radio.Button value="commodity" onClick={() => {}}>
              商品抠图
            </Radio.Button>
            <Radio.Button value="portrait" onClick={() => {}}>
              人像抠图
            </Radio.Button>
          </Radio.Group>
        </div>
        <div className={css.preview}>
          <div className={css.original}>
            <img src={url} />
          </div>
          <div className={css.result}>
            <img src={''} />
          </div>
        </div>
      </div>
      <ModalFooterSingle onConfirm={() => setActiveKeyFromComp('1')}></ModalFooterSingle>
    </>
  );
};
