import { SCENE_TEMPLATES } from '@/constants'
import AIPlugin, { fileFormat } from '@mybricks/plugin-ai'


export default ({ requestAsStream, user, key }: any) => AIPlugin({
  requestAsStream,
  user,
  prompts: {
    canvasWidth: '375',
    systemAppendPrompts: systemAppendPrompts(),
    prdExamplesPrompts: prdExamplesPrompts(),
    generatePageActionExamplesPrompts: generatePageActionExamplesPrompts(),
  },
  key,
  createTemplates: {
    page: SCENE_TEMPLATES.page
  }
})


function systemAppendPrompts () {
  return `
<对于当前搭建有以下特殊上下文>
<搭建画布信息>
  当前搭建画布的宽度为375，所有元素的尺寸需要关注此信息，且尽可能自适应宽度进行布局。
  搭建的画布高度应该不小于670
    比如：
      1.布局需要自适应画布宽度，考虑100%通栏，要么配置宽度+间距；
      2.配置上下左右和宽度高度时，一定要基于画布尺寸进行合理的计算；
  特殊地，系统已经内置了底部导航栏和顶部导航栏，仅关注页面内容即可，不用实现此部分内容。
  最后，必须给页面设置页面高度。
</搭建画布信息>

<下拉组件的使用>
当用户提供的设计稿或者文字描述中，存在一个文本框，文本框右侧有一个类似展开图标时，需要使用 下拉选择 组件 来实现该功能。
</下拉组件的使用>

<替换组件的特殊逻辑>
核心原则： 删除组件后添加新组件时，务必使用全新的、未被使用过的 comId，避免标识符冲突。
<错误的示例>
["u_mBVqY",":root","delete"]
["u_AwkL4","content","addChild",{"title":"曲风选择器","ns":"mybricks.taro.formSelect","comId":"u_mBVqY","layout":{"width":"fit-content","height":"fit-content","marginRight":8},"configs":[{"path":"下拉选择/基础属性/提示内容","value":"曲风"},{"path":"下拉选择/基础属性/选项","value":[{"label":"流行","value":"pop"},{"label":"摇滚","value":"rock"},{"label":"古典","value":"classic"},{"label":"民谣","value":"folk"},{"label":"电子","value":"electronic"},{"label":"爵士","value":"jazz"}]},{"path":"样式/箭头","value":"down"},{"path":"样式/输入框","style":{"borderRadius":"12px","paddingTop":"4px","paddingBottom":"4px","paddingLeft":"10px","paddingRight":"10px","backgroundColor":"#2A3947","border":"none"}},{"path":"样式/内容文本","style":{"fontSize":"12px","color":"#8B9AAD","lineHeight":"18px"}},{"path":"样式/提示内容文本","style":{"fontSize":"12px","color":"#8B9AAD","lineHeight":"18px"}},{"path":"样式/箭头样式","style":{"fontSize":"10px","color":"#8B9AAD"}}]}]
</错误的示例>

<正确的示例>
["u_mBVqY",":root","delete"]
["u_AwkL4","content","addChild",{"title":"曲风选择器","ns":"mybricks.taro.formSelect","comId":"u_Aoskd","layout":{"width":"fit-content","height":"fit-content","marginRight":8},"configs":[{"path":"下拉选择/基础属性/提示内容","value":"曲风"},{"path":"下拉选择/基础属性/选项","value":[{"label":"流行","value":"pop"},{"label":"摇滚","value":"rock"},{"label":"古典","value":"classic"},{"label":"民谣","value":"folk"},{"label":"电子","value":"electronic"},{"label":"爵士","value":"jazz"}]},{"path":"样式/箭头","value":"down"},{"path":"样式/输入框","style":{"borderRadius":"12px","paddingTop":"4px","paddingBottom":"4px","paddingLeft":"10px","paddingRight":"10px","backgroundColor":"#2A3947","border":"none"}},{"path":"样式/内容文本","style":{"fontSize":"12px","color":"#8B9AAD","lineHeight":"18px"}},{"path":"样式/提示内容文本","style":{"fontSize":"12px","color":"#8B9AAD","lineHeight":"18px"}},{"path":"样式/箭头样式","style":{"fontSize":"10px","color":"#8B9AAD"}}]}]
</正确的示例>

</替换组件的特殊逻辑>

</对于当前搭建有以下特殊上下文>`
}

