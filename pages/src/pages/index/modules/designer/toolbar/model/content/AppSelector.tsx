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
    )}_type_`;
  
    set = (selectType: CompileType) => {
      localStorage.setItem(this.key, selectType);
    };
  
    get = (): CompileType => {
      return localStorage.getItem(this.key) as CompileType;
    };
  }
  
  const selectTypeStorage = new SelectTypeStorage();

export const AppSelector = ({ onCompile }) => {
    const [selectType, setSelectType] = useState(selectTypeStorage.get());
    const itemClick = (type) => {
        setSelectType(type);
        selectTypeStorage.set(type)
    }

    const downloadClick = () => {
        console.log("当前选中的应用类型", selectType)
        onCompile?.({
            type: selectType,
            // version: version,
            // description: description,
        });

    }

    return <>
        <div className={css.selector}>
            <div className={classNames({
                [css.item]: true,
                [css.active]: selectType === CompileType.weapp
            })} onClick={() => { itemClick(CompileType.weapp) }}>
                <img src={weapp} alt="" />
                <div className={css.text}>微信小程序</div>
            </div>

            <div className={classNames({
                [css.item]: true,
                [css.active]: selectType === CompileType.alipay
            })} onClick={() => { itemClick(CompileType.alipay) }}>
                <img src={alipay} alt="" />
                <div className={css.text}>支付宝小程序</div>
            </div>

            <div className={classNames({
                [css.item]: true,
                [css.active]: selectType === CompileType.dd
            })} onClick={() => { itemClick(CompileType.dd) }}>
                <img src={dd} alt="" />
                <div className={css.text}>钉钉小程序</div>
            </div>
        </div>
        <div className={classNames(css.footer, "fangzhou-theme")}><Button type="primary" onClick={() => { downloadClick() }}>构建并下载产物</Button></div>
    </>
}