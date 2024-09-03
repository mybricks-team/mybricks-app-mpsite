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

/** 根据Json生成所有页面的Js，并按引用删除数据 */
export const getAllModulesJsCode = async (pages, plugins) => {
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

  //解析「连接器」插件并生成到 modules
  plugins["@mybricks/plugins/service"].connectors.forEach((item) => {
    let content = `;comModules['${item.id}'] = {
      id: '${item.id}',
      excludeKeys: ${JSON.stringify(item.excludeKeys)},
      method: '${item.method}',
      input: ${eval(`(${item.input})`)},
      output: ${eval(`(${item.output})`)},
      outputKeys: ${JSON.stringify(item.outputKeys)},
      markList: ${JSON.stringify(item.markList)},
      globalParamsFn: ${eval(`(${plugins["@mybricks/plugins/service"].config.paramsFn})`)},
      globalResultFn: ${eval(`(${plugins["@mybricks/plugins/service"].config.resultFn})`)},
      path: '${item.path}',
      type: '${item.type}',
    }`;

    allModules += content;
  });

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

          let realJsCode = jsonComs[key].model.data?.fns?.transformCode || jsonComs[key].model.data?.fns?.code || jsonComs[key].model.data?.fns;

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

    delete jsonComs[key]?.model?.style?.styleAry;
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
