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

const handlePageCode = (page: ReturnType<typeof toHarmonyCode>[0]) => {
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
        AppCommonHeader()
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
      // 页面
      content = handlePageCode(page);
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

  /**
   * [TODO]
   * 1. js计算，写文件
   * 2. 拼 EntryView 模版
   * 
   * page文件名 Page_{场景ID}.ets
   */

}

