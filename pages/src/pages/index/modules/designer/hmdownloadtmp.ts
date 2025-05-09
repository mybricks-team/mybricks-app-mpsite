import JSzip from "jszip";
import toHarmonyCode from "@mybricks/to-code-react/dist/esm/toHarmonyCode"

// view/styles/getDesignStyle.ets
const getDesignStyle = {
  path: "view/styles/getDesignStyle.ets",
  content: `export type CSSProperties = Record<string, string | number>

type ComponentAttribute = CommonAttribute

function isNil(value: string | number | null | undefined | ResourceColor | BorderRadiuses | Length | LocalizedBorderRadiuses): boolean {
  return value === null || value === undefined;
}

export class ApplyRootStyleModifier implements AttributeModifier<ComponentAttribute> {
  private css: CSSProperties

  constructor(configCss: CSSProperties) {
    this.css = configCss
  }

  applyNormalAttribute(instance: ComponentAttribute): void {
    if (!isNil(this.css?.width)) {
      instance.width(this.css?.width)
    }
    if (!isNil(this.css?.height)) {
      instance.height(this.css?.height)
    }
    if (!isNil(this.css?.marginTop) || !isNil(this.css?.marginBottom) || !isNil(this.css?.marginLeft) || !isNil(this.css?.marginRight)) {
      instance.margin({
        top: this.css.marginTop || 0,
        left: this.css.marginLeft || 0,
        right: this.css.marginRight || 0,
        bottom: this.css.marginBottom || 0,
      })
    }
  }
}

export class ApplyStyleModifier implements AttributeModifier<ComponentAttribute> {
  private css: CSSProperties

  private initBackgroundColor?: ResourceColor
  backgroundColor(color: ResourceColor) {
    this.initBackgroundColor = color
    return this
  }

  private initBorderRadius?: Length | BorderRadiuses | LocalizedBorderRadiuses
  borderRadius(radius: Length | BorderRadiuses | LocalizedBorderRadiuses) {
    this.initBorderRadius = radius
    return this
  }

  constructor(configCss: CSSProperties) {
    this.css = configCss ?? {}
  }

  applyNormalAttribute(instance: ComponentAttribute): void {
    const backgroundColor = this.css?.backgroundColor ?? this.initBackgroundColor;
    if (!isNil(backgroundColor)) {
      instance.backgroundColor(backgroundColor)
    }

    if (!isNil(this.css?.borderRadius)) {
      instance.borderRadius(this.css.borderRadius)
    } else if (!isNil(this.initBorderRadius)) {
      instance.borderRadius(this.initBorderRadius)
    }

    if (!isNil(this.css.border) && typeof this.css.border === 'string') {
      const settingBorder = parseBorder(this.css.border)
      instance.borderWidth(settingBorder.width)
      instance.borderStyle(settingBorder.style)
      instance.borderColor(settingBorder.color)
    }
    if ([this.css.borderTop, this.css.borderBottom, this.css.borderLeft, this.css.borderRight].every(item => !isNil(item) && typeof item === 'string')) {

    }
  }
}

export class ApplyFontStyleModifier implements AttributeModifier<TextAttribute> {
  private css: CSSProperties

  private initFontColor?: ResourceColor
  fontColor(color: ResourceColor) {
    this.initFontColor = color
    return this
  }

  private initFontSize?: number | string | Resource
  fontSize(size: number | string | Resource) {
    this.initFontSize = size
    return this
  }

  private initFontWeight?: number | FontWeight | string
  fontWeight(size: number | FontWeight | string) {
    this.initFontWeight = size
    return this
  }

  constructor(configCss: CSSProperties) {
    this.css = configCss ?? {}
  }

  applyNormalAttribute(instance: TextAttribute): void {
    const color = this.css?.color ?? this.initFontColor
    if (color) {
      instance.fontColor(color)
    }
    const fontSize = this.css?.fontSize ?? this.initFontSize
    if (fontSize) {
      instance.fontSize(fontSize + 'vp')
    }

    const fontWeight = this.css?.fontWeight ?? this.initFontWeight
    if (fontWeight) {
      instance.fontWeight(fontWeight)
    }
  }
}


interface BorderRsult {
  width: number
  style: BorderStyle
  color: string
}
function parseBorder(borderStr: string): BorderRsult {
  const match = borderStr.match(/^(\d+\w+)\s+(solid|dashed|dotted)\s+(.+)$/);

  if (!match) {
    throw new Error('Invalid border string');
  }

  let style: BorderStyle = BorderStyle.Solid
  switch (match[2]) {
    case 'solid': {
      style = BorderStyle.Solid
      break
    }
    case 'dashed': {
      style = BorderStyle.Dashed
      break
    }
    case 'dotted': {
      style = BorderStyle.Dotted
      break
    }
    default: {
      style = BorderStyle.Solid
      break
    }
  }

  return {
    width: parseFloat(match[1]),
    style,
    color: match[3]
  };
}`
}