function prdExamplesPrompts () {
  return `
<example>
<user_query>根据图片搭建页面</user_query>
<assistant_response>
好的，经过对图片的全面分析，结论如下：
${fileFormat({
  content: `**themes**
  界面采用简约的卡片式布局，整体背景采用浅紫色，内容区域使用纯白色背景，营造出清爽简洁的视觉效果。
  
  **layout**
  界面总体采用从上往下的纵向流式布局，顶部内容通栏，每个区块以圆角卡片的形式呈现，底部通栏为固定布局；
  1. 顶部区域为通栏，中间居中展示一个图标 + 标题；
  2. 导航区域为两行四列的导航入口；
  3. 套餐区域为横向三列的均分布局卡片；
    3.1 卡片内所有文本元素从上到下依次排列，右上角可能存在一个圆形的角标；
  4. 联系人区域是居左的标题 + 居右的联系人详情，联系人详情包含头像和昵称，以及一个可选择箭头；
  5. 结算区域是固定的底部内容，包含左侧的价格计算+右侧的支付按钮；
  
  **colors**
  界面主色调为明亮的蓝紫色，用于突出按钮和重要文字。背景采用柔和的浅紫色，搭配纯白色的内容区域，形成层次分明的视觉层级。
  
  **attention**
  注意以下细节：
  - 截图中的总体背景没有意义，可以考虑去掉；
  - 注意各区块间距，顶部通栏就不要使用外间距了；
  - 卡片中字体内容较丰富，注意字体大小，不要换行和重叠；
  - 图片中的电话区域选择与输入手机号为一体设计、整体圆角；
  - 验证码区域的获取验证码按钮为蓝色，按钮文字为白色；

  **risk**
  参考图片宽度为720像素，目标画布宽度为375像素，我们需要对元素尺寸进行合理的缩放，所以在搭建时需要注意内容不要溢出画布，主要关注以下部分：
  1. 导航区域为两行四列的网格均分布局，两行使用换行来实现，同时内容需要考虑固定宽度，避免超出画布；
  2. 套餐区域中的卡片为三列的均分布局，其中卡片的内容信息较丰富，建议固定宽高，同时将文本字体减少至10px;
  3. “适合各种活动的场地”为动态内容，注意配置文本字体极小，并且配置溢出能力，避免换行；
  4. 底部居左部分内容宽度缩小后会超过一半，注意将字体调整至极小，避免遮挡右侧内容；
  5. 右侧图标 + 文本横向排列时，注意文本宽度，防止遮挡图标；`,
  fileName: 'XX页面需求文档.md'
})}

推荐采用以下组件进行搭建：
${fileFormat({
  content: `[
  {
    "namespace": "mybricks.somelib.card"
  },
  {
    "namespace": "mybricks.somelib.icon"
  },
  {
    "namespace": "mybricks.somelib.text"
  },
  {
    "namespace": "mybricks.somelib.button"
  }
]`,
  fileName: 'XX页面所需要的组件信息.json'
})}
</assistant_response>
</example>`
}

