import React, { useEffect, useRef, useState } from "react";
import css from "./VarList.less";
import { useCallback } from "react";
import { message } from "antd";
import { ImageEditor } from "../imageEditor/index";
import OperatorView from "./operator-view";
import DesignerView from "./designer-view";
import { HelpModal } from "./help-modal";

interface Props {
  variables: any;
  data: any;
  canvas: any;
  theme: any;
}

enum CURRENT_ROLE {
  OPERATOR = "operator",
  DESIGNER = "designer",
}

const VarList = (props: Props) => {
  const { variables, data, canvas, theme } = props;
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <div className={css.view}>
        <div className={css.title}>
          <div className={css.title_main}>图文同步列表</div>
          <div
            className={css.title_help}
            onClick={() => {
              setShowHelpModal(true);
            }}
          >
            使用帮助{" "}
            <img src="https://assets.mybricks.world/Yn2pLojPMnK8jrwAXHgY7o7tRdEL53W5-1725609731194.png" />
          </div>
        </div>
        <DesignerView
          varAryList={data.varAry}
          variables={variables}
          data={data}
          theme={theme}
        ></DesignerView>
      </div>

      <HelpModal
        show={showHelpModal}
        onCancel={() => {
          setShowHelpModal(false);
        }}
        onConfirm={() => {}}
      ></HelpModal>
    </>
  );
};

export default VarList;
