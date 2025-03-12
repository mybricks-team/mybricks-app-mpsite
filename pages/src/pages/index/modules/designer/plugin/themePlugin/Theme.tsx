import React, { useMemo, useState } from "react";
import classNames from "classnames";
import css from "./styles.less";
import {
  Button,
  Input,
  Form,
  message,
  Select,
  Radio,
  Upload,
  Checkbox,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

// 1. 基础颜色系统
interface ThemeColorSystem {
  // 主色调
  primary: string; // 主色，品牌核心色调 (#RRGGBB)
  primaryLight: string; // 主色浅色变体
  primaryDark: string; // 主色深色变体

  // 辅助色系
  secondary: string; // 辅助色，与主色形成和谐搭配
  accent: string; // 强调色，用于关键点突出

  // 功能色系
  success: string; // 成功状态
  warning: string; // 警告状态
  error: string; // 错误状态
  info: string; // 信息状态

  // 中性色系
  neutralDark: string; // 深色中性色 (如标题文本)
  neutralMedium: string; // 中等中性色 (如正文文本)
  neutralLight: string; // 浅色中性色 (如次要文本)
  border: string; // 边框颜色
  divider: string; // 分割线颜色

  // 背景色系
  background: string; // 主背景色
  backgroundSecondary: string; // 次要背景色
  cardBackground: string; // 卡片背景色

  // 阴影
  shadowColor: string; // 阴影基础色
}

// 2. 扩展色彩策略
interface ThemeColorStrategy {
  // 色彩方案类型
  paletteType:
    | "monochromatic"
    | "analogous"
    | "complementary"
    | "triadic"
    | "split-complementary"
    | "custom";

  // 色彩情感
  mood:
    | "professional"
    | "playful"
    | "elegant"
    | "energetic"
    | "calm"
    | "modern"
    | "traditional"
    | "minimalist";

  // 行业适配
  industry?:
    | "technology"
    | "healthcare"
    | "finance"
    | "education"
    | "retail"
    | "entertainment"
    | "food"
    | "travel";

  // 季节/场景映射
  season?: "spring" | "summer" | "autumn" | "winter";

  // 亮度策略
  brightness: "light" | "dark" | "auto";

  // 对比度级别
  contrast: "low" | "medium" | "high";
}

// 3. 排版系统
interface ThemeTypography {
  // 字体家族
  fontPrimary: string; // 主字体
  fontSecondary: string; // 辅助字体

  // 字体大小
  fontSize: {
    xxs: string; // 超小字体
    xs: string; // 很小字体
    sm: string; // 小字体
    base: string; // 基础字体
    lg: string; // 大字体
    xl: string; // 很大字体
    xxl: string; // 超大字体
    heading1: string; // 标题1
    heading2: string; // 标题2
    heading3: string; // 标题3
    heading4: string; // 标题4
  };

  // 字重
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };

  // 行高
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

// 4. 形状和边框
interface ThemeShape {
  // 圆角
  borderRadius: {
    none: string;
    sm: string;
    default: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };

  // 边框宽度
  borderWidth: {
    none: string;
    thin: string;
    default: string;
    thick: string;
  };

  // 阴影层级
  shadow: {
    none: string;
    sm: string;
    default: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// 5. 动效系统
interface ThemeAnimation {
  // 过渡时间
  transition: {
    fast: string;
    default: string;
    slow: string;
  };

  // 动画曲线
  easing: {
    easeInOut: string;
    easeOut: string;
    easeIn: string;
    linear: string;
  };
}

const CREATER_PROPS = `
基于以下信息生成一套完整的UI主题：

1. 业务类型: [电商/金融/教育/医疗/...]
2. 品牌关键词: [专业的,现代的,活力的,...]
3. 目标受众: [年轻人/专业人士/...]
4. 希望传达的情感: [信任/活力/专业/...]
5. 主色调: [如有用户提供]
6. Logo色彩: [如有用户上传]

需要生成以下格式的完整主题配置:
{
  "colorSystem": {
    "primary": "#hexcode",
    ...
  },
  "colorStrategy": {
    "paletteType": "类型",
    ...
  },
  "typography": {
    "fontPrimary": "字体名称",
    ...
  },
  "shape": {
    "borderRadius": {
      ...
    },
    ...
  },
  "animation": {
    ...
  }
}

请确保:
1. 颜色之间有良好的对比度
2. 遵循色彩无障碍原则(WCAG AA标准)
3. 主题风格与业务类型和品牌关键词匹配
4. 颜色系统内部协调一致
`;

// 自定义 ColorPicker 组件，使用原生的颜色选择器
const ColorPicker = ({ value = "#000000", onChange }) => {
  return (
    <div className={css.colorPicker}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={css.nativeColorPicker}
      />
      <div className={css.colorInputContainer}>
        <span className={css.colorHashTag}>#</span>
        <input
          type="text"
          value={value.replace("#", "")}
          onChange={(e) => onChange && onChange("#" + e.target.value)}
          className={css.colorInput}
          maxLength={6}
        />
      </div>
    </div>
  );
};

// 自定义标签组件
const FormLabel = ({ children }) => {
  return <label className={css.formLabel}>{children}</label>;
};

// 自定义表单项组件
const FormItem = ({ label, children }) => {
  return (
    <div className={css.formItem}>
      <FormLabel>{label}</FormLabel>
      <div className={css.formItemContent}>{children}</div>
    </div>
  );
};

export default function Theme(config) {
  const [businessType, setBusinessType] = useState(""); // 业务类型状态
  const [primaryColor, setPrimaryColor] = useState("#1890ff"); // 默认主色
  const [keywords, setKeywords] = useState([]); // 关键词状态
  const [keywordInput, setKeywordInput] = useState(""); // 关键词输入
  const [logo, setLogo] = useState(null); // Logo文件

  const handleAddKeyword = (e) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
      e.preventDefault();
    }
  };

  const handleRemoveKeyword = (index) => {
    const newKeywords = [...keywords];
    newKeywords.splice(index, 1);
    setKeywords(newKeywords);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  // 创建主题样式表单
  const MoodboardCreater = useMemo(() => {
    return (
      <div className={css.creater}>
        <form className={css.themeForm}>
          <FormItem label="业务类型">
            <input
              type="text"
              placeholder="请输入您的业务类型，如电子商务、金融服务等"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className={css.formInput}
            />
          </FormItem>

          <FormItem label="关键词">
            <div className={css.tagsContainer}>
              <div className={css.tagsWrapper}>
                {keywords.map((keyword, index) => (
                  <span key={index} className={css.tagItem}>
                    {keyword}
                    <span
                      className={css.tagClose}
                      onClick={() => handleRemoveKeyword(index)}
                    >
                      ×
                    </span>
                  </span>
                ))}
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder={
                    keywords.length ? "" : "输入描述您品牌的关键词，回车添加"
                  }
                  className={css.tagInput}
                />
              </div>
            </div>
          </FormItem>

          <FormItem label="主色调">
            <ColorPicker value={primaryColor} onChange={setPrimaryColor} />
          </FormItem>

          <div className={css.formFooter}>
            <button
              type="button"
              className={css.submitButton}
              onClick={() => console.log("生成主题")}
            >
              生成主题
            </button>
          </div>
        </form>
      </div>
    );
  }, [primaryColor, businessType, keywords, keywordInput, logo]);

  return (
    <div className={css.moodboard}>
      {/* header */}
      <div className={css.header}>
        <div className={css.title}>AI 组件设计规范</div>
        <div className={css.description}>
          创建设计规范后，AI 组件将遵从该规范生成
        </div>
      </div>

      <div className={css.creater}>
        <div className={css.descriptin}>
          请简明、清晰的描述你的业务，以及提供3到7个关键词。
        </div>
      </div>

      {MoodboardCreater}
    </div>
  );
}
