import { compareVersions } from "compare-versions";
import { getComlibsByNamespaceAndVersion, myRequire } from "@/utils/comlib";
import { pageModel } from "@/stores";

const MySelfId = "_myself_";
const ComLib_Edit = "__comlibs_edit_";

export const initMaterials = async (ctx: Record<string, any>) => {
  const { comlibs, hasMaterialApp, latestComlibs } = ctx;
  const myselfLib = comlibs.find((lib) => lib?.id === MySelfId);
  const libs = comlibs.filter((lib) => lib?.id !== MySelfId);

  if (myselfLib && hasMaterialApp) {
    await getComlibsByNamespaceAndVersion(myselfLib?.comAray);
  }

  // 用户自定义配置
  if (pageModel.customComlib?.editJs) {
    libs.push(pageModel.customComlib?.editJs);
  }

  if (!libs.length) return [];

  const { styles } = await myRequire(
    libs.map((lib) => lib?.editJs ?? lib),
    (error) => {
      Promise.reject(error);
    }
  );

  /**
   * insert styles
   */
  const comlibIndex = window[ComLib_Edit].findIndex(
    (comlib) => comlib.id !== "_myself_"
  );

  if (comlibIndex !== -1) {
    window[ComLib_Edit][comlibIndex]._styleAry = styles;
  }

  /**
   * 兼容中间没有namespace存量页面数据
   */
  window[ComLib_Edit].forEach((winLib) => {
    if (!winLib.namespace) {
      const lib = libs.find((lib) => lib.id === winLib.id);
      if (lib) {
        winLib.namespace = lib.namespace;
      }
    }
  });

  /**
   * without namespace tips
   */
  const libWithoutNamespace = window[ComLib_Edit].filter(
    (lib) => !lib.namespace && lib.id !== "_myself_"
  );
  if (libWithoutNamespace.length) {
    const titleStr = libWithoutNamespace.map((lib) => lib.title).join("、");
    console.error(
      `组件库【${titleStr}】未找到namespace，无法进行更新、删除操作`
    );
  }

  /**
   * sort with namespace of lib
   */
  let namespaceArr = libs.map((raw) => raw.namespace);
  window[ComLib_Edit].sort((a, b) => {
    let aIndex = namespaceArr.indexOf(a.namespace);
    let bIndex = namespaceArr.indexOf(b.namespace);
    return aIndex - bIndex;
  });

  /**
   * insert latestComlib for upgrade
   */
  latestComlibs.forEach((latestLib) => {
    try {
      const shouldUpdateLib = window[ComLib_Edit].find(
        (lib) =>
          (lib.namespace === latestLib.namespace || lib.id === latestLib.id) &&
          compareVersions(latestLib.version, lib.version) > 0
      );
      if (shouldUpdateLib) {
        shouldUpdateLib.latestComlib = latestLib;
      }
    } catch (error) {
      console.warn(
        `[初始化组件库]: ${latestLib.namespace} 组件库是测试版本，无法进行在线升级`
      );
    }
  });
  return window[ComLib_Edit];
};
