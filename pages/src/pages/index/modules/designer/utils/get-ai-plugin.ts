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
  当前搭建的是微信小程序，不使用默认顶部导航栏时，需要关注系统顶部状态栏和右上角胶囊按钮。
    比如：
      1.提供顶部安全区域，建议配置30；
      2.提供右上角胶囊按钮安全区域，坐标为(375-100, 44)，宽高为(100, 32)；
  当前搭建画布的宽度为375，所有元素的尺寸需要关注此信息，且尽可能自适应宽度进行布局。
    比如：
      1.布局需要自适应画布宽度，考虑100%通栏，要么配置宽度+间距；
      2.配置上下左右和宽度高度时，一定要基于画布尺寸进行合理的计算；
  特殊地，系统已经内置了底部导航栏和顶部导航栏，仅关注页面内容即可，不用实现此部分内容。
  最后，必须给页面设置页面高度。
</搭建画布信息>

<允许使用的图标>
airplane_fill
alarm_fill_1
arrow_clockwise
arrow_counterclockwise
arrow_counterclockwise_clock
arrow_down_right_and_arrow_up_left
arrow_left
arrow_right
arrow_right_up_and_square
arrow_up_left_and_arrow_down_right
arrow_up_to_line
arrowshape_turn_up_right_fill
backward_end_fill
battery
battery_75percent
bell_fill
bluetooth
bluetooth_slash
bookmark
calendar
camera
camera_fill
checkmark
checkmark_circle
checkmark_circle_fill
checkmark_square
checkmark_square_fill
chevron_down
chevron_left
chevron_right
chevron_up
clock
dial
doc_plaintext
doc_plaintext_and_pencil
doc_text_badge_arrow_up
doc_text_badge_magnifyingglass
ellipsis_message
envelope
eye
eye_slash
fast_forward
folder
folder_badge_plus
forward_end_fill
gearshape
hand_thumbsup_fill
headphones_fill
heart
heart_fill
heart_slash
house
house_fill
line_viewfinder
list_square_bill
livephoto
lock
lock_open
magnifyingglass
message
message_on_message
mic
music
music_note_list
paintpalette
paperclip
pause
picture
picture_2
picture_damage
play_circle_fill
play_fill
play_round_rectangle_fill
play_video
plus
qrcode
record_circle
resolution_video
save
share
template
text_clipboard
timer
trash
wifi
worldclock
xmark
</允许使用的图标>
</对于当前搭建有以下特殊上下文>`
}

function prdExamplesPrompts () {
  return `
<example>
  <user_query>我要做一个移动端的银行小程序首页</user_query>
  <assistant_response>
好的，我来为你生成一个现代化、安全可信的移动端银行金融类小程序首页需求分析规格说明书和组件选型建议。整体设计以**用户资产为核心**，布局清晰、交互简洁，符合金融类产品的专业调性。

