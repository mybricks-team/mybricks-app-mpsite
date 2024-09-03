import React, { useEffect, useState } from "react";

import useConfig from "./useConfig";
import ConfigDesigner from "./ConfigDesigner";
import ConfigServer from "./ConfigServer";
export const _NAMESPACE_ = APP_NAME;
import style from "./app.less";
import { Collapse, Spin } from "antd";

export default (props) => {
  const { options = {} } = props;
  const configContext = useConfig(_NAMESPACE_, {}, options);

  const isInGroup = options?.type === "group";

  return (
    <Spin spinning={configContext.loading}>
      <Collapse
        style={{ padding: 24 }}
        className={style.wrapper}
        defaultActiveKey={[0, 1, 2, 3, 4]}
      >
        <Collapse.Panel key={0} header="设计器">
          <ConfigDesigner {...configContext} />
        </Collapse.Panel>

        <Collapse.Panel key={0} header="服务扩展">
          <ConfigServer {...configContext} />
        </Collapse.Panel>
      </Collapse>
    </Spin>
  );
};
