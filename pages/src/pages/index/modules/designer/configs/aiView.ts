// import { getNewDSL as genGetNewDsl, getDSLPrompts as genGetDslPrompts, getSystemPrompts as genGetSystemPrompts, DslHelper, Services } from '/Users/cocolbell/Desktop/projects/mybricks/ai-utils/dist/index.umd'
import { getNewDSL as genGetNewDsl, getDSLPrompts as genGetDslPrompts, getSystemPrompts as genGetSystemPrompts, DslHelper, Services } from '@mybricks/ai-utils'

const { checkValueType, getValidSlotStyle, getValidSizeValue, transformToValidBackground } = DslHelper

const getNewDSL = genGetNewDsl({
  flex: (component) => {

    // 兼容把样式写到 layout 的情况
    if (component.style) {
      const {
        width,
        height,
        justifyContent,
        alignItems,
        flex,
        flexDirection,
        columnGap,
        styleAry,
        margin,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        position,
        left,
        right,
        top,
        bottom,
        ...extra
      } = component.style

      if (!component?.style?.styleAry) {
        component.style.styleAry = [
          {
            selector: ':root',
            css: {}
          }
        ]
      }
      component.style.styleAry[0].css = {
        ...(component.style.styleAry[0]?.css ?? {}),
        ...(extra ?? {})
      }
      // 清理多余的属性，特别是padding容易导致双重padding
      Object.keys(extra ?? {}).forEach((key) => {
        if (key.includes('padding')) {
          delete component.style[key]
        }
      })
    }
  
    // 处理幻觉
    // if (component.style?.paddingLeft) {
    //   component.style.marginLeft = component.style?.paddingLeft
    //   delete component.style?.paddingLeft
    // }
    // if (component.style?.paddingRight) {
    //   component.style.marginRight = component.style?.paddingRight
    //   delete component.style?.paddingRight
    // }
  
    // 处理绝对定位兼容
    const rootStyle = component?.style?.styleAry?.find?.(s => s.selector === ':root')?.css
    if (rootStyle?.position === 'absolute') {
      component.style.position = rootStyle.position;
  
      if (rootStyle.left) {
        component.style.left = rootStyle.left
        delete rootStyle.left
      }
      if (rootStyle.right) {
        component.style.right = rootStyle.right
        delete rootStyle.right
      }
      if (rootStyle.top) {
        component.style.top = rootStyle.top
        delete rootStyle.top
      }
      if (rootStyle.bottom) {
        component.style.bottom = rootStyle.bottom
        delete rootStyle.bottom
      }
  
      delete rootStyle.position
    }

    // 兼容布局写到rootStyle的情况
    if (rootStyle?.flexDirection) {
      if (!component.style) {
        component.style = {}
      }
      component.style.flexDirection = rootStyle.flexDirection
    }
    if (rootStyle?.alignItems) {
      if (!component.style) {
        component.style = {}
      }
      component.style.alignItems = rootStyle.alignItems
    }
    if (rootStyle?.justifyContent) {
      if (!component.style) {
        component.style = {}
      }
      component.style.justifyContent = rootStyle.justifyContent
    }
  
    // // 兼容一些样式加到了layout上的情况
    // if (component.style) {
    //   if (component.style?.backgroundColor) {
    //     if (!component?.style?.styleAry?.[0]) {
    //       component.style.styleAry = [
    //         {
    //           selector: ':root',
    //           css: {}
    //         }
    //       ]
    //     }
    //     component.style.styleAry[0].css = {
    //       backgroundColor: component.style?.backgroundColor
    //     }
    //     delete component.style?.backgroundColor
    //   }
    // }
  
    const shouldTransformToGrid = component.style?.flexDirection === 'row' && component?.comAry?.some(com => {
      return !!com.style.flex || (checkValueType(com.style?.width) === 'percentage' && com.style?.width !== '100%')
    })
  
    if (shouldTransformToGrid) {
      const { justifyContent = 'flex-start', alignItems = 'flex-start', columnGap = 0 } = component.style ?? {};
      component.namespace = 'mybricks.taro.containerRow'
  
      const sizeProps = {
        height: component.style?.height ?? 'auto',
        width: component.style?.width ?? '100%'
      }
  
      if (checkValueType(sizeProps?.height) === 'number') {
        sizeProps.height = '100%'
      } else if (checkValueType(sizeProps?.height) === 'percentage') {
        sizeProps.height = sizeProps?.height === '100%' ? '100%' : 'auto';
      }
  
      if (checkValueType(sizeProps?.width) === 'number' || checkValueType(sizeProps?.width) === 'number') {
        sizeProps.width = '100%'
      }
  
      component.data = {
        slotStyle: {
          flexDirection: 'row',
          justifyContent,
          alignItems,
          columnGap,
          flexWrap: component.style?.flexWrap,
          ...sizeProps
        },
        items: component?.comAry?.map((com, index) => {
          const comStyle = com.layout ?? com.style
  
          const base: any = {
            id: `slot${index + 1}`,
            slotStyle: getValidSlotStyle(),
          }
  
          const widthType = checkValueType(getValidSizeValue(comStyle?.width))
  
          switch (true) {
            case comStyle?.flex === 1: {
              base.widthMode = 'auto'
              break
            }
            case comStyle?.width === undefined || comStyle.width === null: {
              base.widthMode = 'fit-content'
              break
            }
            case comStyle?.width === 'fit-content': {
              base.widthMode = 'fit-content'
              break
            }
            case widthType === 'percentage': {
              base.widthMode = 'percent'
              base.width = parseFloat(comStyle?.width)
  
              // 比如30%，走组件配置了，那么底层组件就直接100%即可
              if (base.width !== 100) {
                comStyle.width = '100%'
              }
              break
            }
            case widthType === 'number': {
              // base.widthMode = 'number'
              // base.width = parseFloat(comStyle?.width)
               base.widthMode = 'fit-content'
              break
            }
          }
  
          base.slotStyle.height = comStyle?.height
  
          return base
        })
      }
  
      component?.comAry?.forEach((com, index) => {
        if (!component.slots) {
          component.slots = {}
        }
  
        component.slots[`slot${index + 1}`] = {
          id: `slot${index + 1}`,
          title: `插槽${index + 1}`,
          comAry: [com],
          style: {
            ...(com?.style?.height === '100%' ? {
              height: '100%'
            } : {})
          }
        }
      })
      component.comAry = undefined
      delete component.comAry
  
      if (component?.style?.flex) {
        delete component.style.flex
      }
  
      return
    }
  
    // 处理textAlign幻觉
    if (rootStyle?.textAlign) {
      if (component.style?.flexDirection === 'column') {
        component.style.alignItems = 'center'
      }
      if (component.style?.flexDirection === 'row') {
        component.style.justifyContent = 'center'
      }
    }
  
  
    component.namespace = 'mybricks.taro.containerBasic'
    if (!component.data) {
      component.data = {}
    }
  
    let slotWidth = getValidSizeValue(component.style?.width, '100%')
    if (checkValueType(slotWidth) === 'number') {
      slotWidth = '100%'
    }
  
    let slotHeight = getValidSizeValue(component.style?.height, 'auto')
    if (checkValueType(slotHeight) === 'number') {
      slotHeight = '100%'
    }
  
    component.data.layout = getValidSlotStyle(component.style)
    component.slots = {
      content: {
        id: 'content',
        title: component.title ? `${component.title}插槽` : '内容',
        style: {
          width: slotWidth,
          height: slotHeight,
          flexDirection: component.style.flexDirection,
          layout: `flex-${component.style.flexDirection}`,
          justifyContent: component.data.layout.justifyContent,
          alignItems: component.data.layout.alignItems,
        },
        comAry: component?.comAry
      }
    }
    component.comAry = undefined
    component.style = {
      ...(component.style ?? {}),
      width: component.style?.flex === 1 ? '100%' : getValidSizeValue(component.style?.width, 'fit-content'),
      height: getValidSizeValue(component.style?.height, 'auto'),
    }
  
    // 转换成containerBasic的类名
    if (component.style?.styleAry) {
      component.style?.styleAry.forEach(s => {
        if (s.selector === ':root') {
          s.selector = '> .mybricks-container'
        }
      })
    }
  
    delete component.comAry

    if (component?.style?.flex) {
      delete component.style.flex
    }
  },
  'system.page': (component) => {
    component.namespace = 'mybricks.taro.systemPage'
    component.data = {
      layout: getValidSlotStyle(component.style)
    }
  
    component.data.navigationBarTitleText = component.title
    component.data.useTabBar = false
  
    if (component?.style?.styleAry?.[0]) {
      transformToValidBackground(component?.style?.styleAry?.[0]?.css ?? {})
      const cssProperties = component?.style?.styleAry?.[0]?.css
      if (cssProperties?.backgroundColor) {
        component.data.background = cssProperties?.backgroundColor
      }
      if (cssProperties?.backgroundImage) {
        component.data.backgroundImage = cssProperties?.backgroundImage
      }
      delete component?.style?.styleAry
    }
    component.asRoot = true
  },
  'system.page:after': (component) => {
    if (component?.slots?.content.style) {
      component.slots.content.style.height = '100%'
    }
  }
})