${fileFormat({
  content: `# 概述
本文档用于规划一个面向个人用户的移动端银行小程序首页，核心目标是让用户**一眼看清账户资产状态**，并快速访问常用金融服务。设计强调**安全性、清晰度与高效操作**。

# 设计规范
- *设计风格*：现代金融风，干净、克制、高信任感。
- *色彩体系*：
  - 主色调：深蓝 \`#1A365D\`（代表稳重与安全）
  - 强调色：金色 \`#D4AF37\` 或青金石蓝 \`#2A5CAA\`（用于渐变资产卡片）
  - 背景色：浅灰 \`#F8F9FA\`
  - 文字色：标题 \`#111111\`，正文 \`#444444\`，辅助信息 \`#888888\`
- *字号规范*（基于 14px 基准）：
  - 页面标题：\`16px\` 粗体
  - 卡片标题：\`14px\` 中等
  - 金额数字：\`20px\` 粗体（关键数据放大）
  - 辅助文字：\`12px\`
- *间距与圆角*：
  - 页面间距：\`10px\`
  - 模块垂直间距：\`10px\`
  - 卡片圆角：\`12px\`
  - 按钮圆角：\`8px\`
  - 安全区域适配：顶部状态栏下留出安全边距

# 设计亮点
- **渐变色资产卡片**：使用从深蓝到金色的线性渐变背景展示“当前总余额”，营造尊贵与安全感。
- **资产概览可视化**：通过不同颜色展示活期、定期、理财占比。
- **快捷服务入口**：底部固定常用功能（转账、收款、充值、贷款），图标+文字，点击即达。
- **安全提示强化**：在关键操作区域加入“已加密”、“设备受信任”等小标签，增强用户心理安全感。

# 内容结构（自上而下）

## 顶部状态区
- 用户问候语：“早上好，张**”（带头像，圆形 40px）
- 右侧：消息通知图标 + 安全锁图标（表示当前会话安全）

## 核心资产卡片（渐变色重点模块）
- **背景**：线性渐变 （或深蓝→金色）
- **内容**：
  - 标题：“我的总资产”（白色，16px）
  - 金额：“¥ 186,420.50”（白色，24px 粗体，带千分位）
  - 子信息：“较昨日 +¥1,200.00”（浅金色，12px）
  - 底部小字：“点击查看明细”（白色半透，带下划线）
- **交互**：点击可展开资产分布详情（活期 ¥80k / 定期 ¥60k / 理财 ¥46k）

## 资产分布可视化
- 各类信息数据化，直观展示资金构成
- 每部分带标签和百分比（如“活期 43%”）

## 快捷功能入口（2×4 网格）
- 图标 + 文字，共 转账等8 个高频功能：
- 图标风格统一（线性图标，主色深蓝）

## 近期交易记录
- 标题：“最近交易” + “查看更多 >”
- 列表项（每项高度 64px）：
  - 左侧：交易类型图标（绿色支出/红色收入）
  - 中间：商户名 + 时间（如“星巴克 · 今天 10:23”）
  - 右侧：金额（支出为负，收入为正，颜色区分）
- 最多显示 5 条，支持下拉刷新

## 安全提示横幅（底部上方）
- 浅蓝色背景 \`#E6F0FA\`
- 内容：“您的账户已开启双重验证，当前设备已受信任 ✅”

# 参考风格
招商银行小程序、工商银行小程序设计。
`,
  fileName: '移动端银行小程序首页需求文档.md',
})}

推荐采用以下组件进行搭建：
${fileFormat({
  content: `[
  {
    "namespace": "mybricks.somelib.text"
  },
  {
    "namespace": "mybricks.somelib.icon"
  },
  {
    "namespace": "mybricks.somelib.image"
  },
  {
    "namespace": "mybricks.somelib.button"
  },
  {
    "namespace": "mybricks.somelib.list"
  }
]`,
  fileName: '银行小程序首页所需要的组件信息.json'
})}
  </assistant_response>
</example>

<example>
  <user_query>我要做一个问卷小程序首页</user_query>
  <assistant_response>
好的，我来为你生成一个移动端问卷小程序首页需求文档和组件选型建议。整体设计强调**简洁高效、功能清晰、信息分层明确**，采用**浅色渐变背景 + 卡片式操作区 + 横向标签导航 + 列表式内容展示**。

