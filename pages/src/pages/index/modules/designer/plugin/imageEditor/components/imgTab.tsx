import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

import { PreviewTab } from './tabPages/PreviewTab';
import { CutoutTab } from './tabPages/CutoutTab';
import { CropTab } from './tabPages/CropTab';
import { MaterialTab } from './tabPages/MaterialTab';

import Context from '../context/index';

export const ImgTab = ({ picUrlProp, picUrlSet, onPreviewOk, onPreviewCancel }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (picUrlSet === '') {
      setUrl('');
      return;
    }
    setUrl(picUrlSet);
  }, [picUrlSet]);

  const [activeKey, setActiveKey] = useState('1');
  useEffect(() => {
    console.log('activeKey变化', activeKey);
  }, [activeKey]);

  const onChange = (key: string) => {
    console.log('onChange', key);
  };

  const onTabClick = (key: string) => {
    console.log('onTabClick', key);
    setActiveKey(key);
  };

  const setActiveKeyFromComp = (key: string) => {
    console.log('setActiveKeyFromComp', key);
    setActiveKey(key);
  };

  useEffect(() => {
    if (url) {
      picUrlProp(url);
    }
  }, [url]);

  return (
    <Context.Provider value={{ url, setUrl }}>
      <Tabs
        className="fangzhou-theme"
        defaultActiveKey="1"
        activeKey={activeKey}
        onTabClick={onTabClick}
        onChange={onChange}
      >
        <Tabs.TabPane tab="图片上传" key="1">
          <PreviewTab onOk={onPreviewOk} onCancel={onPreviewCancel}></PreviewTab>
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab="智能抠图" key="2">
          <CutoutTab setActiveKeyFromComp={setActiveKeyFromComp}></CutoutTab>
        </Tabs.TabPane>
        <Tabs.TabPane tab="图片裁剪" key="3">
          <CropTab></CropTab>
        </Tabs.TabPane> */}

        {/* <Tabs.TabPane tab="去素材库选图片" key="4">
          <MaterialTab setActiveKeyFromComp={setActiveKeyFromComp}></MaterialTab>
        </Tabs.TabPane> */}

      </Tabs>
    </Context.Provider>
  );
};
