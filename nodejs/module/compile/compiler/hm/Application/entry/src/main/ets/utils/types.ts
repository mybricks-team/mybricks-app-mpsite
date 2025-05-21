export declare namespace MyBricks {
  type Any = any

  /** 组件数据源 */
  type Data = Record<string, Any>

  /** 事件参数 */
  type EventValue = Any

  /** 事件 */
  type Events = Any

  /** 组件控制器 */
  type Controller = Record<string, (value: EventValue) => Record<string, Any>>

  /** 调用插槽传参 */
  interface SlotParams {
    id: string
    inputValues?: Any
    style?: Any
  }

  /** 插槽传参 */
  type SlotParamsInputValues = Record<string, Any>

  /** 内置JS计算组件相关定义 */
  interface JSParams {
    data: Data
    inputs: string[]
    outputs: string[]
  }

  type JSReturn = (...values: MyBricks.EventValue[]) => Record<string, MyBricks.EventValue>

  interface CodeParams extends JSParams {
    data: {
      runImmediate: boolean
    }
  }

  type Codes = Record<string, (params: CodeParams) => (...values: MyBricks.EventValue[]) => Record<string, MyBricks.EventValue>>

  /** _env */
  type _Env = {
    currentScenes: {
      close: () => void
    }
  }
}
