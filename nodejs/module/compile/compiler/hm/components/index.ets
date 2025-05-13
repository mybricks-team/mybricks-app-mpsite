import BasicButton, { DataType as ButtonDataType, Data as ButtonData } from "./Button";
import BasicSystemPage, { DataType as SystemPageDataType, Data as SystemPageData } from "./SystemPage";
import BasicText, { DataType as TextDataType, Data as TextData } from "./Text";
import BasicImage, { DataType as ImageDataType, Data as ImageData } from "./Image";
import BasicList, { DataType as ListDataType, Data as ListData } from "./List"

import { inputs2 } from "./mybricks";

type Style = Record<string, string | number>;
type Styles = Record<string, Style>;

class MyBricksColumnModifier implements AttributeModifier<ColumnAttribute> {
  style: Style;

  constructor(style: Style) {
    this.style = style;
  }

  applyNormalAttribute(instance: ColumnAttribute): void {
    console.log("[MyBricks - MyBricksColumnModifier]", JSON.stringify(this.style))
    const style = this.style;
    // width
    instance.width(style.width);
    // height
    instance.height(style.height);
    // marginTop
    // marginBottom
    // marginLeft
    // marginRight
    instance.margin({
      top: style.marginTop,
      right: style.marginRight,
      bottom: style.marginBottom,
      left: style.marginLeft
    })
    // flex
    if (typeof style.flex === "number") {
      instance.flexGrow(style.flex as number)
      instance.flexShrink(1)
      instance.flexBasis("0%")
    }
    // position
    if (["absolute", "fixed"].includes(style.position as string)) {
      instance.position({
        top: style.top as number,
        left: style.left as number,
        right: style.right as number,
        bottom: style.bottom as number,
      })
    }
  }
}

@Builder function Slot(params: MyBricks.SlotParams) {}

interface MyBricksButtonControllerButtonTextRelOutputs {
  buttonTextDone: MyBricks.EventValue;
}

// 出码生成各组件的Events
export class MyBricksButtonEvents {
  onClick = (value: MyBricks.EventValue) => {}
}

interface MyBricksButtonControllerType {
  buttonText: (value: MyBricks.EventValue) => MyBricksButtonControllerButtonTextRelOutputs;
  // 内置的显示隐藏逻辑
  show: (value: MyBricks.EventValue) => void;
  hide: (value: MyBricks.EventValue) => void;
  showOrHide: (value: MyBricks.EventValue) => void;
}
export const MyBricksButtonController = () => {
  return inputs2({}, true) as MyBricksButtonControllerType
}

@ComponentV2
export struct MyBricksButton {
  @Param controller: MyBricksButtonControllerType = MyBricksButtonController();
  @Param @Require data: ButtonDataType;
  @Param events: MyBricksButtonEvents = new MyBricksButtonEvents();
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicButton({
        data: new ButtonData(this.data),
        inputs: inputs2(this),
        outputs: this.events,
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


// -- 页面 --
interface MyBricksSystemPageControllerType {

}
export const MyBricksSystemPageController = () => {
  return inputs2({}, true) as MyBricksSystemPageControllerType
}

@ComponentV2
export struct MyBricksSystemPage {
  @Param controller: MyBricksSystemPageControllerType = MyBricksSystemPageController();
  @Param @Require data: SystemPageDataType;
  @Param styles: Styles = {};

  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

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
  onClick: (value: string) => void;
}

@ComponentV2
export struct MyBricksText {
  @Param controller: MyBricksTextController = new MyBricksTextController();
  @Param @Require data: TextDataType;
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
  onClick: (value: string) => void;
  onLoad: (value: string) => void;
  onError: (value: string) => void;
}

@ComponentV2
export struct MyBricksImage {
  @Param controller: MyBricksImageController = new MyBricksImageController();
  @Param @Require data: ImageDataType;
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
}



// -- 列表 --
// export class MyBricksListController {
//   addDataSource = (value: MyBricks.EventValue) => {};
//   refreshDataSource = (value: MyBricks.EventValue) => {};
// }

interface MyBricksContainerListControllerType {
  addDataSource: (value: MyBricks.EventValue) => void;
  refreshDataSource: (value: MyBricks.EventValue) => void;
}

export const MyBricksContainerListController = () => {
  return inputs2({}, true) as MyBricksContainerListControllerType
}

@ComponentV2
export struct MyBricksContainerList {
  @Param controller: MyBricksContainerListControllerType = MyBricksContainerListController();
  @Param @Require data: ListDataType;
  @Param styles: Styles = {};

  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  build() {
    BasicList({
      data: new ListData(this.data),
      inputs: inputs2(this),
      styles: this.styles,
      slots: this.slots
    })
  }
}
