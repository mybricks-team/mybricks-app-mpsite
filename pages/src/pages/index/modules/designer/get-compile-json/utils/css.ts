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

    console.log('styleAry', styleAry)

    pageCss[key] = styleAry.map((item) => {
      let { selector, css } = item;
      if(selector?.includes("_key")) {
        return {
          selector: `#${jsonComs[key]["id"]} ${selector.replace(/_key/g, "data-key")}`,
          css: css
        }
      } else if (selector?.includes("data-com-key")) {
        return {
          selector: `#${jsonComs[key]["id"]} ${selector.replace(/data-com-key/g, "data-key")}`,
          css: css
        }
      } else if (selector?.includes("data-com-id")) {
        return {
          selector: `#${jsonComs[key]["id"]} ${selector.replace(/data-com-id/g, "data-key")}`,
          css: css
        }
      } else if (selector === ':root') {
        return {
          selector: `#${jsonComs[key]["id"]} #${jsonComs[key]["id"]}_root`,
          css: css
        }
      } else{
        return item;
      }
    });

    if (jsonComs[key]?.def?.namespace === "mybricks.taro.ai") {
      const _styleCode = jsonComs[key]?.model?.data?._styleCode;

      // TODO: PC的toJson是默认带这个属性的，小程序这没有了，只能hack添加了
      if (jsonComs[key]?.model && !jsonComs[key].model.isAICode) {
        jsonComs[key].model.isAICode = true
      }

      if (_styleCode) {
        pageCss[key].push({
          selector: null,
          css: decodeURIComponent(_styleCode).replaceAll(
            "__id__",
            jsonComs[key]["id"]
          ).replace(/data-com-id/g, "data-key"),
        });

        // 小程序的 #id 只能匹配第一个Dom，如果在循环列表中，会有问题，hack 一下再说
        pageCss[key].push({
          selector: null,
          css: decodeURIComponent(_styleCode).replaceAll(
            "#__id__",
            `.${jsonComs[key]["id"]}`
          ).replace(/data-com-id/g, "data-key"),
        });
        delete jsonComs[key]?.model?.data?._styleCode;
      }
    }
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
