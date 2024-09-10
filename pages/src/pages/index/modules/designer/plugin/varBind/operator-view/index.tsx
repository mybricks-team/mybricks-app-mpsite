import React, { useState, useCallback, useEffect } from 'react';
import css from './index.less';
import { Button, Checkbox, Form, Input, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ImageEditor } from '../../imageEditor/index';
import { Colorpicker } from '../components/color-picker';
import { hsla2rgba, parseColor } from '../utils/color';
import { message, Tabs } from 'antd';

interface EditItem {
  apiId: string;
  value: string;
  id: string;
}

interface OperatorViewProps {
  varAryList: any;
  variables: any;
  data: any;
  theme: any;
}

enum itemTypes {
  STRING = 'string',
  COLOR = 'color',
  IMAGE = 'image',
}

const OperatorView = (props: OperatorViewProps) => {
  const { varAryList, variables, data, theme } = props;
  const [varAry, setVarAry] = useState(varAryList || []);
  const [imageEditorShow, setImageEditorShow] = useState(false);
  const [urlFromEditor, setUrlFromEditor] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editItem, setEditItem] = useState<EditItem>();
  const [editType, setEditType] = useState(Math.random().toString(36).slice(-6));

  useEffect(() => {
    if (varAry.length == 0) {
      data.varAry = [{}];
      return;
    }
    data.varAry = varAry;
  }, [varAry]);

  const notify = useCallback((item, value) => {
    item.notifyBindings(value); //通知所有bindings
  }, []);

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

  const onChange = (e) => {
    let title = Object.keys(e)[0];
    let content = e[title];

    let newVarAry = varAry.map((item) => {
      if (item.title === title) {
        //判断是否超过字数限制
        if (item.limit && content.length > item.limit) {
          message.error(`输入内容超过限制${item.limit}字`);
          item.value = content.slice(0, item.limit);
        } else {
          item.value = content;
        }
      }
      return item;
    });
    setVarAry(newVarAry);
    variables.getAll().forEach((item) => {
      if (item.title === title) {
        newVarAry.forEach((item) => {
          if (item.title === title) {
            notify(item, item.value);
          }
        });
      }
    });
  };

  const isURL = (str) => {
    try {
      new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  };

  const uploadPic = (item) => {
    if (item) {
      setEditItem(item);
    }
    setImageEditorShow(true);
  };

  useEffect(() => {
    if (!editItem?.id) {
      return;
    }
    setEditUrl(editItem.value);
  }, [editItem]);

  const getPicUrlFromEditor = (url: string) => {
    setUrlFromEditor(url);
  };

  const onSelectColor = (hsl, id) => {
    const val = hsla2rgba(hsl);
    theme.set(id, val);
    let newVarAry = varAry.map((item) => {
      if (item.id === id) {
        item.value = val;
      }
      return item;
    });
    setVarAry(newVarAry);
  };

  return (
    <>
      <div className={css.view}>
        {varAry && varAry.length === 0 && (
          <div className={css.empty}>
            <img
              src="https://f2.eckwai.com/kos/nlav12333/fangzhou/pub/compress/image-267a31f3-d786-4e5a-94f4-83736e120922.png"
              alt=""
              className={css.emptyImg}
            />
            <div>无内容,请联系设计师添加列表</div>
          </div>
        )}

        <div className={css.listWrapper}>
          <Form
            name="basic"
            initialValues={{ remember: true }}
            autoComplete="off"
            onValuesChange={onChange}
            layout="vertical"
          >
            {varAry?.find((item) => item.type === itemTypes.STRING) && (
              <div className={css.listItem}>
                <div className={css.listTitle}>文字同步</div>
                {varAry.map((item, index) => {
                  if (item.type === itemTypes.STRING) {
                    return (
                      <Form.Item
                        label={`${item.title}${
                          item.limit === undefined || item.limit === 0 || item.limit === ''
                            ? ''
                            : `  (限制 ${item.limit} 字):`
                        }`}
                        name={item.title}
                        rules={[{ message: '请输入内容' }]}
                      >
                        <Input defaultValue={item.value} />
                      </Form.Item>
                    );
                  }
                })}
              </div>
            )}
            {/* {varAry?.find((item) => item.type === itemTypes.COLOR) && (
              <div className={css.listItem}>
                <div className={css.listTitle}>颜色同步</div>
                {varAry.map((item, index) => {
                  if (item.type === itemTypes.COLOR) {
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
                          <div className={css.colorVarTitle}>{item.title}</div>
                        </div>
                        <div onClick={() => {}}></div>
                      </div>
                    );
                  }
                })}
              </div>
            )} */}
            {varAry?.find((item) => item.type === itemTypes.IMAGE) && (
              <div className={css.listItem}>
                <div className={css.listTitle}>图片同步</div>

                <div className={css.triCardContainer}>
                  {varAry.map((item, index) => {
                    if (item.type === itemTypes.IMAGE) {
                      return (
                        <div className={css.triCard}>
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
                                : 'https://js-ec.static.yximgs.com/udata/pkg/ks-merchant/cps-hybrid/empty_position.9b16b85c5a152402.png'
                            }
                            alt=""
                          />
                          <div className={css.desc}>{item.title}</div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </Form>
        </div>
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
    </>
  );
};

export default OperatorView;
