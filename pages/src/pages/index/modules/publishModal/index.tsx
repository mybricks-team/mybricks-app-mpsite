import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Popover,
  Spin,
  Divider,
  Modal,
  Steps,
  Button,
  Form,
  Input,
  message,
} from "antd";
import { globalModal } from "@/components";
import { MpContext } from "./context";
import { contentModel, pageModel, userModel } from "@/stores";
import { CompileType } from "@/types";

import styles from "./index.less";

enum Platform {
  weapp = "weapp",
}

const Locale = {
  appId: "AppID(小程序ID)",
  uploadKey: "小程序代码上传密钥",
  appsecret: "AppSecret(小程序密钥)",
};

const ReadFile = ({ accept = ".key", onSelect }) => {
  const inputRef = useRef(null);

  const readKeyFile = (file) => {
    const fileReader = new FileReader();

    return new Promise((resolve) => {
      fileReader.onload = function (evt) {
        // 在文件读取完毕后，其内容将被保存在result属性中
        const content = evt.target.result;
        resolve(content);
      };
      // 以utf-8编码文本格式来读取
      fileReader.readAsText(file, "utf-8");
    });
  };

  const read = () => {
    if (inputRef.current.files?.[0]) {
      readKeyFile(inputRef.current.files[0]).then((cont) => onSelect?.(cont));
    }
  };

  return (
    <div className={styles.autoReadKey}>
      <input ref={inputRef} type="file" accept={accept} onChange={read} />
      <span onClick={() => inputRef.current?.click?.()}>
        从*.key文件中自动读取密钥
      </span>
    </div>
  );
};

// 加密展示
// 输入一个字符串，一行或者多行，需要把中间的内容隐藏，只显示前面几个字符和后面几个字符，中间用*号代替
// 对于字符串特别长的情况，* 的数量不要太多
const encryptStr = (str, frontLen, endLen) => {
  const len = str.length - frontLen - endLen;
  let xing = "";
  for (let i = 0; i < Math.min(len, 30); i++) {
    xing += "*";
  }
  return str.substring(0, frontLen) + xing + str.substring(str.length - endLen);
};

const hasScrect = (val) => {
  return val.indexOf("*") > -1;
};

const SecretTextarea = ({
  value,
  onChange,
  secrect = [4, 4],
  secrectText = "",
  ...props
}) => {
  const [state, setState] = useState({
    showValue: value,
  });

  useEffect(() => {
    setState((c) => {
      return {
        ...c,
        showValue:
          !!value && value.length && value === secrectText
            ? encryptStr(value, secrect[0], secrect[1])
            : value,
      };
    });
  }, [secrectText, value]);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setState((c) => ({ ...c, showValue: val }));

      if (hasScrect(val)) {
        return;
      }
      onChange?.(e);
    },
    [onChange]
  );

  return (
    <Input.TextArea
      {...props}
      value={state.showValue}
      onChange={handleChange}
    />
  );
};

