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
      } else if (selector === ':root') {
        return {
          selector: `#${jsonComs[key]["id"]} view,text`,
          css: css
        }
      } else{
        return item;
      }
    });

    if (jsonComs[key]?.def?.namespace === "mybricks.taro.ai") {
      const _styleCode = jsonComs[key]?.model?.data?._styleCode;
      if (_styleCode) {
        pageCss[key].push({
          selector: null,
          css: decodeURIComponent(_styleCode).replaceAll(
            "__id__",
            jsonComs[key]["id"]
          ),
        });
        delete jsonComs[key]?.model?.data?._styleCode;
      }

      // const styleAry = jsonComs[key]?.model?.style?.styleAry || [];
      // if(styleAry.length) {
      //   styleAry.forEach((item) => {
      //     if(item.selector) {
      //       console.log("~~~~~~", item);

      //       pageCss[key].push({
      //         selector: null,
      //         css: `#${jsonComs[key]["id"]} ${item.selector.replace(/_key/g, "data-key")}` + `{${item.css}}`
      //       });
      //     }
      //   });
      //   delete jsonComs[key]?.model?.style?.styleAry
      // }
    }
  });

  console.log("pageCss", pageCss);
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
