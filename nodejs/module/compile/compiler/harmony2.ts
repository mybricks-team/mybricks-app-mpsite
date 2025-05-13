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

  pageCode.forEach(({ path: relativePath, content }) => {
    fse.outputFileSync(path.join(projectPath, relativePath), content, { encoding: "utf8" })
  })

  const componentPath = path.join(__dirname, "./hm/components");

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