const getSystemPrompts = genGetSystemPrompts()

const getDSLPrompts = genGetDslPrompts({
  dslDemoPrompts: `
  如下为一个卡片中有一个文本：
  \`\`\`dsl file="page.dsl"
  <page title="你好世界">
    <system.page title="你好世界" styleAry={[{selector:":root",css:{background:"#F2F2F7"}}]}>
      <slots.content title="页面内容">
        <flex title="主体卡片" layout={{ width: '100%', marginTop: 10, marginLeft: 12, marginRight: 12, justifyContent: 'center' }}>
          <mybricks.taro.text title="文本" layout={{ width: 'fit-content', marginTop: 20 }} styleAry={[{selector:".mybricks-text",css:{color:'red',fontSize:'20px'}}]} data={{text:"Hello world"}} />
        </flex>
      </slots.content>
    </system.page>
  </page>
  \`\`\``,
  canvasInfoPrompts: `
  当前搭建画布的宽度为375，所有元素的尺寸需要关注此信息，且尽可能自适应布局。
    比如：
      1.system.page下方元素考虑是否需要配置宽度100%且配置左右margin，效果更好；
      2.布局需要自适应画布宽度；
  特殊地，系统已经内置了底部导航栏和顶部导航栏，仅关注页面内容即可，不用实现此部分内容。
  `,
  componentSuggestionPrompts: `
  1. 文本、图片、按钮组件属于基础组件，任何情况下都可以优先使用，即使不在允许使用的组件里；
  2. 关于图片链接，首先明确我们会在发现图标、图片、Logo的时候使用图片组件；
    - 如果是Logo，使用https://placehold.co?text=Logo来配置一个带文本和颜色的图标；
    - 如果是图标，使用https://placehold.co?text=icon来配置一个带文本和颜色的图标，并且建议对图片组件配置圆角；
    - 如果是图片，使用https://ai.mybricks.world/image-search?term=dog&w=100&h=200，其中term代表搜索词，w和h可以配置图片宽高；
    注意参数：
      - 对于https://placehold.co的text参数的值，必须为英文字符，，不允许为中文字符，如果是中文可以用拼音首字母；
      - 对于https://placehold.co的颜色，背景颜色和文颜色要区分开；
  3. 关于图标，图标禁止使用emoji或者特殊符号，需要使用图片组件来替代实现，使用第3点提及的链接；
  4. 注意margin和padding的结合使用，如果可以则建议用margin；
  5. 仔细是否需要用到绝对定位，是相对于父元素的；
  6. system.page下方元素注意配置左右margin，特殊情况比如导航栏这类通栏效果，和背景通栏效果不要配置margin；
  `
})

const getExamplePrompts = () => {
  return `
  <example>
    <user_query>搭建两个竖排的按钮，按钮宽度固定 + 铺满</user_query>
    <assistant_response>
    \`\`\`dsl file="page.dsl"
      <page title="测试页面">
        <system.page title="你好世界" styleAry={[{selector:":root",css:{background:"#FFFFFF"}}]}>
          <slots.content title="页面内容" layout={{ alignItems: 'center' }}>
            <mybricks.taro.button 
              title="按钮1" 
              layout={{width: 50, height: 36}}
              styleAry={[{selector:".mybricks-button",css:{"backgroundColor":"red"}}]}
              data={{text:"按钮1"}}/>
            <mybricks.taro.button 
              title="按钮2" 
              layout={{width: '100%', height: 36}}
              styleAry={[{selector:".mybricks-button",css:{"backgroundColor":"blue"}}]}
              data={{text:"按钮2"}}/>
          </slots.content>
        </system.page>
      </page>
    \`\`\`
    </assistant_response>
  </example>
  `
}

export const getAIResponse = Services.getAIResponse

export default {
  getAvailable: Services.getAvailable,
  getNewDSL,
  getDSLPrompts,
  getSystemPrompts,
  getExamplePrompts
}