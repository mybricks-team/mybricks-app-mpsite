import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import css from "./AppSelector.less";
import { Button } from "antd";
import classNames from "classnames";
import { CompileType } from "@/types";
import weapp from "./../../icons/weapp";
import alipay from "./../../icons/alipay"
import dd from "./../../icons/dd";
import h5 from "./../../icons/h5";

class SelectTypeStorage {
  key = `_mybricks_mpsite_${new URL(location.href).searchParams.get(
    "id"
  )}_harmonyProductSelector_type_`;

  set = (selectType: CompileType) => {
    localStorage.setItem(this.key, selectType);
  };

  get = (): CompileType => {
    return localStorage.getItem(this.key) as CompileType;
  };
}

const selectTypeStorage = new SelectTypeStorage();

export const HarmonyProductSelector = ({ onCompile }) => {
  const [selectType, setSelectType] = useState(selectTypeStorage.get());
  const itemClick = (type) => {
    setSelectType(type);
    selectTypeStorage.set(type)
  }

  const downloadClick = () => {
    console.log("当前选中的应用类型", selectType)
    onCompile({
      type: selectType,
    });
  }

  return <>
    <div className={css.selector}>
      <div className={classNames({
        [css.item]: true,
        [css.active]: selectType === CompileType.harmonyComponent
      })} onClick={() => { itemClick(CompileType.harmonyComponent) }}>
        {/* <img src={weapp} alt="" /> */}
        <div className={css.text}>组件</div>
      </div>

      <div className={classNames({
        [css.item]: true,
        [css.active]: selectType === CompileType.harmonyApplication
      })} onClick={() => { itemClick(CompileType.harmonyApplication) }}>
        {/* <img src={alipay} alt="" /> */}
        <div className={css.text}>应用</div>
      </div>
    </div>
    <div className={classNames(css.footer, "fangzhou-theme")}><Button type="primary" onClick={() => { downloadClick() }}>构建并下载产物</Button></div>
  </>
}