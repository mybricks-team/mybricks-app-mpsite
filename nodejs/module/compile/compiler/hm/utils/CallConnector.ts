import axios from '@ohos/axios'

interface IOptions {
  method: string;
  url: string;
  data: any;
  params: any;
  headers: any;
  [key: string]: any;
}

interface IConfig {
  before: (options: IOptions) => any;
}

const defaultFn = (options: IOptions, ...args: any) => ({
  ...options,
  ...args,
});

const setData = (data, keys, val) => {
  const len = keys.length;
  function dfs(res, index, val) {
    if (!res || index === len) {
      return res;
    }
    const key = keys[index];
    if (Array.isArray(res)) {
      return res.map((item, i) => {
        const curVal = val[i];
        let obj;
        if (curVal === void 0) {
          obj = {};
          val.push(obj);
        } else {
          obj = curVal;
        }
        return dfs(item, index, obj);
      });
    } else {
      if (index === len - 1) {
        val[key] = res[key];
        return res[key];
      }
      res = res[key];
      if (Array.isArray(res)) {
        val[key] = val[key] || [];
      } else {
        val[key] = val[key] || {};
      }
    }
    return dfs(res, index + 1, Array.isArray(val) ? val : val[key]);
  }
  return dfs(data, 0, val);
};

const del = (data, keys) => {
  const len = keys.length;
  function dfs(data, index) {
    if (!data || index === len) return;
    const key = keys[index];
    if (index === len - 1) {
      Reflect.deleteProperty(data, key);
    }
    if (Array.isArray(data)) {
      data.forEach((item) => {
        dfs(item, index);
      });
    } else {
      dfs(data[key], index + 1);
    }
  }
  dfs(data, 0);
};
const getFetch = (connector) => {
  return (params, { then, onError }, config) => {
    const method = connector.method;
    const path = connector.path.trim();
    const headers = connector.headers || {};
    const outputKeys = connector.outputKeys || [];
    const excludeKeys = connector.excludeKeys || [];

    const markList = connector.markList || [];
    if (!markList.length) {
      markList.push({
        title: "默认",
        id: "default",
        predicate: {},
        outputKeys,
        excludeKeys,
      });
    }

    try {
      const url = path;
      /** 全局入参处理 */
      const newParams = connector.globalParamsFn(
        method.startsWith("GET")
          ? { params, url, method, headers }
          : { data: params, url, method, headers }
      );
      newParams.url = newParams.url || url;
      newParams.method = newParams.method || method;
      /** 局部入参处理 */
      const options = connector.input(newParams);

      // 小程序需要兼容 headers => header
      if (options.headers) {
        options.header = options.headers;
        Reflect.deleteProperty(options, "headers");
      }

      // 由于小程序不支持 params，需要将 params 放到 url 上
      if (options.params) {
        let search = Object.keys(options.params)
          .map((key) => `${key}=${options.params[key]}`)
          .join("&");
        options.url =
          (options.url || url).indexOf("?") === -1
            ? `${options.url}?${search}`
            : `${options.url}&${search}`;
        Reflect.deleteProperty(options, "params");
      }

      // /** url 里支持模板字符串 */
      // options.url = (options.url || url).replace(/{(\w+)}/g, (match, key) => {
      //   const param = params[key] || '';
      //   Reflect.deleteProperty(options.params || {}, key);
      //   return param;
      // });

      options.method = options.method || method;

      let curOutputKeys: any = [];
      let curExcludeKeys: any = [];
      let curOutputId = "then";

      config
        .ajax(options)
        .then((response) => {
          console.log("response", response);
          if (response?.statusCode !== 200) {
            return connector.globalErrorResultFn(
              { error: response, response: response, config: {} },
              { throwError: onError }
            );
            // return onError(response.statusCode);
          }

          /** 全局响应值处理 */
          return connector.globalResultFn(
            // { response, config: options },
            { response: response?.data, config: options },
            { throwStatusCodeError: onError, throwError: onError }
          );
        })
        .then((response) => {
          /** 局部响应值处理 */
          const result = connector.output(
            response,
            Object.assign({}, options),
            {
              throwStatusCodeError: onError,
              throwError: onError,
            }
          );

          for (let i = 0; i < markList.length; i++) {
            const {
              id,
              predicate = { key: "", value: undefined },
              excludeKeys,
              outputKeys,
            } = markList[i];

            if (!predicate || !predicate.key || predicate.value === undefined) {
              curOutputKeys = outputKeys;
              curExcludeKeys = excludeKeys;
              curOutputId = id === "default" ? "then" : id;
              break;
            }

            let curResult = result,
              keys = (predicate.key as string).split(".");
            while (curResult && keys.length) {
              curResult = curResult[keys.shift()];
            }

            if (
              !keys.length &&
                (predicate.operator === "="
                  ? curResult === predicate.value
                  : curResult !== predicate.value)
            ) {
              curOutputKeys = outputKeys;
              curExcludeKeys = excludeKeys;
              curOutputId = id === "default" ? "then" : id;
              break;
            }
          }

          return result;
        })
        .then((response) => {
          curExcludeKeys?.forEach((key) => del(response, key.split(".")));

          return response;
        })
        .then((response) => {
          let outputData: any = Array.isArray(response) ? [] : {};
          if (curOutputKeys === void 0 || curOutputKeys.length === 0) {
            outputData = response;
          } else {
            curOutputKeys.forEach((key) => {
              setData(response, key.split("."), outputData);
            });

            /** 当标记单项时，自动返回单项对应的值 */
            if (
              Array.isArray(curOutputKeys) &&
              curOutputKeys.length &&
                (curOutputKeys.length > 1 ||
                  !(curOutputKeys.length === 1 && curOutputKeys[0] === ""))
            ) {
              try {
                let cascadeOutputKeys = curOutputKeys.map((key) =>
                key.split(".")
                );
                while (
                  Object.prototype.toString.call(outputData) ===
                    "[object Object]" &&
                  cascadeOutputKeys.every((keys) => !!keys.length) &&
                    Object.values(outputData).length === 1
                ) {
                  outputData = Object.values(outputData)[0];
                  cascadeOutputKeys.forEach((keys) => keys.shift());
                }
              } catch (e) {
                console.log("connector format data error", e);
              }
            }
          }

          then(outputData);
        })
        .catch((error) => {
          console.error("connector err", error);
          return onError(error);
        });
    } catch (error) {
      console.error("connector error", error);
      return onError(error);
    }
  };
};

