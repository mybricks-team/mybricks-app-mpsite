import React from "react";
import css from "./style.less";

const BoundedCard = ({ appid, onBind }) => {
  const handleBind = (e) => {
    onBind(e);
  };
  return (
    <div className={css.card}>
      <div className={css.title}>APPID:{appid}</div>
      <div className={css.desc}>已绑定小程序</div>
      <div
        className={css.btn}
        onClick={(e) => {
          handleBind(e);
        }}
      >
        去换绑
      </div>
    </div>
  );
};
export default BoundedCard;
