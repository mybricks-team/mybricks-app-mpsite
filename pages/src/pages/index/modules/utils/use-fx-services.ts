import React, { useCallback, useMemo, useRef } from "react";
import axios from "axios";

interface DebugParams {
  fileId: string | number;
  database: any;
  toJSON: ServiceToJson;
}

interface ServiceToJson {
  /** 服务 Fx 的数据 */
  frames?: any[];
  /** 插件数据，主要为 Http 接口的插件数据 */
  plugins?: Record<string, any>;
}

export const useFxServices = (
  { runtimeApiPrefix = "/runtime" } = {
    runtimeApiPrefix: "/runtime",
  }
) => {
  const scopeIdRef = useRef(null);

  const debugErrMessageRef = useRef("");

  /**
   * @param params.toJSON
   *
   * @example
   */
  const serviceDebug = useCallback(
    ({ database, fileId, toJSON }: DebugParams) => {
      return new Promise((resolve, reject) => {
        axios
          .post("/paas/api/project/service/push", {
            target: "debug",
            version: "1.0.0",
            fileId,
            json: toJSON,
            database,
          })
          .then((res) => {
            debugErrMessageRef.current = "";
            scopeIdRef.current = res.data.data.scopeId;
            resolve("");
          })
          .catch((err) => {
            let message = "";
            if (err?.response && err.response.status === 404) {
              message = "调试服务异常：找不到调试服务，请联系平台管理员";
            } else {
              message = `调试服务异常：${err?.response?.data?.message ?? err?.message ?? "未知错误"}`;
            }
            debugErrMessageRef.current = message;
            resolve("");
          });
      });
    },
    []
  );

  const callServiceFx = useCallback(
    ({ params, id }: { params: string; id: string }) => {
      return new Promise((resolve, reject) => {
        if (debugErrMessageRef.current) {
          return reject(new Error(debugErrMessageRef.current));
        }

        axios
          .post(
            `${runtimeApiPrefix}/debug/start/${scopeIdRef.current}/${id}`,
            { params },
            { headers: { "x-mybricks-target": "debug" } }
          )
          .then((res) => {
            if (res?.data?.code === 1) {
              resolve(res.data.data);
            } else {
              reject(res?.data?.message ?? "未知错误");
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    [runtimeApiPrefix]
  );

  const getServiceOutline = useCallback(() => {
    return [
      {
        catalogId: "httpServiceWithInterceptor",
        title: "服务Fx",
        adder() {
          return [
            {
              title: "服务Fx",
              type: "frame",
              debuggable: true,
              inputs: [
                {
                  id: "request",
                  title: "参数",
                  editable: true,
                  schema: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                      },
                    },
                    editable: true,
                  },
                },
              ],
              outputs: [
                {
                  id: "response",
                  title: "成功返回",
                  editable: true,
                  // wrap: {
                  //   type: '_service_response'
                  // },
                  schema: {
                    type: "follow",
                    editable: true,
                  },
                },
                {
                  id: "onError",
                  title: "发生错误",
                  editable: true,
                  schema: {
                    type: "follow",
                    editable: true,
                  },
                },
              ],
            },
          ];
        },
      },
    ];
  }, []);

  return {
    serviceDebug,
    getServiceOutline,
    callServiceFx,
  };
};
