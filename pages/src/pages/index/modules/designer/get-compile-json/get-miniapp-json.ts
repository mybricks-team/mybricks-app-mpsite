import { getAllModulesJsCode, getPageCssCode } from "../getAllModules";
import axios from "axios";
import { BaseJson } from "./base";
import { Css } from "./utils";

export class GetMiniappJson extends BaseJson {
  constructor() {
    super();
  }

  getJson = async ({ toJson, ci, status, comlibs, events = {} }) => {
    const { pages, fxFrames, depModules, pageCssMap, pageAliasMap } =
      await this.initJson({
        toJson,
        events,
        comlibs,
      });

    pages.forEach((item) => {
      const { id } = item;

      let pageCssContent: any = [];
      const cssMap = pageCssMap[id];
      Css.forEachCssMap(cssMap, (key, selector, css) => {
        if (!selector && typeof css === "string") {
          pageCssContent.push(transformStyleToCss(css));
        } else {
          if (selector.includes(key)) {
            pageCssContent.push(`
              ${selector} {
                ${transformStyleToCss(css)}
              }
              `);
          } else {
            pageCssContent.push(`
            .${key} ${selector} {
              ${transformStyleToCss(css)}
            }
            `);
          }
        }
      });
      item.cssContent = pageCssContent.join("\n");
    });

    // popup已经被包含到pages里了，所以不要重复提取
    const forAllModules = [...(fxFrames ?? [])].map((j) => ({ pageToJson: j }));
    // 提取 js计算 连接器 等组件，并删除 pages, popups,fxFrames中的代码
    let allModules = await getAllModulesJsCode(
      [...pages, ...forAllModules],
      toJson.plugins
    );

    const allComponentsMap = await getAllComponents(comlibs, toJson);
    // 把所有组件的Css文件提取出来
    const allComponentsCss = await getAllComponentsCss(allComponentsMap);

    // 最后再清理一次 json
    // 最后再清理一次 json
    // 最后再清理一次 json
    this.cleanPagesFromJson(this.json);

    const params = {
      ...this.json,
      allModules,
      ci,
      status,
      allComponents: {
        map: allComponentsMap,
        css: allComponentsCss,
      },
      depModules,
      pageAliasMap,
    };

    console.warn("toJson2Json", params);
    return params;
  };
}

async function getAllComponentsCss(componentsMap) {
  let allCssContent = "";
  Object.keys(componentsMap).forEach((nameAndVer) => {
    const { css } = componentsMap[nameAndVer];
    if (css) {
      allCssContent += decodeURIComponent(css);
    }
  });

  const miniCss = new window.CleanCSS().minify(allCssContent);
  return miniCss.styles;
}

async function getAllComponents(comlibs, toJSON) {
  const libs = await genLazyloadComs(comlibs, toJSON);

  let componentRuntimeMap = {};

  libs.forEach((lib) => {
    if (lib.componentRuntimeMap) {
      componentRuntimeMap = Object.assign(
        componentRuntimeMap,
        lib.componentRuntimeMap
      );
    }
  });
  return componentRuntimeMap;
}

/**
 * @description 按需加载组件
 * @param comlibs
 * @param toJSON
 * @returns
 */
