import React, { ReactNode, useMemo } from 'react';
import css from "./updateTips.less"
import tipsIcon from "./icons/tips"


const updateTip = ({ versions, updatorName, description, isglobalUpdate = false }) => {
    // return <>
    //     <div>当前最新保存版本号为 <b className={css.tipStyle}>{versions}</b></div>
    //     <div>由 <b className={css.tipStyle}>{updatorName}</b> 保存</div>
    //     <div>当前保存内容：</div>
    //     {isglobalUpdate && <b className={css.tipStyle}>应用全局配置</b>}
    //     {description.length ? description.map((des) => des) : null}
    // </>

    return <div className={css.card}>
        {/* 左侧更新内容 */}
        <div className={css.left_content}>
            <div className={css.title}>
                <div className={css.icon}>{tipsIcon()}</div>
                <div>当前内容有更新</div>

            </div>
            <div className={css.description}>
                {isglobalUpdate && "应用全局配置"}
                {description.length ? description.map((des) => des) : null}
            </div>
            <div className={css.bottom_content}>
                <div className={css.button} onClick={() => {
                    location.reload();
                }}>立即刷新</div>

                <div>{updatorName} 更新于 {versions}</div>
            </div>

        </div>

        {/* 右侧更新版本号和更新人 */}
        {/* <div className={css.right_version}>
            <div className={css.version}>
                {versions}
                </div>
            <div className={css.updator}>
                {updatorName}
                </div>
        </div> */}
    </div>
}

export default updateTip