function isPlainObject(value) {
  if (typeof value !== "object" || value === null) return false;

  let proto = Object.getPrototypeOf(value);
  if (proto === null) return true; // 没有原型的对象也视为普通对象

  // 检查对象是否是由Object构造函数创建的
  return proto === Object.prototype;
}

export function call(
  connector: Record<string, unknown>,
  params: any,
  config?: IConfig
) {
  return new Promise((resolve, reject) => {
    try {
      const fn = getFetch(connector);
      const { before = defaultFn } = config || {};

      // 如果 params 不是 对象，则转换为空对象
      if (!isPlainObject(params)) {
        params = {};
      }

      fn(
        params,
        { then: resolve, onError: reject },
        {
          ajax(options: IOptions) {
            let _options = before({ ...options }) || options;
            //
            // if (
            //   _options.header &&
            //     _options.header["Content-Type"] === "multipart/form-data"
            // ) {
            //   const formData = new FormData();
            //   Object.keys(_options.data ?? {}).forEach((key) => {
            //     formData.append(key, _options.data[key]);
            //   });
            //   _options.data = formData;
            //   // 删除 Content-Type 以便浏览器自动设置正确的 boundary
            //   delete _options.header["Content-Type"];
            // }

            return axios(_options)
              .then(res => {
                //兼容
                //@ts-ignore
                res.statusCode = res.status
                return res;
              })
              .catch((error) => reject(error));
          },
        }
      );
    } catch (ex) {
      console.error("连接器script错误", ex);
      reject("连接器script错误.");
    }
  });
}

export const genCallConnector = (connectorDefinitions) => (connector, params) => {
  return call(connectorDefinitions[connector?.id], params)
}