const genLazyloadComs = async (comlibs, toJSON) => {
  const curComLibs = JSON.parse(JSON.stringify(comlibs));
  const mySelfComMap = {};
  comlibs.forEach((comLib) => {
    if (comLib?.defined && Array.isArray(comLib.comAray)) {
      comLib.comAray.forEach((com) => {
        mySelfComMap[`${com.namespace}@${com.version}`] = true;
      });
    }
  });

  /**
   * 过滤掉 render-web 内置的组件
   */
  const ignoreNamespaces = [
    "mybricks.core-comlib.fn",
    "mybricks.core-comlib.var",
    "mybricks.core-comlib.type-change",
    "mybricks.core-comlib.connector",
    "mybricks.core-comlib.frame-input",
    "mybricks.core-comlib.frame-output",
    "mybricks.core-comlib.scenes",
    "mybricks.core-comlib.defined-com",
    "mybricks.core-comlib.module",
    "mybricks.core-comlib.selection",
    "mybricks.core-comlib.group",
    "mybricks.core-comlib.service",
  ];

  let definedComsDeps = [];
  let modulesDeps = [];

  if (toJSON.definedComs) {
    Object.keys(toJSON.definedComs).forEach((key) => {
      definedComsDeps = [
        ...definedComsDeps,
        ...toJSON.definedComs[key].json.deps,
      ];
    });
  }

  if (toJSON.modules) {
    Object.keys(toJSON.modules).forEach((key) => {
      modulesDeps = [...modulesDeps, ...toJSON.modules[key].json.deps];
    });
  }

  let deps = [
    ...(toJSON.scenes || [])
      .reduce((pre, scene) => [...pre, ...scene.deps], [])
      .filter((item) => !mySelfComMap[`${item.namespace}@${item.version}`])
      .filter((item) => !ignoreNamespaces.includes(item.namespace)),
    ...(toJSON.global?.fxFrames || [])
      .reduce((pre, fx) => [...pre, ...fx.deps], [])
      .filter((item) => !mySelfComMap[`${item.namespace}@${item.version}`])
      .filter((item) => !ignoreNamespaces.includes(item.namespace)),
    ...definedComsDeps
      .filter((item) => !mySelfComMap[`${item.namespace}@${item.version}`])
      .filter((item) => !ignoreNamespaces.includes(item.namespace)),
    ...modulesDeps
      .filter((item) => !mySelfComMap[`${item.namespace}@${item.version}`])
      .filter((item) => !ignoreNamespaces.includes(item.namespace)),
  ];

  deps = deps.reduce((accumulator, current) => {
    const existingObject = accumulator.find(
      (obj) => obj.namespace === current.namespace
    );
    if (!existingObject) {
      accumulator.push(current);
    }
    return accumulator;
  }, []);

  if (deps.length) {
    const willFetchComLibs = curComLibs.filter(
      (lib) => !lib?.defined && lib.coms
    );

    const allComLibsRuntimeMap = (
      await Promise.all(
        willFetchComLibs.map((lib) =>
          axios.get(lib.coms, { withCredentials: false })
        )
      )
    ).map((data) => data.data);
    const noThrowError = comlibs.some((lib) => !lib.coms && !lib.defined);

    deps.forEach((component) => {
      let libIndex = allComLibsRuntimeMap.findIndex(
        (lib) => lib[component.namespace + "@" + component.version]
      );
      let curComponent = null;
      if (libIndex !== -1) {
        curComponent =
          allComLibsRuntimeMap[libIndex][
            component.namespace + "@" + component.version
          ];
      } else {
        libIndex = allComLibsRuntimeMap.findIndex((lib) =>
          Object.keys(lib).find((key) => key.startsWith(component.namespace))
        );

        if (libIndex === -1) {
          if (noThrowError) {
            return;
          } else {
            throw new Error(
              `找不到 ${component.namespace}@${component.version} 对应的组件资源`
            );
          }
        }
        curComponent =
          allComLibsRuntimeMap[libIndex][
            Object.keys(allComLibsRuntimeMap[libIndex]).find((key) =>
              key.startsWith(component.namespace)
            )
          ];
      }

      if (!curComponent) {
        if (noThrowError) {
          return;
        } else {
          throw new Error(
            `找不到 ${component.namespace}@${component.version} 对应的组件资源`
          );
        }
      }

      if (!willFetchComLibs[libIndex].componentRuntimeMap) {
        willFetchComLibs[libIndex].componentRuntimeMap = {};
      }
      willFetchComLibs[libIndex].componentRuntimeMap[
        component.namespace + "@" + curComponent.version
      ] = curComponent;
    });
  }

  return curComLibs;
};

const pxRegex = (units = ["px"]) =>
  new RegExp(
    `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${units.join("|")})`,
    "g"
  );
const designWidth = (input) => 375;

const pxToRpxConfigs = {
  platform: "weapp",
  // designWidth: 750,
  designWidth: 375,
  deviceRatio: {
    375: 4 / 2,
    640: 2.34 / 2,
    750: 2 / 2,
    828: 1.81 / 2,
  },
  targetUnit: "rpx",
  rootValue: (input) => 1 / pxToRpxConfigs.deviceRatio[designWidth(input)],
};
const targetUnit = "rpx";

const legacyOptions = {
  root_value: "rootValue",
  unit_precision: "unitPrecision",
  selector_black_list: "selectorBlackList",
  prop_white_list: "propList",
  media_query: "mediaQuery",
  propWhiteList: "propList",
};

function convertLegacyOptions(options) {
  if (typeof options !== "object") return;
  if (
    ((typeof options.prop_white_list !== "undefined" &&
      options.prop_white_list.length === 0) ||
      (typeof options.propWhiteList !== "undefined" &&
        options.propWhiteList.length === 0)) &&
    typeof options.propList === "undefined"
  ) {
    options.propList = ["*"];
    delete options.prop_white_list;
    delete options.propWhiteList;
  }
  Object.keys(legacyOptions).forEach(function (key) {
    if (options.hasOwnProperty(key)) {
      options[legacyOptions[key]] = options[key];
      delete options[key];
    }
  });
}

convertLegacyOptions(pxToRpxConfigs);

const defaults = {
  methods: ["platform", "size"],
  rootValue: 16,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ["*"],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
};

const opts = Object.assign({}, defaults, pxToRpxConfigs);
const onePxTransform = true;
const transUnits = ["px"];
const pxRgx = pxRegex(transUnits);

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

function createPxReplace(
  rootValue,
  unitPrecision,
  minPixelValue,
  onePxTransform
) {
  return function (input) {
    return function (m, $1) {
      if (!$1) return m;
      const pixels = parseFloat($1);
      let val = pixels / rootValue(input, m, $1);
      if (unitPrecision >= 0 && unitPrecision <= 100) {
        val = toFixed(val, unitPrecision);
      }
      return val + targetUnit;
    };
  };
}

const pxReplace = createPxReplace(
  opts.rootValue,
  opts.unitPrecision,
  opts.minPixelValue,
  onePxTransform
)("?");

function transformStyleToCss(obj) {
  if (typeof obj === "string") {
    return obj.replace(pxRgx, pxReplace);
  }
  let result = [];
  Object.keys(obj).forEach((key) => {
    if (key !== "styleEditorUnfold") {
      result.push(`${Css.camelToKebab(key)}: ${Css.px2rpx(obj[key])};`);
    }
  });
  return result.join("\n");
}
