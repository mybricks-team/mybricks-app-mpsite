import { appRouter } from "../utils"
import {
  mybricks_harmony__showToast as basicMyBricksHarmony_showToast,
  mybricks_harmony__connector as basicMyBricksHarmony_connector,
  mybricks_harmony_popup as BasicMyBricksHarmonyPopup,
  mybricks_harmony_popup_Data,
  mybricks_harmony_systemPage as BasicMyBricksHarmonySystemPage,
  mybricks_harmony_systemPage_Data,
  mybricks_harmony_systemWebview as BasicMyBricksHarmonySystemWebview,
  mybricks_Harmony_SystemWebview_Data,
  mybricks_harmony_button as BacisMyBricksHarmonyButton,
  mybricks_harmony_button_Data,
  mybricks_harmony_text as BasicMyBricksHarmonyText,
  mybricks_harmony_text_Data,
  mybricks_harmony_image as BasicMyBricksHarmonyImage,
  mybricks_harmony_image_Data,
  mybricks_harmony_containerList as BasicMyBricksHarmonyContainerList,
  mybricks_harmony_containerList_Data,
  mybricks_harmony_containerBasic as BasicMyBricksHarmonyContainerBasic,
  mybricks_harmony_containerBasic_Data,
  mybricks_harmony_formInput as BasicMyBricksHarmonyFormInput,
  mybricks_harmony_formInput_Data,
  mybricks_harmony_formPassword as BasicMyBricksHarmonyFormPassword,
  mybricks_harmony_formPassword_Data,
  mybricks_harmony_smsInput as BasicMyBricksHarmonySmsInput,
  mybricks_harmony_smsInput_Data
} from "../../comlib/index"
import basicCodes from "./codes";
import { createJSHandle, createInputsHandle, createEventsHandle, Page } from "../utils/mybricks"
import { genCallConnector } from "../utils/CallConnector"
import { MyBricks } from "../utils/types"

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
    } else {
      instance.flexShrink(0)
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

const env: MyBricks.Env = {
  callConnector: genCallConnector(basicCodes, { domain: undefined })
}

export const Controller = () => {
  return createInputsHandle({}, true) as MyBricks.Controller
}

/** 场景打开、输出 */
export const page = new Page(appRouter);

/** _showToast */
export const myBricksHarmony_showToast = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_showToast, { props });
}

/** connector */
export const myBricksHarmony_connector = (props: MyBricks.JSParams): (...values: MyBricks.EventValue) => Record<string, MyBricks.EventValue> => {
  return createJSHandle(basicMyBricksHarmony_connector, { props, env });
}

/** systemPage */
@ComponentV2
export struct MyBricksHarmonySystemPage {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySystemPage({
        data: new mybricks_harmony_systemPage_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
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
export struct MyBricksHarmonyPopup {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyPopup({
        _env,
        data: new mybricks_harmony_popup_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
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
export struct MyBricksHarmonySystemWebview {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySystemWebview({
        data: new mybricks_Harmony_SystemWebview_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** button */
@ComponentV2
export struct MyBricksHarmonyButton {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BacisMyBricksHarmonyButton({
        data: new mybricks_harmony_button_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** text */
@ComponentV2
export struct MyBricksHarmonyText {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyText({
        data: new mybricks_harmony_text_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** image */
@ComponentV2
export struct MyBricksHarmonyImage {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyImage({
        data: new mybricks_harmony_image_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)

  }
}


/** containerList */
@ComponentV2
export struct MyBricksHarmonyContainerList {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyContainerList({
        data: new mybricks_harmony_containerList_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
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
export struct MyBricksHarmonyContainerBasic {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyContainerBasic({
        data: new mybricks_harmony_containerBasic_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
        slots: this.slots,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** formInput */
@ComponentV2
export struct MyBricksHarmonyFormInput {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormInput({
        data: new mybricks_harmony_formInput_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** formPassword */
@ComponentV2
export struct MyBricksHarmonyFormPassword {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonyFormPassword({
        data: new mybricks_harmony_formPassword_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** smsInput */
@ComponentV2
export struct MyBricksHarmonySmsInput {
  @Param controller: MyBricks.Controller = Controller();
  @Param @Require data: MyBricks.Data
  @Param events: MyBricks.Events = {}
  @Param styles: Styles = {};
  @Local columnVisibility: Visibility = Visibility.Visible;
  @BuilderParam slots : (params: MyBricks.SlotParams) => void = Slot;

  myBricksColumnModifier = new MyBricksColumnModifier(this.styles.root)

  build() {
    Column() {
      BasicMyBricksHarmonySmsInput({
        data: new mybricks_harmony_smsInput_Data(this.data as MyBricks.Any),
        inputs: createInputsHandle(this),
        outputs: createEventsHandle(this.events),
        styles: this.styles,
      })
    }
    .attributeModifier(this.myBricksColumnModifier)
    .visibility(this.columnVisibility)
  }
}

/** JS计算 */
const codes: MyBricks.Codes = Object.keys(basicCodes).reduce((pre, key) => {
  pre[key] = (props: MyBricks.JSParams): MyBricks.JSReturn => {
    return createJSHandle(basicCodes[key], { props });
  }
  return pre
}, {} as MyBricks.Codes)

export {
  codes
}