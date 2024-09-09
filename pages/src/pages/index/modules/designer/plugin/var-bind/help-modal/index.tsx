import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import css from './index.less';

interface Props {
  show: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const HelpModal = ({ show, onConfirm, onCancel } : Props) => {

  return (
    <>
      <Modal
        bodyStyle={{ padding: '5px 20px', borderRadius: '30px !important', overflow: 'hidden', boxShadow: 'none', backgroundColor:"#F9F9F9" }}
        wrapClassName={css.modalOuter}
        style={{ borderRadius: '10px', overflow: 'hidden', height: '730px' }}
        className={css.modal}
        visible={show}
        onOk={onConfirm}
        onCancel={onCancel}
        footer={null}
      >
        <div className={css.box}>
            <div className={css.title}>图文同步项如何使用：</div>
            <img className={css.helpImg} src="https://assets.mybricks.world/t03M3izebtZoAuFrRZRzrR7RvbnIxyLj-1725864189049.png" alt="" />
        </div>
      </Modal>
    </>
  );
};