// view/Button.ets
const Button = {
  path: "view/Button.ets",
  content: `import {
  ApplyRootStyleModifier,
  ApplyStyleModifier,
  ApplyFontStyleModifier,
  CSSProperties
} from './styles/getDesignStyle'

interface StyleProps {
  backgroundColor: string;
}

export interface DataType {
  text: string
  style?: StyleProps
}

@ObservedV2
class Style {
  @Trace backgroundColor: string = '#fa6400'
}

@ObservedV2
export class Data implements DataType {
  @Trace text: string
  style?: Style = new Style()

  constructor(config: DataType) {
    this.text = config.text
  }
}

interface Inputs {
  buttonText: (fn: (text: string) => void) => void
}

interface Outputs {
  onClick?: (value: string) => void
}

@ComponentV2
export default struct Mybricks_Button {
  @Param data: Data = new Data({
    text: '按钮'
  });
  @Param styles: Record<string, CSSProperties> = {}
  @Param inputs?: Inputs = undefined;
  @Param outputs?: Outputs = undefined;

  aboutToAppear(): void {
    this.inputs?.buttonText((text) => {
      this.data.text = text;
    })
  }

  build() {
    Button({ type: ButtonType.Normal }) {
      Text(this.data.text)
        .attributeModifier(
          new ApplyFontStyleModifier(this.styles['.mybricks-button'])
            .fontSize(14)
            .fontColor('#ffffff')
        )
    }
    .borderRadius('50%')
    .backgroundColor(this.data?.style?.backgroundColor)
    .height(40)
    .padding({
      top: 0,
      bottom: 0,
      left: 14,
      right: 14
    })
    .onClick(() => {
      this.outputs?.onClick?.(this.data.text)
    })
    .attributeModifier(new ApplyStyleModifier(this.styles['.mybricks-button']))
    .attributeModifier(
      new ApplyRootStyleModifier(this.styles['root'])
    )
  }
}
`
}

// view/Image.ets
const Image = {
  path: "view/Image.ets",
  content: `import { ApplyRootStyleModifier, ApplyStyleModifier, ApplyFontStyleModifier, CSSProperties } from './styles/getDesignStyle'

@Extend(Image) function aspectFit() {
  .objectFit(ImageFit.Contain)
  .overlay('Contain', { align: Alignment.Bottom, offset: { x: 0, y: 0 } })
}

@Extend(Image) function cover() {
  .objectFit(ImageFit.Cover)
  .overlay('Cover', { align: Alignment.Bottom, offset: { x: 0, y: 0 } })
}

export interface DataType {
  src?: string
  svgPolyfill?: string
  mode?: 'aspectFit' | 'cover' | string
}

@ObservedV2
export class Data implements DataType {
  @Trace src?: string
  @Trace svgPolyfill?: string
  @Trace mode?: 'aspectFit' | 'cover' | string

  constructor(config: DataType) {
    this.src = config.src
    this.svgPolyfill = config.svgPolyfill
  }
}

interface Inputs {
  setSrc: (fn: (src: string) => void) => void
}

interface Outputs {
  onClick?: (src: string) => void,
  onLoad?: (src: string) => void,
  onError?: (src: string) => void
}

@ComponentV2
export default struct Mybricks_Image {
  @Param data: Data = new Data({});
  @Param styles: Record<string, CSSProperties> = {}
  @Param inputs?: Inputs = undefined;
  @Param outputs?: Outputs = undefined;

  aboutToAppear(): void {
    this.inputs?.setSrc((src) => {
      this.data.src = src;
    })
  }

  build() {
    Column() {
      Image(this.data.svgPolyfill || this.data.src)
        .attributeModifier(
          new ApplyStyleModifier(this.styles['.mybricks-image'])
        )
        .width('100%')
        .height('100%')
        .onFinish(() => {
          this.outputs?.onLoad?.(this.data.src || "")
        })
        .onError(() => {
          this.outputs?.onError?.(this.data.src || "")
        })
    }.onClick(() => {
      this.outputs?.onClick?.(this.data.src || "")
    })
    .attributeModifier(
      new ApplyRootStyleModifier(this.styles['root'])
    )
  }
}
`
}

