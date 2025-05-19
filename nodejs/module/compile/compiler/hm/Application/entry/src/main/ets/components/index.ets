import { appRouter } from "../utils"
import {
  mybricks_harmony__showToast as basic_mybricks_harmony__showToast,
  mybricks_harmony_popup as basic_mybricks_harmony_popup,
  mybricks_harmony_popup_Data,
  mybricks_harmony_systemPage as basic_mybricks_harmony_systemPage,
  mybricks_harmony_systemPage_Data,
  mybricks_harmony_systemWebview as basic_mybricks_harmony_systemWebview,
  mybricks_Harmony_SystemWebview_Data,
  mybricks_harmony_button as bacis_mybricks_harmony_button,
  mybricks_harmony_button_Data,
  mybricks_harmony_text as basic_mybricks_harmony_text,
  mybricks_harmony_text_Data,
  mybricks_harmony_image as basic_mybricks_harmony_image,
  mybricks_harmony_image_Data,
  mybricks_harmony_containerList as basic_mybricks_harmony_containerList,
  mybricks_harmony_containerList_Data,
  mybricks_harmony_containerBasic as basic_mybricks_harmony_containerBasic,
  mybricks_harmony_containerBasic_Data
} from "./../../comlib/index"
import basicCodes from "./codes";

import { inputs, inputs2 } from "./mybricks"

type Style = Record<string, string | number>;
type Styles = Record<string, Style>;

class MyBricksColumnModifier implements AttributeModifier<ColumnAttribute> {
  style: Style;

  constructor(style: Style) {
    this.style = style;
  }

  applyNormalAttribute(instance: ColumnAttribute): void {
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
    // paddingTop
    // paddingRight
    // paddingBottom
    // paddingLeft
    instance.padding({
      top: style.paddingTop,
      right: style.paddingRight,
      bottom: style.paddingBottom,
      left: style.paddingLeft
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

const _env: MyBricks._Env = {
  currentScenes: {
    close: () => {
      appRouter.pop()
    }
  }
}

export const Controller = () => {
  return inputs2({}, true) as MyBricks.Controller
}


/** _showToast */
export const mybricks_harmony__showToast = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return inputs(basic_mybricks_harmony__showToast, props);
}

/** systemPage */
@ComponentV2
export struct Mybricks_harmony_systemPage {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      basic_mybricks_harmony_systemPage({
        data: new mybricks_harmony_systemPage_Data(this.data as MyBricks.Any),
        inputs: inputs2(this),
        outputs: this.events,
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** popup */
@ComponentV2
export struct Mybricks_harmony_popup {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      basic_mybricks_harmony_popup({
        _env,
        data: new mybricks_harmony_popup_Data(this.data as MyBricks.Any),
        inputs: inputs2(this),
        outputs: this.events,
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** systemWebview */
@ComponentV2
export struct Mybricks_harmony_systemWebview {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      basic_mybricks_harmony_systemWebview({
        data: new mybricks_Harmony_SystemWebview_Data(this.data as MyBricks.Any),
        inputs: inputs2(this),
        outputs: this.events,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** button */
@ComponentV2
export struct Mybricks_harmony_button {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      bacis_mybricks_harmony_button({
        data: new mybricks_harmony_button_Data(this.data as MyBricks.Any),
        inputs: inputs2(this),
        outputs: this.events,
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** text */
@ComponentV2
export struct Mybricks_harmony_text {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      basic_mybricks_harmony_text({
        data: new mybricks_harmony_text_Data(this.data as MyBricks.Any),
        inputs: inputs2(this),
        outputs: this.events,
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** image */
@ComponentV2
export struct Mybricks_harmony_image {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      basic_mybricks_harmony_image({
        data: new mybricks_harmony_image_Data(this.data as MyBricks.Any),
        inputs: inputs2(this),
        outputs: this.events,
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** containerList */
@ComponentV2
export struct Mybricks_harmony_containerList {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      basic_mybricks_harmony_containerList({
        data: new mybricks_harmony_containerList_Data(this.data as MyBricks.Any),
        inputs: inputs2(this),
        outputs: this.events,
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** containerBasic */
@ComponentV2
export struct Mybricks_harmony_containerBasic {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      basic_mybricks_harmony_containerBasic({
        data: new mybricks_harmony_containerBasic_Data(this.data as MyBricks.Any),
        inputs: inputs2(this),
        outputs: this.events,
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}


/** JS计算 */
const codes: MyBricks.Codes = Object.keys(basicCodes).reduce((pre, key) => {
  pre[key] = (props: MyBricks.JSParams): MyBricks.JSReturn => {
    return inputs(basicCodes[key], props);
  }
  return pre
}, {} as MyBricks.Codes)

export {
  codes
}
