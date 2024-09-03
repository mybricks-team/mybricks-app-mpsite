import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import axios from "axios";
import * as https from 'https';

const agent = new https.Agent({  
  rejectUnauthorized: false
});

/*
* @description 公共的构建方法，收集公共参数，防止每个函数的特殊参数传来传去
*/
export class BaseCompiler {
  projectPath: string;

  constructor({
    projectPath,
  }) {
    this.projectPath = projectPath;
  }

  getAssets (name: 'vconsole') {
    switch(true) {
      case name === 'vconsole': {
        return {
          name: 'vconosle',
          filePath: path.join(__dirname, 'assets/vconsole/3.15.1/vconsole.min.js')
        }
      }
    }
    return null
  }

  /**
   *
   * @description data合法性校验以及修正
   */
  transformData = ({ data }) => {
    if (!data.appConfig) {
      throw new Error("无效的data.appConfig");
    }

    /** tabbar数量小于2删除tabbar */
    if (
      Array.isArray(data?.appConfig?.tabBar?.list) &&
      data?.appConfig?.tabBar?.list.length < 2
    ) {
      delete data.appConfig.tabBar;
    }

    /** data.pages多余的pagePath */
    if (
      Array.isArray(data.pages) &&
      Array.isArray(data?.appConfig?.pages) &&
      data.pages.length !== data?.appConfig?.pages.length
    ) {
      throw new Error("请检查页面pages相关配置");
    }
  }

  /** 从page的原始Json获取当前页面用的组件定义，主要是为了兼容多场景弹框 */
  getComsFromPageJson = (pageJson) => {
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
    return pageJson?.coms || {}
  }

  /** 获取Script脚本的具体内容 */
  getScrtptContentFromNetwork = async (url: string) => {
    const { data: content } = await axios({ method: 'get', url, timeout: 30 * 1000, httpsAgent: agent});
    return { content }
  }
}