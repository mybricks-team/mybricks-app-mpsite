import { Logger } from "@mybricks/rocker-commons";
import { AxiosRequestConfig } from "axios";
import { ILocalizationInfo } from "../interface";
import axios from "axios";
import * as path from "path";
import * as fs from "fs";

/**
 * 获取本地化相关信息
 * @param url 资源地址
 * @param pathPrefix 本地化后相对地址的前缀
 * @returns 本地化相关信息
 */
export async function getLocalizationInfoByNetwork(
  url: string,
  path: string,
  config?: AxiosRequestConfig<any> & { withoutError: boolean }
): Promise<ILocalizationInfo> {
  const { withoutError, ...axiosConfig } = config || {};
  try {
    const { data: content } = await axios({
      method: "get",
      url,
      timeout: 30 * 1000,
      ...axiosConfig,
    });
    const name = url.split("/").slice(-1)[0];
    Logger.info(`[publish] 获取资源成功(by network): ${url}`);
    return { path, name, content, from: { type: 'byNetwork', url } };
  } catch (e) {
    Logger.error(`[publish] 获取资源失败(by network): ${url}`, e);
    if (withoutError) return undefined;
    else throw e;
  }
}

export async function getLocalizationInfoByLocal(
  url: string,
  _path: string,
  config?: { withoutError: boolean }
): Promise<ILocalizationInfo> {
  const { withoutError } = config || {};
  try {
    const publishFilePath = path.resolve(__dirname, `../../../assets/${url}`);
    const content = fs.readFileSync(publishFilePath, "utf8");
    const name = url.split("/").slice(-1)[0];
    Logger.info(`[publish] 获取资源成功(by local): ${url}`);
    return { path: _path, name, content, from: { type: 'byLocal', url } };
  } catch (e) {
    Logger.error(
      `[publish] 获取资源失败(by local): ${url} ${JSON.stringify(e, null, 2)}`
    );
    if (withoutError) return undefined;
    else throw e;
  }
}
