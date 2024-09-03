import { getComsFromPageJson } from "./common";

export function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export function px2rpx(value) {
  const regex = /(\d*\.?\d+)px/g;
  let result = value;
  try {
    result = value.replace(regex, (match, p1) => {
      const pxValue = parseFloat(p1);
      if (pxValue <= 2) {
        return `${pxValue}px`;
      } else {
        const rpxValue = pxValue * 2;
        return `${rpxValue}rpx`;
      }
    });
  } catch (error) {}
  return result;
}

export function px2Vw(value) {
  const regex = /(\d*\.?\d+)px/g;
  let result = value;
  try {
    result = value.replace(regex, (match, p1) => {
      const pxValue = parseFloat(p1);
      if (pxValue <= 2) {
        return `${pxValue}px`;
      } else {
        const rpxValue = pxValue / (375 / 100);
        return `${rpxValue}vw`;
      }
    });
  } catch (error) {}
  return result;
}

interface ComCss {
  selector: string;
  css: string;
}

/** 根据页面Json生成每个页面的CSS */
export const getPageCssMap = (pageToJson) => {
  let pageCss = {};

  const jsonComs = getComsFromPageJson(pageToJson);

  Object.keys(jsonComs).forEach((key) => {
    let styleAry = jsonComs[key]?.model?.style?.styleAry || [];
    pageCss[key] = styleAry;
    // delete jsonComs[key]?.model?.style?.styleAry
  });

  return pageCss;
};

export const forEachCssMap = (cssMap, callback) => {
  Object.keys(cssMap).forEach((key) => {
    const styleAry = cssMap[key];
    styleAry.forEach((item) => {
      let { selector, css } = item;
      if (Array.isArray(selector)) {
        selector.forEach((_selector) => {
          callback?.(key, _selector, css);
        });
      } else {
        callback?.(key, selector, css);
      }
    });
  });
};
