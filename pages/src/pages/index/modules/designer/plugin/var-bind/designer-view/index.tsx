import React, { useState, useCallback, useEffect } from 'react';
import css from './index.less';
import { message, Tabs } from 'antd';
import { ImageEditor } from '../../imageEditor/index';
import EditableDiv from '../components/editable-div';
import { hsla2rgba, parseColor,rgb2Hex } from '../utils/color';
import { Colorpicker } from '../components/color-picker';
import { setCSSVar } from "../utils/index"
import { itemTypes } from "../enum"

interface EditItem {
  apiId: string;
  value: string;
  id: string;
}

interface DesignerViewProps {
  varAryList: any;
  variables: any;
  data: any;
  theme: any;
}


interface MultiAddItemProps {
  type: itemTypes;
  value: string;
}

const DesignerView = (props: DesignerViewProps) => {
  const { varAryList, variables, data, theme } = props;
  const [varAry, setVarAry] = useState(varAryList || []);
  const [displayVarAry, setDisplayVarAry] = useState(varAryList);
  const [activeKey, setActiveKey] = useState('1');
  const [imageEditorShow, setImageEditorShow] = useState(false);
  const [urlFromEditor, setUrlFromEditor] = useState('');
  const [editItem, setEditItem] = useState<EditItem>();
  const [editUrl, setEditUrl] = useState('');
  const [editType, setEditType] = useState(Math.random().toString(36).slice(-6));
  const [originalTitles, setOriginalTitles] = useState('');
  const [tabChangeType, setTabChangeType] = useState(Math.random().toString(36).slice(-6));
  const [currentType, setCurrentType] = useState(itemTypes.STRING);
  const [tempInput, setTempInput] = useState({});
  const [tempInputValue, setTempInputValue] = useState({});

  //初始化时给变量列表追加notifyBindings
  useEffect(() => {
    const apiAry = variables.getAll();
    if (!apiAry) return
    const updatedVarAry = varAry.map((item) => {
      const apiItem = apiAry.find((apiItem) => item.title === apiItem.title);
      if (apiItem) {
        return { ...item, apiId: apiItem.id, notifyBindings: apiItem.notifyBindings };
      } else {
        return item;
      }
    });
    setVarAry(updatedVarAry);

  }, [variables])

  useEffect(() => {
    console.log("varAry",varAry)
    if (varAry.length == 0) {
      data.varAry = [{}];
      return;
    }
    data.varAry = varAry;
    setTabChangeType(Math.random().toString(36).slice(-6));
    let colorList = varAry.filter((item) => item.type === itemTypes.COLOR);
    colorList = colorList.map((item) => {
      return { ...item, name: item.title };
    });
    // window.getTheme = () => {
    //   return colorList;
    // };
    console.log('colorList', colorList)
    setCSSVar(colorList)
  }, [varAry]);

  useEffect(() => {
    setDisplayVarAry(varAry.filter((item) => item.type === itemTypes.STRING));
  }, []);

  useEffect(() => {
    let type;
    if (activeKey === '1') {
      type = itemTypes.STRING;
    } else if (activeKey === '2') {
      type = itemTypes.COLOR;
    } else if (activeKey === '3') {
      type = itemTypes.IMAGE;
    } else {
      return;
    }
    setDisplayVarAry(varAry.filter((item) => item.type === type));
    setCurrentType(type);
  }, [activeKey, tabChangeType]);

  const notify = (item, value) => {
    if (item?.notifyBindings === undefined) {
      return;
    }
    item.notifyBindings(value); //通知item对应的bindings
  };

  const _generateUniqueTitle = () => {
    let titleNumber = 1;
    let uniqueTitle = false;
    let newTitle = '';
    while (!uniqueTitle) {
      newTitle = `图文同步项${titleNumber}`;
      const isDuplicate = varAry.some((item) => item.title === newTitle);
      if (!isDuplicate) {
        uniqueTitle = true;
      } else {
        titleNumber++;
      }
    }
    return newTitle;
  };

  const addVar = (type: itemTypes) => {
    const uniqueTitle = _generateUniqueTitle();
    const randomId = Math.random().toString(36).slice(-6);

    const newItem = {
      id: type === itemTypes.COLOR ? `--${randomId}` : randomId,
      title: uniqueTitle,
      value: '',
      type,
    };

    // const colorId = Math.random().toString(36).slice(-6)
    // const newItemColor = {
    //   apiId: colorId,
    //   id: '--' + colorId,
    //   title: uniqueTitle,
    //   value: '#FFFFFF',
    //   type,
    // };
    //非颜色变量的处理
    // if (type === itemTypes.STRING || type === itemTypes.IMAGE) {
      variables.add({ title: uniqueTitle, schema: { type: 'string' }, initValue: '' });
      let apiAry = variables.getAll();
      const updatedVarAry = [...varAry, newItem].map((item) => {
        const apiItem = apiAry.find((apiItem) => item.title === apiItem.title);
        if (apiItem) {
          return { ...item, apiId: apiItem.id, notifyBindings: apiItem.notifyBindings };
        } else {
          return item;
        }
      });
      setVarAry(updatedVarAry);
    // }

    // if (type === itemTypes.COLOR) {
    //   const updatedVarAry = [...varAry, newItemColor];
    //   setVarAry(updatedVarAry);
    // }
  };

  const delVar = useCallback((id) => {
    variables.remove(id);
    const updatedVarAry = data.varAry.filter((item) => item.apiId !== id);
    setVarAry(updatedVarAry);
  }, []);

  const handleInputTitleChange = (event, itemId) => {
    let eventValue = typeof event === 'string' ? event : event?.target?.value;

    // 临时保存用户输入，不直接更新 varAry
    setTempInput((prevInput) => ({ ...prevInput, [itemId]: eventValue }));
  };

  const handleInputTitleBlur = (itemId, value) => {
    let inputValue = typeof value === 'string' ? value : value?.target?.value;
    const eventValue = tempInput[itemId];

    // 清空临时输入
    setTempInput((prevInput) => {
      const updatedInput = { ...prevInput };
      delete updatedInput[itemId];
      return updatedInput;
    });

    if (eventValue === undefined) return;

    let isDuplicate = false;
    let originalTitle = '';
    data.varAry.forEach((item) => {
      if (item.title === eventValue && item.apiId !== itemId) {
        isDuplicate = true;
        originalTitle = item.title;
        return;
      }
    });

    const updatedVarAry = data.varAry.map((item) => {
      if (item.apiId === itemId) {
        if (isDuplicate) {
          message.error('变量名重复！请重新输入新的变量名');
          return item
        } else {
          variables.update(itemId, {
            title: eventValue,
            schema: { type: 'string' },
            initValue: inputValue,
          });

          return { ...item, title: eventValue };
        }
      } else {
        return item;
      }
    });
    setVarAry(updatedVarAry);
  };

  const getPicUrlFromEditor = (url: string) => {
    setUrlFromEditor(url);
  };

  //在编辑器点确认的时候，把编辑器的url传给变量
  useEffect(() => {
    if (urlFromEditor) {
      const updatedVarAry = data.varAry.map((item) => {
        if (item.apiId === editItem.apiId) {
          notify(item, urlFromEditor);
          return { ...item, value: urlFromEditor };
        } else {
          return item;
        }
      });

      setVarAry(updatedVarAry);
    }
  }, [urlFromEditor, editType]);

  useEffect(() => {
    if (!editItem?.id) {
      return;
    }
    setEditUrl(editItem.value);
  }, [editItem]);

  const onTabChange = (key) => {
    setActiveKey(key);
  };

  const onSelectColor = (hsl, id) => {
    //操作选中后，length为3
    const val = hsla2rgba(hsl);
    theme.set(id, val);
    let newVarAry = varAry.map((item) => {
      if (item.id === id) {
        item.value = val;
        notify(item, rgb2Hex(val));
      }
      return item;
    });
    setVarAry(newVarAry);
  };

  const delColor = (item) => {
    const {id,apiId} = item;
    theme.remove(id);
    delVar(apiId)
    let newVarAry = varAry.filter((item) => item.id !== item);
    setVarAry(newVarAry);
  };

  const getLimitByItemId = (itemId) => {
    let limit = '0';
    data.varAry.forEach((item) => {
      if (item.apiId === itemId) {
        limit = item.limit;
      }
    });
    return limit;
  };

  const handleInputValueChange = (event, itemId) => {
    let limit = getLimitByItemId(itemId);
    if (event.target.value.length == 0 || event.target.value.length <= limit || !limit || limit == '' || limit == '0') {
      setTempInputValue((prevInputValue) => ({
        ...prevInputValue,
        [itemId]: event.target.value,
      }));
      return;
    }
    if (event.target.value.length > limit) {
      message.error(`输入内容超过限制${limit}字`);
      //把超过限制的内容截取掉
      setTempInputValue((prevInputValue) => ({
        ...prevInputValue,
        [itemId]: event.target.value.substring(0, limit),
      }));
      return;
    }
  };

  const handleInputValueBlur = (item, value) => {
    const itemId = item.apiId;
    const itemTitle = item.title;
    const eventValue = tempInputValue[itemId];

    // 清空临时输入
    setTempInputValue((prevInputValue) => {
      const updatedInputValue = { ...prevInputValue };
      delete updatedInputValue[itemId];
      return updatedInputValue;
    });

    if (eventValue === undefined) return;

    variables.update(itemId, {
      title: itemTitle,
      schema: { type: 'string' },
      initValue: value,
    });

    const updatedVarAry = data.varAry.map((item) => {
      if (item.apiId === itemId) {
        notify(item, value);
        return { ...item, value: value };
      } else {
        return item;
      }
    });
    setVarAry(updatedVarAry);
  };

  return (
    <div className="fangzhou-theme">
      <div className={css.view}>
        <div className={css.card}>
          <Tabs
            className={css.tabs}
            defaultActiveKey="1"
            activeKey={activeKey}
            onTabClick={(e) => { }}
            onChange={(e) => {
              onTabChange(e);
            }}
          >
            <Tabs.TabPane tab="文本" key="1"></Tabs.TabPane>
            <Tabs.TabPane tab="颜色" key="2"></Tabs.TabPane>
            <Tabs.TabPane tab="图片" key="3"></Tabs.TabPane>
          </Tabs>

          <div className={css.listWrapper}>
            {/* 文字变量的显示tab */}
            {displayVarAry && currentType === itemTypes.STRING && displayVarAry.length === 0 && (
              <div className={css.empty}>
                <img
                  src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-267a31f3-d786-4e5a-94f4-83736e120922.png"
                  alt=""
                  className={css.emptyImg}
                />
                无内容
              </div>
            )}
            {displayVarAry &&
              currentType === itemTypes.STRING &&
              displayVarAry.map((item, index) => {
                return (
                  <div key={item.id} className={css.var}>
                    <div className={css.varTitleBox}>
                      <div className={css.varTitle}>
                        @
                        <input
                          onChange={(e) => {
                            handleInputTitleChange(e, item.apiId);
                          }}
                          onBlur={(e) => {
                            handleInputTitleBlur(item.apiId, e);
                          }}
                          type="text"
                          value={tempInput[item.apiId] !== undefined ? tempInput[item.apiId] : item.title}
                          placeholder="请输入变量名"
                          className={css.varFiledTitle}
                        />
                      </div>
                    </div>

                    <div className={css.varbox}>
                      <input
                        onChange={(e) => handleInputValueChange(e, item.apiId)}
                        onBlur={(e) => handleInputValueBlur(item, e.target.value)}
                        value={tempInputValue[item.apiId] !== undefined ? tempInputValue[item.apiId] : item.value}
                        type="text"
                        className={css.varFiled}
                        placeholder="请输入配置值"
                      />
                      <div className={css.varDelete} title="删除" onClick={(e) => delVar(item.apiId)}>
                        <img
                          src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-749031b5-e29c-4364-b1de-3bfef9028175.png"
                          alt="删除"
                          className={css.deleteImg}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* 颜色变量的显示tab */}
            {displayVarAry && currentType === itemTypes.COLOR && displayVarAry.length === 0 && (
              <div className={css.empty}>
                <img
                  src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-267a31f3-d786-4e5a-94f4-83736e120922.png"
                  alt=""
                  className={css.emptyImg}
                />
                无内容
              </div>
            )}
            {displayVarAry &&
              currentType === itemTypes.COLOR &&
              displayVarAry.map((item, index) => {
                return (
                  <div className={css.colorVarItem}>
                    <div className={css.colorVarItemLeft}>
                      <Colorpicker
                        value={item.value}
                        onChange={({ hsl }) => {
                          onSelectColor(hsl, item.id);
                        }}
                        key={''}
                      >
                        <div className={css.colorVarRound} style={{ backgroundColor: item.value }}></div>
                      </Colorpicker>
                      <div className={css.colorVarTitle}>
                        <EditableDiv value={item.title} onChange={(e) => {
                          handleInputTitleChange(e, item.apiId);
                        }}
                          onBlur={(e) => {
                            handleInputTitleBlur(item.apiId, e);
                          }}></EditableDiv>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        delColor(item);
                      }}
                    >
                      <img
                        src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-749031b5-e29c-4364-b1de-3bfef9028175.png"
                        alt="删除"
                        className={css.deleteImg}
                      />
                    </div>
                  </div>
                );
              })}

            {/* 图片变量的显示tab */}
            {displayVarAry && currentType === itemTypes.IMAGE && displayVarAry.length === 0 && (
              <div className={css.empty}>
                <img
                  src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-267a31f3-d786-4e5a-94f4-83736e120922.png"
                  alt=""
                  className={css.emptyImg}
                />
                无内容
              </div>
            )}
            {displayVarAry && currentType === itemTypes.IMAGE && (
              <div className={css.triCardContainer}>
                {displayVarAry.map((item, index) => {
                  return (
                    <div className={css.triCard}>
                      <img
                        className={css.cross}
                        src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-294e22d0-2350-4217-a953-7c9315752179.png"
                        onClick={(e) => delVar(item.apiId)}
                      />
                      <div
                        className={css.changePic}
                        onClick={() => {
                          setImageEditorShow(true);
                          setEditItem(item);
                        }}
                      >
                        更换图片
                      </div>
                      <img
                        className={css.img}
                        src={
                          item.value
                            ? item.value
                            : 'https://assets.mybricks.world/s6SYCUwvz2JJkSk4BidnjsnvdvKD8NPJ-1724659566939.png'
                        }
                        alt=""
                      />
                      <div className={css.desc}>
                        <EditableDiv
                          value={tempInput[item.apiId] !== undefined ? tempInput[item.apiId] : item.title}
                          onChange={(e) => {
                            handleInputTitleChange(e, item.apiId);
                          }}
                          onBlur={(e) => {
                            handleInputTitleBlur(item.apiId, e);
                          }}
                        ></EditableDiv>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            className={css.addVar}
            onClick={() => {
              addVar(currentType);
            }}
          >
            新增图文配置
          </button>
        </div>

        <ImageEditor
          show={imageEditorShow}
          onCancel={() => setImageEditorShow(false)}
          onConfirm={() => {
            setImageEditorShow(false), setEditType(Math.random().toString(36).slice(-6));
          }}
          picUrlProps={getPicUrlFromEditor}
          picUrlSet={editUrl}
        ></ImageEditor>
      </div>
    </div>
  );
};

export default DesignerView;