const MiniappConfig = {
  [Platform.weapp]: {
    steps: [
      {
        title: "步骤一",
        description: "绑定小程序",
        context: {
          Desc: () => {
            return (
              <div
                style={{
                  fontStyle: "italic",
                  marginBottom: -5,
                  marginTop: -10,
                  opacity: 0.7,
                }}
              >
                填写AppID和密钥后才可以
                <strong>预览和构建小程序</strong>，
                <a
                  target="_blank"
                  href="https://docs.qq.com/doc/DTUJtblpiakl2SnRm"
                >
                  如何填写？
                </a>
              </div>
            );
          },
          Content: () => {
            const [] = useState();
            const [form] = Form.useForm();

            const { next } = useContext(MpContext);

            const submit = useCallback(() => {
              form
                .validateFields()
                .then((values) => {
                  if (values) {
                    console.log("values", values);
                    pageModel.wxConfig.appid = values.appid;
                    pageModel.wxConfig.privateKey = encodeURIComponent(
                      values.privateKey || ""
                    );
                  }
                  next?.();
                })
                .catch((err) => {});
            }, [next]);

            useEffect(() => {
              form.setFieldsValue({
                appid: pageModel.wxConfig?.appid,
                privateKey: decodeURIComponent(
                  pageModel.wxConfig?.privateKey || ""
                ),
              });
            }, []);

            const onFileSelect = useCallback((v) => {
              form.setFieldValue("privateKey", v);
            }, []);

            return (
              <div>
                <Form name="basic" form={form} layout="vertical">
                  <Form.Item
                    label={Locale.appId}
                    name="appid"
                    rules={[
                      { required: true, message: `${Locale.appId}不能为空` },
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label={Locale.uploadKey}
                    name="privateKey"
                    rules={[
                      {
                        required: true,
                        message: `${Locale.uploadKey}不能为空`,
                      },
                      {
                        pattern: new RegExp(/.*BEGIN RSA PRIVATE KEY.*/),
                        message: "密钥格式错误，请严格按照文档操作获取密钥",
                      },
                    ]}
                    extra={<ReadFile accept=".key" onSelect={onFileSelect} />}
                  >
                    <SecretTextarea
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      secrectText={pageModel.wxConfig?.privateKey}
                    />
                    {/* <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} /> */}
                  </Form.Item>
                </Form>
                <div className={styles.footer}>
                  <Button type="primary" onClick={submit}>
                    下一步
                  </Button>
                </div>
              </div>
            );
          },
        },
      },
      // {
      //   title: '步骤二',
      //   description: '配置小程序密钥',
      //   context: {
      //     Desc: () => {
      //       return (
      //         <div
      //           style={{
      //             fontStyle: 'italic',
      //             marginBottom: -5,
      //             marginTop: -10,
      //             opacity: 0.7,
      //           }}
      //         >
      //           配置小程序密钥后才可以
      //           <strong>使用微信开放能力（例如微信一键登录）</strong>，
      //           <a
      //             target="_blank"
      //             href="https://docs.qq.com/doc/DRGp6TFJuUVVhTFNv"
      //           >
      //             如何填写？
      //           </a>
      //         </div>
      //       )
      //     },
      //     Content: () => {
      //       const [] = useState()
      //       const [form] = Form.useForm()

      //       const { next } = useContext(MpContext)

      //       const submit = useCallback(() => {
      //         form
      //           .validateFields()
      //           .then((values) => {
      //             if (values.appsecret) {
      //               pageModel.wxConfig.appsecret = values.appsecret
      //             }
      //             next?.()
      //           })
      //           .catch((err) => {})
      //       }, [next])

      //       useEffect(() => {
      //         form.setFieldsValue({
      //           appsecret: pageModel.wxConfig?.appsecret,
      //         })
      //       }, [])

      //       return (
      //         <div>
      //           <Form name="basic" form={form} layout="vertical">
      //             <Form.Item
      //               label={Locale.appsecret}
      //               name="appsecret"
      //               rules={
      //                 [
      //                   // {
      //                   //   required: true,
      //                   //   message: `${Locale.appsecret}不能为空`,
      //                   // },
      //                 ]
      //               }
      //             >
      //               <SecretTextarea autoSize={{ minRows: 3, maxRows: 6 }} secrect={[4, 4]} secrectText={pageModel.wxConfig.appsecret} />
      //               {/* <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} /> */}
      //             </Form.Item>
      //           </Form>
      //           <div className={styles.footer}>
      //             <Button type="primary" onClick={submit}>
      //               下一步
      //             </Button>
      //           </div>
      //         </div>
      //       )
      //     },
      //   },
      // },
      {
        title: "步骤二",
        description: "设置上传白名单",
        context: {
          Content: () => {
            return (
              <div>
                <div>
                  <span>访问</span>
                  <a
                    style={{ margin: "0px 3px" }}
                    target="_blank"
                    href="https://mp.weixin.qq.com/"
                  >
                    微信公众平台
                  </a>
                  <span>并直接关闭白名单</span>，
                  <span style={{ color: "#ff4d4f", fontWeight: 500 }}>
                    否则将会无法预览和发布小程序！！！
                  </span>
                </div>
                <div style={{ margin: "10px 0px" }}>
                  <img
                    style={{ width: "100%" }}
                    src="https://f2.eckwai.com/kos/nlav11092/u_6k3fwj.f49a7640670a03e8.png"
                    alt=""
                  />
                </div>
                <div className={styles.footer}>
                  <Button type="primary" onClick={() => globalModal.hide()}>
                    好的，我已知晓并操作
                  </Button>
                </div>
              </div>
            );
          },
        },
      },
    ],
  },
};

const LintModal = ({ activeIndex = 0 } = {}) => {
  const [activeStep, setActiveStep] = useState(activeIndex);
  const steps = MiniappConfig[Platform.weapp].steps;

  const activeContext = useMemo(() => {
    return steps[activeStep]?.context ?? {};
  }, [activeStep, steps]);

  const { Desc, Content } = activeContext ?? {};

  const mpContext = useMemo(() => {
    return {
      next: () => {
        setActiveStep((c) => {
          return c < steps.length - 1 ? ++c : c;
        });
      },
      prev: () => {
        setActiveStep((c) => {
          return c > 0 ? --c : c;
        });
      },
    };
  }, [steps]);

  return (
    <MpContext.Provider value={mpContext}>
      <div className="fangzhou-theme">
        <Steps current={activeStep} items={steps} />
        <div className={styles.body}>
          {Desc && <Desc />}
          <div className={styles.content}>{Content && <Content />}</div>
        </div>
      </div>
    </MpContext.Provider>
  );
};

const showLint = ({ activeIndex } = {}) => {
  globalModal.show({
    title: "前置校验",
    footer: null,
    width: 700,
    maskClosable: false,
    children: <LintModal activeIndex={activeIndex} />,
  });
};

export const showMpConfig = ({ activeIndex } = {}) => {
  globalModal.show({
    title: "小程序配置",
    footer: null,
    width: 700,
    maskClosable: false,
    children: <LintModal activeIndex={activeIndex} />,
  });
};

const ComlibModal = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      editJs: pageModel.customComlib?.editJs,
      rtJs: pageModel.customComlib?.rtJs,
      rtComJs: pageModel.customComlib?.rtComJs,
    });
  }, []);

  const submit = useCallback(async () => {
    pageModel.customComlib = pageModel.customComlib || {};

    pageModel.customComlib.editJs = form.getFieldValue("editJs");
    pageModel.customComlib.rtJs = form.getFieldValue("rtJs");
    pageModel.customComlib.rtComJs = form.getFieldValue("rtComJs");

    globalModal.hide();

    message.success("设置成功，保存并刷新页面后生效");

  }, []);

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  return (
    <div>
      <Form name="basic" form={form} {...layout}>
        <Form.Item label="rt.js 文件地址" name="rtJs">
          <Input />
        </Form.Item>
        <Form.Item label="edit.js 文件地址" name="editJs">
          <Input />
        </Form.Item>
        <Form.Item label="rtCom.js 文件地址" name="rtComJs">
          <Input />
        </Form.Item>
      </Form>
      <div className={styles.footer}>
        <Button type="primary" onClick={submit}>
          设置
        </Button>
      </div>
    </div>
  );
};