// view/index.ets
const Index = {
  path: "view/index.ets",
  content: `import BasicButton, { DataType as TBasicButtonDataType, Data as ButtonData } from "./Button";
import BasicSystemPage, { DataType as TBasicSystemPageDataType, Data as SystemPageData } from "./SystemPage";
import BasicText, { DataType as TBasicTextDataType, Data as TextData } from "./Text";
import BasicImage, { DataType as TBasicImageDataType, Data as ImageData } from "./Image";

type Style = Record<string, string | number>;
type Styles = Record<string, Style>;

// -- 按钮 --
export class MyBricksButtonController {
  buttonText: (text: string) => void = () => {};
}

interface MyBricksButtonEvents {
  onClick?: (value: string) => void;
}

@ComponentV2
export struct MyBricksButton {
  @Param controller: MyBricksButtonController = new MyBricksButtonController();
  @Param @Require data: TBasicButtonDataType;
  @Param events: MyBricksButtonEvents = {
    onClick: (value: string): void => {
      console.log("[MyBricks] - Function not implemented.");
    }
  }
  @Param styles: Styles = {};

  build() {
    BasicButton({
      data: new ButtonData(this.data),
      inputs: {
        buttonText: (fn) => {
          this.controller.buttonText = (text) => {
            fn(text)
          };
        }
      },
      outputs: {
        onClick: this.events.onClick
      },
      styles: this.styles
    })
  }
}


// -- 页面 --
export class MyBricksSystemPageController {}

@ComponentV2
export struct MyBricksSystemPage {
  @Param controller: MyBricksSystemPageController = new MyBricksSystemPageController();
  @Param @Require data: TBasicSystemPageDataType;
  @Param styles: Styles = {};

  @Builder
  emptySlot() {};

  @BuilderParam slots : (type: string) => void = this.emptySlot;

  build() {
    BasicSystemPage({
      data: new SystemPageData(this.data),
      slots: this.slots
    })
  }
}

// -- 文本 --
export class MyBricksTextController {
  value: (text: string) => void = () => {};
}

interface MyBricksTextEvents {
  onClick?: (value: string) => void;
}

@ComponentV2
export struct MyBricksText {
  @Param controller: MyBricksTextController = new MyBricksTextController();
  @Param @Require data: TBasicTextDataType;
  @Param events: MyBricksTextEvents = {
    onClick: (value: string): void => {
      console.log("[MyBricks] - Function not implemented.");
    }
  }
  @Param styles: Styles = {};

  build() {
    BasicText({
      data: new TextData(this.data),
      inputs: {
        value: (fn) => {
          this.controller.value = (text) => {
            fn(text)
          };
        }
      },
      outputs: {
        onClick: this.events.onClick
      },
      styles: this.styles
    })
  }
}

// -- 图片 --
export class MyBricksImageController {
  setSrc: (text: string) => void = () => {};
}

interface MyBricksImageEvents {
  onClick?: (value: string) => void;
  onLoad?: (value: string) => void;
  onError?: (value: string) => void;
}

@ComponentV2
export struct MyBricksImage {
  @Param controller: MyBricksImageController = new MyBricksImageController();
  @Param @Require data: TBasicImageDataType;
  @Param events: MyBricksImageEvents = {
    onClick: (value: string): void => {
      console.log("[MyBricks] - Function not implemented.");
    },
    onLoad: (value: string): void => {
      console.log("[MyBricks] - Function not implemented.");
    },
    onError: (value: string): void => {
      console.log("[MyBricks] - Function not implemented.");
    }
  }
  @Param styles: Styles = {};

  build() {
    BasicImage({
      data: new ImageData(this.data),
      inputs: {
        setSrc: (fn) => {
          this.controller.setSrc = (text) => {
            fn(text)
          };
        }
      },
      outputs: {
        onClick: this.events.onClick,
        onLoad: this.events.onLoad,
        onError: this.events.onError,
      },
      styles: this.styles
    })
  }
}`
}

