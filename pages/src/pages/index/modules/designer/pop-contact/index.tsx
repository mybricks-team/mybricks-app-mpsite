import React, { useEffect, useState, useMemo } from "react";
import { Popover } from "antd";
import css from "./index.less";

const content = () => {
  return (
    <div className={css.pop}>
      <img
        className={css.wxcode}
        src="https://assets.mybricks.world/SHaHPeGK7ARGgxuROg7ucc0jrJHel3er-1715065328932.png"
        alt=""
      />
      <div className={css.text}>扫码添加客服微信</div>
    </div>
  );
};

const model = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const contact_btn_callback = () => {
      setOpen(false);
    };
    document.body.addEventListener("click", contact_btn_callback);
    return () => {
      document.body.removeEventListener("click", contact_btn_callback);
    };
  }, []);
  return (
    <Popover content={content} trigger="click" open={open}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={css.btn}
      >
        <img
          src="https://assets.mybricks.world/sbDmAtQt7obyPNCCYYOVBAL6OF6XTdLV-1715066969270.png"
          alt=""
        />
        联系客服
      </div>
    </Popover>
  );
};

export default model;
