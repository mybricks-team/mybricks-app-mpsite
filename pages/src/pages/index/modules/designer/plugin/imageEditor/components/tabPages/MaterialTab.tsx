import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import css from './MaterialTab.less';
import { message } from 'antd';
import Context from '../../context/index';

export const MaterialTab = ({ setActiveKeyFromComp }) => {
  const { setUrl } = useContext(Context);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const selectedMaterialsRef = useRef([]);
  const iframeRef = useRef<HTMLIFrameElement>();
  const iframeUrl = useMemo(() => {
    const url = new URL(`${location.origin}/material/picture`);
    url.searchParams.set('isSelector', 'true');
    url.searchParams.set('type', 'picture');
    // url.searchParams.set('sceneId', String(5));
    return url.toString();
  }, []);

  useEffect(() => {
    window.addEventListener('message', addMaterial);

    return () => {
      window.removeEventListener('message', addMaterial);
    };
  }, []);

  const addMaterial = useCallback((event) => {
    if (!event?.data?.materialType) {
      return;
    }

    const { materialId, comlib, materialType, content, title, namespace, version } = event.data;

    if (selectedMaterials.length !== 0) {
      message.warn('只能选取一张图片素材，此次操作将覆盖上次选取的图片素材');
    }

    if (materialType === 'picture') {
      const materials = [{ materialId, materialType, content, title, namespace, version }];
      selectedMaterialsRef.current = materials;
      console.log('选中了图片素材', materials);
      setSelectedMaterials(materials);
      setActiveKeyFromComp('1');
      //   sendSelectedMaterials();
      setUrl(JSON.parse(materials[0].content).url);
    }
  }, []);

  //不知道为啥加了监听器获取到素材后，还要向iframe发送消息，这里先注释掉
  //
  //   const sendSelectedMaterials = useCallback(() => {
  //     const res = iframeRef.current.contentWindow?.postMessage(
  //       {
  //         materialModalRefer: true,
  //         action: 'select',
  //         selectedMaterials: JSON.stringify(
  //           selectedMaterialsRef.current.map((com) => {
  //             return {
  //               materialId: com.materialId,
  //               namespace: com.namespace,
  //               version: com.version,
  //             };
  //           }),
  //         ),
  //       },
  //       '*',
  //     );
  //   }, []);

  return (
    <iframe className={css.iframe} ref={iframeRef} src={iframeUrl}></iframe>
    // <iframe
    //   className={css.iframe}
    //   ref={iframeRef}
    //   src="https://fangzhou.corp.kuaishou.com/material/picture?isSelector=true&type=picture"
    // ></iframe>
  );
};
