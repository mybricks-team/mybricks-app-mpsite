import React from 'react';
import css from './style.less';

const UnboundedCard = ({onBind}) => {
    const handleBind = (e) => {
        onBind(e)
    }

    return (
      <div className={css.card}>
        <div className={css.title}>暂未绑定小程序</div>
        <div className={css.desc}>无法预览/发布小程序</div>
        <div className={css.btn} onClick={(e)=>{handleBind(e)}}>
          去绑定
        </div>
      </div>
    );
}

export default UnboundedCard;