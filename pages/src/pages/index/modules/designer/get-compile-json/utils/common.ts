export function getComsFromPageJson (pageJson)  {
  /** 多场景 */
  if (Array.isArray(pageJson?.scenes)) {
    return pageJson?.scenes.reduce((acc, cur) => {
      return {
        ...acc,
        ...(cur?.coms || {})
      }
    }, {})
  }
  /** 非多场景 */
  return pageJson?.coms ?? {}
}

export function isPageScene(sceneToJson) {
  // 为了兼容 spa 导为 mpa 时，引擎把 popup 类型转为了 normal 类型
  // 需要额外判断，如果包含了 mybricks.taro.popup 组件，则过滤
  if (
    sceneToJson.deps.some((dep) => {
      return dep.namespace === "mybricks.taro.popup";
    })
  ) {
    // console.log("包含了 mybricks.taro.popup 组件", sceneToJson);
    return false;
  }

  return (
    !isPopupScene(sceneToJson) &&
    !isModuleScene(sceneToJson) &&
    sceneToJson.id !== "tabbar"
  );
}

export function isPopupScene(sceneToJson) {
  return sceneToJson.type === "popup";
}
export function isModuleScene(sceneToJson) {
  return sceneToJson.type === "module";
}

export const cloneToJson = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export function findComFromToJson(pageToJson, namespace): any {
  pageToJson = cloneToJson(pageToJson);

  return Object.values(pageToJson.coms).find((item) => {
    return item.def.namespace.toLowerCase() === namespace.toLowerCase();
  });
}

export function rgbaToHex(rgbaStr) {
  if (rgbaStr.startsWith("rgba") === false) {
    return rgbaStr;
  }

  let rgba = rgbaStr.slice(5, -1).split(",");
  let r = parseInt(rgba[0]);
  let g = parseInt(rgba[1]);
  let b = parseInt(rgba[2]);
  let a = parseFloat(rgba[3]);
  let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  if (a === 1) {
    return hex;
  }
  return (
    hex +
    Math.round(a * 255)
      .toString(16)
      .padStart(2, "0")
  );
}