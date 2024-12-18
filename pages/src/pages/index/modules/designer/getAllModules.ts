const Babel = window.Babel as any;
const Terser = window.Terser as any;

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
      return `$n['${repeatIOFnMap.get(functionCode)}']`
    },
    /** 生成提取的代码 */
    generate: () => {
      let allCodes = 'var $n = {};';
      repeatIOFnMap.forEach((id, fn) => {
        allCodes += `$n['${id}'] = ${fn};`;
      })
      return allCodes
    }
  }
})();

/** 根据Json生成所有页面的Js，并按引用删除数据 */
export const getAllModulesJsCode = async (pages, plugins, config = {}) => {
  const { isH5 } = config;
  let allModules = `
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
  }
`;

  let connectorsCode = '';

  //解析「连接器」插件并生成到 modules
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
    }`;

    connectorsCode += content;
  });

  allModules += repeatFnCodeCollector.generate() + connectorsCode;

  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];

    let json = page?.pageToJson ?? {};

    let jsonComs = getComsFromPageJson(json);

    //解析新版「JS计算」并生成到 modules
    Object.keys(jsonComs ?? {})
      .filter((key) => {
        return (
          ["mybricks.taro._muilt-inputJs"].indexOf(
            jsonComs[key].def.namespace
          ) !== -1
        );
      })
      .forEach((key) => {
        try {
          /** JS计算的格式变来变去的，兼容一下 */
          // let realJsCode = jsonComs[key].model.data?.fns?.code || jsonComs[key].model.data?.fns;
          // let realJsCode;

          // if (
          //   typeof jsonComs[key].model.data?.fns === "object" &&
          //   !!jsonComs[key].model.data?.fns?.transformCode
          // ) {
          //   realJsCode = jsonComs[key].model.data?.fns?.transformCode;
          // } else {
          //   realJsCode = jsonComs[key].model.data?.fns;
          // }

          let realJsCode = jsonComs[key].model.data?.fns?.code || jsonComs[key].model.data?.fns?.transformCode || jsonComs[key].model.data?.fns;

          if (!realJsCode) {
            return;
          }

          let moduleContent = `
            ;const js_${key} = ${decodeURIComponent(realJsCode)};
            comModules['${key}'] = _execJs(js_${key});
            `;

          //   let moduleContent = `
          // ;comModules['${key}'] = function ({ env, data, inputs, outputs, logger, onError }) {

          //   const { fns, runImmediate } = data;
          //   const script = ${decodeURIComponent(realJsCode)};
          //   const runJSParams = {
          //     outputs: convertObject2Array(outputs)
          //   };
          //   try {
          //     if (runImmediate) {
          //       if (env.runtime) {
          //         script(runJSParams);
          //       }
          //     }
          //     inputs['input']((val) => {
          //       try {
          //         script({
          //           ...runJSParams,
          //           inputs: convertObject2Array(val)
          //         });
          //       } catch (ex) {
          //         console.error('js计算组件运行错误.', ex);
          //       }
          //     });
          //   } catch (ex) {
          //     console.error('js计算组件运行错误.', ex);
          //   }
          // }
          // `;

          allModules += moduleContent;

          delete jsonComs[key].model.data.fns;
        } catch (e) {
          console.log(e);
        }
      });
  }

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

    
  // 生成ai组件代码
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];

    let json = page?.pageToJson ?? {};

    let jsonComs = getComsFromPageJson(json);

    Object.keys(jsonComs ?? {}).forEach((key) => {
      if (jsonComs[key].def.namespace === "mybricks.taro.ai") {
        const com = jsonComs[key];
        const code = com.model.data._renderCode;

        // 注意，这里要修改这个key，小程序为_key，web为data-key，运行时的AIRender也是两个环境不一样的，目前无法统一，试过了
        if (code) { // 有code才生成
          if (!isH5) {  // 小程序环境
            let moduleContent = `
            ;const ui_${key} = (exports, require) => {
              ${decodeURIComponent(com.model.data._renderCode).replace(/data-com-key/g, '_key')}
            };comModules['${key}'] = ui_${key};` 
            
            allModules += moduleContent;
            delete com.model.data._renderCode;
          } else { // H5 环境
            com.model.data._renderCode = encodeURIComponent(
              decodeURIComponent(com.model.data._renderCode).replace(/data-com-key/g, 'data-key')
            );
          }
        }
      }
    });
  }

  const miniJScode = await Terser.minify(babelScript(allModules));
  // 生成所有动态的js逻辑
  return encodeURIComponent(miniJScode.code);
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
        ...(cur?.coms || {}),
      };
    }, {});
  }
  /** 非多场景 */
  return pageJson?.coms ?? {};
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
