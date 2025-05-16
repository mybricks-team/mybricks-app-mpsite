const Babel = window.Babel as any;
const Terser = window.Terser as any;

const TerserMinify = async (code) => {
  const result = await Terser.minify(code);
  return result.code;
};

/** 目前只编译有限的几个API */
const babelScript = (code) => {
  return Babel.transform(code, {
    presets: ["env", "typescript"], // 设置需要使用的预设（这里使用env预设）
    filename: "types.d.ts",
    // sourceType: 'script', // 这里设置sourceType的值为script，可以让Babel输出常规类型的输出文件
    // plugins: [
    //   Babel.availablePlugins['proposal-optional-chaining'],
    //   Babel.availablePlugins['proposal-nullish-coalescing-operator'],
    //   Babel.availablePlugins['proposal-object-rest-spread']
    // ]
  }).code;
};

/** 将范围内的代码提取出来，用引用的方式使用，剔除重复代码 */
const repeatFnCodeCollector = (() => {
  const repeatIOFnMap = new Map();
  let repeatIOFnCount = 0;

  return {
    /** 收集重复代码 */
    collect: (functionCode) => {
      if (!repeatIOFnMap.has(functionCode)) {
        repeatIOFnMap.set(functionCode, ++repeatIOFnCount);
      }
      return `$n['${repeatIOFnMap.get(functionCode)}']`;
    },
    /** 生成提取的代码 */
    generate: () => {
      let allCodes = "var $n = {};";
      repeatIOFnMap.forEach((id, fn) => {
        allCodes += `$n['${id}'] = ${fn};`;
      });
      return allCodes;
    },
  };
})();

const JS_HEADER = `
function convertObject2Array(input) {
  let result = [];
  Object.keys(input)
    .sort((a, b) => {
      let _a = extractNumbers(a) || 0;
      let _b = extractNumbers(b) || 0;
      return +_a - +_b;
    })
    .forEach((key) => {
      result.push(input[key]);
    });
  return result;
}
function extractNumbers(str) {
  let number = "";
  for (let i = 0; i < str.length; i++) {
    if (!isNaN(parseInt(str[i]))) {
      number += str[i];
    }
  }
  return number;
}
function _execJs (script) {
  return function ({ env, data, inputs, outputs, logger, onError }) {
    const { fns, runImmediate } = data;
    const runJSParams = {
      logger,
      outputs: convertObject2Array(outputs)
    };
    try {
      if (runImmediate) {
        if (env.runtime) {
          script(runJSParams);
        }
      }
      inputs['input']((val) => {
        try {
          script({
            ...runJSParams,
            inputs: convertObject2Array(val)
          });
        } catch (ex) {
          console.error('js计算组件运行错误.', ex);
        }
      });
    } catch (ex) {
      console.error('js计算组件运行错误.', ex);
    }
  }
}`;

const jsCodeCollector = () => {
  const codeMap = new Map();
  let codeKey = 0;
  return {
    /** 收集代码 */
    collect: (functionCode) => {
      if (!codeMap.has(functionCode)) {
        codeMap.set(functionCode, ++codeKey);
        return `$js['${codeMap.get(functionCode)}']`;
      }
    },
    /** 生成提取的代码 */
    generate: () => {
      let allCodes = `
      ${JS_HEADER}
      var $js = {};`;
      codeMap.forEach((id, fn) => {
        allCodes += `$js['${id}'] = ${fn};`;
      });
      return allCodes;
    },
  };
};