// view/SystemPage.ets
const SystemPage = {
  path: "view/SystemPage.ets",
  content: `import display from '@ohos.display';
import { ApplyRootStyleModifier, ApplyStyleModifier, CSSProperties } from './styles/getDesignStyle'

let screenHeight = display.getDefaultDisplaySync().height;


export interface DataType {
  background: string
}


@ObservedV2
export class Data implements DataType {
  @Trace background: string

  constructor(config: DataType) {
    this.background = config.background
  }
}


interface Inputs {}

interface Outputs {}

@Builder
function emptySlot(name: string) {
}

@ComponentV2
export default struct Mybricks_System_Page {
  @Param data: Data = new Data({
    background: '#ffffff'
  });
  @Param styles: Record<string, CSSProperties> = {}
  @Param inputs?: Inputs = undefined;
  @Param outputs?: Outputs = undefined;
  @BuilderParam slots: (name: string) => void = emptySlot;

  aboutToAppear(): void {

  }

  build() {
    Column() {
      this.slots('content')
    }
    .backgroundColor(this.data?.background)
    .alignItems(HorizontalAlign.Start)
    .align(Alignment.Start)
    .height('100%')
    .width('100%')
  }
}
`
}

// view/Text.ets
const Text = {
  path: "view/Text.ets",
  content: `import {
  ApplyRootStyleModifier,
  ApplyStyleModifier,
  ApplyFontStyleModifier,
  CSSProperties
} from './styles/getDesignStyle'

export interface DataType {
  text: string
}

@ObservedV2
export class Data implements DataType {
  @Trace text: string

  constructor(config: DataType) {
    this.text = config.text
  }
}

interface Inputs {
  value: (fn: (text: string) => void) => void
}

interface Outputs {
  onClick?: (value: string) => void
}

@ComponentV2
export default struct Mybricks_Text {
  @Param data: Data = new Data({
    text: '文本内容'
  });
  @Param styles: Record<string, CSSProperties> = {}
  @Param inputs?: Inputs = undefined;
  @Param outputs?: Outputs = undefined;

  aboutToAppear(): void {
    this.inputs?.value((text) => {
      this.data.text = text;
    })
  }

  build() {
    Column() {
      Text(this.data.text)
        .wordBreak(WordBreak.BREAK_WORD)
        .attributeModifier(
          new ApplyFontStyleModifier(this.styles['.mybricks-text'])
            .fontSize(14)
            .fontColor('#333333')
        )
    }.attributeModifier(
      new ApplyRootStyleModifier(this.styles['root'])
    )
  }
}
`
}

const mapC = {
  "mybricks.taro.systemPage": {
    // 导入方式
    dependencyImport: {
      packageName: "../view",
      dependencyNames: ["MyBricksSystemPage", "MyBricksSystemPageController"],
      importType: "named",
    },
    componentName: "MyBricksSystemPage",
  },
  "mybricks.taro.button": {
    // 导入方式
    dependencyImport: {
      packageName: "../view",
      dependencyNames: ["MyBricksButton", "MyBricksButtonController"],
      importType: "named",
    },
    componentName: "MyBricksButton",
  },
  "mybricks.taro.text": {
    // 导入方式
    dependencyImport: {
      packageName: "../view",
      dependencyNames: ["MyBricksText", "MyBricksTextController"],
      importType: "named",
    },
    componentName: "MyBricksText",
  },
  "mybricks.taro.image": {
    // 导入方式
    dependencyImport: {
      packageName: "../view",
      dependencyNames: ["MyBricksImage", "MyBricksImageController"],
      importType: "named",
    },
    componentName: "MyBricksImage",
  },
};

const hmdownloadtmp = (tojson: any) => {
  console.log("[hmdownloadtmp - tojson]", tojson);
  const res = toHarmonyCode(tojson, {
    getComponentMetaByNamespace(namespace) {
      return mapC[namespace];
    },
  })

  console.log("[hmdownloadtmp - result]", res);

  downloadToFile({
    content: [getDesignStyle, Button, Image, Index, SystemPage, Text, ...res],
    name: "Harmony.zip"
  })
}


function downloadToFile ({ content, name }: { content: any, name: string }) {
  // 添加文件到 ZIP
  const jszip = new JSzip();
  content.forEach(({ content, path }: any) => {
    jszip.file(path, content);
  })

  // 生成 ZIP 文件并触发下载
  jszip.generateAsync({ type: "blob" })
    .then(function (content) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = name;
      link.click();
    });
}

export default hmdownloadtmp;
