import toHarmonyCode from "@mybricks/to-code-react/dist/cjs/toHarmonyCode"
import * as path from "path";
import * as fse from "fs-extra";
import { BaseCompiler } from "./base";
import { COMPONENT_META } from "./hm/constant";

class HarmonyCompiler extends BaseCompiler {
  validateData = (data) => {
    this.transformData({ data });
  };
}

const handleEntryCode = (template: string, {
  tabbarScenes,
  normalScenes,
  entryPageId,
  tabbarConfig
}) => {
  const allImports = Array.from(new Set([...tabbarScenes, ...normalScenes]))
    .map(path => `import Page_${path} from './Page_${path}';`)
    .join('\n')
  const generateRoutes = (paths) => paths
    .map((path, i) => `${i === 0 ? 'if' : '\t\telse if'} (path === '${path}') {\n\t\t\tPage_${path}()\n\t\t}`)
    .join('\n');
  const renderMainScenes = generateRoutes(Array.from(new Set([entryPageId, ...tabbarScenes])))
  const renderScenes = generateRoutes(normalScenes)


  return template
    .replace("$r('app.config.imports')", allImports)
    .replace("$r('app.config.mainScenes')", renderMainScenes)
    .replace("$r('app.config.scenes')", renderScenes)
    .replace("$r('app.config.tabbar')", JSON.stringify(tabbarConfig, null, 2))
    .replace("$r('app.config.entry')", JSON.stringify(entryPageId))
}

const handlePageCode = (page: ReturnType<typeof toHarmonyCode>[0], {
  disableScroll = false,
  navigationBarBackgroundColor,
  navigationBarTextStyle,
  navigationBarTitleText
}) => {
  page.importManager.addImport({
    packageName: "../utils",
    dependencyNames: ["AppCommonHeader"],
    importType: "named",
  });
  return `${page.importManager.toCode()}

  @ComponentV2
  export default struct Page {
    build() {
      NavDestination() {
        AppCommonHeader({
          title: ${JSON.stringify(navigationBarTitleText)},
          titleColor: ${JSON.stringify(navigationBarTextStyle)},
          barBackgroundColor: ${JSON.stringify(navigationBarBackgroundColor)}
        })
        Index()
      }
      .hideTitleBar(true)
    }
  }

  ${page.content}
  `;
}

const handlePopupCode = (page: ReturnType<typeof toHarmonyCode>[0]) => {
  return `${page.importManager.toCode()}
  
      @ComponentV2
      export default struct Page {
        build() {
          NavDestination() {
            Index()
          }
          .hideTitleBar(true)
          .hideBackButton(true)
          .mode(NavDestinationMode.DIALOG)
          .systemTransition(NavigationSystemTransitionType.NONE)
        }
      }
  
      ${page.content}
      `;
}

export const compilerHarmony2 = async (
  { data, projectPath, projectName, fileName, depModules, origin, type }: any,
  { Logger }
) => {
  const compiler = new HarmonyCompiler({ projectPath });
  // 校验data合法性
  compiler.validateData(data);

  const pageCode = toHarmonyCode(data.toJson, {
    getComponentMetaByNamespace(namespace) {
      return COMPONENT_META[namespace];
    },
  });

  pageCode.forEach((page) => {
    let content = "";
    if (page.type === "ignore") {
      // 不做特殊处理，一般是固定模版代码
      content = page.content;
    } else if (page.type === "normal") {
      const { pageConfig } = data.pages.find(p => p.id === page.pageId) ?? {}
      // 页面
      content = handlePageCode(page, pageConfig);
    } else if (page.type === "popup") {
      // 弹窗
      content = handlePopupCode(page);
    }

    fse.outputFileSync(path.join(projectPath, page.path), content, { encoding: "utf8" })
  });

  await fse.copy(path.join(__dirname, "./hm/components"), path.join(projectPath, "components"))
  await fse.copy(path.join(__dirname, "./hm/types"), path.join(projectPath, "types"))
  await fse.copy(path.join(__dirname, "./hm/utils"), path.join(projectPath, "utils"))

  // await fse.copy(indexPath, target, { overwrite: true })

  // 写入搭建Js
  const jsCodePath = path.join(projectPath, "codes.js");
  await fse.ensureFile(jsCodePath)
  await fse.writeFile(jsCodePath, `export default (function(comModules) {
    ${decodeURIComponent(data.allModules?.all)};
    return comModules;
  })({})`, { encoding: "utf8" })

  // tabbar配置
  const tabbarConfig = (data.tabBarJson ?? []).map(item => {
    const { pagePath, ...others } = item
    return {
      id: item.pagePath.split('/')[1],
      ...others,
    }
  })

  // 入口场景
  const entryPageId: string = data.appConfig?.entryPagePath?.split('/')[1];

  // tabbar场景
  const tabbarScenes: string[] = data.appConfig.pages.filter(p => 
    (data.tabBarJson || []).some(
      (b) => b?.pagePath === p
    )
  ).map(p => p.split('/')[1])

  // 普通场景
  const normalScenes: string[] = data.appConfig.pages.filter(p => 
    !(data.tabBarJson || []).some(
      (b) => b?.pagePath === p
    )
  ).map(p => p.split('/')[1])

  const entryPath = path.join(projectPath, "./pages/Index.ets");
  await fse.copy(path.join(__dirname, "./hm/pages/Index.ets"), entryPath);
  
  let entryFileContent = await fse.readFile(entryPath, 'utf-8')

  entryFileContent = handleEntryCode(entryFileContent, {
    normalScenes,
    tabbarScenes,
    tabbarConfig,
    entryPageId
  })
  await fse.writeFile(entryPath, entryFileContent, 'utf-8')
}

