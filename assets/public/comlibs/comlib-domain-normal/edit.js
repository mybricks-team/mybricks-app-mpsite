!function(t, e) {
  "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.MybricksComDef = e() : t.MybricksComDef = e()
}(self, ( () => ( () => {
  var __webpack_modules__ = {
      6125: (t, e, n) => {
          "use strict";
          var r, o, i, a, c, u, s;
          n.d(e, {
              $_: () => s,
              Ks: () => r,
              Tf: () => o,
              fu: () => a
          }),
          function(t) {
              t.STRING = "string",
              t.NUMBER = "number",
              t.DATETIME = "datetime",
              t.JSON = "json",
              t.ENUM = "enum",
              t.RELATION = "relation",
              t.MAPPING = "mapping",
              t.SYS_USER = "SYS_USER",
              t.SYS_ROLE = "SYS_ROLE",
              t.SYS_ROLE_RELATION = "SYS_ROLE_RELATION",
              t.CALC = "calc"
          }(r || (r = {})),
          function(t) {
              t.VARCHAR = "varchar",
              t.BIGINT = "bigint",
              t.MEDIUMTEXT = "mediumtext"
          }(o || (o = {})),
          function(t) {
              t.AND = "AND",
              t.OR = "OR"
          }(i || (i = {})),
          function(t) {
              t.EQUAL = "=",
              t.NOT_EQUAL = "<>",
              t.LIKE = "LIKE",
              t.NOT_LIKE = "NOT LIKE",
              t.IN = "IN",
              t.NOT_IN = "NOT IN",
              t.GE = ">=",
              t.LE = "<=",
              t.IS_NULL = "IS NULL",
              t.IS_NOT_NULL = "IS NOT NULL"
          }(a || (a = {})),
          function(t) {
              t.ASC = "ASC",
              t.DESC = "DESC"
          }(c || (c = {})),
          function(t) {
              t.ENUM = "ENUM",
              t.CUSTOM = "CUSTOM"
          }(u || (u = {})),
          function(t) {
              t.CURRENT_TIME = "$currentTime"
          }(s || (s = {}))
      }
      ,
      7225: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => r
          });
          const r = {
              ":root": [{
                  title: "规范返回值",
                  type: "switch",
                  desc: "规范即使用{ code: 1, data: xxx }的形式返回数据，否则代表数据值完全自定义",
                  value: {
                      get: function(t) {
                          return t.data.useRegular
                      },
                      set: function(t, e) {
                          t.data.useRegular = e
                      }
                  }
              }]
          }
      }
      ,
      9755: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = t.env
                , n = t.inputs
                , r = t.data;
              n.customResponse((function(t) {
                  var n, o;
                  e.collect("结束 response: ", t),
                  null === (o = null === (n = e.hooks) || void 0 === n ? void 0 : n.onFinished) || void 0 === o || o.call(n, t, !r.useRegular)
              }
              ))
          }
          n.d(e, {
              A: () => r
          })
      }
      ,
      2730: (t, e, n) => {
          "use strict";
          n.d(e, {
              Fo: () => o,
              N9: () => r,
              r_: () => i
          });
          var r = "({ outputs, inputs, env }) => {\n  const [ inputValue0 ] = inputs;\n  const [ output0 ] = outputs;\n  output0(inputValue0);\n}"
            , o = "({ outputs, env }) => {\n  const [ output0 ] = outputs;\n  output0(0);\n}"
            , i = "/**\n* @parma inputs: any[] 输入项\n* @parma outputs: any[] 输出项\n* @parma env: {\n*   executeSql: ( sql: string) => { rows: any[] | any }, // 执行 SQL\n*   genUniqueId: () => number, // 生成递增的唯一 ID\n*   getEntityName: (entityName: string) => string, // 获取实体表名，生成 SQL 语句时需要\n* } 环境变量\n*\n* 例子\n* ({ inputs, outputs, env }) => {\n*   const [ inputValue0, inputValue1 ] = inputs;\n*   const [ output0, output1, output2 ] = outputs;\n*   const res = '该值输出给下一个组件使用' + inputValue0\n*   \n*   // 向输出项 (output0) 输出结果\n*   output0(res); \n\n*   // 多输出的情况\n*   // 向输出项 (output1) 输出输入项0的值\n*   // output1(inputValue0); \n*   // 向输出项 (output2) 输出输入项1的值\n*   // output2(inputValue1);\n*\n*   // 调用环境变量上方法查询数据库\n*   // 请注意: INSERT 语句返回类型为 { rows: object }; SELECT 语句返回类型为 { rows: object[] }\n*   // const data = env.executeSql('SELECT * FORM ' + env.getEntityName(table_name)); \n* }\n*/"
      }
      ,
      4945: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
          "use strict";
          __webpack_require__.d(__webpack_exports__, {
              A: () => __WEBPACK_DEFAULT_EXPORT__
          });
          var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2730);
          const __WEBPACK_DEFAULT_EXPORT__ = {
              "@init": function(t) {
                  var e = t.data
                    , n = t.setAutoRun
                    , r = t.isAutoRun
                    , o = t.output;
                  (!!r && r() || e.runImmediate) && (n(!0),
                  e.runImmediate = !0,
                  o.get("output0").setSchema({
                      type: "number"
                  })),
                  e.fns = e.fns || (e.runImmediate ? _constants__WEBPACK_IMPORTED_MODULE_0__.Fo : _constants__WEBPACK_IMPORTED_MODULE_0__.N9)
              },
              "@inputConnected": function(t, e) {
                  var n = t.data
                    , r = t.output;
                  n.fns === _constants__WEBPACK_IMPORTED_MODULE_0__.N9 && r.get("output0").setSchema({
                      type: "unknown"
                  })
              },
              ":root": [{
                  title: "添加输入项",
                  type: "Button",
                  ifVisible: function(t) {
                      return !t.data.runImmediate
                  },
                  value: {
                      set: function(t) {
                          var e = t.input
                            , n = getIoOrder(e)
                            , r = "input.inputValue".concat(n)
                            , o = "参数".concat(n);
                          e.add(r, o, {
                              type: "follow"
                          }, !0)
                      }
                  }
              }, {
                  title: "添加输出项",
                  type: "Button",
                  value: {
                      set: function(t) {
                          var e = t.output
                            , n = getIoOrder(e)
                            , r = "output".concat(n)
                            , o = "输出项".concat(n);
                          e.add({
                              id: r,
                              title: o,
                              schema: {
                                  type: "unknown"
                              },
                              editable: !0,
                              deletable: !0
                          })
                      }
                  }
              }, {
                  type: "code",
                  options: function(t) {
                      return t.data,
                      t.output,
                      {
                          babel: !0,
                          comments: _constants__WEBPACK_IMPORTED_MODULE_0__.r_,
                          theme: "light",
                          minimap: {
                              enabled: !1
                          },
                          lineNumbers: "on",
                          eslint: {
                              parserOptions: {
                                  ecmaVersion: "2020",
                                  sourceType: "module"
                              }
                          },
                          autoSave: !1
                      }
                  },
                  title: "代码编辑",
                  value: {
                      get: function(t) {
                          return t.data.fns
                      },
                      set: function(t, e) {
                          t.data.fns = e
                      }
                  }
              }]
          };
          function updateOutputSchema(output, code) {
              var outputs = {}
                , inputs = {};
              output.get().forEach((function(t) {
                  var e = t.id;
                  outputs[e] = function(t) {
                      try {
                          var n = jsonToSchema(t);
                          output.get(e).setSchema(n)
                      } catch (t) {
                          output.get(e).setSchema({
                              type: "unknown"
                          })
                      }
                  }
              }
              )),
              setTimeout((function() {
                  try {
                      var fn = eval(decodeURIComponent(code.code || code));
                      fn({
                          inputValue: void 0,
                          outputs: convertObject2Array(outputs),
                          inputs: convertObject2Array(inputs),
                          env: {
                              executeSql: function(t) {
                                  return {
                                      rows: []
                                  }
                              },
                              genUniqueId: function() {
                                  return Date.now()
                              },
                              getEntityName: function(t) {
                                  return t
                              },
                              encrypt: function(t) {
                                  return t
                              },
                              decrypt: function(t) {
                                  return t
                              }
                          }
                      })
                  } catch (t) {
                      console.error(t)
                  }
              }
              ))
          }
          function getIoOrder(t) {
              var e = t.get().pop().id;
              return Number(e.replace(/\D+/, "")) + 1
          }
      }
      ,
      9571: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
          "use strict";
          __webpack_require__.d(__webpack_exports__, {
              A: () => __WEBPACK_DEFAULT_EXPORT__
          });
          var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7983)
            , __assign = function() {
              return __assign = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              __assign.apply(this, arguments)
          };
          function __WEBPACK_DEFAULT_EXPORT__(_a) {
              var _b, _c, env = _a.env, data = _a.data, inputs = _a.inputs, outputs = _a.outputs, onError = _a.onError, fns = data.fns, runImmediate = data.runImmediate, isDebug = null === (_b = env.runtime) || void 0 === _b ? void 0 : _b.debug, runJSParams = {
                  outputs: (0,
                  _util__WEBPACK_IMPORTED_MODULE_0__.K)(outputs),
                  env: {
                      executeSql: function(t) {
                          return env.executeSql(t)
                      },
                      genUniqueId: env.genUniqueId,
                      getEntityName: isDebug ? function(t) {
                          return t
                      }
                      : env.getEntityName,
                      encrypt: env.encrypt,
                      decrypt: env.decrypt
                  }
              };
              try {
                  runImmediate && env.runtime && eval(decodeURIComponent(fns.transformCode || fns))(runJSParams),
                  inputs.input((function(val) {
                      var _a;
                      env.collect("执行 JS计算: ", val);
                      try {
                          eval(decodeURIComponent(fns.transformCode || fns))(__assign(__assign({}, runJSParams), {
                              inputs: (0,
                              _util__WEBPACK_IMPORTED_MODULE_0__.K)(val)
                          })),
                          env.collect("执行 JS计算 结束: ", val)
                      } catch (t) {
                          null == onError || onError(t.message),
                          env.edit ? console.error("js计算组件运行错误.", t) : null === (_a = env.logger) || void 0 === _a || _a.error("".concat(t))
                      }
                  }
                  ))
              } catch (t) {
                  null == onError || onError(t.message),
                  env.edit ? console.error("js计算组件运行错误.", t) : null === (_c = env.logger) || void 0 === _c || _c.error("".concat(t))
              }
          }
      }
      ,
      7983: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = [];
              return Object.keys(t).sort((function(t, e) {
                  var n, r;
                  return +((null === (n = null == t ? void 0 : t.match(/\d+/g)) || void 0 === n ? void 0 : n[0]) || 0) - +((null === (r = null == e ? void 0 : e.match(/\d+/g)) || void 0 === r ? void 0 : r[0]) || 0)
              }
              )).forEach((function(n) {
                  e.push(t[n])
              }
              )),
              e
          }
          n.d(e, {
              K: () => r
          })
      }
      ,
      8892: (t, e, n) => {
          "use strict";
          n.d(e, {
              Bn: () => o,
              kJ: () => r,
              yE: () => i
          });
          var r = {
              HEADERS: "headers"
          }
            , o = 2
            , i = 3
      }
      ,
      3607: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => a
          });
          var r = n(8892)
            , o = {
              type: "any"
          }
            , i = "then";
          const a = {
              "@init": function(t) {
                  var e = t.data
                    , n = t.setDesc
                    , r = t.setAutoRun
                    , o = t.isAutoRun;
                  e.connectorConfig = e.connectorConfig || {},
                  (!!o && o() || e.immediate) && (r(!0),
                  e.immediate = !0),
                  n("（连接器为空）")
              },
              "@connectorUpdated": function(t, e) {
                  var n = t.data
                    , r = t.input
                    , o = t.output
                    , i = t.setDesc
                    , a = (t.setAutoRun,
                  t.isAutoRun,
                  e.connector);
                  n.connector && a.id === n.connector.id && (u({
                      data: n,
                      input: r,
                      output: o
                  }, a),
                  i("已选择：".concat(n.connector.title)))
              },
              "@connectorRemoved": function(t, e) {
                  var n, r = t.data, a = t.input, c = t.output, u = t.setDesc, s = (t.setAutoRun,
                  t.isAutoRun,
                  e.connector);
                  r.connector && s.id === r.connector.id && (r.globalMock = !1,
                  r.connector = void 0,
                  null === (n = a.get("call")) || void 0 === n || n.setSchema(o),
                  r.outputSchema = o,
                  r.mockOutputId = i,
                  c.get().forEach((function(t) {
                      "then" === t.id ? c.get(t.id).setSchema(o) : "catch" !== t.id && c.remove(t.id)
                  }
                  )),
                  u("".concat(s.title, " 已失效")))
              },
              ":root": [{
                  title: "连接器",
                  type: "_connectorSelect",
                  value: {
                      get: function(t) {
                          return t.data.connector
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.input
                            , o = t.output
                            , i = t.setDesc;
                          u({
                              data: n,
                              input: r,
                              output: o
                          }, e),
                          i("已选择：".concat(n.connector.title))
                      }
                  }
              }, {
                  title: "输出请求头(Headers)",
                  type: "switch",
                  value: {
                      get: function(t) {
                          return t.data.outputHeaders
                      },
                      set: function(t, e) {
                          var n = t.data
                            , o = t.output;
                          e ? (o.add(r.kJ.HEADERS, "请求头输出项", {
                              type: "object",
                              properties: {}
                          }),
                          n.outputHeaders = !0) : (o.remove(r.kJ.HEADERS),
                          n.outputHeaders = !1)
                      }
                  }
              }, {
                  title: "数据模拟（调试时）",
                  type: "switch",
                  value: {
                      get: function(t) {
                          return t.data.mock
                      },
                      set: function(t, e) {
                          t.data.mock = e
                      }
                  }
              }, {
                  title: "模拟输出项（调试时）",
                  description: "开启数据模拟时，根据所选输出项类型进行模拟",
                  type: "select",
                  options: function(t) {
                      var e = t.output;
                      return {
                          get options() {
                              return e.get().map((function(t) {
                                  return {
                                      label: t.title,
                                      value: t.id
                                  }
                              }
                              ))
                          }
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.mockOutputId || i
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.output;
                          n.mockOutputId = e,
                          n.outputSchema = r.get(e).schema || o
                      }
                  }
              }, {}, {
                  title: "动态配置",
                  type: "switch",
                  value: {
                      get: function(t) {
                          return t.data.showDynamicConfig
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.configs;
                          e ? r.add({
                              id: "dynamicConfig",
                              title: "连接器",
                              schema: {
                                  type: "object"
                              },
                              binding: "data.dynamicConfig",
                              editor: {
                                  type: "_connectorSelect"
                              }
                          }) : r.remove("dynamicConfig"),
                          n.showDynamicConfig = e
                      }
                  }
              }]
          };
          function c(t) {
              return t && ["object", "array", "number", "string", "boolean", "any", "follow", "unknown"].some((function(e) {
                  return t.type === e
              }
              ))
          }
          function u(t, e) {
              var n = t.input
                , r = t.output
                , a = t.data;
              a.globalMock = e.globalMock,
              a.connector = {
                  id: e.id,
                  title: e.title,
                  type: e.type,
                  connectorName: e.connectorName,
                  script: e.script
              },
              function(t, e) {
                  var n, r, a = t.output, u = t.data, s = t.input.get("call");
                  s && (c(e.inputSchema) ? s.setSchema(e.inputSchema) : s.setSchema(o)),
                  (null === (n = e.markList) || void 0 === n ? void 0 : n.length) ? (a.get().forEach((function(t) {
                      "then" !== t.id && "catch" !== t.id && a.remove(t.id)
                  }
                  )),
                  null === (r = e.markList) || void 0 === r || r.forEach((function(t) {
                      var e = c(t.outputSchema) ? t.outputSchema : o;
                      if ("default" === t.id) {
                          var n = a.get("then");
                          n.setSchema(e),
                          n.setTitle("".concat(t.title, "(标记组)"))
                      } else
                          a.get(t.id) ? a.get(t.id).setSchema(e) : a.add(t.id, "".concat(t.title, "(标记组)"), e)
                  }
                  ))) : a.get().forEach((function(t) {
                      "then" === t.id ? a.get(t.id).setSchema(c(e.outputSchema) ? e.outputSchema : o) : "catch" !== t.id && a.remove(t.id)
                  }
                  ));
                  var l = a.get().find((function(t) {
                      return t.id === u.mockOutputId
                  }
                  ));
                  l ? u.outputSchema = a.get(l.id).schema : (u.mockOutputId = i,
                  u.outputSchema = a.get(i).schema)
              }({
                  input: n,
                  output: r,
                  data: a
              }, e)
          }
      }
      ,
      9391: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => a
          });
          var r = n(8892)
            , o = function() {
              return o = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              o.apply(this, arguments)
          };
          function i(t, e, n) {
              var i = t.env
                , a = t.data
                , c = t.outputs;
              t.logger,
              void 0 === e && (e = {}),
              void 0 === n && (n = {});
              var u = a.connector
                , s = a.dynamicConfig;
              if (u || s)
                  try {
                      var l = u
                        , d = {
                          openMock: a.globalMock || a.mock,
                          outputSchema: a.outputSchema,
                          mockOutputId: a.mockOutputId
                      };
                      s && (l = s,
                      d = {
                          openMock: s.globalMock || a.mock,
                          outputSchema: s.outputSchema,
                          mockOutputId: s.mockOutputId
                      }),
                      i.callConnector(l, e, o(o(o({}, d), n), {
                          onResponseInterception: function(t) {
                              var e;
                              null === (e = c[r.kJ.HEADERS]) || void 0 === e || e.call(c, t.headers || {})
                          },
                          isMultipleOutputs: !0
                      })).then((function(t) {
                          var e, n;
                          c[null !== (e = null == t ? void 0 : t.__OUTPUT_ID__) && void 0 !== e ? e : "then"](null !== (n = null == t ? void 0 : t.__ORIGIN_RESPONSE__) && void 0 !== n ? n : t)
                      }
                      )).catch((function(t) {
                          c.catch(t)
                      }
                      ))
                  } catch (t) {
                      console.error(t),
                      c.catch("执行错误 ".concat(t.message || t))
                  }
              else
                  c.catch("没有选择接口")
          }
          function a(t) {
              var e = t.env
                , n = t.data
                , o = t.inputs
                , a = t.outputs
                , c = t.logger;
              e.runtime && (n.immediate ? i({
                  env: e,
                  data: n,
                  outputs: a,
                  logger: c
              }) : o.call((function(t) {
                  n.callReady |= n.useExternalUrl ? r.Bn : r.yE,
                  function(t) {
                      var e = t.env
                        , n = t.data
                        , o = t.outputs
                        , a = t.params
                        , c = t.logger;
                      n.callReady === r.yE && (n.callReady = r.Bn,
                      i({
                          env: e,
                          data: n,
                          outputs: o,
                          logger: c
                      }, a, n.connectorConfig))
                  }({
                      env: e,
                      data: n,
                      logger: c,
                      params: "object" == typeof t ? t : {},
                      outputs: a
                  })
              }
              )))
          }
      }
      ,
      7528: (t, e, n) => {
          "use strict";
          n.d(e, {
              D: () => a,
              t: () => i
          });
          var r = n(9313)
            , o = n(8305)
            , i = function(t) {
              var e = t.conditions
                , n = t.params
                , a = t.whereJoiner
                , c = t.entityMap
                , u = t.curEntity
                , s = e.filter((function(t) {
                  return t.fieldId
              }
              ))
                , l = [];
              s.forEach((function(t) {
                  var e, a, s = "";
                  if (t.conditions)
                      s = i({
                          conditions: t.conditions,
                          whereJoiner: t.whereJoiner,
                          params: n,
                          entityMap: c,
                          curEntity: u
                      });
                  else {
                      var d = c[t.entityId]
                        , p = null == d ? void 0 : d.fieldAry.find((function(e) {
                          return e.id === t.fieldId
                      }
                      ));
                      if (p) {
                          var f = "".concat(p.name)
                            , m = t.value || "";
                          if (d.id !== u.id) {
                              var v = u.fieldAry.find((function(e) {
                                  var n, r;
                                  return (null === (r = null === (n = e.mapping) || void 0 === n ? void 0 : n.entity) || void 0 === r ? void 0 : r.id) === t.entityId
                              }
                              ))
                                , h = null === (a = null === (e = null == v ? void 0 : v.mapping) || void 0 === e ? void 0 : e.entity) || void 0 === a ? void 0 : a.fieldAry.find((function(e) {
                                  return e.id === t.fieldId
                              }
                              ));
                              f = "MAPPING_".concat((null == v ? void 0 : v.name) || d.name) + ((null == h ? void 0 : h.isPrimaryKey) ? ".MAPPING_".concat((null == v ? void 0 : v.name) || d.name, "_") : ".") + ((null == h ? void 0 : h.name) || p.name)
                          }
                          t.value.startsWith("{") && t.value.endsWith("}") && (m = (0,
                          o.Jt)(n, t.value.substr(1, t.value.length - 2).split(".").slice(1))),
                          s = "".concat(f, " ").concat(t.operator, " ").concat((0,
                          r.ce)(p.dbType, t.operator, m))
                      }
                  }
                  s && l.push(s)
              }
              ));
              var d = "";
              return a || (d = "WHERE "),
              d + "".concat(l.length > 1 ? "(" : "").concat(l.join(" ".concat(a, " "))).concat(l.length > 1 ? ")" : "")
          }
            , a = function(t) {
              var e = t.conditions
                , n = t.entities
                , r = t.params
                , o = (t.isEdit,
              {});
              n.forEach((function(t) {
                  return o[t.id] = t
              }
              ));
              var a = n.find((function(t) {
                  return t.selected
              }
              ));
              if (a) {
                  var c = [];
                  return c.push("DELETE FROM ".concat(a.id)),
                  c.push(i({
                      conditions: [e],
                      params: r,
                      curEntity: a,
                      entityMap: o
                  })),
                  c.join(" ")
              }
          }
      }
      ,
      9313: (t, e, n) => {
          "use strict";
          n.d(e, {
              ce: () => u,
              y2: () => s
          });
          var r = n(6125)
            , o = {
              string: ["varchar", "char", "text", "mediumtext"],
              number: ["int", "bigint"]
          }
            , i = function(t) {
              return o.string.find((function(e) {
                  return e === t || t.includes(e)
              }
              ))
          }
            , a = function(t) {
              return o.number.find((function(e) {
                  return e === t || t.includes(e)
              }
              ))
          }
            , c = function(t, e) {
              return i(t) ? "'".concat(e, "'") : (a(t),
              e)
          }
            , u = function(t, e, n) {
              return [r.fu.LIKE, r.fu.NOT_LIKE].includes(e) ? "'%".concat(n, "%'") : [r.fu.IN, r.fu.NOT_IN].includes(e) ? "(".concat((Array.isArray(n) ? n : String(n).split(",")).map((function(e) {
                  return c(t, e)
              }
              )).join(","), ")") : [r.fu.IS_NOT_NULL, r.fu.IS_NULL].includes(e) ? "" : c(t, n)
          }
            , s = function(t) {
              return i(t) ? "'" : (a(t),
              "")
          }
      }
      ,
      6614: (t, e, n) => {
          "use strict";
          n.d(e, {
              w: () => a
          });
          var r = n(8305)
            , o = function(t, e, n) {
              if (n || 2 === arguments.length)
                  for (var r, o = 0, i = e.length; o < i; o++)
                      !r && o in e || (r || (r = Array.prototype.slice.call(e, 0, o)),
                      r[o] = e[o]);
              return t.concat(r || Array.prototype.slice.call(e))
          }
            , i = function(t, e) {
              if (null == t)
                  return "";
              var n = function(t) {
                  return t < 10 ? "0" + t : t
              }
                , r = t.getFullYear()
                , o = r.toString().substring(2)
                , i = t.getMonth() + 1
                , a = n(i)
                , c = t.getDate()
                , u = n(c)
                , s = t.getHours()
                , l = n(s)
                , d = t.getMinutes()
                , p = n(d)
                , f = t.getSeconds()
                , m = n(f);
              return e.replace(/yyyy/g, r).replace(/yy/g, o).replace(/MM/g, a).replace(/M/g, i).replace(/DD/g, u).replace(/D/g, c).replace(/HH/g, l).replace(/H/g, s).replace(/mm/g, p).replace(/m/g, d).replace(/ss/g, m).replace(/s/g, f)
          }
            , a = function(t, e, n) {
              var a = {};
              e.forEach((function(t) {
                  return a[t.id] = t
              }
              ));
              var c = [];
              t.forEach((function(t) {
                  var n = e.find((function(e) {
                      return e.id === t.entityId
                  }
                  ));
                  if (n) {
                      var r = n.fieldAry.find((function(e) {
                          return e.id === t.fieldId
                      }
                      ));
                      if (r) {
                          var i = "datetime" === r.bizType ? r.showFormat : ["enum", "json"].includes(r.bizType) ? "JSON" : void 0;
                          i && c.push(o(o([], t.fromPath.map((function(t) {
                              return {
                                  key: t.fieldName
                              }
                          }
                          )), !0), [{
                              key: r.name,
                              showFormat: i
                          }], !1))
                      }
                  }
              }
              ));
              var u = function(t, e) {
                  if (e.length && t) {
                      var n = e[0].key;
                      if (1 !== e.length)
                          Array.isArray(t) ? t.forEach((function(t) {
                              u(t, e.slice(1))
                          }
                          )) : u(t[n], e.slice(1));
                      else if (Array.isArray(t))
                          t.forEach((function(t) {
                              if ("JSON" === e[0].showFormat)
                                  try {
                                      t[n] = t[n] ? (0,
                                      r.xL)(t[n], t[n]) : t[n]
                                  } catch (t) {}
                              else
                                  t["_" + n] = t[n],
                                  t[n] = t[n] && e[0].showFormat ? i(new Date(t[n]), e[0].showFormat) : null
                          }
                          ));
                      else if ("JSON" === e[0].showFormat)
                          try {
                              t[n] = t[n] ? (0,
                              r.xL)(t[n], t[n]) : t[n]
                          } catch (t) {}
                      else
                          t["_" + n] = t[n],
                          t[n] = t[n] && e[0].showFormat ? i(new Date(t[n]), e[0].showFormat) : null
                  }
              };
              return Array.from(n || []).map((function(t) {
                  return c.forEach((function(e) {
                      u(t, e)
                  }
                  )),
                  t
              }
              ))
          }
      }
      ,
      8282: (t, e, n) => {
          "use strict";
          n.d(e, {
              O: () => a,
              X: () => c
          });
          var r = n(6125)
            , o = n(9313)
            , i = n(8305)
            , a = function(t) {
              var e = t.entity
                , n = t.conAry
                , a = (t.isEdit,
              t.genUniqueId)
                , c = t.encrypt
                , u = t.data
                , s = t.batch
                , l = "INSERT INTO ".concat(e.id, " ")
                , d = []
                , p = e.fieldAry.filter((function(t) {
                  return t.bizType !== r.Ks.MAPPING
              }
              )).filter((function(t) {
                  return !t.isPrimaryKey || "auto_increment" !== t.extra
              }
              )).map((function(t) {
                  return t.name
              }
              ));
              return (s ? u : [u]).forEach((function(t) {
                  var u = [];
                  e.fieldAry.forEach((function(e) {
                      if (e.bizType !== r.Ks.MAPPING) {
                          var s = n.find((function(t) {
                              return t.to === "/".concat(e.name)
                          }
                          ));
                          if (s) {
                              var l = s.from.split("/").filter(Boolean)
                                , d = (0,
                              i.Jt)(t, l.map((function(t) {
                                  return t
                              }
                              )))
                                , p = (0,
                              o.y2)(e.dbType);
                              null == d ? u.push("null") : Array.isArray(d) || "[object Object]" === Object.prototype.toString.call(d) ? u.push("".concat(p).concat(JSON.stringify(e.useEncrypt ? c(d) : d)).concat(p)) : u.push("".concat(p).concat(e.useEncrypt ? c(d) : d).concat(p))
                          } else
                              e.isPrimaryKey ? "auto_increment" !== e.extra && u.push(String(a())) : "_STATUS_DELETED" === e.name ? u.push("0") : ["_UPDATE_TIME", "_CREATE_TIME"].includes(e.name) || e.bizType === r.Ks.DATETIME && e.defaultValueWhenCreate === r.$_.CURRENT_TIME ? u.push(String(Date.now())) : void 0 !== e.defaultValueWhenCreate && null !== e.defaultValueWhenCreate ? (p = (0,
                              o.y2)(e.dbType),
                              u.push("".concat(p).concat(e.useEncrypt ? c(e.defaultValueWhenCreate) : e.defaultValueWhenCreate).concat(p))) : e.notNull ? u.push("null") : u.push("default")
                      }
                  }
                  )),
                  d.push(u)
              }
              )),
              "".concat(l, "(").concat(p.join(","), ") VALUES ").concat(d.map((function(t) {
                  return "(".concat(t.join(","), ")")
              }
              )).join(", "))
          }
            , c = function(t, e, n, o) {
              var a;
              void 0 === o && (o = !0);
              for (var c = Array.isArray(t) ? t : [t], u = e.fieldAry.filter((function(t) {
                  return n.find((function(e) {
                      return e.to === "/".concat(t.name)
                  }
                  ))
              }
              )), s = 0; s < c.length; s++)
                  for (var l = c[s], d = function(t) {
                      var e = u[t]
                        , c = n.find((function(t) {
                          return t.to === "/".concat(e.name)
                      }
                      ));
                      if (!c)
                          return "continue";
                      var s = c.from.substring(c.from.indexOf("/") + 1).split("/")
                        , d = (0,
                      i.Jt)(l, s);
                      if (null == d) {
                          if (o && e.notNull && !e.defaultValueWhenCreate)
                              throw new Error("请求参数字段 " + s.join(".") + " 不能为空");
                          if (!o && e.notNull && null === d)
                              throw new Error("请求参数字段 " + s.join(".") + " 不能为空");
                          return "continue"
                      }
                      if ((e.dbType === r.Tf.VARCHAR || e.dbType === r.Tf.MEDIUMTEXT) && e.bizType !== r.Ks.ENUM && e.bizType !== r.Ks.JSON && "string" != typeof d && "number" != typeof d)
                          throw new Error("请求参数字段 " + s.join(".") + " 必须为字符串或数字类型");
                      if (e.dbType === r.Tf.BIGINT && "number" != typeof d && parseInt(d) != d)
                          throw new Error("请求参数字段 " + s.join(".") + " 必须为数字类型");
                      if (e.bizType === r.Ks.ENUM) {
                          var p = null !== (a = e.enumValues) && void 0 !== a ? a : [];
                          if (p.length) {
                              var f = d;
                              try {
                                  f = JSON.parse(f)
                              } catch (t) {}
                              if (Array.isArray(f)) {
                                  for (var m = 0; m < f.length; m++)
                                      if (!p.includes(f[m]))
                                          throw new Error("请求参数字段 " + s.join(".") + " 中每一项必须为枚举值 " + p.join("/") + " 其中之一")
                              } else if (!p.includes(String(f)))
                                  throw new Error("请求参数字段 " + s.join(".") + " 必须为枚举值 " + p.join("/") + " 其中之一")
                          }
                      }
                  }, p = 0; p < u.length; p++)
                      d(p)
          }
      }
      ,
      6801: (t, e, n) => {
          "use strict";
          n.d(e, {
              G: () => u
          });
          var r = n(9313)
            , o = n(6125)
            , i = function() {
              return i = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              i.apply(this, arguments)
          }
            , a = function(t, e, n) {
              if (n || 2 === arguments.length)
                  for (var r, o = 0, i = e.length; o < i; o++)
                      !r && o in e || (r || (r = Array.prototype.slice.call(e, 0, o)),
                      r[o] = e[o]);
              return t.concat(r || Array.prototype.slice.call(e))
          }
            , c = function(t) {
              var e = t.conditions
                , n = t.entities
                , i = t.params
                , u = t.whereJoiner
                , s = t.entityMap
                , l = t.curEntity
                , d = t.entityFieldMap
                , p = e.filter((function(t) {
                  return t.fieldId
              }
              )).filter((function(t) {
                  var e, r;
                  if (t.conditions)
                      return !0;
                  if (!(null === (e = t.value) || void 0 === e ? void 0 : e.startsWith("{")) || !(null === (r = t.value) || void 0 === r ? void 0 : r.endsWith("}")))
                      return !![o.fu.IS_NOT_NULL, o.fu.IS_NULL].includes(null == t ? void 0 : t.operator) || void 0 !== (null == t ? void 0 : t.value);
                  var a = t.value.substr(1, t.value.length - 2);
                  if (!new RegExp("^".concat(n.map((function(t) {
                      return t.name
                  }
                  )).join("|"), "\\.")).test(a)) {
                      for (var c = a.split(".").slice(1), u = i, s = void 0, l = 0; l < c.length; l++)
                          if (u = u[c[l]],
                          l === c.length - 1)
                              s = u;
                          else if ("object" != typeof u || null === u)
                              break;
                      return "IN" === t.operator || "NOT IN" === t.operator ? !(Array.isArray(s) && !(null == s ? void 0 : s.length)) && void 0 !== s && "" !== s : void 0 !== s
                  }
                  return !0
              }
              ))
                , f = [];
              p.forEach((function(t) {
                  var e, o, u, p, m;
                  if (t.conditions)
                      m = c({
                          conditions: t.conditions,
                          entities: n,
                          whereJoiner: t.whereJoiner,
                          params: i,
                          entityMap: s,
                          curEntity: l,
                          entityFieldMap: d
                      });
                  else {
                      var v = d[t.entityId + t.fieldId]
                        , h = v.name;
                      if (t.fromPath.length) {
                          var _ = t.fromPath[t.fromPath.length - 1]
                            , y = d[_.entityId + _.fieldId]
                            , g = (null === (o = null === (e = y.mapping) || void 0 === e ? void 0 : e.condition) || void 0 === o ? void 0 : o.startsWith("count(")) && (null === (p = null === (u = y.mapping) || void 0 === u ? void 0 : u.condition) || void 0 === p ? void 0 : p.endsWith(")"));
                          h = "MAPPING_".concat(a(a([], t.fromPath.map((function(t) {
                              return d[t.entityId + t.fieldId].name
                          }
                          )), !0), [g ? "总数" : v.name], !1).join("_"))
                      }
                      var D = t.value || ""
                        , E = !1;
                      if (t.value.startsWith("{") && t.value.endsWith("}")) {
                          var w = t.value.substr(1, t.value.length - 2);
                          if (new RegExp("^".concat(n.map((function(t) {
                              return t.name
                          }
                          )).join("|"), "\\.")).test(w))
                              D = w,
                              E = !0;
                          else
                              for (var b = w.split(".").slice(1), A = i, C = 0; C < b.length; C++)
                                  if (A = A[b[C]],
                                  C === b.length - 1)
                                      D = A;
                                  else if ("object" != typeof A || null === A) {
                                      D = void 0;
                                      break
                                  }
                      }
                      m = "".concat(h, " ").concat(t.operator, " ").concat(E ? D : (0,
                      r.ce)(v.dbType, t.operator, D))
                  }
                  m && f.push(m)
              }
              ));
              var m = "".concat(f.length > 1 ? "(" : "").concat(f.join(" ".concat(u, " "))).concat(f.length > 1 ? ")" : "")
                , v = "";
              return !u && m && (v = "WHERE "),
              v + m
          }
            , u = function(t) {
              var e = t.conditions
                , n = t.entities
                , r = t.params
                , u = t.limit
                , s = t.orders
                , l = void 0 === s ? [] : s
                , d = t.pageNum
                , p = t.fields
                , f = t.showPager
                , m = t.selectCount
                , v = (t.isEdit,
              n.find((function(t) {
                  return t.selected
              }
              )));
              if (v && v.fieldAry.length) {
                  var h = {}
                    , _ = {};
                  n.forEach((function(t) {
                      h[t.id] = t,
                      t.fieldAry.forEach((function(e) {
                          var n, r, i;
                          _[t.id + e.id] = e,
                          t.isSystem && !e.isPrivate && (_[t.id + e.name] = e),
                          (null === (i = null === (r = null === (n = e.mapping) || void 0 === n ? void 0 : n.entity) || void 0 === r ? void 0 : r.fieldAry) || void 0 === i ? void 0 : i.length) && e.mapping.entity.fieldAry.filter((function(t) {
                              return t.bizType === o.Ks.CALC
                          }
                          )).forEach((function(t) {
                              return _[e.mapping.entity.id + t.id] = t
                          }
                          ))
                      }
                      ))
                  }
                  ));
                  var y = []
                    , g = []
                    , D = []
                    , E = [v.id]
                    , w = []
                    , b = function(t) {
                      t.forEach((function(t) {
                          t.conditions ? b(t.conditions) : t.fieldId && (w.push(t),
                          w.push.apply(w, t.fromPath.slice(1).map((function(e, n) {
                              return i(i({}, e), {
                                  fromPath: t.fromPath.slice(0, n + 1)
                              })
                          }
                          ))))
                      }
                      ))
                  };
                  b([e]),
                  l = l.map((function(t) {
                      var e, n;
                      if (t.fieldId)
                          return i(i({}, t), {
                              fromPath: t.fromPath || []
                          });
                      if (t.fieldName) {
                          for (var r = String(t.fieldName).split("."), o = [], a = v, c = function() {
                              if (!a)
                                  return {
                                      value: void 0
                                  };
                              var t = r.shift()
                                , i = a.fieldAry.find((function(e) {
                                  return e.name === t
                              }
                              ));
                              if (!i)
                                  return {
                                      value: void 0
                                  };
                              o.push({
                                  fieldId: i.id,
                                  entityId: a.id,
                                  fieldName: i.name,
                                  fromPath: []
                              }),
                              a = h[null === (n = null === (e = i.mapping) || void 0 === e ? void 0 : e.entity) || void 0 === n ? void 0 : n.id]
                          }; r.length; ) {
                              var u = c();
                              if ("object" == typeof u)
                                  return u.value
                          }
                          if (o.length)
                              return i(i({}, o.pop()), {
                                  order: t.order,
                                  fromPath: o
                              })
                      }
                  }
                  )).filter(Boolean).reduce((function(t, e) {
                      return a(a(a([], t, !0), [e], !1), e.fromPath.slice(1).map((function(t, n) {
                          return i(i({}, t), {
                              fromPath: e.fromPath.slice(0, n + 1)
                          })
                      }
                      )), !0)
                  }
                  ), []);
                  var A = a(a(a([], p, !0), l, !0), w, !0).reduce((function(t, e) {
                      var n = _[e.entityId + e.fieldId]
                        , r = e.fromPath.slice(0, -1);
                      return n.bizType === o.Ks.CALC ? (!n.hasHandle && r.length && (n.hasHandle = !0,
                      n.sql = n.sql.replace(/MAPPING_/g, "MAPPING_".concat(r.map((function(t) {
                          return _[t.entityId + t.fieldId].name
                      }
                      )), "_"))),
                      a(a(a([], t, !0), [e], !1), (n.fields || []).map((function(t) {
                          return i(i({}, t), {
                              fromCalcField: e,
                              fromPath: a(a([], r, !0), t.fromPath, !0)
                          })
                      }
                      )), !0)) : a(a([], t, !0), [e], !1)
                  }
                  ), [])
                    , C = {};
                  A.forEach((function(t) {
                      var e = a(a([], (t.fromPath || []).map((function(t) {
                          return t.fieldId
                      }
                      )), !0), [t.fieldId], !1).join(".");
                      C[e] ? C[e].fromCalcField && !t.fromCalcField && (C[e].fromCalcField = void 0) : C[e] = t
                  }
                  ));
                  var F = (A = Object.values(C)).map((function(t) {
                      var e, n, r;
                      return t.entityId !== v.id || (null === (e = t.fromPath) || void 0 === e ? void 0 : e.length) ? (null === (n = t.fromPath[0]) || void 0 === n ? void 0 : n.entityId) === v.id ? null === (r = t.fromPath[0]) || void 0 === r ? void 0 : r.fieldId : void 0 : t.fieldId
                  }
                  )).filter(Boolean)
                    , S = function(t, e, n, r) {
                      var i = [];
                      return t.forEach((function(t) {
                          var c, u;
                          if (t) {
                              var s = A.filter((function(n) {
                                  return n.fromPath.length === e && n.fromPath[n.fromPath.length - 1].fieldId === t.id
                              }
                              ));
                              if (s.length) {
                                  var l = t.mapping.entity
                                    , d = String(t.mapping.condition)
                                    , f = t.mapping.type
                                    , m = h[l.id]
                                    , v = null;
                                  if ("primary" === f ? v = null !== (c = m.fieldAry.find((function(t) {
                                      return t.isPrimaryKey
                                  }
                                  ))) && void 0 !== c ? c : null : "foreigner" === f && (v = null !== (u = m.fieldAry.find((function(t) {
                                      return "relation" === t.bizType && t.relationEntityId === r.id
                                  }
                                  ))) && void 0 !== u ? u : null),
                                  v) {
                                      var y = S(s.map((function(t) {
                                          return _[t.entityId + t.fieldId]
                                      }
                                      )), e + 1, a(a([], n, !0), [t], !1), m)
                                        , g = d.startsWith("max(") && d.endsWith(")")
                                        , D = "$$"
                                        , E = "";
                                      if ("primary" === f) {
                                          var w = r.fieldAry.find((function(e) {
                                              return ["relation", "SYS_USER", "SYS_ROLE", "SYS_ROLE_RELATION"].includes(e.bizType) && e.relationEntityId === m.id && ("mapping" === t.bizType || e.id === t.id)
                                          }
                                          ))
                                            , b = a(a([], n.map((function(t) {
                                              return t.name
                                          }
                                          )), !0), [t.name], !1).join("_")
                                            , C = []
                                            , F = {};
                                          p.filter((function(n) {
                                              return n.fromPath.find((function(n, o) {
                                                  return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                              }
                                              ))
                                          }
                                          )).forEach((function(n) {
                                              var i = _[n.entityId + n.fieldId]
                                                , a = n.fromPath.findIndex((function(n, o) {
                                                  return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                              }
                                              ));
                                              if (n.fromPath.length - 1 === a) {
                                                  if (![o.Ks.MAPPING].includes(i.bizType)) {
                                                      var c = p.find((function(t) {
                                                          return t.fromPath.length === n.fromPath.length + 1 && t.fromPath[t.fromPath.length - 1].fieldId === i.id
                                                      }
                                                      ));
                                                      C.push("'".concat(c ? "_" : "").concat(i.name, "', ").concat(i.bizType === o.Ks.CALC ? i.sql : i.name))
                                                  }
                                              } else {
                                                  var u = _[n.fromPath[a + 1].entityId + n.fromPath[a + 1].fieldId];
                                                  F[u.name] || (C.push("'".concat(u.name, "', ").concat(u.name, "_JSON")),
                                                  F[u.name] = 1)
                                              }
                                          }
                                          ));
                                          var I = A.filter((function(n) {
                                              return (!n.fromCalcField || n.fromCalcField.fromPath.length < e) && n.fromPath.find((function(n, o) {
                                                  return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                              }
                                              )) && (n.entityId !== m.id || !_[n.entityId + n.fieldId].isPrimaryKey)
                                          }
                                          )).map((function(n) {
                                              var i = _[n.entityId + n.fieldId]
                                                , c = n.fromPath.findIndex((function(n, o) {
                                                  return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                              }
                                              ))
                                                , u = "MAPPING_".concat(a(a([], n.fromPath.map((function(t) {
                                                  return _[t.entityId + t.fieldId].name
                                              }
                                              )), !0), [i.isPrimaryKey && "总数" === n.fieldName ? n.fieldName : i.name], !1).join("_"));
                                              return n.fromPath.length - 1 !== c ? u : [o.Ks.MAPPING].includes(i.bizType) ? void 0 : "".concat(i.bizType === o.Ks.CALC ? i.sql : i.name, " AS ").concat(u)
                                          }
                                          )).filter(Boolean);
                                          E = "LEFT JOIN (SELECT id AS MAPPING_".concat(b, "_id").concat(I.length ? ", ".concat(I.join(", ")) : "").concat(C.length ? ", JSON_OBJECT(".concat(C.join(", "), ") ").concat(t.name, "_JSON") : "", " FROM ").concat(m.name, " ").concat(y.join(" "), " WHERE _STATUS_DELETED = 0) MAPPING_").concat(b, " ON MAPPING_").concat(b, ".MAPPING_").concat(b, "_id = ").concat(r.name, ".").concat(null == w ? void 0 : w.name)
                                      } else if ("foreigner" === f) {
                                          var O = "MAPPING_" + [b = a(a([], n.map((function(t) {
                                              return t.name
                                          }
                                          )), !0), [t.name], !1).join("_"), null == v ? void 0 : v.name].join("_")
                                            , P = []
                                            , k = {};
                                          if (p.filter((function(n) {
                                              return n.fromPath.find((function(n, o) {
                                                  return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                              }
                                              ))
                                          }
                                          )).forEach((function(n) {
                                              var i = _[n.entityId + n.fieldId]
                                                , a = n.fromPath.findIndex((function(n, o) {
                                                  return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                              }
                                              ));
                                              if (n.fromPath.length - 1 === a) {
                                                  var c = p.find((function(t) {
                                                      return t.fromPath.length === n.fromPath.length + 1 && t.fromPath[t.fromPath.length - 1].fieldId === i.id
                                                  }
                                                  ));
                                                  P.push("'".concat(c ? "_" : "").concat(i.name, "', ").concat(i.bizType === o.Ks.CALC ? i.sql : i.name))
                                              } else {
                                                  var u = _[n.fromPath[a + 1].entityId + n.fromPath[a + 1].fieldId];
                                                  k[u.name] || (P.push("'".concat(u.name, "', ").concat(u.name, "_JSON")),
                                                  k[u.name] = 1)
                                              }
                                          }
                                          )),
                                          "-1" === d)
                                              I = A.filter((function(n) {
                                                  var o = _[n.entityId + n.fieldId];
                                                  return (!n.fromCalcField || n.fromCalcField.fromPath.length < e) && n.fromPath.find((function(n, o) {
                                                      return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                                  }
                                                  )) && (n.entityId !== m.id || !o.isPrimaryKey) && o.name !== (null == v ? void 0 : v.name)
                                              }
                                              )).map((function(n) {
                                                  var i = n.fromPath.findIndex((function(n, o) {
                                                      return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                                  }
                                                  ))
                                                    , c = _[n.entityId + n.fieldId]
                                                    , u = "MAPPING_".concat(a(a([], n.fromPath.map((function(t) {
                                                      return _[t.entityId + t.fieldId].name
                                                  }
                                                  )), !0), [c.name], !1).join("_"));
                                                  return n.fromPath.length - 1 === i ? "GROUP_CONCAT(".concat(c.bizType === o.Ks.CALC ? c.sql : c.name, ' SEPARATOR "').concat(D, '") ').concat(u) : c.bizType !== o.Ks.MAPPING ? "GROUP_CONCAT(".concat(u, ' SEPARATOR "').concat(D, '") ').concat(u) : void 0
                                              }
                                              )).filter(Boolean),
                                              E = 'LEFT JOIN (SELECT GROUP_CONCAT(id SEPARATOR "'.concat(D, '") MAPPING_').concat(b, "_id, GROUP_CONCAT(").concat(null == v ? void 0 : v.name, ' SEPARATOR "').concat(D, '") ').concat(O).concat(I.length ? ", ".concat(I.join(", ")) : "").concat(P.length ? ", JSON_ARRAYAGG(JSON_OBJECT(".concat(P.join(", "), ")) ").concat(t.name, "_JSON") : "", " FROM ").concat(m.name, " ").concat(y.join(" "), " WHERE _STATUS_DELETED = 0 GROUP BY ").concat(null == v ? void 0 : v.name, ") MAPPING_").concat(b, " ON MAPPING_").concat(b, ".").concat(O, " = ").concat(r.name, ".id");
                                          else if (g) {
                                              var x = d.substr(4, d.length - 5);
                                              I = A.filter((function(n) {
                                                  var o = _[n.entityId + n.fieldId];
                                                  return (!n.fromCalcField || n.fromCalcField.fromPath.length < e) && n.fromPath.find((function(n, o) {
                                                      return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                                  }
                                                  )) && (n.entityId !== m.id || !o.isPrimaryKey) && o.name !== (null == v ? void 0 : v.name)
                                              }
                                              )).map((function(n) {
                                                  var i = n.fromPath.findIndex((function(n, o) {
                                                      return n.fieldId === t.id && n.entityId === r.id && o + 1 === e
                                                  }
                                                  ))
                                                    , c = _[n.entityId + n.fieldId]
                                                    , u = "MAPPING_".concat(a(a([], n.fromPath.map((function(t) {
                                                      return _[t.entityId + t.fieldId].name
                                                  }
                                                  )), !0), [c.name], !1).join("_"));
                                                  return n.fromPath.length - 1 === i ? "".concat(c.bizType === o.Ks.CALC ? c.sql : c.name, " AS ").concat(u) : c.bizType !== o.Ks.MAPPING ? u : void 0
                                              }
                                              )).filter(Boolean),
                                              E = 'LEFT JOIN (SELECT GROUP_CONCAT(id SEPARATOR "'.concat(D, '") MAPPING_').concat(b, "_id, GROUP_CONCAT(").concat(null == v ? void 0 : v.name, ' SEPARATOR "').concat(D, '") ').concat(O).concat(I.length ? ", ".concat(I.join(", ")) : "").concat(P.length ? ", JSON_ARRAYAGG(JSON_OBJECT(".concat(P.join(", "), ")) ").concat(t.name, "_JSON") : "", " FROM ").concat(m.name, " ").concat(y.join(" "), " WHERE _STATUS_DELETED = 0 AND ").concat(x, " IN (SELECT max(").concat(x, ") FROM ").concat(m.name, " WHERE _STATUS_DELETED = 0 GROUP BY ").concat(v.name, ")) MAPPING_").concat(b, " ON MAPPING_").concat(b, ".").concat(O, " = ").concat(r.name, ".id")
                                          } else
                                              d.startsWith("count(") && d.endsWith(")") && (E = "LEFT JOIN (SELECT ".concat(null == v ? void 0 : v.name, " AS ").concat(O, ", COUNT(id) AS MAPPING_").concat(b, "_总数, JSON_OBJECT('总数', COUNT(id)) ").concat(t.name, "_JSON FROM ").concat(m.name, " ").concat(y.join(" "), " WHERE _STATUS_DELETED = 0 GROUP BY ").concat(null == v ? void 0 : v.name, ") MAPPING_").concat(b, " ON MAPPING_").concat(b, ".").concat(O, " = ").concat(r.name, ".id"))
                                      }
                                      E && i.push(E)
                                  }
                              }
                          }
                      }
                      )),
                      i
                  };
                  E.push.apply(E, S(v.fieldAry.filter((function(t) {
                      var e, n, r;
                      return F.includes(t.id) && (null === (r = null === (n = null === (e = t.mapping) || void 0 === e ? void 0 : e.entity) || void 0 === n ? void 0 : n.fieldAry) || void 0 === r ? void 0 : r.length) && h[t.mapping.entity.id]
                  }
                  )), 1, [], v));
                  var I = []
                    , O = p.map((function(t) {
                      var e = t;
                      if (t.fromPath.length)
                          e = t.fromPath[0];
                      else if ("mapping" === _[t.entityId + t.fieldId].bizType && !p.find((function(e) {
                          var n;
                          return (null === (n = e.fromPath[0]) || void 0 === n ? void 0 : n.fieldId) === t.fieldId
                      }
                      )))
                          return;
                      return I.includes(e.fieldId) ? void 0 : (I.push(e.fieldId),
                      e)
                  }
                  )).filter(Boolean);
                  O.map((function(t) {
                      var e = _[t.entityId + t.fieldId];
                      "mapping" !== e.bizType ? "relation" === e.bizType && p.find((function(e) {
                          var n;
                          return (null === (n = e.fromPath[0]) || void 0 === n ? void 0 : n.fieldId) === t.fieldId
                      }
                      )) ? D.push("".concat(e.name, " AS _").concat(e.name), "".concat(e.name, "_JSON AS ").concat(e.name)) : D.push(e.name) : D.push("".concat(e.name, "_JSON AS ").concat(e.name))
                  }
                  ));
                  var P = c({
                      conditions: [e],
                      entities: n,
                      params: r,
                      entityMap: h,
                      curEntity: v,
                      entityFieldMap: _
                  });
                  if (console.log("whereSql: ", P),
                  y.push("SELECT ".concat(D.join(", "), " FROM ").concat(E.join(" "))),
                  y.push(P),
                  (f || m) && (g.push("SELECT count(*) as total FROM ".concat(E.join(" "))),
                  g.push(P)),
                  m)
                      return ["", g.join(" ")];
                  if (l.length) {
                      var k = [];
                      l.forEach((function(t) {
                          var e, n, r, o, i = _[t.entityId + t.fieldId];
                          if (i)
                              if (t.fromPath.length) {
                                  var c = t.fromPath[t.fromPath.length - 1]
                                    , u = _[c.entityId + c.fieldId]
                                    , s = (null === (n = null === (e = u.mapping) || void 0 === e ? void 0 : e.condition) || void 0 === n ? void 0 : n.startsWith("count(")) && (null === (o = null === (r = u.mapping) || void 0 === r ? void 0 : r.condition) || void 0 === o ? void 0 : o.endsWith(")"));
                                  k.push("MAPPING_".concat(a(a([], t.fromPath.map((function(t) {
                                      return _[t.entityId + t.fieldId].name
                                  }
                                  )), !0), [s ? "总数" : i.name], !1).join("_"), " ").concat(t.order))
                              } else
                                  k.push("".concat(i.name, " ").concat(t.order))
                      }
                      )),
                      k.length && y.push("ORDER BY ".concat(k.join(", ")))
                  }
                  var x = u.value ? String(u.value) : "";
                  if (x && (x.startsWith("{") && x.endsWith("}") ? (x = r[x.slice(x.indexOf(".") + 1, -1)] || 50) && y.push("LIMIT ".concat(x)) : y.push("LIMIT ".concat(x))),
                  d)
                      if (d.startsWith("{") && d.endsWith("}")) {
                          var T = r[d.slice(d.indexOf(".") + 1, -1)];
                          T && y.push("OFFSET ".concat((Number(T) - 1) * Number(x)))
                      } else
                          Number.isNaN(Number(d)) || y.push("OFFSET ".concat((Number(d) - 1) * Number(x)));
                  return [y.join(" "), g.join(" ")]
              }
          }
      }
      ,
      270: (t, e, n) => {
          "use strict";
          n.d(e, {
              $: () => a
          });
          var r = n(7528)
            , o = n(9313)
            , i = n(8305)
            , a = function(t) {
              var e = t.conditions
                , n = t.entities
                , a = t.params
                , c = t.connectors
                , u = (t.isEdit,
              t.encrypt)
                , s = {};
              n.forEach((function(t) {
                  return s[t.id] = t
              }
              ));
              var l = n.find((function(t) {
                  return t.selected
              }
              ));
              if (l) {
                  var d = [];
                  return d.push("UPDATE ".concat(l.id, " SET")),
                  d.push(function(t) {
                      var e = t.entity
                        , n = t.params
                        , r = t.encrypt;
                      return t.connectors.map((function(t, a) {
                          var c = t.from
                            , u = t.to.replace("/", "")
                            , s = e.fieldAry.find((function(t) {
                              return t.name === u
                          }
                          ));
                          if (s) {
                              var l = c.split("/").filter(Boolean)
                                , d = (0,
                              i.Jt)(n, l)
                                , p = (0,
                              o.y2)(s.dbType);
                              return void 0 === d ? "" : "".concat(a ? ", " : "").concat(u, " = ").concat(null === d ? null : "".concat(p).concat(Array.isArray(d) || "[object Object]" === Object.prototype.toString.call(d) ? JSON.stringify(s.useEncrypt ? r(d) : d) : s.useEncrypt ? r(d) : d).concat(p))
                          }
                      }
                      )).filter(Boolean).join("")
                  }({
                      connectors: c,
                      entity: l,
                      params: a,
                      encrypt: u
                  })),
                  d.push((0,
                  r.t)({
                      conditions: [e],
                      params: a,
                      curEntity: l,
                      entityMap: s
                  })),
                  d.join(" ")
              }
          }
      }
      ,
      8305: (t, e, n) => {
          "use strict";
          n.d(e, {
              Jt: () => o,
              xL: () => r
          });
          var r = function(t, e) {
              void 0 === e && (e = {});
              try {
                  return JSON.parse(t)
              } catch (t) {
                  return e
              }
          }
            , o = function(t, e) {
              void 0 === e && (e = []);
              for (var n = t, r = function(t, e, n) {
                  if (n || 2 === arguments.length)
                      for (var r, o = 0, i = e.length; o < i; o++)
                          !r && o in e || (r || (r = Array.prototype.slice.call(e, 0, o)),
                          r[o] = e[o]);
                  return t.concat(r || Array.prototype.slice.call(e))
              }([], e, !0); void 0 !== n && r.length; )
                  n = null == n ? void 0 : n[r.shift()];
              return n
          }
      }
      ,
      7491: (t, e, n) => {
          "use strict";
          n.d(e, {
              UD: () => u,
              ZP: () => s,
              k1: () => c
          });
          var r = n(6125)
            , o = function(t, e, n) {
              if (n || 2 === arguments.length)
                  for (var r, o = 0, i = e.length; o < i; o++)
                      !r && o in e || (r || (r = Array.prototype.slice.call(e, 0, o)),
                      r[o] = e[o]);
              return t.concat(r || Array.prototype.slice.call(e))
          }
            , i = function(t, e, n) {
              return n ? e.name !== n.name ? "实体【".concat(t.name, "】中字段名存在变更，由【").concat(e.name, "】变更为【").concat(n.name, "】") : e.bizType !== n.bizType || e.bizType === n.bizType && e.dbType !== n.dbType ? "实体【".concat(t.name, "】中字段【").concat(e.name, "】类型存在变更，由【").concat(e.typeLabel, "】变更为【").concat(n.typeLabel, "】") : void 0 : "实体【".concat(t.name, "】中字段存在变更，原【").concat(e.name, "】字段已被删除")
          }
            , a = function(t, e) {
              t.forEach((function(t) {
                  t.conditions ? a(t.conditions, e) : t.fieldId && e.push(t.fieldId)
              }
              ))
          }
            , c = function(t, e, n) {
              void 0 === t && (t = []),
              void 0 === n && (n = []);
              var r = t.find((function(t) {
                  return t.selected
              }
              ));
              if (e && r && r.id === e.id) {
                  var o = [];
                  if (a([n], o),
                  e._destroyed)
                      return "实体【".concat(e.name, "】已删除");
                  if (r.name !== e.name)
                      return "实体名存在变更，由【".concat(r.name, "】变更为【").concat(e.name, "】");
                  for (var c = r.fieldAry.filter((function(t) {
                      return o.includes(t.id)
                  }
                  )), u = function(t) {
                      var n = c[t]
                        , o = e.fieldAry.find((function(t) {
                          return t.id === n.id
                      }
                      ))
                        , a = i(r, n, o);
                      if (a)
                          return {
                              value: a
                          }
                  }, s = 0; s < c.length; s++) {
                      var l = u(s);
                      if ("object" == typeof l)
                          return l.value
                  }
              }
          }
            , u = function(t, e, n) {
              var o, c, u = t.find((function(t) {
                  return t.selected
              }
              ));
              if (u && e && u.id === e.id) {
                  if (e._destroyed)
                      return "实体【".concat(e.name, "】已删除");
                  var s = u.fieldAry;
                  if (n) {
                      var l = n.conAry
                        , d = void 0 === l ? [] : l
                        , p = n.conditions
                        , f = void 0 === p ? [] : p
                        , m = []
                        , v = d.map((function(t) {
                          return t.to.slice(1)
                      }
                      ));
                      a([f], m),
                      s = u.fieldAry.filter((function(t) {
                          return m.includes(t.id) || v.includes(t.name)
                      }
                      ))
                  }
                  if (u.name !== e.name)
                      return "实体名存在变更，由【".concat(u.name, "】变更为【").concat(e.name, "】");
                  for (var h = function(t) {
                      var n = s[t]
                        , a = e.fieldAry.find((function(t) {
                          return t.id === n.id
                      }
                      ))
                        , l = i(u, n, a);
                      return l || !a ? {
                          value: l
                      } : n.defaultValueWhenCreate !== a.defaultValueWhenCreate ? {
                          value: "实体【".concat(u.name, "】中字段【").concat(n.name, "】默认值存在变更")
                      } : n.useEncrypt !== a.useEncrypt ? {
                          value: "实体【".concat(u.name, "】中字段【").concat(n.name, "】加密方式存在变更")
                      } : n.notNull !== a.notNull ? {
                          value: "实体【".concat(u.name, "】中字段【").concat(n.name, "】非空判断方式存在变更")
                      } : n.bizType === r.Ks.ENUM && (null === (o = n.enumValues) || void 0 === o ? void 0 : o.join(",")) !== (null === (c = a.enumValues) || void 0 === c ? void 0 : c.join(",")) ? {
                          value: "实体【".concat(u.name, "】中字段【").concat(n.name, "】枚举选项存在变更")
                      } : void 0
                  }, _ = 0; _ < s.length; _++) {
                      var y = h(_);
                      if ("object" == typeof y)
                          return y.value
                  }
              }
          }
            , s = function(t) {
              var e, n, a, c, u, s, l, d, p, f, m, v, h, _, y, g, D = t.entities, E = t.newEntity, w = t.fields, b = void 0 === w ? [] : w, A = t.conditions, C = t.orders, F = void 0 === C ? [] : C;
              if (D.find((function(t) {
                  return t.selected
              }
              )) && E) {
                  var S = D.find((function(t) {
                      return t.id === E.id
                  }
                  ));
                  if (S) {
                      var I = {}
                        , O = []
                        , P = function(t) {
                          t.forEach((function(t) {
                              t.conditions ? P(t.conditions) : t.fieldId && O.push(t)
                          }
                          ))
                      };
                      P([A]),
                      o(o(o([], O, !0), b, !0), F, !0).forEach((function(t) {
                          I[t.entityId] ? I[t.entityId].push(t) : I[t.entityId] = [t]
                      }
                      ));
                      var k = (null === (e = I[E.id]) || void 0 === e ? void 0 : e.map((function(t) {
                          return t.fieldId
                      }
                      ))) || [];
                      if (k.length) {
                          if (E._destroyed)
                              return "实体【".concat(E.name, "】已删除");
                          var x = S.fieldAry.filter((function(t) {
                              return k.includes(t.id)
                          }
                          ));
                          if (S.name !== E.name)
                              return "实体名存在变更，由【".concat(S.name, "】变更为【").concat(E.name, "】");
                          for (var T = function(t) {
                              var e = x[t]
                                , o = E.fieldAry.find((function(t) {
                                  return t.id === e.id
                              }
                              ))
                                , D = i(S, e, o);
                              if (D || !o)
                                  return {
                                      value: D
                                  };
                              if (e.bizType === r.Ks.RELATION && e.relationEntityId !== o.relationEntityId)
                                  return {
                                      value: "实体【".concat(S.name, "】中字段【").concat(e.name, "】所关联的实体存在变更")
                                  };
                              if (e.showFormat !== o.showFormat)
                                  return {
                                      value: "实体【".concat(S.name, "】中字段【").concat(e.name, "】数据格式化方式存在变更")
                                  };
                              if (e.mapping && !o.mapping)
                                  return {
                                      value: "实体【".concat(S.name, "】中字段【").concat(e.name, "】所映射数据存在变更")
                                  };
                              if (e.mapping && o.mapping) {
                                  if (e.mapping.condition !== o.mapping.condition || e.mapping.fieldJoiner !== o.mapping.fieldJoiner || e.mapping.type !== o.mapping.type || (null === (n = e.mapping.entity) || void 0 === n ? void 0 : n.id) !== (null === (a = o.mapping.entity) || void 0 === a ? void 0 : a.id) || (null === (c = e.mapping.entity) || void 0 === c ? void 0 : c.name) !== (null === (u = o.mapping.entity) || void 0 === u ? void 0 : u.name) || (null === (s = e.mapping.entity) || void 0 === s ? void 0 : s.fieldAry.length) !== (null === (l = o.mapping.entity) || void 0 === l ? void 0 : l.fieldAry.length))
                                      return {
                                          value: "实体【".concat(S.name, "】中字段【").concat(e.name, "】所映射数据存在变更")
                                      };
                                  var w = null === (d = e.mapping.entity) || void 0 === d ? void 0 : d.fieldAry.map((function(t) {
                                      return t.id
                                  }
                                  )).sort().join(",")
                                    , b = null === (p = o.mapping.entity) || void 0 === p ? void 0 : p.fieldAry.map((function(t) {
                                      return t.id
                                  }
                                  )).sort().join(",")
                                    , A = null === (f = e.mapping.entity) || void 0 === f ? void 0 : f.fieldAry.map((function(t) {
                                      return t.name
                                  }
                                  )).sort().join(",")
                                    , C = null === (m = o.mapping.entity) || void 0 === m ? void 0 : m.fieldAry.map((function(t) {
                                      return t.name
                                  }
                                  )).sort().join(",");
                                  if (w !== b || A !== C)
                                      return {
                                          value: "实体【".concat(S.name, "】中字段【").concat(e.name, "】所映射数据存在变更")
                                      };
                                  for (var F = function(t) {
                                      var n = null === (g = null === (y = e.mapping.entity) || void 0 === y ? void 0 : y.fieldAry) || void 0 === g ? void 0 : g.find((function(e) {
                                          return e.id === t.id
                                      }
                                      ));
                                      if ((null == n ? void 0 : n.sql) !== (null == t ? void 0 : t.sql))
                                          return {
                                              value: "实体【".concat(S.name, "】中字段【").concat(e.name, "】所映射数据存在变更")
                                          }
                                  }, I = 0, O = null !== (_ = null === (h = null === (v = o.mapping.entity) || void 0 === v ? void 0 : v.fieldAry) || void 0 === h ? void 0 : h.filter((function(t) {
                                      return t.bizType === r.Ks.CALC
                                  }
                                  ))) && void 0 !== _ ? _ : []; I < O.length; I++) {
                                      var P = F(O[I]);
                                      if ("object" == typeof P)
                                          return P
                                  }
                              }
                          }, M = 0; M < x.length; M++) {
                              var N = T(M);
                              if ("object" == typeof N)
                                  return N.value
                          }
                      }
                  }
              }
          }
      }
      ,
      7657: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => r
          });
          const r = {
              "@inputUpdated": function(t, e) {
                  var n = t.output
                    , r = e.id
                    , o = e.schema;
                  "set" === r && (n.get("return").setSchema(o),
                  n.get("changed").setSchema(o))
              },
              "@inputDisConnected": function(t, e, n) {
                  var r = t.output;
                  "set" === n.id && (r.get("return").setSchema({
                      type: "unknown"
                  }),
                  r.get("changed").setSchema({
                      type: "unknown"
                  }))
              },
              ":root": [{
                  title: "变量名称",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.title
                      },
                      set: function(t, e) {
                          (0,
                          t.setTitle)(e)
                      }
                  }
              }, {
                  title: "类型",
                  type: "_schema",
                  value: {
                      get: function(t) {
                          return t.outputs.get("return").schema
                      },
                      set: function(t, e) {
                          var n = t.outputs;
                          n.get().forEach((function(t) {
                              n.get(t.id).setSchema(e)
                          }
                          ))
                      }
                  }
              }]
          }
      }
      ,
      6443: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = t.data
                , n = t.outputs
                , r = t.inputs;
              r.get((function(t, n) {
                  var r = o(void 0 !== e.val ? e.val : e.initValue);
                  n.return(r)
              }
              )),
              r.set((function(t, r) {
                  e.val = t;
                  var i = o(t);
                  n.changed(i, !0)
              }
              )),
              r.reset((function() {
                  var t = e.initValue;
                  e.val = t,
                  n.changed(o(t), !0)
              }
              ))
          }
          function o(t) {
              if (t && "object" == typeof t)
                  try {
                      return t instanceof FormData ? t : JSON.parse(JSON.stringify(t))
                  } catch (e) {
                      return t
                  }
              return t
          }
          n.d(e, {
              A: () => r
          })
      }
      ,
      2279: (t, e, n) => {
          "use strict";
          n.d(e, {
              Fo: () => o,
              N9: () => r,
              r_: () => i
          });
          var r = "({ inputValue, outputs }) => {\n    const { output0 } = outputs;\n    output0(inputValue);\n  }"
            , o = "({ outputs }) => {\n    const { output0 } = outputs;\n    output0(0);\n  }"
            , i = "/**\n  * @param inputValue: any 输入项的值\n  * @parma outputs: any 输出项\n  *\n  * 例子\n  * ({ inputValue, outputs }) => {\n  *   const { output0, output1, output2 } = outputs;\n  *   const res = '该值输出给下一个组件使用' + inputValue\n  *   \n  *   // 向输出项（output0）输出结果\n  *   output0(res); \n  *   \n  *   // 多输出的情况\n  *   // output1(res); \n  *   // output2(res); \n  * }\n  */"
      }
      ,
      1468: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
          "use strict";
          __webpack_require__.d(__webpack_exports__, {
              A: () => __WEBPACK_DEFAULT_EXPORT__
          });
          var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2279)
            , _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2724)
            , __spreadArray = function(t, e, n) {
              if (n || 2 === arguments.length)
                  for (var r, o = 0, i = e.length; o < i; o++)
                      !r && o in e || (r || (r = Array.prototype.slice.call(e, 0, o)),
                      r[o] = e[o]);
              return t.concat(r || Array.prototype.slice.call(e))
          }
            , getFnParams = function(t) {
              var e = t.data
                , n = t.outputs
                , r = __spreadArray(["context", "inputValue"], n.get().map((function(t) {
                  return t.id
              }
              )), !0);
              return e.runImmediate && r.splice(1, 1),
              r
          }
            , getExtralib = function(t) {
              var e = t.outputs;
              return __spreadArray(__spreadArray([], e.get().map((function(t) {
                  var e = t.id
                    , n = t.title;
                  return "/** \n* ".concat(n, " \n*/ \ndeclare function ").concat(e, "(val: any): void")
              }
              )), !0), ["declare var inputValue: any;"], !1).join(";\n")
          }
            , forceRender = {
              run: function() {}
          };
          const __WEBPACK_DEFAULT_EXPORT__ = {
              "@init": function(t) {
                  var e = t.data
                    , n = t.setAutoRun
                    , r = t.isAutoRun
                    , o = t.output;
                  (!!r && r() || e.runImmediate) && (n(!0),
                  e.runImmediate = !0,
                  o.get("output0").setSchema({
                      type: "number"
                  })),
                  e.fns = e.fns || (e.runImmediate ? _constants__WEBPACK_IMPORTED_MODULE_0__.Fo : _constants__WEBPACK_IMPORTED_MODULE_0__.N9)
              },
              "@pinRemoved": function(t) {
                  t.data,
                  t.outputs
              },
              "@inputUpdated": function(t, e) {
                  t.data.inputSchema = e.schema
              },
              "@inputConnected": function(t, e) {
                  var n = t.data
                    , r = t.output;
                  n.inputSchema = e.schema,
                  n.fns === _constants__WEBPACK_IMPORTED_MODULE_0__.N9 && r.get("output0").setSchema({
                      type: "unknown"
                  })
              },
              "@inputDisConnected": function(t) {
                  t.data.inputSchema = {
                      type: "any"
                  }
              },
              ":root": [{
                  title: "添加输出项",
                  type: "Button",
                  value: {
                      set: function(t) {
                          var e = t.output
                            , n = getOutputOrder({
                              output: e
                          })
                            , r = "output".concat(n)
                            , o = "输出项".concat(n);
                          e.add({
                              id: r,
                              title: o,
                              schema: {
                                  type: "unknown"
                              },
                              editable: !0,
                              deletable: !0
                          })
                      }
                  }
              }, {
                  type: "code",
                  options: function(t) {
                      var e = t.data
                        , n = t.output;
                      return {
                          babel: !0,
                          comments: _constants__WEBPACK_IMPORTED_MODULE_0__.r_,
                          theme: "light",
                          minimap: {
                              enabled: !1
                          },
                          lineNumbers: "on",
                          eslint: {
                              parserOptions: {
                                  ecmaVersion: "2020",
                                  sourceType: "module"
                              }
                          },
                          autoSave: !1,
                          onBlur: function() {
                              updateOutputSchema(n, e.fns)
                          },
                          schema: e.inputSchema
                      }
                  },
                  title: "代码编辑",
                  value: {
                      get: function(t) {
                          return t.data.fns
                      },
                      set: function(t, e) {
                          t.data.fns = e
                      }
                  }
              }]
          };
          function updateOutputSchema(output, code) {
              var outputs = {};
              output.get().forEach((function(t) {
                  var e = t.id;
                  outputs[e] = function(t) {
                      try {
                          var n = (0,
                          _util__WEBPACK_IMPORTED_MODULE_1__.j)(t);
                          output.get(e).setSchema(n)
                      } catch (t) {
                          output.get(e).setSchema({
                              type: "unknown"
                          })
                      }
                  }
              }
              ));
              try {
                  setTimeout((function() {
                      var fn = eval(decodeURIComponent(code.code || code));
                      fn({
                          inputValue: void 0,
                          outputs
                      })
                  }
                  ))
              } catch (t) {}
          }
          function getOutputOrder(t) {
              var e = t.output.get().pop().id;
              return Number(e.slice(6)) + 1
          }
      }
      ,
      8462: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
          "use strict";
          __webpack_require__.d(__webpack_exports__, {
              A: () => __WEBPACK_DEFAULT_EXPORT__
          });
          var __assign = function() {
              return __assign = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              __assign.apply(this, arguments)
          }
            , getFnString = function(t, e) {
              return "function _RT_ ({".concat(e.join(","), "}) {").concat(t, "}")
          };
          function __WEBPACK_DEFAULT_EXPORT__(_a) {
              var _b, env = _a.env, data = _a.data, inputs = _a.inputs, outputs = _a.outputs, logger = _a.logger, onError = _a.onError, fns = data.fns, runImmediate = data.runImmediate, runJSParams = {
                  outputs
              };
              try {
                  runImmediate && env.runtime && eval(decodeURIComponent(fns))(runJSParams),
                  inputs.input0((function(val) {
                      var _a;
                      try {
                          eval(decodeURIComponent(fns))(__assign(__assign({}, runJSParams), {
                              inputValue: val
                          }))
                      } catch (t) {
                          null == onError || onError(t.message),
                          env.edit ? console.error("js计算组件运行错误.", t) : null === (_a = env.logger) || void 0 === _a || _a.error("".concat(t))
                      }
                  }
                  ))
              } catch (t) {
                  null == onError || onError(t.message),
                  env.edit ? console.error("js计算组件运行错误.", t) : null === (_b = env.logger) || void 0 === _b || _b.error("".concat(t))
              }
          }
      }
      ,
      2724: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = {
                  type: void 0
              };
              return o({
                  schema: e,
                  val: t
              }),
              e.type ? e : void 0
          }
          function o(t) {
              var e, n, r = t.schema, i = t.val, a = t.key, c = t.fromAry;
              if (Array.isArray(i)) {
                  var u = {};
                  a ? r[a] = {
                      type: "array",
                      items: u
                  } : (r.type = "array",
                  r.items = u),
                  function(t, e) {
                      var n;
                      e.length > 0 && (n = e[0]),
                      o({
                          schema: t,
                          val: n,
                          fromAry: !0
                      })
                  }(u, i)
              } else if ("object" == typeof i && i) {
                  var s = void 0;
                  c && (r.type = "object",
                  s = r.properties = {});
                  var l = c ? s : {};
                  c || (a ? r[a] = {
                      type: "object",
                      properties: l
                  } : (r.type = "object",
                  r.properties = l)),
                  e = l,
                  n = i,
                  Object.keys(n).map((function(t) {
                      return o({
                          schema: e,
                          val: n[t],
                          key: t
                      })
                  }
                  ))
              } else {
                  var d = null == i ? "any" : typeof i;
                  void 0 === a ? r.type = d : r[a] = {
                      type: d
                  }
              }
          }
          n.d(e, {
              j: () => r
          })
      }
      ,
      142: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => r
          });
          const r = {
              ":root": [{
                  title: "cookie名称",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.keyName
                      },
                      set: function(t, e) {
                          t.data.keyName = e
                      }
                  }
              }]
          }
      }
      ,
      4760: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = t.env
                , n = t.data
                , r = (t.outputs,
              t.inputs)
                , o = t.onError;
              r.params((function(t, r) {
                  var i, a;
                  e.collect("获取cookie key: ", n.keyName),
                  n.keyName ? null === (i = r.rtn) || void 0 === i || i.call(r, null === (a = null == e ? void 0 : e.cookies) || void 0 === a ? void 0 : a[n.keyName]) : o("获取cookies 必须配置 key")
              }
              ))
          }
          n.d(e, {
              A: () => r
          })
      }
      ,
      6122: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => r
          });
          const r = {
              ":root": [{
                  title: "cookie名称",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.keyName
                      },
                      set: function(t, e) {
                          t.data.keyName = e
                      }
                  }
              }, {
                  title: "仅http可获取",
                  type: "switch",
                  value: {
                      get: function(t) {
                          return t.data.httpOnly
                      },
                      set: function(t, e) {
                          t.data.httpOnly = e
                      }
                  }
              }, {
                  title: "过期时间（秒）",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.maxAge
                      },
                      set: function(t, e) {
                          t.data.maxAge = e
                      }
                  }
              }, {
                  title: "域名",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.domain
                      },
                      set: function(t, e) {
                          t.data.domain = e
                      }
                  }
              }, {
                  title: "路径",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.path
                      },
                      set: function(t, e) {
                          t.data.path = e
                      }
                  }
              }]
          }
      }
      ,
      8332: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = function() {
              return r = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              r.apply(this, arguments)
          };
          function o(t) {
              var e = t.env
                , n = t.data
                , o = (t.outputs,
              t.inputs)
                , i = t.onError;
              o.params((function(t, o) {
                  var a;
                  e.collect("设置cookies key: ", null == n ? void 0 : n.keyName),
                  n.keyName ? "string" != typeof t && "number" != typeof t && t ? i("设置cookies 入参格式错误") : (null === (a = e.setCookie) || void 0 === a || a.call(e, null == n ? void 0 : n.keyName, t, r(r({
                      httpOnly: !!n.httpOnly,
                      path: n.path || "/"
                  }, n.maxAge ? {} : {
                      maxAge: n.maxAge
                  }), n.domain ? {} : {
                      domain: n.domain
                  })),
                  o.rtn(t)) : i("设置cookies 必须配置 key")
              }
              ))
          }
      }
      ,
      2208: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7491);
          const o = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.cancelError
                    , i = t.throwError;
                  if (e.rules) {
                      var a = (0,
                      r.UD)(e.rules.entities, n.entity);
                      a ? i(a) : o(),
                      e.errorMessage = a
                  }
              },
              ":root": [{
                  title: "编辑",
                  type: "domain.dbInsert",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          get paramSchema() {
                              return n.get("params").schema || {}
                          },
                          get errorMessage() {
                              return e.errorMessage
                          },
                          batch: !0
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.rules
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.cancelError;
                          n.rules = e,
                          n.errorMessage = "",
                          o(),
                          n.rules ? r("已选择 ".concat(n.rules.desc)) : r("未完成选择")
                      }
                  }
              }]
          }
      }
      ,
      8870: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(8282);
          function o(t) {
              var e = t.env
                , n = t.data
                , o = t.outputs
                , i = t.inputs
                , a = t.onError;
              i.params((function(t) {
                  var i, c = null === (i = e.runtime) || void 0 === i ? void 0 : i.debug;
                  if (n.rules)
                      try {
                          if (!t || !Array.isArray(t) || !t.length)
                              throw new Error("输入数据错误，非数组或数字为空");
                          (0,
                          r.X)(t, n.rules.entities[0], n.rules.conAry),
                          e.collect("批量插入数据 params: ", t);
                          var u = (0,
                          r.O)({
                              entity: n.rules.entities[0],
                              isEdit: c,
                              data: t,
                              batch: !0,
                              conAry: n.rules.conAry,
                              genUniqueId: e.genUniqueId,
                              encrypt: e.encrypt
                          });
                          e.collect("批量插入数据 sql: ", u),
                          e.executeSql(u).then((function(t) {
                              var n, r;
                              e.collect("批量插入数据 res: ", t),
                              o.rtn(t.insertId || (null === (r = null === (n = t.rows) || void 0 === n ? void 0 : n[0]) || void 0 === r ? void 0 : r.insertId))
                          }
                          )).catch((function(t) {
                              return a("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                          }
                          ))
                      } catch (t) {
                          c && console.error("执行SQL发生错误, ", t),
                          a("执行错误, ".concat(null == t ? void 0 : t.message))
                      }
              }
              ))
          }
      }
      ,
      1164: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7491);
          const o = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.throwError
                    , i = t.cancelError;
                  if (e.rules) {
                      var a = (0,
                      r.UD)(e.rules.entities, n.entity, {
                          conAry: e.rules.conAry,
                          conditions: e.rules.conditions
                      });
                      a ? o(a) : i(),
                      e.errorMessage = a
                  }
              },
              ":root": [{
                  title: "编辑",
                  type: "domain.dbUpdate",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          batch: !0,
                          get paramSchema() {
                              return n.get("params").schema
                          },
                          get errorMessage() {
                              return e.errorMessage
                          }
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.rules
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.cancelError;
                          n.rules = e,
                          n.errorMessage = "",
                          o(),
                          n.rules ? r("已选择 ".concat(n.rules.desc)) : r("未完成选择")
                      }
                  }
              }]
          }
      }
      ,
      5314: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => c
          });
          var r = n(8282)
            , o = n(270)
            , i = function(t, e, n, r) {
              return new (n || (n = Promise))((function(o, i) {
                  function a(t) {
                      try {
                          u(r.next(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function c(t) {
                      try {
                          u(r.throw(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function u(t) {
                      var e;
                      t.done ? o(t.value) : (e = t.value,
                      e instanceof n ? e : new n((function(t) {
                          t(e)
                      }
                      ))).then(a, c)
                  }
                  u((r = r.apply(t, e || [])).next())
              }
              ))
          }
            , a = function(t, e) {
              var n, r, o, i, a = {
                  label: 0,
                  sent: function() {
                      if (1 & o[0])
                          throw o[1];
                      return o[1]
                  },
                  trys: [],
                  ops: []
              };
              return i = {
                  next: c(0),
                  throw: c(1),
                  return: c(2)
              },
              "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                  return this
              }
              ),
              i;
              function c(c) {
                  return function(u) {
                      return function(c) {
                          if (n)
                              throw new TypeError("Generator is already executing.");
                          for (; i && (i = 0,
                          c[0] && (a = 0)),
                          a; )
                              try {
                                  if (n = 1,
                                  r && (o = 2 & c[0] ? r.return : c[0] ? r.throw || ((o = r.return) && o.call(r),
                                  0) : r.next) && !(o = o.call(r, c[1])).done)
                                      return o;
                                  switch (r = 0,
                                  o && (c = [2 & c[0], o.value]),
                                  c[0]) {
                                  case 0:
                                  case 1:
                                      o = c;
                                      break;
                                  case 4:
                                      return a.label++,
                                      {
                                          value: c[1],
                                          done: !1
                                      };
                                  case 5:
                                      a.label++,
                                      r = c[1],
                                      c = [0];
                                      continue;
                                  case 7:
                                      c = a.ops.pop(),
                                      a.trys.pop();
                                      continue;
                                  default:
                                      if (!((o = (o = a.trys).length > 0 && o[o.length - 1]) || 6 !== c[0] && 2 !== c[0])) {
                                          a = 0;
                                          continue
                                      }
                                      if (3 === c[0] && (!o || c[1] > o[0] && c[1] < o[3])) {
                                          a.label = c[1];
                                          break
                                      }
                                      if (6 === c[0] && a.label < o[1]) {
                                          a.label = o[1],
                                          o = c;
                                          break
                                      }
                                      if (o && a.label < o[2]) {
                                          a.label = o[2],
                                          a.ops.push(c);
                                          break
                                      }
                                      o[2] && a.ops.pop(),
                                      a.trys.pop();
                                      continue
                                  }
                                  c = e.call(t, a)
                              } catch (t) {
                                  c = [6, t],
                                  r = 0
                              } finally {
                                  n = o = 0
                              }
                          if (5 & c[0])
                              throw c[1];
                          return {
                              value: c[0] ? c[1] : void 0,
                              done: !0
                          }
                      }([c, u])
                  }
              }
          };
          function c(t) {
              var e = this
                , n = t.env
                , c = t.data
                , u = t.outputs
                , s = t.inputs
                , l = t.onError;
              s.params((function(t) {
                  return i(e, void 0, void 0, (function() {
                      var e, i, s, d, p, f, m;
                      return a(this, (function(a) {
                          switch (a.label) {
                          case 0:
                              if (e = null === (m = n.runtime) || void 0 === m ? void 0 : m.debug,
                              !c.rules)
                                  return [3, 7];
                              a.label = 1;
                          case 1:
                              if (a.trys.push([1, 6, , 7]),
                              !t || !Array.isArray(t) || !t.length)
                                  throw new Error("输入数据错误，非数组或数字为空");
                              (0,
                              r.X)(t, c.rules.entities[0], c.rules.conAry, !1),
                              n.collect("批量更新数据 params: ", t),
                              i = 0,
                              s = t,
                              a.label = 2;
                          case 2:
                              return i < s.length ? (d = s[i],
                              p = (0,
                              o.$)({
                                  conditions: c.rules.conditions,
                                  connectors: c.rules.conAry,
                                  entities: c.rules.entities,
                                  params: d,
                                  isEdit: e,
                                  encrypt: n.encrypt
                              }),
                              n.collect("批量更新数据 sql: ", p),
                              [4, n.executeSql(p)]) : [3, 5];
                          case 3:
                              a.sent(),
                              a.label = 4;
                          case 4:
                              return i++,
                              [3, 2];
                          case 5:
                              return u.rtn(),
                              [3, 7];
                          case 6:
                              return f = a.sent(),
                              e && console.error("执行SQL发生错误, ", f),
                              l("执行错误, ".concat(null == f ? void 0 : f.message)),
                              [3, 7];
                          case 7:
                              return [2]
                          }
                      }
                      ))
                  }
                  ))
              }
              ))
          }
      }
      ,
      1880: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7491);
          const o = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.cancelError
                    , i = t.throwError;
                  if (e.rules) {
                      var a = (0,
                      r.k1)(e.rules.entities, n.entity, e.rules.conditions);
                      a ? i(a) : o(),
                      e.errorMessage = a
                  }
              },
              ":root": [{
                  title: "编辑",
                  type: "domain.dbDelete",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          get paramSchema() {
                              return n.get("params").schema
                          },
                          get errorMessage() {
                              return e.errorMessage
                          }
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.rules
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.cancelError;
                          n.rules = e,
                          n.errorMessage = "",
                          o(),
                          n.rules ? r("已选择 ".concat(n.rules.desc)) : r("未完成选择")
                      }
                  }
              }]
          }
      }
      ,
      6670: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7528);
          function o(t) {
              var e = t.env
                , n = t.data
                , o = t.outputs
                , i = t.inputs
                , a = t.onError;
              i.params((function(t) {
                  var i, c = null === (i = e.runtime) || void 0 === i ? void 0 : i.debug;
                  if (n.rules)
                      try {
                          e.collect("删除数据 val: ", t);
                          var u = (0,
                          r.D)({
                              conditions: n.rules.conditions,
                              entities: n.rules.entities,
                              params: t,
                              isEdit: c
                          });
                          e.collect("删除数据 sql: ", u),
                          e.executeSql(u).then((function() {
                              return o.rtn()
                          }
                          )).catch((function(t) {
                              return a("执行SQL发生错误,".concat(null == t ? void 0 : t.message))
                          }
                          ))
                      } catch (t) {
                          c && console.error("执行SQL发生错误, ", t),
                          a("执行错误, ".concat(null == t ? void 0 : t.message))
                      }
              }
              ))
          }
      }
      ,
      9406: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7491);
          const o = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.cancelError
                    , i = t.throwError;
                  if (e.rules) {
                      var a = (0,
                      r.UD)(e.rules.entities, n.entity);
                      a ? i(a) : o(),
                      e.errorMessage = a
                  }
              },
              ":root": [{
                  title: "编辑",
                  type: "domain.dbInsert",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          get paramSchema() {
                              return n.get("params").schema || {}
                          },
                          get errorMessage() {
                              return e.errorMessage
                          }
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.rules
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.cancelError;
                          n.rules = e,
                          n.errorMessage = "",
                          o(),
                          n.rules ? r("已选择 ".concat(n.rules.desc)) : r("未完成选择")
                      }
                  }
              }]
          }
      }
      ,
      4624: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(8282);
          function o(t) {
              var e = t.env
                , n = t.data
                , o = t.outputs
                , i = t.inputs
                , a = t.onError;
              i.params((function(t) {
                  var i, c = null === (i = e.runtime) || void 0 === i ? void 0 : i.debug;
                  if (n.rules)
                      try {
                          (0,
                          r.X)(t, n.rules.entities[0], n.rules.conAry),
                          e.collect("添加数据 val: ", t);
                          var u = (0,
                          r.O)({
                              entity: n.rules.entities[0],
                              isEdit: c,
                              data: t,
                              batch: !1,
                              conAry: n.rules.conAry,
                              genUniqueId: e.genUniqueId,
                              encrypt: e.encrypt
                          });
                          e.collect("添加数据 sql: ", u),
                          e.executeSql(u).then((function(t) {
                              var n;
                              e.collect("添加数据 res: ", t),
                              o.rtn(t.insertId || (null === (n = t.rows) || void 0 === n ? void 0 : n.insertId))
                          }
                          )).catch((function(t) {
                              return a("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                          }
                          ))
                      } catch (t) {
                          c && console.error("执行SQL发生错误, ", t),
                          a("执行错误, ".concat(null == t ? void 0 : t.message))
                      }
              }
              ))
          }
      }
      ,
      705: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7491);
          const o = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.cancelError
                    , i = t.throwError;
                  if (e.selector) {
                      var a = (0,
                      r.ZP)({
                          entities: e.selector.entities,
                          newEntity: n.entity,
                          fields: e.selector.fields,
                          orders: e.selector.orders,
                          conditions: e.selector.conditions
                      });
                      a ? i(a) : o(),
                      e.errorMessage = a
                  }
              },
              "@init": function(t) {
                  var e = t.data
                    , n = t.isAutoRun
                    , r = t.setDesc;
                  e.autoRun = !(!n || !n()),
                  r("未选择数据")
              },
              ":root": [{
                  title: "选择",
                  type: "domain.dbSelect",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          get paramSchema() {
                              return n.get("params").schema || {}
                          },
                          get errorMessage() {
                              return e.errorMessage
                          },
                          showPager: !1
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.selector
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.outputs
                            , i = t.cancelError
                            , a = e.outputSchema
                            , c = function(t, e) {
                              var n = {};
                              for (var r in t)
                                  Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
                              if (null != t && "function" == typeof Object.getOwnPropertySymbols) {
                                  var o = 0;
                                  for (r = Object.getOwnPropertySymbols(t); o < r.length; o++)
                                      e.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[o]) && (n[r[o]] = t[r[o]])
                              }
                              return n
                          }(e, ["outputSchema"]);
                          n.selector = c,
                          n.errorMessage = "",
                          i(),
                          n.selector ? (r("已选择 ".concat(n.selector.desc)),
                          o.get("rtn").setSchema(a)) : r("未完成选择")
                      }
                  }
              }]
          }
      }
      ,
      537: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => u
          });
          var r = n(6801)
            , o = n(6614)
            , i = function() {
              return i = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              i.apply(this, arguments)
          }
            , a = function(t, e, n, r) {
              return new (n || (n = Promise))((function(o, i) {
                  function a(t) {
                      try {
                          u(r.next(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function c(t) {
                      try {
                          u(r.throw(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function u(t) {
                      var e;
                      t.done ? o(t.value) : (e = t.value,
                      e instanceof n ? e : new n((function(t) {
                          t(e)
                      }
                      ))).then(a, c)
                  }
                  u((r = r.apply(t, e || [])).next())
              }
              ))
          }
            , c = function(t, e) {
              var n, r, o, i, a = {
                  label: 0,
                  sent: function() {
                      if (1 & o[0])
                          throw o[1];
                      return o[1]
                  },
                  trys: [],
                  ops: []
              };
              return i = {
                  next: c(0),
                  throw: c(1),
                  return: c(2)
              },
              "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                  return this
              }
              ),
              i;
              function c(c) {
                  return function(u) {
                      return function(c) {
                          if (n)
                              throw new TypeError("Generator is already executing.");
                          for (; i && (i = 0,
                          c[0] && (a = 0)),
                          a; )
                              try {
                                  if (n = 1,
                                  r && (o = 2 & c[0] ? r.return : c[0] ? r.throw || ((o = r.return) && o.call(r),
                                  0) : r.next) && !(o = o.call(r, c[1])).done)
                                      return o;
                                  switch (r = 0,
                                  o && (c = [2 & c[0], o.value]),
                                  c[0]) {
                                  case 0:
                                  case 1:
                                      o = c;
                                      break;
                                  case 4:
                                      return a.label++,
                                      {
                                          value: c[1],
                                          done: !1
                                      };
                                  case 5:
                                      a.label++,
                                      r = c[1],
                                      c = [0];
                                      continue;
                                  case 7:
                                      c = a.ops.pop(),
                                      a.trys.pop();
                                      continue;
                                  default:
                                      if (!((o = (o = a.trys).length > 0 && o[o.length - 1]) || 6 !== c[0] && 2 !== c[0])) {
                                          a = 0;
                                          continue
                                      }
                                      if (3 === c[0] && (!o || c[1] > o[0] && c[1] < o[3])) {
                                          a.label = c[1];
                                          break
                                      }
                                      if (6 === c[0] && a.label < o[1]) {
                                          a.label = o[1],
                                          o = c;
                                          break
                                      }
                                      if (o && a.label < o[2]) {
                                          a.label = o[2],
                                          a.ops.push(c);
                                          break
                                      }
                                      o[2] && a.ops.pop(),
                                      a.trys.pop();
                                      continue
                                  }
                                  c = e.call(t, a)
                              } catch (t) {
                                  c = [6, t],
                                  r = 0
                              } finally {
                                  n = o = 0
                              }
                          if (5 & c[0])
                              throw c[1];
                          return {
                              value: c[0] ? c[1] : void 0,
                              done: !0
                          }
                      }([c, u])
                  }
              }
          };
          function u(t) {
              var e, n = this, u = t.env, s = t.data, l = t.outputs, d = t.inputs, p = t.onError;
              if (s.selector) {
                  var f = null === (e = u.runtime) || void 0 === e ? void 0 : e.debug
                    , m = {
                      params: {},
                      fields: s.selector.fields || [],
                      conditions: s.selector.conditions || [],
                      entities: s.selector.entities || [],
                      limit: s.selector.limit,
                      showPager: !1,
                      selectCount: !1,
                      orders: s.selector.orders,
                      pageNum: s.selector.pageNum,
                      isEdit: f
                  }
                    , v = function(t) {
                      return a(n, void 0, void 0, (function() {
                          var e, n, i;
                          return c(this, (function(a) {
                              switch (a.label) {
                              case 0:
                                  return e = ((0,
                                  r.G)(t) || [])[0],
                                  u.collect("查询数据 sql: ", e),
                                  [4, u.executeSql(e)];
                              case 1:
                                  return n = a.sent(),
                                  u.collect("查询数据 res: ", n),
                                  i = n.rows,
                                  i = Array.from(i || []),
                                  (0,
                                  o.w)(t.fields || [], t.entities, i),
                                  [2, i]
                              }
                          }
                          ))
                      }
                      ))
                  };
                  s.autoRun && v(m).then((function(t) {
                      return l.rtn(t)
                  }
                  )).catch((function(t) {
                      f && console.error("执行SQL发生错误, ", t),
                      p("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                  }
                  )),
                  d.params((function(t) {
                      v(i(i({}, m), {
                          params: t,
                          orders: t.orders && Array.isArray(t.orders) ? t.orders : m.orders
                      })).then((function(t) {
                          return l.rtn(t)
                      }
                      )).catch((function(t) {
                          f && console.error("执行SQL发生错误, ", t),
                          p("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                      }
                      ))
                  }
                  ))
              }
          }
      }
      ,
      9815: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => i
          });
          var r = n(7491)
            , o = function() {
              return o = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              o.apply(this, arguments)
          };
          const i = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.cancelError
                    , i = t.throwError;
                  if (e.selector) {
                      var a = (0,
                      r.ZP)({
                          entities: e.selector.entities,
                          newEntity: n.entity,
                          fields: e.selector.fields,
                          orders: e.selector.orders,
                          conditions: e.selector.conditions
                      });
                      a ? i(a) : o(),
                      e.errorMessage = a
                  }
              },
              "@init": function(t) {
                  var e = t.data
                    , n = t.isAutoRun
                    , r = t.setDesc;
                  e.autoRun = !(!n || !n()),
                  r("未选择数据")
              },
              ":root": [{
                  title: "选择",
                  type: "domain.dbSelect",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          get paramSchema() {
                              var t, e, r, i, a, c = JSON.parse(JSON.stringify(null !== (e = null === (t = n.get("params.params")) || void 0 === t ? void 0 : t.schema) && void 0 !== e ? e : {}));
                              return c.properties = o(o({}, JSON.parse(JSON.stringify(null !== (a = null === (i = null === (r = n.get("params.pageParams")) || void 0 === r ? void 0 : r.schema) || void 0 === i ? void 0 : i.properties) && void 0 !== a ? a : {}))), c.properties),
                              c || {}
                          },
                          get errorMessage() {
                              return e.errorMessage
                          },
                          showPager: !0
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.selector
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.outputs
                            , i = t.cancelError
                            , a = e.outputSchema
                            , c = function(t, e) {
                              var n = {};
                              for (var r in t)
                                  Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
                              if (null != t && "function" == typeof Object.getOwnPropertySymbols) {
                                  var o = 0;
                                  for (r = Object.getOwnPropertySymbols(t); o < r.length; o++)
                                      e.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[o]) && (n[r[o]] = t[r[o]])
                              }
                              return n
                          }(e, ["outputSchema"]);
                          n.selector = c,
                          n.errorMessage = "",
                          i(),
                          n.selector ? (r("已选择 ".concat(n.selector.desc)),
                          o.get("rtn").setSchema(a)) : r("未完成选择")
                      }
                  }
              }]
          }
      }
      ,
      8251: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => u
          });
          var r = n(6801)
            , o = n(6614)
            , i = function() {
              return i = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              i.apply(this, arguments)
          }
            , a = function(t, e, n, r) {
              return new (n || (n = Promise))((function(o, i) {
                  function a(t) {
                      try {
                          u(r.next(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function c(t) {
                      try {
                          u(r.throw(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function u(t) {
                      var e;
                      t.done ? o(t.value) : (e = t.value,
                      e instanceof n ? e : new n((function(t) {
                          t(e)
                      }
                      ))).then(a, c)
                  }
                  u((r = r.apply(t, e || [])).next())
              }
              ))
          }
            , c = function(t, e) {
              var n, r, o, i, a = {
                  label: 0,
                  sent: function() {
                      if (1 & o[0])
                          throw o[1];
                      return o[1]
                  },
                  trys: [],
                  ops: []
              };
              return i = {
                  next: c(0),
                  throw: c(1),
                  return: c(2)
              },
              "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                  return this
              }
              ),
              i;
              function c(c) {
                  return function(u) {
                      return function(c) {
                          if (n)
                              throw new TypeError("Generator is already executing.");
                          for (; i && (i = 0,
                          c[0] && (a = 0)),
                          a; )
                              try {
                                  if (n = 1,
                                  r && (o = 2 & c[0] ? r.return : c[0] ? r.throw || ((o = r.return) && o.call(r),
                                  0) : r.next) && !(o = o.call(r, c[1])).done)
                                      return o;
                                  switch (r = 0,
                                  o && (c = [2 & c[0], o.value]),
                                  c[0]) {
                                  case 0:
                                  case 1:
                                      o = c;
                                      break;
                                  case 4:
                                      return a.label++,
                                      {
                                          value: c[1],
                                          done: !1
                                      };
                                  case 5:
                                      a.label++,
                                      r = c[1],
                                      c = [0];
                                      continue;
                                  case 7:
                                      c = a.ops.pop(),
                                      a.trys.pop();
                                      continue;
                                  default:
                                      if (!((o = (o = a.trys).length > 0 && o[o.length - 1]) || 6 !== c[0] && 2 !== c[0])) {
                                          a = 0;
                                          continue
                                      }
                                      if (3 === c[0] && (!o || c[1] > o[0] && c[1] < o[3])) {
                                          a.label = c[1];
                                          break
                                      }
                                      if (6 === c[0] && a.label < o[1]) {
                                          a.label = o[1],
                                          o = c;
                                          break
                                      }
                                      if (o && a.label < o[2]) {
                                          a.label = o[2],
                                          a.ops.push(c);
                                          break
                                      }
                                      o[2] && a.ops.pop(),
                                      a.trys.pop();
                                      continue
                                  }
                                  c = e.call(t, a)
                              } catch (t) {
                                  c = [6, t],
                                  r = 0
                              } finally {
                                  n = o = 0
                              }
                          if (5 & c[0])
                              throw c[1];
                          return {
                              value: c[0] ? c[1] : void 0,
                              done: !0
                          }
                      }([c, u])
                  }
              }
          };
          function u(t) {
              var e, n = this, u = t.env, s = t.data, l = t.outputs, d = t.inputs, p = t.onError;
              if (s.selector) {
                  var f = null === (e = u.runtime) || void 0 === e ? void 0 : e.debug
                    , m = {
                      params: {},
                      fields: s.selector.fields || [],
                      conditions: s.selector.conditions || [],
                      entities: s.selector.entities || [],
                      limit: s.selector.limit,
                      showPager: !0,
                      selectCount: !1,
                      orders: s.selector.orders,
                      pageNum: s.selector.pageNum,
                      isEdit: f
                  }
                    , v = function(t) {
                      return a(n, void 0, void 0, (function() {
                          var e, n, i, a, s;
                          return c(this, (function(c) {
                              switch (c.label) {
                              case 0:
                                  return u.collect("分页查询数据 params: ", t),
                                  e = (0,
                                  r.G)(t) || [],
                                  n = e[0],
                                  i = e[1],
                                  u.collect("分页查询数据 sql: ", {
                                      sql: n,
                                      countSql: i
                                  }),
                                  [4, u.executeSql(n)];
                              case 1:
                                  return a = c.sent().rows,
                                  u.collect("分页查询数据 res: ", {
                                      rows: a
                                  }),
                                  a = Array.from(a || []),
                                  (0,
                                  o.w)(t.fields || [], t.entities, a),
                                  [4, u.executeSql(i)];
                              case 2:
                                  return s = c.sent().rows,
                                  u.collect("分页查询数据 res: ", {
                                      rows: s
                                  }),
                                  [2, {
                                      dataSource: a,
                                      total: s[0] ? s[0].total : 0,
                                      pageNum: t.params.pageNum || 1,
                                      pageSize: t.params.pageSize || 50
                                  }]
                              }
                          }
                          ))
                      }
                      ))
                  };
                  s.autoRun ? v(m).then((function(t) {
                      return l.rtn(t)
                  }
                  )).catch((function(t) {
                      f && console.error("执行SQL发生错误, ", t),
                      p("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                  }
                  )) : d.params((function(t) {
                      return a(n, void 0, void 0, (function() {
                          var e, n, r;
                          return c(this, (function(o) {
                              switch (o.label) {
                              case 0:
                                  e = i(i({}, t.pageParams || {}), t.params || {}),
                                  o.label = 1;
                              case 1:
                                  return o.trys.push([1, 3, , 4]),
                                  [4, v(i(i({}, m), {
                                      params: e,
                                      orders: e.orders && Array.isArray(e.orders) ? e.orders : m.orders
                                  }))];
                              case 2:
                                  return n = o.sent(),
                                  l.rtn(n),
                                  [3, 4];
                              case 3:
                                  return r = o.sent(),
                                  f && console.error("执行SQL发生错误, ", r),
                                  p("执行SQL发生错误, ".concat(null == r ? void 0 : r.message)),
                                  [3, 4];
                              case 4:
                                  return [2]
                              }
                          }
                          ))
                      }
                      ))
                  }
                  ))
              }
          }
      }
      ,
      3614: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7491);
          const o = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.cancelError
                    , i = t.throwError;
                  if (e.selector) {
                      var a = (0,
                      r.ZP)({
                          entities: e.selector.entities,
                          newEntity: n.entity,
                          fields: [],
                          orders: e.selector.orders,
                          conditions: e.selector.conditions
                      });
                      a ? i(a) : o(),
                      e.errorMessage = a
                  }
              },
              "@init": function(t) {
                  var e = t.data
                    , n = t.isAutoRun
                    , r = t.setDesc;
                  e.autoRun = !(!n || !n()),
                  r("未选择数据")
              },
              ":root": [{
                  title: "选择",
                  type: "domain.dbSelect",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          get paramSchema() {
                              return n.get("params").schema || {}
                          },
                          get errorMessage() {
                              return e.errorMessage
                          },
                          selectCount: !0
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.selector
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.outputs
                            , i = t.cancelError
                            , a = e.outputSchema
                            , c = function(t, e) {
                              var n = {};
                              for (var r in t)
                                  Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
                              if (null != t && "function" == typeof Object.getOwnPropertySymbols) {
                                  var o = 0;
                                  for (r = Object.getOwnPropertySymbols(t); o < r.length; o++)
                                      e.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[o]) && (n[r[o]] = t[r[o]])
                              }
                              return n
                          }(e, ["outputSchema"]);
                          n.selector = c,
                          n.errorMessage = "",
                          i(),
                          n.selector ? (r("已选择 ".concat(n.selector.desc)),
                          o.get("rtn").setSchema(a)) : r("未完成选择")
                      }
                  }
              }]
          }
      }
      ,
      9088: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => c
          });
          var r = n(6801)
            , o = function() {
              return o = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              o.apply(this, arguments)
          }
            , i = function(t, e, n, r) {
              return new (n || (n = Promise))((function(o, i) {
                  function a(t) {
                      try {
                          u(r.next(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function c(t) {
                      try {
                          u(r.throw(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function u(t) {
                      var e;
                      t.done ? o(t.value) : (e = t.value,
                      e instanceof n ? e : new n((function(t) {
                          t(e)
                      }
                      ))).then(a, c)
                  }
                  u((r = r.apply(t, e || [])).next())
              }
              ))
          }
            , a = function(t, e) {
              var n, r, o, i, a = {
                  label: 0,
                  sent: function() {
                      if (1 & o[0])
                          throw o[1];
                      return o[1]
                  },
                  trys: [],
                  ops: []
              };
              return i = {
                  next: c(0),
                  throw: c(1),
                  return: c(2)
              },
              "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                  return this
              }
              ),
              i;
              function c(c) {
                  return function(u) {
                      return function(c) {
                          if (n)
                              throw new TypeError("Generator is already executing.");
                          for (; i && (i = 0,
                          c[0] && (a = 0)),
                          a; )
                              try {
                                  if (n = 1,
                                  r && (o = 2 & c[0] ? r.return : c[0] ? r.throw || ((o = r.return) && o.call(r),
                                  0) : r.next) && !(o = o.call(r, c[1])).done)
                                      return o;
                                  switch (r = 0,
                                  o && (c = [2 & c[0], o.value]),
                                  c[0]) {
                                  case 0:
                                  case 1:
                                      o = c;
                                      break;
                                  case 4:
                                      return a.label++,
                                      {
                                          value: c[1],
                                          done: !1
                                      };
                                  case 5:
                                      a.label++,
                                      r = c[1],
                                      c = [0];
                                      continue;
                                  case 7:
                                      c = a.ops.pop(),
                                      a.trys.pop();
                                      continue;
                                  default:
                                      if (!((o = (o = a.trys).length > 0 && o[o.length - 1]) || 6 !== c[0] && 2 !== c[0])) {
                                          a = 0;
                                          continue
                                      }
                                      if (3 === c[0] && (!o || c[1] > o[0] && c[1] < o[3])) {
                                          a.label = c[1];
                                          break
                                      }
                                      if (6 === c[0] && a.label < o[1]) {
                                          a.label = o[1],
                                          o = c;
                                          break
                                      }
                                      if (o && a.label < o[2]) {
                                          a.label = o[2],
                                          a.ops.push(c);
                                          break
                                      }
                                      o[2] && a.ops.pop(),
                                      a.trys.pop();
                                      continue
                                  }
                                  c = e.call(t, a)
                              } catch (t) {
                                  c = [6, t],
                                  r = 0
                              } finally {
                                  n = o = 0
                              }
                          if (5 & c[0])
                              throw c[1];
                          return {
                              value: c[0] ? c[1] : void 0,
                              done: !0
                          }
                      }([c, u])
                  }
              }
          };
          function c(t) {
              var e, n = this, c = t.env, u = t.data, s = t.outputs, l = t.inputs, d = t.onError;
              if (u.selector) {
                  var p = null === (e = c.runtime) || void 0 === e ? void 0 : e.debug
                    , f = {
                      params: {},
                      fields: u.selector.fields || [],
                      conditions: u.selector.conditions || [],
                      entities: u.selector.entities || [],
                      limit: u.selector.limit,
                      showPager: !1,
                      selectCount: !0,
                      orders: u.selector.orders,
                      pageNum: u.selector.pageNum,
                      isEdit: p
                  }
                    , m = function(t) {
                      return i(n, void 0, void 0, (function() {
                          var e, n, o;
                          return a(this, (function(i) {
                              switch (i.label) {
                              case 0:
                                  return c.collect("查询数据总数 params: ", t),
                                  e = (0,
                                  r.G)(t) || [],
                                  n = e[1],
                                  c.collect("查询数据总数 countSql: ", n),
                                  [4, c.executeSql(n)];
                              case 1:
                                  return o = i.sent().rows,
                                  c.collect("查询数据总数 res: ", {
                                      rows: o
                                  }),
                                  [2, {
                                      total: o[0] ? o[0].total : 0
                                  }]
                              }
                          }
                          ))
                      }
                      ))
                  };
                  u.autoRun && m(f).then((function(t) {
                      return s.rtn(t)
                  }
                  )).catch((function(t) {
                      p && console.error("执行SQL发生错误, ", t),
                      d("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                  }
                  )),
                  l.params((function(t) {
                      m(o(o({}, f), {
                          params: t
                      })).then((function(t) {
                          return s.rtn(t)
                      }
                      )).catch((function(t) {
                          p && console.error("执行SQL发生错误, ", t),
                          d("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                      }
                      ))
                  }
                  ))
              }
          }
      }
      ,
      4249: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7491);
          const o = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.cancelError
                    , i = t.throwError;
                  if (e.selector) {
                      var a = (0,
                      r.ZP)({
                          entities: e.selector.entities,
                          newEntity: n.entity,
                          fields: e.selector.fields,
                          orders: e.selector.orders,
                          conditions: e.selector.conditions
                      });
                      a ? i(a) : o(),
                      e.errorMessage = a
                  }
              },
              "@init": function(t) {
                  var e = t.data
                    , n = t.isAutoRun
                    , r = t.setDesc;
                  e.autoRun = !(!n || !n()),
                  r("未选择数据")
              },
              ":root": [{
                  title: "选择",
                  type: "domain.dbSelect",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          get paramSchema() {
                              return n.get("params").schema || {}
                          },
                          get errorMessage() {
                              return e.errorMessage
                          },
                          single: !0
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.selector
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.outputs
                            , i = t.cancelError
                            , a = e.outputSchema
                            , c = function(t, e) {
                              var n = {};
                              for (var r in t)
                                  Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
                              if (null != t && "function" == typeof Object.getOwnPropertySymbols) {
                                  var o = 0;
                                  for (r = Object.getOwnPropertySymbols(t); o < r.length; o++)
                                      e.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[o]) && (n[r[o]] = t[r[o]])
                              }
                              return n
                          }(e, ["outputSchema"]);
                          n.selector = c,
                          n.errorMessage = "",
                          i(),
                          n.selector ? (r("已选择 ".concat(n.selector.desc)),
                          o.get("rtn").setSchema(a.items || {
                              type: "unknown"
                          })) : r("未完成选择")
                      }
                  }
              }, {
                  title: "空数据判断",
                  type: "switch",
                  desc: "判断查询出的数据是否为空",
                  value: {
                      get: function(t) {
                          return t.data.emptyCheck
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.output;
                          n.emptyCheck = e,
                          e ? r.add({
                              id: "empty",
                              title: "空数据",
                              schema: {
                                  type: "unknown"
                              },
                              editable: !0
                          }) : r.remove("empty")
                      }
                  }
              }]
          }
      }
      ,
      2737: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => s
          });
          var r = n(6801)
            , o = n(6614)
            , i = function() {
              return i = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              i.apply(this, arguments)
          }
            , a = function(t, e, n, r) {
              return new (n || (n = Promise))((function(o, i) {
                  function a(t) {
                      try {
                          u(r.next(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function c(t) {
                      try {
                          u(r.throw(t))
                      } catch (t) {
                          i(t)
                      }
                  }
                  function u(t) {
                      var e;
                      t.done ? o(t.value) : (e = t.value,
                      e instanceof n ? e : new n((function(t) {
                          t(e)
                      }
                      ))).then(a, c)
                  }
                  u((r = r.apply(t, e || [])).next())
              }
              ))
          }
            , c = function(t, e) {
              var n, r, o, i, a = {
                  label: 0,
                  sent: function() {
                      if (1 & o[0])
                          throw o[1];
                      return o[1]
                  },
                  trys: [],
                  ops: []
              };
              return i = {
                  next: c(0),
                  throw: c(1),
                  return: c(2)
              },
              "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                  return this
              }
              ),
              i;
              function c(c) {
                  return function(u) {
                      return function(c) {
                          if (n)
                              throw new TypeError("Generator is already executing.");
                          for (; i && (i = 0,
                          c[0] && (a = 0)),
                          a; )
                              try {
                                  if (n = 1,
                                  r && (o = 2 & c[0] ? r.return : c[0] ? r.throw || ((o = r.return) && o.call(r),
                                  0) : r.next) && !(o = o.call(r, c[1])).done)
                                      return o;
                                  switch (r = 0,
                                  o && (c = [2 & c[0], o.value]),
                                  c[0]) {
                                  case 0:
                                  case 1:
                                      o = c;
                                      break;
                                  case 4:
                                      return a.label++,
                                      {
                                          value: c[1],
                                          done: !1
                                      };
                                  case 5:
                                      a.label++,
                                      r = c[1],
                                      c = [0];
                                      continue;
                                  case 7:
                                      c = a.ops.pop(),
                                      a.trys.pop();
                                      continue;
                                  default:
                                      if (!((o = (o = a.trys).length > 0 && o[o.length - 1]) || 6 !== c[0] && 2 !== c[0])) {
                                          a = 0;
                                          continue
                                      }
                                      if (3 === c[0] && (!o || c[1] > o[0] && c[1] < o[3])) {
                                          a.label = c[1];
                                          break
                                      }
                                      if (6 === c[0] && a.label < o[1]) {
                                          a.label = o[1],
                                          o = c;
                                          break
                                      }
                                      if (o && a.label < o[2]) {
                                          a.label = o[2],
                                          a.ops.push(c);
                                          break
                                      }
                                      o[2] && a.ops.pop(),
                                      a.trys.pop();
                                      continue
                                  }
                                  c = e.call(t, a)
                              } catch (t) {
                                  c = [6, t],
                                  r = 0
                              } finally {
                                  n = o = 0
                              }
                          if (5 & c[0])
                              throw c[1];
                          return {
                              value: c[0] ? c[1] : void 0,
                              done: !0
                          }
                      }([c, u])
                  }
              }
          }
            , u = function(t) {
              return null == t || Array.isArray(t) && !t.length
          };
          function s(t) {
              var e, n = this, s = t.env, l = t.data, d = t.outputs, p = t.inputs, f = t.onError;
              if (l.selector) {
                  var m = null === (e = s.runtime) || void 0 === e ? void 0 : e.debug
                    , v = {
                      params: {},
                      fields: l.selector.fields || [],
                      conditions: l.selector.conditions || [],
                      entities: l.selector.entities || [],
                      limit: l.selector.limit,
                      showPager: !1,
                      selectCount: !1,
                      orders: l.selector.orders,
                      pageNum: l.selector.pageNum,
                      isEdit: m
                  }
                    , h = function(t) {
                      return a(n, void 0, void 0, (function() {
                          var e, n;
                          return c(this, (function(i) {
                              switch (i.label) {
                              case 0:
                                  return s.collect("单条查询数据 params: ", t),
                                  e = ((0,
                                  r.G)(t) || [])[0],
                                  s.collect("单条查询数据 sql: ", e),
                                  [4, s.executeSql(e)];
                              case 1:
                                  return n = i.sent().rows,
                                  s.collect("单条查询数据 res: ", {
                                      rows: n
                                  }),
                                  n = Array.from(n || []),
                                  (0,
                                  o.w)(t.fields || [], t.entities, n),
                                  [2, n]
                              }
                          }
                          ))
                      }
                      ))
                  };
                  l.autoRun && h(v).then((function(t) {
                      var e = null == t ? void 0 : t[0];
                      d[l.emptyCheck && u(e) ? "empty" : "rtn"](e)
                  }
                  )).catch((function(t) {
                      m && console.error("执行SQL发生错误, ", t),
                      f("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                  }
                  )),
                  p.params((function(t) {
                      h(i(i({}, v), {
                          params: t,
                          orders: t.orders && Array.isArray(t.orders) ? t.orders : v.orders
                      })).then((function(t) {
                          var e = null == t ? void 0 : t[0];
                          d[l.emptyCheck && u(e) ? "empty" : "rtn"](e)
                      }
                      )).catch((function(t) {
                          m && console.error("执行SQL发生错误, ", t),
                          f("执行SQL发生错误, ".concat(null == t ? void 0 : t.message))
                      }
                      ))
                  }
                  ))
              }
          }
      }
      ,
      3166: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = n(7491);
          const o = {
              "@envChanged": function(t) {
                  var e = t.data
                    , n = t.env
                    , o = t.throwError
                    , i = t.cancelError;
                  if (e.rules) {
                      var a = (0,
                      r.UD)(e.rules.entities, n.entity, {
                          conAry: e.rules.conAry,
                          conditions: e.rules.conditions
                      });
                      a ? o(a) : i(),
                      e.errorMessage = a
                  }
              },
              ":root": [{
                  title: "编辑",
                  type: "domain.dbUpdate",
                  options: function(t) {
                      var e = t.data
                        , n = t.input;
                      return {
                          get paramSchema() {
                              return n.get("params").schema
                          },
                          get errorMessage() {
                              return e.errorMessage
                          }
                      }
                  },
                  value: {
                      get: function(t) {
                          return t.data.rules
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.setDesc
                            , o = t.cancelError;
                          n.rules = e,
                          n.errorMessage = "",
                          o(),
                          n.rules ? r("已选择 ".concat(n.rules.desc)) : r("未完成选择")
                      }
                  }
              }]
          }
      }
      ,
      4576: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => i
          });
          var r = n(8282)
            , o = n(270);
          function i(t) {
              var e = t.env
                , n = t.data
                , i = t.outputs
                , a = t.inputs
                , c = t.onError;
              a.params((function(t) {
                  var a, u = null === (a = e.runtime) || void 0 === a ? void 0 : a.debug;
                  if (n.rules)
                      try {
                          (0,
                          r.X)(t, n.rules.entities[0], n.rules.conAry, !1),
                          e.collect("更新数据 params: ", t);
                          var s = (0,
                          o.$)({
                              conditions: n.rules.conditions,
                              connectors: n.rules.conAry,
                              entities: n.rules.entities,
                              params: t,
                              isEdit: u,
                              encrypt: e.encrypt
                          });
                          e.collect("更新数据 sql: ", s),
                          e.executeSql(s).then((function() {
                              return i.rtn()
                          }
                          )).catch((function(t) {
                              return c("执行SQL发生错误,".concat(null == t ? void 0 : t.message))
                          }
                          ))
                      } catch (t) {
                          u && console.error("执行SQL发生错误, ", t),
                          c("执行错误, ".concat(null == t ? void 0 : t.message))
                      }
              }
              ))
          }
      }
      ,
      7962: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => i
          });
          var r = function() {
              return r = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              r.apply(this, arguments)
          }
            , o = function(t) {
              var e = t.data
                , n = t.input
                , o = t.output
                , i = t.schema
                , a = (void 0 === i ? null : i) || n.get("inputValue").schema;
              e.merge && a && "object" === a.type ? o.get("rtn").setSchema(r(r({}, a), {
                  properties: r(r({}, a.properties), {
                      userId: {
                          type: "number"
                      }
                  })
              })) : o.get("rtn").setSchema({
                  type: "object",
                  properties: {
                      userId: {
                          type: "number"
                      }
                  }
              })
          };
          const i = {
              "@inputConnected": function(t, e) {
                  var n = t.data
                    , r = t.output
                    , i = t.input
                    , a = e.schema;
                  o({
                      data: n,
                      input: i,
                      output: r,
                      schema: a
                  })
              },
              ":root": [{
                  title: "合并输入",
                  type: "switch",
                  desc: "当输入值为对象时合并输入值",
                  value: {
                      get: function(t) {
                          return t.data.merge
                      },
                      set: function(t, e) {
                          var n = t.data
                            , r = t.input
                            , i = t.outputs;
                          n.merge = e,
                          o({
                              data: n,
                              input: r,
                              output: i
                          })
                      }
                  }
              }]
          }
      }
      ,
      9564: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => o
          });
          var r = function() {
              return r = Object.assign || function(t) {
                  for (var e, n = 1, r = arguments.length; n < r; n++)
                      for (var o in e = arguments[n])
                          Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
                  return t
              }
              ,
              r.apply(this, arguments)
          };
          function o(t) {
              var e = t.env
                , n = t.inputs
                , o = t.data;
              n.inputValue((function(t, n) {
                  var i, a = null === (i = null == e ? void 0 : e.user) || void 0 === i ? void 0 : i.id;
                  n.rtn(o.merge && "[object Object]" === Object.prototype.toString.call(t) ? r(r({}, t), {
                      userId: a
                  }) : {
                      userId: a
                  })
              }
              ))
          }
      }
      ,
      6176: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => r
          });
          const r = {
              ":root": [{
                  title: "密钥",
                  desc: "请务必保持生成和解析使用同一个密钥",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.secretKey
                      },
                      set: function(t, e) {
                          t.data.secretKey = e
                      }
                  }
              }, {
                  title: "过期时间（秒）",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.expiresIn
                      },
                      set: function(t, e) {
                          t.data.expiresIn = e
                      }
                  }
              }]
          }
      }
      ,
      4698: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = t.env
                , n = t.data
                , r = (t.outputs,
              t.inputs)
                , o = t.onError;
              r.params((function(t, r) {
                  var i;
                  if (t)
                      try {
                          var a = e.jwt.sign(t, n.secretKey, {
                              expiresIn: "".concat(n.expiresIn, "s")
                          });
                          r.rtn(a)
                      } catch (t) {
                          o("生成jwt出错：".concat(null !== (i = null == t ? void 0 : t.message) && void 0 !== i ? i : "未知错误"))
                      }
                  else
                      o("生成jwt的参数必须存在")
              }
              ))
          }
          n.d(e, {
              A: () => r
          })
      }
      ,
      3928: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => r
          });
          const r = {
              ":root": [{
                  title: "密钥",
                  desc: "请务必保持生成和解析使用同一个密钥",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.secretKey
                      },
                      set: function(t, e) {
                          t.data.secretKey = e
                      }
                  }
              }]
          }
      }
      ,
      9074: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = t.env
                , n = t.data
                , r = (t.outputs,
              t.inputs)
                , o = t.onError;
              r.params((function(t, r) {
                  var i;
                  if (t)
                      try {
                          var a = e.jwt.verify(t, n.secretKey);
                          r.rtn(a)
                      } catch (t) {
                          o("解析jwt出错：".concat(null !== (i = null == t ? void 0 : t.message) && void 0 !== i ? i : "未知错误"))
                      }
                  else
                      o("解析jwt的参数必须存在")
              }
              ))
          }
          n.d(e, {
              A: () => r
          })
      }
      ,
      7817: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => r
          });
          const r = {
              ":root": [{
                  title: "获取Header名称",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.headerName
                      },
                      set: function(t, e) {
                          t.data.headerName = e
                      }
                  }
              }]
          }
      }
      ,
      6513: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = t.env
                , n = t.data
                , r = t.outputs
                , o = t.inputs;
              t.onError,
              o.params((function(t, o) {
                  var i;
                  e.collect("获取请求头 val: ", null == e ? void 0 : e.headers),
                  n.headerName ? r.rtn(null === (i = null == e ? void 0 : e.headers) || void 0 === i ? void 0 : i[n.headerName]) : r.rtn(null == e ? void 0 : e.headers)
              }
              ))
          }
          n.d(e, {
              A: () => r
          })
      }
      ,
      7388: (t, e, n) => {
          "use strict";
          n.d(e, {
              A: () => r
          });
          const r = {
              ":root": [{
                  title: "小程序AppID",
                  desc: "请务必保持生成和解析使用同一个密钥",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.appId
                      },
                      set: function(t, e) {
                          t.data.appId = e
                      }
                  }
              }, {
                  title: "小程序AppSecret",
                  type: "text",
                  value: {
                      get: function(t) {
                          return t.data.appSecret
                      },
                      set: function(t, e) {
                          t.data.appSecret = e
                      }
                  }
              }]
          }
      }
      ,
      3678: (t, e, n) => {
          "use strict";
          function r(t) {
              var e = t.env
                , n = t.data
                , r = (t.outputs,
              t.inputs)
                , o = t.onError;
              r.params((function(t, r) {
                  var i, a, c, u, s;
                  if (!n.appId || !n.appSecret)
                      return o("appID和appSecret是必填项，请检查配置");
                  if (!t || "string" != typeof t)
                      return o("小程序登录凭证不存在，请检查输入项");
                  try {
                      null === (u = null === (c = null === (a = null === (i = e.services) || void 0 === i ? void 0 : i.wechatMiniapp) || void 0 === a ? void 0 : a.code2Session) || void 0 === c ? void 0 : c.call(a, t, n.appId, n.appSecret)) || void 0 === u || u.then((function(t) {
                          if (null == t ? void 0 : t.errcode)
                              return o("小程序登录失败[".concat(t.errcode, "]：").concat(t.errmsg));
                          r.rtn(t)
                      }
                      ))
                  } catch (t) {
                      o("小程序登录调用失败：".concat(null !== (s = null == t ? void 0 : t.message) && void 0 !== s ? s : "未知错误"))
                  }
              }
              ))
          }
          n.d(e, {
              A: () => r
          })
      }
      ,
      4622: t => {
          "use strict";
          t.exports = {
              useRegular: !1
          }
      }
      ,
      8968: t => {
          "use strict";
          t.exports = JSON.parse('{"outputSchema":{"type":"any"},"useExternalUrl":false}')
      }
      ,
      8738: t => {
          "use strict";
          t.exports = {}
      }
      ,
      9213: t => {
          "use strict";
          t.exports = {
              keyName: ""
          }
      }
      ,
      5745: t => {
          "use strict";
          t.exports = JSON.parse('{"keyName":"","httpOnly":false,"path":"/"}')
      }
      ,
      813: t => {
          "use strict";
          t.exports = {
              merge: !0
          }
      }
      ,
      4279: t => {
          "use strict";
          t.exports = JSON.parse('{"dynamic":false,"secretKey":"mybricks","expiresIn":86400}')
      }
      ,
      6551: t => {
          "use strict";
          t.exports = JSON.parse('{"dynamic":false,"secretKey":"mybricks"}')
      }
      ,
      4147: t => {
          "use strict";
          t.exports = JSON.parse('{"dynamic":false,"appId":"","appSecret":""}')
      }
  }
    , __webpack_module_cache__ = {};
  function __webpack_require__(t) {
      var e = __webpack_module_cache__[t];
      if (void 0 !== e)
          return e.exports;
      var n = __webpack_module_cache__[t] = {
          exports: {}
      };
      return __webpack_modules__[t](n, n.exports, __webpack_require__),
      n.exports
  }
  __webpack_require__.d = (t, e) => {
      for (var n in e)
          __webpack_require__.o(e, n) && !__webpack_require__.o(t, n) && Object.defineProperty(t, n, {
              enumerable: !0,
              get: e[n]
          })
  }
  ,
  __webpack_require__.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e);
  var __webpack_exports__ = {};
  let comlibEdt = window.__comlibs_edit_;
  comlibEdt || (comlibEdt = window.__comlibs_edit_ = []);
  const comAray = [];
  let comDef;
  return comlibEdt.push({
      id: "@mybricks/comlib-domain-normal",
      title: "MyBricks领域建模通用组件库",
      version: "0.0.8",
      dependencies: [],
      target: "nodejs",
      comAray
  }),
  comDef = {
      title: "查询数据",
      namespace: "mybricks.domain.select",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "选择数据",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js-autorun",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "结果",
          schema: {
              type: "unknown"
          },
          editable: !0
      }]
  },
  comDef.runtime = __webpack_require__(537).A,
  comDef.editors = __webpack_require__(705).A,
  comAray.push(comDef),
  comDef = {
      title: "分页查询数据",
      namespace: "mybricks.domain.selectByPager",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "选择数据",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js-autorun",
      inputs: [{
          id: "params",
          title: "参数",
          schema: [{
              title: "分页参数",
              name: "pageParams",
              type: "object",
              properties: {
                  pageNum: {
                      type: "number"
                  },
                  pageSize: {
                      type: "number"
                  }
              }
          }, {
              title: "参数",
              name: "params",
              type: "follow"
          }],
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "结果",
          schema: {
              type: "unknown"
          },
          editable: !0
      }]
  },
  comDef.runtime = __webpack_require__(8251).A,
  comDef.editors = __webpack_require__(9815).A,
  comAray.push(comDef),
  comDef = {
      title: "单条查询数据",
      namespace: "mybricks.domain.singleSelect",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "查询单条数据",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js-autorun",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "结果",
          schema: {
              type: "unknown"
          },
          editable: !0
      }]
  },
  comDef.runtime = __webpack_require__(2737).A,
  comDef.editors = __webpack_require__(4249).A,
  comAray.push(comDef),
  comDef = {
      title: "查询数据总数",
      namespace: "mybricks.domain.selectCount",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "查询数据总数",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js-autorun",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "结果",
          schema: {
              type: "unknown"
          },
          editable: !0
      }]
  },
  comDef.runtime = __webpack_require__(9088).A,
  comDef.editors = __webpack_require__(3614).A,
  comAray.push(comDef),
  comDef = {
      title: "添加数据",
      namespace: "mybricks.domain.dbInsert",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "向数据库中添加数据",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "插入的数据id",
          schema: {
              type: "number"
          }
      }]
  },
  comDef.runtime = __webpack_require__(4624).A,
  comDef.editors = __webpack_require__(9406).A,
  comAray.push(comDef),
  comDef = {
      title: "批量添加数据",
      namespace: "mybricks.domain.dbBatchInsert",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "向数据库中批量添加数据",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "插入的数据id",
          schema: {
              type: "number"
          }
      }]
  },
  comDef.runtime = __webpack_require__(8870).A,
  comDef.editors = __webpack_require__(2208).A,
  comAray.push(comDef),
  comDef = {
      title: "更新数据",
      namespace: "mybricks.domain.dbUpdate",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "向数据库中更新数据",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功"
      }]
  },
  comDef.runtime = __webpack_require__(4576).A,
  comDef.editors = __webpack_require__(3166).A,
  comAray.push(comDef),
  comDef = {
      title: "批量更新数据",
      namespace: "mybricks.domain.dbBatchUpdate",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "向数据库中批量更新数据",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功"
      }]
  },
  comDef.runtime = __webpack_require__(5314).A,
  comDef.editors = __webpack_require__(1164).A,
  comAray.push(comDef),
  comDef = {
      title: "删除数据",
      namespace: "mybricks.domain.dbDelete",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "删除数据项",
      icon: "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20standalone%3D%22no%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20t%3D%221674029536536%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%222687%22%20width%3D%2232%22%20height%3D%2232%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cpath%20d%3D%22M268.8%20460.8C262.4%20454.4%20243.2%20454.4%20224%20448%20172.8%20435.2%20147.2%20422.4%20153.6%20396.8c0-25.6%2025.6-44.8%2064-44.8%2044.8%200%2064%2019.2%2070.4%2057.6l44.8-12.8C326.4%20345.6%20281.6%20313.6%20211.2%20313.6%20140.8%20320%20108.8%20345.6%20102.4%20396.8%20102.4%20441.6%20128%20467.2%20198.4%20486.4c0%200%206.4%200%206.4%200%2012.8%200%2019.2%206.4%2025.6%206.4%2044.8%2012.8%2064%2032%2064%2051.2%200%2032-25.6%2051.2-70.4%2051.2C172.8%20595.2%20147.2%20576%20140.8%20524.8L89.6%20537.6c12.8%2064%2057.6%20102.4%20134.4%2096s115.2-32%20121.6-89.6C345.6%20505.6%20320%20473.6%20268.8%20460.8z%22%20p-id%3D%222688%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M537.6%20313.6C441.6%20320%20390.4%20371.2%20384%20473.6c6.4%2096%2051.2%20147.2%20140.8%20153.6l70.4%2083.2%2051.2-12.8L576%20627.2c70.4-19.2%20102.4-70.4%20108.8-147.2C678.4%20377.6%20627.2%20320%20537.6%20313.6zM531.2%20595.2c-64-6.4-96-44.8-96-115.2%206.4-76.8%2038.4-115.2%20102.4-121.6%2064%206.4%2096%2044.8%20102.4%20121.6C633.6%20550.4%20595.2%20588.8%20531.2%20595.2z%22%20p-id%3D%222689%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M780.8%20588.8%20780.8%20320%20736%20320%20736%20627.2%20947.2%20627.2%20947.2%20588.8Z%22%20p-id%3D%222690%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功"
      }]
  },
  comDef.runtime = __webpack_require__(6670).A,
  comDef.editors = __webpack_require__(1880).A,
  comAray.push(comDef),
  comDef = {
      title: "获取用户信息",
      namespace: "mybricks.domain.getAuthUser",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "获取用户信息，透传输入数据",
      icon: "data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%201024%201024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M858.5%20763.6c-18.9-44.8-46.1-85-80.6-119.5-34.5-34.5-74.7-61.6-119.5-80.6-0.4-0.2-0.8-0.3-1.2-0.5C719.5%20518%20760%20444.7%20760%20362c0-137-111-248-248-248S264%20225%20264%20362c0%2082.7%2040.5%20156%20102.8%20201.1-0.4%200.2-0.8%200.3-1.2%200.5-44.8%2018.9-85%2046-119.5%2080.6-34.5%2034.5-61.6%2074.7-80.6%20119.5C146.9%20807.5%20137%20854%20136%20901.8c-0.1%204.5%203.5%208.2%208%208.2h60c4.4%200%207.9-3.5%208-7.8%202-77.2%2033-149.5%2087.8-204.3%2056.7-56.7%20132-87.9%20212.2-87.9s155.5%2031.2%20212.2%2087.9C779%20752.7%20810%20825%20812%20902.2c0.1%204.4%203.6%207.8%208%207.8h60c4.5%200%208.1-3.7%208-8.2-1-47.8-10.9-94.3-29.5-138.2zM512%20534c-45.9%200-89.1-17.9-121.6-50.4S340%20407.9%20340%20362c0-45.9%2017.9-89.1%2050.4-121.6S466.1%20190%20512%20190s89.1%2017.9%20121.6%2050.4S684%20316.1%20684%20362c0%2045.9-17.9%2089.1-50.4%20121.6S557.9%20534%20512%20534z%22%0A%20%20%20%20%20%20%20%20%20%20fill%3D%22%23555555%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E",
      data: "./data.json",
      runtime: "./runtime.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "inputValue",
          title: "输入值",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功"
      }]
  },
  comDef.runtime = __webpack_require__(9564).A,
  comDef.editors = __webpack_require__(7962).A,
  comDef.data = __webpack_require__(813),
  comAray.push(comDef),
  comDef = {
      title: "结束",
      namespace: "mybricks.domain.end",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "结束节点，自定义返回数据",
      icon: "data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M793.889347%20200.380242c27.648573%2020.615681%2042.196018%2032.710677%2063.781037%2056.119312%2025.313864%2027.453234%2043.242957%2048.52047%2064.502857%2086.507991%2044.537416%2079.580127%2053.527718%20136.949077%2053.517684%20212.063821%200%2064.933675-15.452562%20130.459388-40.138263%20187.311893-22.076044%2050.841799-61.545336%20104.359483-101.886297%20138.933914-45.506755%2039.001681-81.214423%2060.462941-137.605337%2081.826531-55.699867%2021.102023-114.070267%2028.641326-181.379458%2027.791064-68.274516-0.862973-129.364283-11.040029-180.533878-31.80489-46.159002-18.731189-98.338744-46.827973-141.596418-87.541551-43.946046-41.361142-70.369064-75.958317-93.88139-127.198155-26.157437-57.004361-40.094111-129.065922-39.680686-191.781288%200-36.980719%204.033895-70.902234%2012.252873-105.241856%208.532726-35.651474%2020.069131-69.572989%2038.13135-102.35257%2018.856956-34.221214%2036.754607-62.067803%2058.869452-88.973149%2023.248751-28.285434%2039.2104-46.417894%2064.295476-63.475987%2018.297696-12.442861%2036.879036-9.295353%2047.199252-2.306612%204.403836%202.982273%208.919391%206.577992%2012.933218%2012.933217%209.572307%2015.156208-0.334486%2029.769212-6.69038%2038.465836-7.148625%209.781026-23.130343%2026.023643-38.738775%2043.218205-38.192895%2042.075603-55.133918%2065.965228-74.986303%20106.965794-30.772668%2063.552249-37.495827%20115.718611-38.131349%20166.573791-0.668971%2053.517684%209.995096%2099.647251%2027.427813%20140.483919%2033.916163%2080.572211%2094.807915%20144.44289%20175.270414%20178.615938%2041.108271%2017.845472%20113.812713%2037.319888%20181.960793%2038.13135%2056.193568%200.668971%20125.919751-11.321666%20166.574459-28.096784%2045.935566-18.954626%2097.223569-56.862539%20127.10383-94.324918%2023.013273-28.852721%2052.179742-70.910931%2064.413884-105.694749%2014.863868-42.260239%2024.806784-87.661297%2024.559934-132.458943%200-54.414105-11.53373-108.417461-36.918505-156.856317-20.16747-38.483228-46.480777-74.607665-84.66899-108.048189-13.377414-11.714352-23.822728-20.067124-38.808348-31.619586-10.191774-7.857065-36.059546-25.027545-28.923632-47.326356%204.970455-15.53217%2018.303717-25.294464%2031.887843-27.205046%2019.456354-2.736092%2028.565733%202.427027%2043.705885%2012.041479l6.179955%204.322891zM510.755379%20531.65738c-8.696624-0.668971-10.034566-0.446204-20.738102-6.689711-11.031333-6.434832-17.839451-21.183637-16.514219-35.175166V92.220334c0-18.178619%200.386665-22.815926%208.988295-31.685813%205.351768-5.519011%2010.963097-11.381873%2026.08987-11.539751%2016.055305-0.167243%2021.407073%203.846584%2027.929542%209.700081%209.70677%208.711341%2010.703537%2017.56049%2010.377078%2033.525483v397.5715c-0.509756%2015.273947%200.326458%2022.967114-11.380535%2033.502739-3.884046%203.495374-8.027653%207.693167-20.96087%208.362138l-3.791059%200.000669z%20m4.453341%200.573308%22%0A%20%20%20%20%20%20%20%20%20%20fill%3D%22%23555555%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E",
      data: "./data.json",
      runtime: "./runtime.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "customResponse",
          title: "响应值",
          schema: {
              type: "follow"
          },
          editable: !0
      }]
  },
  comDef.runtime = __webpack_require__(9755).A,
  comDef.editors = __webpack_require__(7225).A,
  comDef.data = __webpack_require__(4622),
  comAray.push(comDef),
  comDef = {
      visibility: !1,
      title: "JS计算",
      namespace: "mybricks.domain.segment",
      version: "1.0.0",
      description: "JS计算",
      author: "MyBricks",
      author_name: "MyBricks",
      icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20t%3D%221628601589636%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20p-id%3D%2268206%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%2F%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M617.728%20635.008a173.269333%20173.269333%200%200%201-93.312-16.981333%2061.397333%2061.397333%200%200%201-22.869333-43.093334%209.472%209.472%200%200%200-9.642667-9.386666%201997.909333%201997.909333%200%200%200-40.533333%200%209.002667%209.002667%200%200%200-9.856%207.936%2099.797333%2099.797333%200%200%200%2032.128%2078.677333%20170.282667%20170.282667%200%200%200%2095.061333%2035.797333%20343.978667%20343.978667%200%200%200%20108.074667-4.608%20133.376%20133.376%200%200%200%2071.594666-38.570666%2099.754667%2099.754667%200%200%200%2016.896-95.189334%2079.744%2079.744%200%200%200-52.48-46.72c-54.613333-19.2-113.664-17.706667-169.386666-32.298666-9.685333-2.986667-21.504-6.314667-25.813334-16.554667a36.48%2036.48%200%200%201%2012.117334-40.746667%20109.141333%20109.141333%200%200%201%2057.6-14.336%20173.653333%20173.653333%200%200%201%2080.341333%2011.52%2061.269333%2061.269333%200%200%201%2029.312%2042.325334%2010.368%2010.368%200%200%200%209.728%2010.069333c13.397333%200.256%2026.794667%200.042667%2040.234667%200.085333a9.728%209.728%200%200%200%2010.538666-7.168%20103.850667%20103.850667%200%200%200-50.645333-89.856%20250.88%20250.88%200%200%200-137.301333-21.034666%20149.546667%20149.546667%200%200%200-92.842667%2037.333333%2092.8%2092.8%200%200%200-18.517333%2096.512%2082.346667%2082.346667%200%200%200%2051.968%2045.312c54.485333%2019.669333%20114.176%2013.354667%20169.130666%2030.762667%2010.752%203.626667%2023.210667%209.216%2026.496%2021.12a42.24%2042.24%200%200%201-11.52%2040.362666%20126.72%20126.72%200%200%201-76.501333%2018.730667z%20m248.277333-360.32q-159.488-90.197333-319.104-180.266667a71.552%2071.552%200%200%200-69.845333%200L159.146667%20273.962667a65.792%2065.792%200%200%200-34.346667%2057.258666v361.6a66.261333%2066.261333%200%200%200%2035.669333%2057.813334c30.421333%2016.554667%2059.989333%2034.816%2091.008%2050.304a130.730667%20130.730667%200%200%200%20116.821334%203.2%2090.752%2090.752%200%200%200%2042.453333-81.962667c0.213333-119.338667%200-238.677333%200.085333-357.973333a9.386667%209.386667%200%200%200-8.832-10.88%201773.013333%201773.013333%200%200%200-40.661333%200%208.96%208.96%200%200%200-9.728%209.088c-0.170667%20118.570667%200.042667%20237.141333-0.085333%20355.754666a40.106667%2040.106667%200%200%201-26.026667%2037.674667%2065.365333%2065.365333%200%200%201-52.906667-7.082667l-84.565333-47.786666a10.112%2010.112%200%200%201-5.76-10.026667V333.098667a11.050667%2011.050667%200%200%201%206.698667-11.093334q158.421333-89.258667%20316.8-178.645333a11.008%2011.008%200%200%201%2012.458666%200l316.842667%20178.602667a11.178667%2011.178667%200%200%201%206.656%2011.093333v357.888a10.325333%2010.325333%200%200%201-5.717333%2010.154667q-155.989333%2088.234667-312.192%20176.213333c-4.949333%202.730667-10.837333%207.210667-16.64%203.84-27.306667-15.445333-54.186667-31.488-81.408-47.061333a8.789333%208.789333%200%200%200-9.813334-0.597334%20222.634667%20222.634667%200%200%201-37.632%2017.578667c-5.888%202.389333-13.141333%203.072-17.194666%208.533333a56.149333%2056.149333%200%200%200%2018.432%2013.226667l95.402666%2055.168a69.546667%2069.546667%200%200%200%2070.613334%201.962667q158.976-89.6%20317.952-179.370667a66.389333%2066.389333%200%200%200%2035.669333-57.770667V331.221333a65.706667%2065.706667%200%200%200-33.194667-56.533333z%22%20p-id%3D%2268207%22%20fill%3D%22%23555555%22%2F%3E%3C%2Fsvg%3E",
      runtime: "./rt.ts",
      editors: "./editors.ts",
      rtType: "js-autorun",
      inputs: [{
          id: "input0",
          title: "输入项0",
          schema: {
              type: "follow"
          }
      }],
      outputs: [{
          id: "output0",
          title: "输出项0",
          schema: {
              type: "number"
          },
          editable: !0
      }]
  },
  comDef.runtime = __webpack_require__(8462).A,
  comDef.editors = __webpack_require__(1468).A,
  comAray.push(comDef),
  comDef = {
      title: "服务接口",
      namespace: "mybricks.normal-pc.service",
      author: "MyBricks",
      author_name: "MyBricks",
      version: "1.0.7",
      description: "服务接口",
      runtime: "./runtime.ts",
      editors: "./editors.tsx",
      data: "./data.json",
      icon: "data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%2264736%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M351.59960937%20876.65820313c-49.04296875%200-90.79101563-31.90429688-105.55664062-76.02539063h-62.13867188c-19.42382813%200-35.15625-15.73242188-35.15625-35.15625s15.73242188-35.15625%2035.15625-35.15625h62.13867188c14.765625-44.12109375%2056.51367188-76.02539063%20105.55664063-76.02539063s90.79101563%2031.90429688%20105.55664062%2076.02539063h384.34570313c19.42382813%200%2035.15625%2015.73242188%2035.15624999%2035.15625s-15.73242188%2035.15625-35.15625%2035.15625H457.15625c-14.765625%2044.03320313-56.51367188%2076.02539063-105.55664063%2076.02539063z%20m1e-8-152.13867188c-22.58789063%200-40.86914063%2018.36914063-40.86914063%2040.86914063%200%2022.58789063%2018.36914063%2040.86914063%2040.86914063%2040.86914062%2022.58789063%200%2040.86914063-18.36914063%2040.86914062-40.86914063%200.08789063-22.5-18.28125-40.86914063-40.86914063-40.86914062z%20m323.08593749-101.33789063c-49.04296875%200-90.79101563-31.90429688-105.55664062-76.02539062H183.9921875c-19.42382813%200-35.15625-15.73242188-35.15625-35.15625s15.73242188-35.15625%2035.15625-35.15625H569.12890625c14.765625-44.12109375%2056.51367188-76.02539063%20105.55664063-76.02539063s90.79101563%2031.90429688%20105.55664062%2076.02539063h61.25976563c19.42382813%200%2035.15625%2015.73242188%2035.15625%2035.15625s-15.73242188%2035.15625-35.15625%2035.15625h-61.25976563c-14.765625%2044.12109375-56.51367188%2076.02539063-105.55664063%2076.02539063z%20m1e-8-152.13867187c-22.58789063%200-40.86914063%2018.36914063-40.86914063%2040.86914063%200%2022.58789063%2018.36914063%2040.86914063%2040.86914063%2040.86914062%2022.58789063%200%2040.86914063-18.36914063%2040.86914062-40.86914063s-18.36914063-40.86914063-40.86914063-40.86914062zM351.59960937%20370.93554687c-49.04296875%200-90.79101563-31.90429688-105.55664062-76.02539062h-62.13867188c-19.42382813%200-35.15625-15.73242188-35.15625-35.15625s15.73242188-35.15625%2035.15625-35.15625h62.13867188c14.765625-44.12109375%2056.51367188-76.02539063%20105.55664063-76.02539063s90.79101563%2031.90429688%20105.55664062%2076.02539063h384.34570313c19.42382813%200%2035.15625%2015.73242188%2035.15624999%2035.15625s-15.73242188%2035.15625-35.15625%2035.15625H457.15625c-14.765625%2044.12109375-56.51367188%2076.02539063-105.55664063%2076.02539063z%20m1e-8-152.13867187c-22.58789063%200-40.86914063%2018.36914063-40.86914063%2040.86914063%200%2022.58789063%2018.36914063%2040.86914063%2040.86914063%2040.86914062%2022.58789063%200%2040.86914063-18.36914063%2040.86914062-40.86914063%200.08789063-22.5-18.28125-40.86914063-40.86914063-40.86914062z%22%20p-id%3D%2264737%22%20fill%3D%22%23555555%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      rtType: "js-autorun",
      inputs: [{
          id: "call",
          rels: ["then", "catch"],
          title: "调用",
          desc: "调用对应服务接口",
          schema: {
              type: "object"
          }
      }],
      outputs: [{
          id: "then",
          title: "结果",
          desc: "成功时，接口返回信息",
          schema: {
              type: "unknown"
          }
      }, {
          id: "catch",
          title: "发生错误",
          desc: "发生错误时，接口返回信息",
          schema: {
              type: "string"
          }
      }]
  },
  comDef.runtime = __webpack_require__(9391).A,
  comDef.editors = __webpack_require__(3607).A,
  comDef.data = __webpack_require__(8968),
  comAray.push(comDef),
  comDef = {
      visibility: !1,
      title: "变量",
      namespace: "mybricks.core-comlib.var",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "变量",
      icon: "./icon.png",
      data: "./data.json",
      runtime: "./runtime.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "get",
          title: "读取",
          schema: {
              type: "any"
          },
          rels: ["return"]
      }, {
          id: "set",
          title: "赋值",
          schema: {
              type: "follow"
          }
      }, {
          id: "reset",
          title: "重置",
          schema: {
              type: "any"
          }
      }],
      outputs: [{
          id: "return",
          title: "完成",
          schema: {
              type: "unknown"
          }
      }, {
          id: "changed",
          title: "当值发生变化",
          schema: {
              type: "unknown"
          }
      }]
  },
  comDef.runtime = __webpack_require__(6443).A,
  comDef.editors = __webpack_require__(7657).A,
  comDef.data = __webpack_require__(8738),
  comAray.push(comDef),
  comDef = {
      title: "JS计算",
      namespace: "mybricks.core-comlib._muilt-inputJs",
      version: "1.0.0",
      description: "JS计算",
      author: "MyBricks",
      author_name: "MyBricks",
      icon: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20t%3D%221628601589636%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20p-id%3D%2268206%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%2F%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M617.728%20635.008a173.269333%20173.269333%200%200%201-93.312-16.981333%2061.397333%2061.397333%200%200%201-22.869333-43.093334%209.472%209.472%200%200%200-9.642667-9.386666%201997.909333%201997.909333%200%200%200-40.533333%200%209.002667%209.002667%200%200%200-9.856%207.936%2099.797333%2099.797333%200%200%200%2032.128%2078.677333%20170.282667%20170.282667%200%200%200%2095.061333%2035.797333%20343.978667%20343.978667%200%200%200%20108.074667-4.608%20133.376%20133.376%200%200%200%2071.594666-38.570666%2099.754667%2099.754667%200%200%200%2016.896-95.189334%2079.744%2079.744%200%200%200-52.48-46.72c-54.613333-19.2-113.664-17.706667-169.386666-32.298666-9.685333-2.986667-21.504-6.314667-25.813334-16.554667a36.48%2036.48%200%200%201%2012.117334-40.746667%20109.141333%20109.141333%200%200%201%2057.6-14.336%20173.653333%20173.653333%200%200%201%2080.341333%2011.52%2061.269333%2061.269333%200%200%201%2029.312%2042.325334%2010.368%2010.368%200%200%200%209.728%2010.069333c13.397333%200.256%2026.794667%200.042667%2040.234667%200.085333a9.728%209.728%200%200%200%2010.538666-7.168%20103.850667%20103.850667%200%200%200-50.645333-89.856%20250.88%20250.88%200%200%200-137.301333-21.034666%20149.546667%20149.546667%200%200%200-92.842667%2037.333333%2092.8%2092.8%200%200%200-18.517333%2096.512%2082.346667%2082.346667%200%200%200%2051.968%2045.312c54.485333%2019.669333%20114.176%2013.354667%20169.130666%2030.762667%2010.752%203.626667%2023.210667%209.216%2026.496%2021.12a42.24%2042.24%200%200%201-11.52%2040.362666%20126.72%20126.72%200%200%201-76.501333%2018.730667z%20m248.277333-360.32q-159.488-90.197333-319.104-180.266667a71.552%2071.552%200%200%200-69.845333%200L159.146667%20273.962667a65.792%2065.792%200%200%200-34.346667%2057.258666v361.6a66.261333%2066.261333%200%200%200%2035.669333%2057.813334c30.421333%2016.554667%2059.989333%2034.816%2091.008%2050.304a130.730667%20130.730667%200%200%200%20116.821334%203.2%2090.752%2090.752%200%200%200%2042.453333-81.962667c0.213333-119.338667%200-238.677333%200.085333-357.973333a9.386667%209.386667%200%200%200-8.832-10.88%201773.013333%201773.013333%200%200%200-40.661333%200%208.96%208.96%200%200%200-9.728%209.088c-0.170667%20118.570667%200.042667%20237.141333-0.085333%20355.754666a40.106667%2040.106667%200%200%201-26.026667%2037.674667%2065.365333%2065.365333%200%200%201-52.906667-7.082667l-84.565333-47.786666a10.112%2010.112%200%200%201-5.76-10.026667V333.098667a11.050667%2011.050667%200%200%201%206.698667-11.093334q158.421333-89.258667%20316.8-178.645333a11.008%2011.008%200%200%201%2012.458666%200l316.842667%20178.602667a11.178667%2011.178667%200%200%201%206.656%2011.093333v357.888a10.325333%2010.325333%200%200%201-5.717333%2010.154667q-155.989333%2088.234667-312.192%20176.213333c-4.949333%202.730667-10.837333%207.210667-16.64%203.84-27.306667-15.445333-54.186667-31.488-81.408-47.061333a8.789333%208.789333%200%200%200-9.813334-0.597334%20222.634667%20222.634667%200%200%201-37.632%2017.578667c-5.888%202.389333-13.141333%203.072-17.194666%208.533333a56.149333%2056.149333%200%200%200%2018.432%2013.226667l95.402666%2055.168a69.546667%2069.546667%200%200%200%2070.613334%201.962667q158.976-89.6%20317.952-179.370667a66.389333%2066.389333%200%200%200%2035.669333-57.770667V331.221333a65.706667%2065.706667%200%200%200-33.194667-56.533333z%22%20p-id%3D%2268207%22%20fill%3D%22%23555555%22%2F%3E%3C%2Fsvg%3E",
      runtime: "./runtime.ts",
      editors: "./editors.ts",
      rtType: "js-autorun",
      inputs: [{
          id: "input",
          title: "输入项",
          schema: [{
              name: "inputValue0",
              title: "参数0",
              type: "follow"
          }]
      }],
      outputs: [{
          id: "output0",
          title: "输出项0",
          schema: {
              type: "number"
          },
          editable: !0
      }]
  },
  comDef.runtime = __webpack_require__(9571).A,
  comDef.editors = __webpack_require__(4945).A,
  comAray.push(comDef),
  comDef = {
      title: "获取请求头",
      namespace: "mybricks.domain.requestHeader",
      author: "CheMingjun",
      author_name: "车明君",
      version: "1.0.0",
      description: "获取请求头数据",
      icon: "data:image/svg+xml,%3Csvg%20t%3D%221682320404405%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%224281%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cpath%20d%3D%22M825.6%20198.4v32h-6.4c-2.133333%200-6.4%200-12.8%202.133333-6.4%200-12.8%202.133333-17.066667%204.266667-4.266667%202.133333-8.533333%204.266667-12.8%208.533333-4.266667%204.266667-6.4%208.533333-6.4%2012.8v505.6c0%208.533333%204.266667%2014.933333%2014.933334%2019.2%208.533333%204.266667%2019.2%206.4%2027.733333%208.533334l14.933333%202.133333v32H597.333333v-32c27.733333%200%2044.8-2.133333%2049.066667-4.266667s6.4-10.666667%206.4-25.6v-224h-283.733333v224c0%2014.933333%202.133333%2021.333333%206.4%2025.6s21.333333%204.266667%2049.066666%204.266667v32h-228.266666v-32h6.4c2.133333%200%206.4%200%2012.8-2.133333%206.4%200%2012.8-2.133333%2017.066666-4.266667%204.266667-2.133333%208.533333-4.266667%2012.8-8.533333%204.266667-4.266667%206.4-8.533333%206.4-12.8v-505.6c0-8.533333-4.266667-14.933333-14.933333-19.2-8.533333-4.266667-19.2-6.4-27.733333-8.533334l-14.933334-2.133333v-32h228.266667v32c-27.733333%200-44.8%202.133333-49.066667%204.266667s-6.4%2010.666667-6.4%2025.6v224h283.733334v-224c0-14.933333-2.133333-21.333333-6.4-25.6-4.266667-2.133333-21.333333-4.266667-49.066667-4.266667v-32h230.4z%22%20p-id%3D%224282%22%20fill%3D%22%232c2c2c%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.tsx",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功"
      }]
  },
  comDef.runtime = __webpack_require__(6513).A,
  comDef.editors = __webpack_require__(7817).A,
  comAray.push(comDef),
  comDef = {
      title: "获取Cookie",
      namespace: "mybricks.domain.cookie-get",
      author: "MyBricks",
      author_name: "MyBricks",
      version: "1.0.0",
      description: "获取Cookie",
      icon: "data:image/svg+xml,%3Csvg%20t%3D%221724122325950%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%2214947%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cpath%20d%3D%22M640%20426.666667h-21.333333c-35.413333%200-64-28.586667-64-64V341.333333h-21.333334c-35.413333%200-64-28.586667-64-64V216.32C337.493333%20234.666667%20233.386667%20341.333333%20216.32%20472.746667A63.744%2063.744%200%200%201%20341.333333%20490.666667c0%2035.413333-28.586667%2064-64%2064-33.706667%200-61.013333-26.026667-64-58.88%200%2020.906667%200%2042.24%203.84%2064%2017.493333%20114.773333%20104.533333%20209.92%20216.32%20239.786666A63.914667%2063.914667%200%200%201%20469.333333%20682.666667c35.413333%200%2064%2028.586667%2064%2064%200%2030.72-21.333333%2056.32-50.346666%2062.293333%2024.746667%201.706667%2048.64%201.706667%2071.68-1.706667V810.666667c0%2028.16%205.12%2055.466667%2013.653333%2080.64-18.346667%202.986667-37.12%204.693333-56.32%204.693333a384%20384%200%200%201%200-768s42.666667%200%2042.666667%2042.666667v85.333333h42.666666s42.666667%200%2042.666667%2042.666667v42.666666h85.333333s42.666667%200%2042.666667%2042.666667v42.666667h85.333333s25.6%200%2037.12%2021.333333a360.277333%20360.277333%200%200%201%200.853334%20120.32c-25.173333-8.533333-52.48-13.653333-80.64-13.653333h-3.413334c2.133333-13.653333%203.413333-28.16%203.413334-42.666667h-64c-35.413333%200-64-28.586667-64-64V426.666667h-42.666667m0%20192v1.28c28.16-24.746667%2061.866667-43.946667%2098.986667-55.04-10.24-6.4-22.186667-10.24-34.986667-10.24-35.413333%200-64%2028.586667-64%2064m-149.333333-21.333334c35.413333%200%2064-28.586667%2064-64s-28.586667-64-64-64-64%2028.586667-64%2064%2028.586667%2064%2064%2064M469.333333%20320c0-35.413333-28.586667-64-64-64S341.333333%20284.586667%20341.333333%20320%20369.92%20384%20405.333333%20384%20469.333333%20355.413333%20469.333333%20320m441.173334%20355.84l-153.173334%20153.173333-67.84-67.84L640%20810.666667l117.333333%20128%20202.666667-202.666667-49.493333-60.16z%22%20p-id%3D%2214948%22%20fill%3D%22%23555555%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.ts",
      data: "./data.json",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "any"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功"
      }]
  },
  comDef.runtime = __webpack_require__(4760).A,
  comDef.editors = __webpack_require__(142).A,
  comDef.data = __webpack_require__(9213),
  comAray.push(comDef),
  comDef = {
      title: "设置Cookie",
      namespace: "mybricks.domain.cookie-set",
      author: "MyBricks",
      author_name: "MyBricks",
      version: "1.0.0",
      description: "设置Cookie",
      icon: "data:image/svg+xml,%3Csvg%20t%3D%221724122292130%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%2214675%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cpath%20d%3D%22M704%20554.666667c12.8%200%2024.746667%203.84%2034.986667%2010.24-37.12%2011.093333-70.826667%2030.293333-98.986667%2055.04v-1.28c0-35.413333%2028.586667-64%2064-64m-21.333333-128v21.333333c0%2035.413333%2028.586667%2064%2064%2064H810.666667c0%2014.506667-1.28%2029.013333-3.413334%2042.666667H810.666667c28.16%200%2055.466667%205.12%2080.64%2013.653333a360.277333%20360.277333%200%200%200-0.853334-120.32C878.933333%20426.666667%20853.333333%20426.666667%20853.333333%20426.666667h-85.333333V384c0-42.666667-42.666667-42.666667-42.666667-42.666667h-85.333333V298.666667c0-42.666667-42.666667-42.666667-42.666667-42.666667h-42.666666V170.666667c0-42.666667-42.666667-42.666667-42.666667-42.666667a384%20384%200%200%200%200%20768c19.2%200%2037.973333-1.706667%2056.32-4.693333-8.533333-25.173333-13.653333-52.48-13.653333-80.64v-3.413334c-23.04%203.413333-46.933333%203.413333-71.68%201.706667%2029.013333-5.973333%2050.346667-31.573333%2050.346666-62.293333%200-35.413333-28.586667-64-64-64a63.914667%2063.914667%200%200%200-35.84%20116.906666c-111.786667-29.866667-198.826667-125.013333-216.32-239.786666C213.333333%20538.026667%20213.333333%20516.693333%20213.333333%20495.786667c2.986667%2032.853333%2030.293333%2058.88%2064%2058.88%2035.413333%200%2064-28.586667%2064-64S312.746667%20426.666667%20277.333333%20426.666667c-29.013333%200-53.333333%2019.626667-61.013333%2046.08C233.386667%20341.333333%20337.493333%20234.666667%20469.333333%20216.32V277.333333c0%2035.413333%2028.586667%2064%2064%2064h21.333334v21.333334c0%2035.413333%2028.586667%2064%2064%2064H682.666667m-192%20170.666666c35.413333%200%2064-28.586667%2064-64s-28.586667-64-64-64-64%2028.586667-64%2064%2028.586667%2064%2064%2064M469.333333%20320c0-35.413333-28.586667-64-64-64S341.333333%20284.586667%20341.333333%20320%20369.92%20384%20405.333333%20384%20469.333333%20355.413333%20469.333333%20320M853.333333%20768v-128h-85.333333v128h-128v85.333333h128v128h85.333333v-128h128v-85.333333h-128z%22%20p-id%3D%2214676%22%20fill%3D%22%23555555%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.ts",
      data: "./data.json",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "follow"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功"
      }]
  },
  comDef.runtime = __webpack_require__(8332).A,
  comDef.editors = __webpack_require__(6122).A,
  comDef.data = __webpack_require__(5745),
  comAray.push(comDef),
  comDef = {
      title: "生成JsonWebToken",
      namespace: "mybricks.domain.jwt-sign",
      author: "MyBricks",
      author_name: "MyBricks",
      version: "1.0.0",
      description: "生成JsonWebToken",
      icon: "data:image/svg+xml,%3Csvg%20t%3D%221724140114845%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%2225120%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cpath%20d%3D%22M701.248%200A323.2%20323.2%200%200%200%20393.6%20420.8L6.528%20807.872A22.4%2022.4%200%200%200%200%20823.68v178.048c0%2012.288%209.984%2022.272%2022.272%2022.272h155.84c5.888%200%2011.52-2.368%2015.744-6.528l44.8-44.8a22.336%2022.336%200%200%200%206.528-15.744v-70.848h70.848a22.272%2022.272%200%200%200%2022.272-22.272v-62.4h62.4c5.888%200%2011.52-2.368%2015.744-6.528l170.24-170.24A323.2%20323.2%200%200%200%201024%20322.752%20323.2%20323.2%200%200%200%20701.248%200z%20m-225.28%20496.96l-379.072%20379.072a11.136%2011.136%200%201%201-15.68-15.744L460.288%20481.28a11.136%2011.136%200%200%201%2015.744%2015.744z%20m385.472-35.328l-15.744%2015.744L546.56%20178.304l15.744-15.744a210.112%20210.112%200%200%201%20149.504-61.888c56.512%200%20109.632%2021.952%20149.568%2061.888a211.712%20211.712%200%200%201%200%20299.072z%22%20fill%3D%22%23555555%22%20p-id%3D%2225121%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.ts",
      data: "./data.json",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "any"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功",
          schema: {
              type: "string"
          }
      }]
  },
  comDef.runtime = __webpack_require__(4698).A,
  comDef.editors = __webpack_require__(6176).A,
  comDef.data = __webpack_require__(4279),
  comAray.push(comDef),
  comDef = {
      title: "解析JsonWebToken",
      namespace: "mybricks.domain.jwt-verify",
      author: "MyBricks",
      author_name: "MyBricks",
      version: "1.0.0",
      description: "解析JsonWebToken",
      icon: "data:image/svg+xml,%3Csvg%20t%3D%221724140114845%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%2225120%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cpath%20d%3D%22M701.248%200A323.2%20323.2%200%200%200%20393.6%20420.8L6.528%20807.872A22.4%2022.4%200%200%200%200%20823.68v178.048c0%2012.288%209.984%2022.272%2022.272%2022.272h155.84c5.888%200%2011.52-2.368%2015.744-6.528l44.8-44.8a22.336%2022.336%200%200%200%206.528-15.744v-70.848h70.848a22.272%2022.272%200%200%200%2022.272-22.272v-62.4h62.4c5.888%200%2011.52-2.368%2015.744-6.528l170.24-170.24A323.2%20323.2%200%200%200%201024%20322.752%20323.2%20323.2%200%200%200%20701.248%200z%20m-225.28%20496.96l-379.072%20379.072a11.136%2011.136%200%201%201-15.68-15.744L460.288%20481.28a11.136%2011.136%200%200%201%2015.744%2015.744z%20m385.472-35.328l-15.744%2015.744L546.56%20178.304l15.744-15.744a210.112%20210.112%200%200%201%20149.504-61.888c56.512%200%20109.632%2021.952%20149.568%2061.888a211.712%20211.712%200%200%201%200%20299.072z%22%20fill%3D%22%23555555%22%20p-id%3D%2225121%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.ts",
      data: "./data.json",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              type: "string"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功",
          schema: {
              type: "any"
          }
      }]
  },
  comDef.runtime = __webpack_require__(9074).A,
  comDef.editors = __webpack_require__(3928).A,
  comDef.data = __webpack_require__(6551),
  comAray.push(comDef),
  comDef = {
      title: "微信小程序登录",
      namespace: "mybricks.domain.weapp-login",
      author: "MyBricks",
      author_name: "MyBricks",
      version: "1.0.0",
      description: "微信小程序登录",
      icon: "data:image/svg+xml,%3Csvg%20t%3D%221724227500283%22%20class%3D%22icon%22%20viewBox%3D%220%200%201024%201024%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20p-id%3D%224272%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Cpath%20d%3D%22M512%200a512%20512%200%201%200%20512%20512A512%20512%200%200%200%20512%200z%20m256.717%20460.186a151.962%20151.962%200%200%201-87.347%2065.74%2083.251%2083.251%200%200%201-24.474%204.096%2029.082%2029.082%200%200%201%200-58.163%2015.667%2015.667%200%200%200%206.451-1.229%2091.443%2091.443%200%200%200%2055.91-40.96%2075.264%2075.264%200%200%200%2011.06-39.628c0-45.978-42.496-83.866-94.31-83.866a105.267%20105.267%200%200%200-51.2%2013.414%2081.92%2081.92%200%200%200-43.725%2070.452v244.224a138.445%20138.445%200%200%201-72.704%20120.422%20159.642%20159.642%200%200%201-79.77%2020.48c-84.378%200-153.6-63.488-153.6-142.029a136.192%20136.192%200%200%201%2019.763-69.837%20151.962%20151.962%200%200%201%2087.347-65.74%2085.914%2085.914%200%200%201%2024.474-4.096%2029.082%2029.082%200%201%201%200%2058.163%2015.667%2015.667%200%200%200-6.451%201.229%2095.949%2095.949%200%200%200-55.91%2040.96%2075.264%2075.264%200%200%200-11.06%2039.628c0%2045.978%2042.496%2083.866%2094.925%2083.866a105.267%20105.267%200%200%200%2051.2-13.414%2081.92%2081.92%200%200%200%2043.622-70.452V390.35a138.752%20138.752%200%200%201%2072.807-120.525%20151.245%20151.245%200%200%201%2079.155-21.504c84.378%200%20153.6%2063.488%20153.6%20142.029a136.192%20136.192%200%200%201-19.763%2069.837z%22%20p-id%3D%224273%22%20fill%3D%22%23555555%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
      runtime: "./rt.ts",
      data: "./data.json",
      editors: "./editors.tsx",
      rtType: "js",
      inputs: [{
          id: "params",
          title: "参数",
          schema: {
              title: "登录凭证code",
              type: "string"
          },
          rels: ["rtn"],
          editable: !0
      }],
      outputs: [{
          id: "rtn",
          title: "成功",
          schema: {
              type: "object",
              properties: {
                  openid: {
                      title: "用户唯一标识",
                      type: "string"
                  },
                  unionid: {
                      title: "开放平台的唯一标识",
                      type: "string"
                  }
              }
          }
      }]
  },
  comDef.runtime = __webpack_require__(3678).A,
  comDef.editors = __webpack_require__(7388).A,
  comDef.data = __webpack_require__(4147),
  comAray.push(comDef),
  __webpack_exports__
}
)()));
//# sourceMappingURL=edit.js.map