export const showComlibAdder = () => {
  globalModal.show({
    title: "自定义组件库",
    footer: null,
    width: 700,
    maskClosable: false,
    children: <ComlibModal />,
  });
};

export const showCompileSuccess = ({
  type,
  backEndProjectPath,
  onDownload,
}: {
  type: CompileType;
  onDownload: any;
}) => {
  if (
    type === CompileType.dd ||
    type === CompileType.alipay ||
    type === CompileType.weapp
  ) {
    const descMap = {
      [CompileType.dd]: "钉钉小程序",
      [CompileType.alipay]: "支付宝小程序",
      [CompileType.weapp]: "微信小程序",
    };

    globalModal.show({
      title: "🎉 构建成功",
      footer: null,
      width: 380,
      children: (
        <div className="fangzhou-theme">
          <div>
            {descMap[type]}构建成功，<a onClick={onDownload}>点击下载</a>
          </div>
        </div>
      ),
    });
    return;
  }
};

export const showLintNoPermission = () => {
  globalModal.show({
    title: "操作失败",
    footer: null,
    width: 500,
    children: (
      <div className="fangzhou-theme">
        <div>
          <span>
            当前项目未绑定小程序，无法预览/发布，请联系项目创建人绑定小程序～
          </span>
          {/* <a style={{ margin: '0px 3px' }} target="_blank" href="https://mp.weixin.qq.com/">
            微信公众平台
          </a>
          - 版本管理，
          <span>去查看刚刚推送的新版本吧</span> */}
          {/* <span style={{ color: '#ff4d4f', fontWeight: 500 }}>否则将会无法预览和发布小程序！！！</span> */}
        </div>
        <div className={styles.footer}>
          <Button type="primary" onClick={() => globalModal.hide()}>
            好的，我已知晓
          </Button>
        </div>
      </div>
    ),
  });
};

enum PublishErrCode {
  /** 普通错误，仅提示，就当没有errCode这个字段好了 */
  None = 0,
  /** 缺少appId和上传密钥 */
  NoAppIdAndUploadKey = "10001",
  /** 未配置上传白名单 */
  NoUploadWhiteList = "10002",
  /** 上传密钥错误 */
  InvalidAppSecret = "10003",
}

/** TODO没有权限的用户要隐藏展示 */
export const handlePublishErrCode = (reponseData: any) => {
  if (
    reponseData.errCode === PublishErrCode.NoAppIdAndUploadKey ||
    reponseData.errCode === PublishErrCode.InvalidAppSecret
  ) {
    showLint({ activeIndex: 0 });
    return;
  }

  if (reponseData.errCode === PublishErrCode.NoUploadWhiteList) {
    showLint({ activeIndex: 1 });
    return;
  }

  message.error(reponseData?.message ?? "构建失败，请重试");
};