/** 根据Json生成所有页面的Js，并按引用删除数据 */
export const getAllModulesJsCode = async (pages, plugins, options = {}) => {
  const { isH5, isHarmony } = options;
  let allModules = ``;

  //解析「连接器」插件并生成到 modules
  let connectorsCode = "";
  plugins["@mybricks/plugins/service"].connectors.forEach((item) => {
    let content = `;comModules['${item.id}'] = {
      id: '${item.id}',
      excludeKeys: ${JSON.stringify(item.excludeKeys)},
      method: '${item.method}',
      input: ${repeatFnCodeCollector.collect(item.input)},
      output: ${repeatFnCodeCollector.collect(item.output)},
      outputKeys: ${JSON.stringify(item.outputKeys)},
      markList: ${JSON.stringify(item.markList)},
      globalParamsFn: ${repeatFnCodeCollector.collect(plugins["@mybricks/plugins/service"].config.paramsFn)},
      globalResultFn: ${repeatFnCodeCollector.collect(plugins["@mybricks/plugins/service"].config.resultFn)},
      globalErrorResultFn: ${repeatFnCodeCollector.collect(plugins["@mybricks/plugins/service"].config.errorResultFn)},
      path: '${item.path}',
      type: '${item.type}',
    };`;

    connectorsCode += content;
  });

  allModules += repeatFnCodeCollector.generate() + connectorsCode;

  //解析 JS计算 + AI组件
  /** 全部代码 */
  let jsCode = JS_HEADER;
  /** 按页面分开的代码 */
  let pagesJsCode = {};
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];
    let json = page?.pageToJson ?? {};
    let jsonComs = getComsFromPageJson(json);

    Object.keys(jsonComs ?? {}).forEach((key) => {
      const pageId = jsonComs[key].pageId;

      try {
        //解析新版「JS计算」并生成到 modules
        if (
          jsonComs[key].def.namespace === "mybricks.taro._muilt-inputJs" ||
          jsonComs[key].def.namespace === "mybricks.core-comlib.js-ai" ||
          jsonComs[key].def.namespace === "mybricks.harmony._muilt-inputJs"
        ) {

          let realJsCode =
            jsonComs[key].model.data?.fns?.code ||
            jsonComs[key].model.data?.fns?.transformCode ||
            jsonComs[key].model.data?.fns;

          if (!realJsCode) {
            return;
          }

          let content = `
            ;const js_${key} = ${decodeURIComponent(realJsCode)};
            comModules['${key}'] = _execJs(js_${key});
            `;

          if (!isH5 && !isHarmony && pageId) {
            // 小程序环境且属于某一个页面的话，需要将js文件分到每一个页面自己的文件下
            if (!pagesJsCode[pageId]) {
              pagesJsCode[pageId] = JS_HEADER;
            }
            pagesJsCode[pageId] += content;
          } else {
            jsCode += content;
          }

          delete jsonComs[key].model.data.inputSchema;
          delete jsonComs[key].model.data.extraLib;
          delete jsonComs[key].model.data.fns;
        }

        // 解析 AI组件
        if (jsonComs[key].def.namespace === "mybricks.taro.ai") {
          const com = jsonComs[key];
          const code = com.model.data._renderCode;

          // 注意，这里要修改这个key，小程序为_key，web为data-key，运行时的AIRender也是两个环境不一样的，目前无法统一，试过了
          if (code) {
            // 有code才生成
            if (!isH5) {
              // 小程序环境
              let content = `
              ;const ui_${key} = (exports, require) => {
                ${decodeURIComponent(com.model.data._renderCode)
                  .replace(/data-com-key/g, "_key")
                  .replace(/data-com-id/g, "_key")}
              };comModules['${key}'] = ui_${key};`;

              if (pageId) {
                if (!pagesJsCode[pageId]) {
                  pagesJsCode[pageId] = JS_HEADER;
                }
                pagesJsCode[pageId] += content;
              } else {
                jsCode += content;
              }
              delete com.model.data._renderCode;
            } else {
              // H5 环境
              com.model.data._renderCode = encodeURIComponent(
                decodeURIComponent(com.model.data._renderCode)
                  .replace(/data-com-key/g, "data-key")
                  .replace(/data-com-id/g, "data-key")
              );
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    });

    // 删除标记
    deleteMarkForComs(jsonComs);
  }

  allModules += jsCode;

  // 删除连接器代码
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];

    let json = page?.pageToJson ?? {};

    let jsonComs = getComsFromPageJson(json);

    let _connectors = Object.keys(jsonComs ?? {}).filter((key) => {
      return (
        ["mybricks.taro._connector"].indexOf(jsonComs[key].def.namespace) !== -1
      );
    });

    for (let j = 0; j < _connectors.length; j++) {
      let key = _connectors[j];

      try {
        delete jsonComs[key].model.data.connector?.script;
        delete jsonComs[key].model.data.connector?.inputSchema;
        delete jsonComs[key].model.data.connector?.outputSchema;
      } catch (e) {
        console.log(e);
      }
    }
  }

  if (isH5) {
    const all = encodeURIComponent(
      await TerserMinify(await babelScript(allModules))
    );

    let result = {
      all,
    };
    return result;
  } else if (isHarmony) {
    let result = {
      all: encodeURIComponent(allModules),
    };
    return result
  } else {
    const all = encodeURIComponent(
      await TerserMinify(await babelScript(allModules))
    );
    const pages = {};

    for (const pageId in pagesJsCode) {
      pages[pageId] = encodeURIComponent(
        await TerserMinify(await babelScript(pagesJsCode[pageId]))
      );
    }

    let result = {
      all,
      pages,
    };
    return result;
  }
};