${fileFormat({
  content: `# 概述
本文档用于规划一款灵活高效的移动端问卷小程序首页，目标是让用户快速发起调研、考试或投票，并浏览热门模板。界面风格现代、清爽，突出核心功能入口，符合企业级调研工具的专业调性。

# 设计规范
- *设计风格*：极简科技风，强调**功能直达**与**信息层级清晰**
- *色彩体系*：
  - 主背景：浅蓝白渐变 \`linear-gradient(135deg, #F0F7FF, #FFFFFF)\`
  - 主色调：深蓝 \`#0066CC\`
  - 辅助色：天蓝 \`#4DB8FF\`（考试）、绿色 \`#2EC47B\`（投票）
  - 文字色：标题 \`#111111\`，正文 \`#666666\`，辅助信息 \`#999999\`
- *字号规范*：
  - 页面标题：\`28px\` 粗体
  - 功能按钮文字：\`16px\`
  - 问卷标题：\`18px\`
  - 参与人数：\`12px\`
- *间距与圆角*：
  - 模块间距：\`10px\`
  - 卡片圆角：\`8px\`
  - 按钮圆角：\`8px\`

# 设计亮点
- **三大核心功能并列呈现**：通过三种颜色的卡片按钮区分“创建问卷”、“创建考试”、“发起投票”，视觉上清晰可辨、主次分明。
- **顶部品牌强化**：大标题 + 品牌标语 + 使用者头像动态提示，增强社交信任感。
- *整页背景渐变*：背景使用从顶部到右下角的浅蓝白渐变，营造轻松愉悦的氛围。
- *入口强调*：三个入口操作按钮采用大尺寸卡片设计，点击区域大，且均带轻微阴影，提升层次感。

# 内容结构

## 顶部区域
- 布局整体上内边距下移约 88px，避免遮挡系统状态栏和右上角胶囊栏遮挡。
- **主标题**：“灵活高效的问卷/考试工具”（28px，加粗）
- **副标题**：“累计创建问卷200万份”（14px，灰色）
- **品牌标识**：左侧显示Logo，右侧为居右上角的“新手引导”按钮（绿色圆角矩形）
- **用户动态提示**：一行小字“吴彦祖正在创建问卷...”，下方配一组圆形用户头像（最多5个）

## 核心功能区（两栏布局）
- **左侧主卡片**蓝色渐变背景：
  - 标题：“极致轻便 / 多场景触达 / 数据处理”
  - 按钮：“创建问卷”（白色椭圆按钮，内文蓝色）
- **右侧两个功能按钮**（上下排列）：
  - 上方：蓝色卡片，图标+文字“创建考试”
  - 下方：绿色卡片，图标+文字“发起投票”（带纸飞机图标）

## 内容导航标签
- 横向标签栏，当前选中“热门问卷”，其他为“热门投票”、“热门测试”
- 标签字体：16px，选中时蓝色，未选中灰色

## 热门内容列表
- 重复数据，循环列表展示，每项为一个水平卡片，高度约 80px
- 每项为一条水平卡片，高度约 80px
- 左侧：文件图标（白色底，蓝色边框），底部带标签（如“问卷”、“有奖问卷”）
- 中间：问卷标题（18px，自动截断）
- 右侧：参与人数（12px，灰色）
- 分隔线：浅灰色 1px 实线


# 参考风格
京东良研、腾讯问卷、问卷星小程序首页。
`,
  fileName: '问卷工具小程序首页需求文档.md',
})}

推荐采用以下组件进行搭建：
${fileFormat({
  content: `[
  {
    "namespace": "mybricks.somelib.text"
  },
  {
    "namespace": "mybricks.somelib.icon"
  },
  {
    "namespace": "mybricks.somelib.button"
  },
  {
    "namespace": "mybricks.somelib.list"
  },
  {
    "namespace": "mybricks.somelib.image"
  }
]`,
  fileName: '问卷工具小程序首页所需要的组件信息.json'
})}
  </assistant_response>
</example>
`
}

function generatePageActionExamplesPrompts() {
  return `