function generatePageActionExamplesPrompts() {
  return `
<example>
<user_query>搭建一个个人中心页面框架</user_query>
<assistant_response>
  首先，必须根据页面内容设置一个合适的页面的高度。
  其次，必须把页面设置为flex布局，且为垂直方向的布局。不要在页面中再放置容器组件来做布局，这样会增加不必要的复杂度。
  注意这个action是必须的，因为页面内容区必须是flex布局，不然会重叠在一起导致错位:: ["_root_",":root","doConfig",{"path":"页面/内容区/布局","value":{"display":"flex","flexDirection":"column","alignItems":"center"}}]
  然后
  基于用户当前的选择上下文，我们来实现一个个人中心页面框架，由于是框架，所以我仅给出主体部分，思考过程如下：
  1. 搭建页面时一般用从上到下的楼层化搭建方式，我们推荐在页面最外层设置为flex的垂直布局，设置子组件的左右margin以及高度，这样好调整位置；
  2. 将页面从上到下分成顶部信息、个人信息、中间入口、底部按钮四个部分；
  3. 个人信息部分，图文编排卡片，用flex布局实现左右布局；
  4. 中间入口是竖排的入口，为了方便上下调整，我们可以使用flex布局；
  5. 底部居下固定的修改个人信息的按钮；

  ${fileFormat({
    content: `["_root_",":root","setLayout",{"height": 820}]
    ["_root_",":root","doConfig",{"path":"root/标题","value":"个人中心页面框架"}]
    ["_root_",":root","doConfig",{"path":"root/布局","value":{"display":"flex","flexDirection":"column","alignItems":"center"}}]
    ["_root_",":root","doConfig",{"path":"root/样式","style":{"background":"#F5F5F5"}}]
    ["_root_","_rootSlot_","addChild",{"title":"顶部信息","ns":"some.banner","comId":"u_top32","layout":{"width":"100%","height":80,"marginTop":8,"marginLeft":12,"marginRight":12},"configs":[{"path":"常规/布局","value":{"display":"flex"}}]}]
    ["_root_","_rootSlot_","addChild",{"title":"个人信息","ns":"some.container","comId":"u_a2fer","layout":{"width":"100%","height":100,"marginLeft":8,"marginRight":8},"configs":[{"path":"常规/布局","value":{"display":"flex","flexDirection":"row","justifyContent":"space-between","alignItems":"center"}}]}]
    ["u_a2fer", "content", "addChild",{"title":"头像","ns":"some.avatar","comId":"u_avatar1","layout":{"width":64,"height":64},"configs":[]}]
    ["u_a2fer", "content", "addChild",{"title":"用户信息","ns":"some.container","comId":"u_info4","ignore":true,"layout":{"width":"fit-content","height":"fit-content"},"configs":[{"path":"常规/布局","value":{"display":"flex","flexDirection":"row","alignItems":"center"}}]}]
    ["_root_","_rootSlot_","addChild",{"title":"中间入口","ns":"some.container","comId":"u_iiusd7","layout":{"width":"100%","height":200,"marginLeft":8,"marginRight":8},"configs":[{"path":"常规/布局","value":{"display":"flex","flexDirection":"column"}}]}]
    ["_root_","_rootSlot_","addChild",{"title":"底部固定按钮","comId":"u_btm21","ns":"some.container","layout":{"width":"100%","height":84,"position":"fixed","bottom":0,"left":0},"configs":[{"path":"常规/布局","value":{"display":"flex"}}]}]`,
    fileName: '生成个人中心页面操作步骤.json'
  })}

  注意：
  - 用户信息布局组件父组件为布局组件，且仅承担布局功能，不承担样式、点击功能，我们添加ignore标记来优化。
</assistant_response>
</example>

<example>
<user_query>添加一个一行三列的导航</user_query>
<assistant_response>
  好的，一行三列的导航考察的是我们布局的关键知识，一行三列，就是均分布局，均分我们一般选择使用flex布局。
  所以提供一个flex容器，确定子组件的宽度，并将内容平铺上去。
  
  首先，必须根据页面内容设置一个合适的页面的高度。
  其次，必须对页面布局设置为flex布局，且为垂直方向的布局。不要在页面中再放置容器组件来做布局，这样会增加不必要的复杂度。
  注意这个action是必须的，因为页面内容区必须是flex布局，不然会重叠在一起导致错位: ["_root_",":root","doConfig",{"path":"页面/内容区/布局","value":{"display":"flex","flexDirection":"column","alignItems":"center"}}]
  
  ${fileFormat({
    content: `["_root_",":root","setLayout",{"height": 360}]
    ["_root_",":root","doConfig",{"path":"root/标题","value":"一行三列的导航"}]
    ["_root_",":root","doConfig",{"path":"root/布局","value":{"display":"flex","flexDirection":"column","alignItems":"center"}}]
    ["_root_","_rootSlot_","addChild",{"title":"Flex容器","ns":"some.container","comId":"u_iiusd7","layout":{"width":"100%","height":200,"marginLeft":8,"marginRight":8},"configs":[{"path":"常规/布局","value":{"display":"flex","flexDirection":"row","justifyContent":"space-between","alignItems":"center","flexWrap":"wrap"}}]}]
    ["u_iiusd7","content","addChild",{"title":"导航1","ns":"some.icon","comId":"u_icon1","layout":{"width":120,"height":120,"marginTop":8},"configs":[{"path":"样式/文本","style":{"background":"#0000FF"}}]}]`,
    fileName: '一行三列导航操作步骤.json'
  })}

注意：
  - 这个Flex容器是根组件的直接子组件，所以不允许添加ignore标记。
</assistant_response>
</example>`
}