/** 根据页面Json生成每个页面的CSS，并按引用删除数据 */
export const getPageCssCode = (pageToJson) => {
  let targetStyleContent = [];

  const jsonComs = getComsFromPageJson(pageToJson);

  Object.keys(jsonComs).forEach((key) => {
    let styleAry = jsonComs[key]?.model?.style?.styleAry || [];
    styleAry.forEach((item) => {
      let { selector, css } = item;
      targetStyleContent.push(`
      .${key} ${selector} {
        ${transformStyle(css)} 
      }
      `);
    });

    // delete jsonComs[key]?.model?.style?.styleAry;
  });

  return targetStyleContent.join("\n");
};

function getComsFromPageJson(pageJson) {
  /** 多场景 */
  if (Array.isArray(pageJson?.scenes)) {
    return pageJson?.scenes.reduce((acc, cur) => {
      return {
        ...acc,
        ...addMarkForComsByScene(cur?.coms || {}, cur),
      };
    }, {});
  }
  /** 非多场景 */
  return addMarkForComsByScene(pageJson?.coms, pageJson) ?? {};
}

/** 给所有组件都加上标记，定义归属的页面 */
function addMarkForComsByScene(coms, scene) {
  if (isPageSceneJson(scene)) {
    Object.keys(coms ?? {}).forEach((comKey) => {
      coms[comKey].pageId = scene.id;
    });
  }
  return coms;
}

/** 删除组件的标记 */
function deleteMarkForComs(coms) {
  Object.keys(coms ?? {}).forEach((comKey) => {
    if (coms[comKey].pageId) {
      delete coms[comKey].pageId;
    }
  });
}

/** 判断是否是页面级Json */
function isPageSceneJson(sceneJson) {
  return (
    sceneJson.type !== "popup" &&
    sceneJson.type !== "module" &&
    sceneJson.type !== "fx"
  );
}

function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function px2rpx(value) {
  const regex = /(\d*\.?\d+)px/g;
  const result = value.replace(regex, (match, p1) => {
    const pxValue = parseFloat(p1);
    if (pxValue <= 2) {
      return `${pxValue}px`;
    } else {
      const rpxValue = pxValue * 2;
      return `${rpxValue}rpx`;
    }
  });
  return result;
}

function transformStyle(obj) {
  let result = [];
  Object.keys(obj).forEach((key) => {
    if (key !== "styleEditorUnfold") {
      result.push(`${camelToKebab(key)}: ${px2rpx(obj[key])};`);
    }
  });
  return result.join("\n");
}
