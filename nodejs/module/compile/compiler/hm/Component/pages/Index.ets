import { appRouter, TabBarConfig, initAppWindow, appWindow, parseRadius } from '../utils'

$r('app.config.imports')

// 初始化沉浸式窗口相关
initAppWindow()

@Entry
@ComponentV2
export default struct EntryView {
  /** 开启闪屏页支持 */
  @Local shouldShowHome: boolean = false

  /** 所有Tabbar页面/入口页 */
  @Builder
  renderMainScenes(path: string) {
    $r('app.config.mainScenes')
  }

  /** 所有非Tabbar场景的入口 */
  @Builder
  renderScenes(path: string) {
    $r('app.config.scenes')
  }

  aboutToAppear(): void {
    appRouter.registTabbar($r('app.config.tabbar')).registEntryPage($r('app.config.entry'))
  }

  build() {
    Stack() {
      Navigation(appRouter.navPathStack) {
        if (this.shouldShowHome) {
          if (appRouter.hasTabs()) {
            Tabs({ index: appRouter.activeTabIndex, barPosition: BarPosition.End }) {
              ForEach(appRouter.tabList, (item: TabBarConfig, index: number) => {
                TabContent() {
                  this.renderMainScenes(item.id)
                }
                .tabBar(renderTabItems(item, index))
              }, (item: TabBarConfig) => item.id)
            }
            .scrollable(false)
            .barHeight(42)
            .padding({
              bottom: appWindow.bottomBarHeight // 底部安全距离
            })
            .onChange((index: number) => {
              appRouter.activeTabIndex = index
            })
            .animationMode(AnimationMode.NO_ANIMATION)
          } else if (appRouter.entryPageId) {
            this.renderMainScenes(appRouter.entryPageId)
          }
        } else {
          SplashPage({
            onEnd: () => {
              this.shouldShowHome = true
            }
          })
        }
      }
      .width('100%')
      .height('100%')
      .hideTitleBar(true)
      .navDestination(this.renderScenes)
      .mode(NavigationMode.Stack)
    }
    .alignContent(Alignment.BottomEnd)
    .backgroundColor('#ffffff')
  }
}

@Builder
function renderTabItems (item: TabBarConfig, index: number) {
  Column() {
    if (item.normalIconPath && item.selectedIconPath) {
      Image(index === appRouter.activeTabIndex ? item.selectedIconPath : item.normalIconPath)
        .width(index === appRouter.activeTabIndex ? parseInt(String(item.selectedTextStyle?.width ?? 22))  : parseInt(String(item.normalIconStyle?.width ?? 22)))
        .height(index === appRouter.activeTabIndex ? parseInt(String(item.selectedTextStyle?.height ?? 22))  : parseInt(String(item.normalIconStyle?.height ?? 22)))
        .objectFit(ImageFit.Contain)
      Text(item.text)
        .fontColor(index === appRouter.activeTabIndex ? item.selectedTextStyle?.color : item.normalTextStyle?.color)
        .fontSize(index === appRouter.activeTabIndex ? (item.selectedTextStyle?.fontSize ?? 12) : (item.normalTextStyle?.fontSize ?? 12))
        .fontWeight(index === appRouter.activeTabIndex ? (item.selectedTextStyle.fontWeight ?? 500) : (item.normalTextStyle.fontWeight ?? 400))
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
    } else {
      Text(item.text)
        .fontColor(index === appRouter.activeTabIndex ? item.selectedTextStyle?.color : item.normalTextStyle?.color)
        .fontSize(index === appRouter.activeTabIndex ? (item.selectedTextStyle?.fontSize ?? 12) : (item.normalTextStyle?.fontSize ?? 12))
        .fontWeight(index === appRouter.activeTabIndex ? (item.selectedTextStyle.fontWeight ?? 500) : (item.normalTextStyle.fontWeight ?? 400))
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
    }
  }
  .width("100%")
  .height("100%")
  .padding({
    top: 6,
    bottom: 6
  })
  .justifyContent(FlexAlign.SpaceBetween)
  .backgroundColor(index === appRouter.activeTabIndex ? item.selectedBackgroundStyle?.backgroundColor : item.normalBackgroundStyle?.backgroundColor)
  .borderRadius(parseRadius(index === appRouter.activeTabIndex ? item.selectedBackgroundStyle?.borderRadius : item.normalBackgroundStyle?.borderRadius))
}

/** TODO: 闪屏启动页 */
@ComponentV2
export struct SplashPage {
  @Event onEnd: VoidCallback = () => undefined

  aboutToAppear(): void {
    setTimeout(() => {
      this.onEnd()
    }, 1000)
  }

  build() {
    Stack().width('100%').height('100%')
  }
}
