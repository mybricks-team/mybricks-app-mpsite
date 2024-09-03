import React, { useEffect, useRef, useState } from 'react';
import css from './VarList.less';
import { useCallback } from 'react';
import { message } from 'antd';
import { ImageEditor } from '../imageEditor/index';
import OperatorView from './operator-view';
import DesignerView from './designer-view';



interface Props {
  variables: any;
  data: any;
  canvas: any;
  theme: any;
}

enum CURRENT_ROLE {
  OPERATOR = 'operator',
  DESIGNER = 'designer',
}

const VarList = (props: Props) => {
  const { variables, data, canvas, theme } = props;
  // const [varAry, setVarAry] = useState(data.varAry || []);

  // useEffect(() => {
  //   let apiAry = variables.getAll();
  //   if (!varAry || varAry.length === 0) {
  //     if (JSON.stringify(apiAry) !== JSON.stringify(varAry)) {
  //       setVarAry(apiAry);
  //     }
  //   } else {
  //     const updatedVarAry = varAry.map((item) => {
  //       const apiItem = apiAry.find((apiItem) => apiItem.title === item.title);
  //       if (apiItem) {
  //         return {
  //           ...item,
  //           apiId: apiItem.id,
  //           notifyBindings: apiItem.notifyBindings,
  //         };
  //       }
  //       return item;
  //     });
  //     if (JSON.stringify(updatedVarAry) !== JSON.stringify(varAry)) {
  //       setVarAry(updatedVarAry);
  //     }

  //   }
  // }, [variables, varAry]);

  return (
    <>
      <div className={css.view}>
        <div className={css.title}>图文同步列表</div>
        <DesignerView varAryList={data.varAry} variables={variables} data={data} theme={theme}></DesignerView>
      </div>
    </>
  );
}

export default VarList;