<example>
<user_query>搭建一个个人中心页面框架</user_query>
<assistant_response>
  首先，必须根据页面内容设置一个合适的页面的高度。
  其次，必须对页面布局设置一个合理的布局,搭建页面时一般用从上到下的楼层化搭建方式，我们推荐在页面最外层设置为flex的垂直布局，设置子组件的左右margin以及高度，这样好调整位置。

  然后
  基于用户当前的选择上下文，我们来实现一个个人中心页面框架，由于是框架，所以我仅给出主体部分，思考过程如下：
  1. 将页面从上到下分成顶部信息、个人信息、中间入口、底部按钮四个部分；
  2. 顶部信息部分，注意需要预留系统状态栏和右上角胶囊按钮的安全区域，避免遮挡内容；
  3. 个人信息部分，图文编排卡片，用flex布局实现左右布局；
    其中
    - 头像固定宽度64，右侧用户信息容器配置宽度自适应(width=auto)；
    - 内部的间距由头像的左外间距+用户信息的右外间距组成；
  4. 中间入口是竖排的入口，使用高度适应内容，保证不会内容溢出；
  5. 底部居下固定的修改个人信息的按钮；

  ${fileFormat({
    content: `["_root_",":root","setLayout",{"height": 820}]
    ["_root_",":root","doConfig",{"path":"root/标题","value":"个人中心页面框架"}]
    ["_root_",":root","doConfig",{"path":"root/布局","value":{"display":"flex","flexDirection":"column","alignItems":"center"}}]
    ["_root_",":root","doConfig",{"path":"root/样式","style":{"background":"#F5F5F5"}}]
    ["_root_","_rootSlot_","addChild",{"title":"顶部信息","ns":"some.banner","comId":"u_top32","layout":{"width":"100%","height":80,"marginTop":10,"marginLeft":10,"marginRight":10},"configs":[{"path":"常规/布局","value":{"display":"flex"}}]}]
    ["_root_","_rootSlot_","addChild",{"title":"个人信息","ns":"some.container","comId":"u_a2fer","layout":{"width":"100%","height":"fit-content","marginLeft":5,"marginRight":5},"configs":[{"path":"常规/布局","value":{"display":"flex","flexDirection":"row","justifyContent":"space-between","alignItems":"center"}}]}]
    ["u_a2fer", "content", "addChild",{"title":"头像","ns":"some.avatar","comId":"u_avatar1","layout":{"width":64,"height":64,"marginLeft":5,"marginRight":10},"configs":[]}]
    ["u_a2fer", "content", "addChild",{"title":"用户信息","ns":"some.container","comId":"u_info4","ignore":true,"layout":{"width":"auto","height":"fit-content","marginRight": 5},"configs":[{"path":"常规/布局","value":{"display":"flex","flexDirection":"row","alignItems":"center"}}]}]
    ["_root_","_rootSlot_","addChild",{"title":"中间入口","ns":"some.container","comId":"u_iiusd7","layout":{"width":"100%","height":"fit-content","marginLeft":5,"marginRight":5},"configs":[{"path":"常规/布局","value":{"display":"flex","flexDirection":"column"}}]}]
    ["u_iiusd7", "content", "addChild",{"title":"隐私协议","ns":"some.container","comId":"u_pricy1","enhance":true,"layout":{"width":100,"height":"fit-content"},"configs":[]}]
    ["_root_","_rootSlot_","addChild",{"title":"底部固定按钮","comId":"u_btm21","ns":"some.container","layout":{"width":"100%","height":84,"position":"fixed","bottom":0,"left":0},"configs":[{"path":"常规/布局","value":{"display":"flex"}}]}]`,
    fileName: '生成个人中心页面操作步骤.json'
  })}

  注意：
  - 个人信息横向擦用固定 + 自适应方式，是常见的横向布局示例，保证内容拓展还能维持原有布局；
  - 各类组件在flex布局下建议使用height=fit-content来自适应高度，比如个人信息、中间入口等，减少计算错误的可能；
  - 整体遵循5px网格间距系统，包括模块间距为10=5*2；
  - 用户信息布局组件父组件为布局组件，且仅承担布局功能，不承担样式、点击功能，我们添加ignore标记来优化。
  - 隐私协议为图文信息入口，大概率有点击事件，所以用enhance标记来优化。
</assistant_response>
</example>

<example>
<user_query>添加一个一行三列的导航</user_query>
<assistant_response>
  好的，一行三列的导航考察的是我们布局的关键知识，一行三列，就是均分布局，均分我们一般选择使用flex布局。
  所以提供一个flex容器，确定子组件的宽度，并将内容平铺上去。
  
  首先，必须根据页面内容设置一个合适的页面的高度。
  其次，必须对页面布局设置一个合理的布局。
  
  ${fileFormat({
    content: `["_root_",":root","setLayout",{"height": 360}]
    ["_root_",":root","doConfig",{"path":"root/标题","value":"一行三列的导航"}]
    ["_root_",":root","doConfig",{"path":"root/布局","value":{"display":"flex","flexDirection":"column","alignItems":"center"}}]
    ["_root_","_rootSlot_","addChild",{"title":"Flex容器","ns":"some.container","comId":"u_iiusd7","enhance":true,"layout":{"width":"100%","height":"fit-content","marginLeft":5,"marginRight":5},"configs":[{"path":"常规/布局","value":{"display":"flex","flexDirection":"row","justifyContent":"space-between","alignItems":"center","flexWrap":"wrap"}}]}]
    ["u_iiusd7","content","addChild",{"title":"导航1","ns":"some.icon","comId":"u_icon1","layout":{"width":120,"height":120,"marginTop":8},"configs":[{"path":"样式/文本","style":{"background":"#0000FF"}}]}]`,
    fileName: '一行三列导航操作步骤.json'
  })}

注意：
  - 这个Flex容器是根组件的直接子组件，所以不允许添加ignore标记。
</assistant_response>
</example>`
}