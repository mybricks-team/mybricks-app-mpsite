import { getAllModulesJsCode, getPageCssCode } from "../getAllModules";
import axios from "axios";
import { BaseJson } from "./base";
import { Css } from "./utils";

export class GetHarmonyJson extends BaseJson {
  constructor() {
    super();
  }

  getJson = async ({ toJson, comlibs, events = {} }) => {
    const { pages, fxFrames, depModules, pageCssMap, pageAliasMap, globalVarMap } =
      await this.initJson({
        toJson,
        events,
        comlibs,
      });


    // popup已经被包含到pages里了，所以不要重复提取
    const forAllModules = [...(fxFrames ?? [])].map((j) => ({ pageToJson: j }));
    // 提取 js计算 连接器 等组件，并删除 pages, popups,fxFrames中的代码
    let allModules = await getAllModulesJsCode(
      [...pages, ...forAllModules],
      toJson.plugins,
      {
        isHarmony: true,
      }
    );

    // 最后再清理一次 json
    // 最后再清理一次 json
    // 最后再清理一次 json
    this.cleanPagesFromJson(this.json);

    const params = {
      ...this.json,
      allModules,
      depModules,
      pageAliasMap,
      globalVarMap
    };

    console.warn("toJson2Json", params);
    return params;
  };
}
