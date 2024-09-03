import { Logger } from "@mybricks/rocker-commons";
import API from "@mybricks/sdk-for-app/api";
import { getAppTypeFromTemplate } from "./common";
import * as path from "path";
import * as fs from 'fs';
const pkg = require('../../../package.json')

// 不传groupId表示获取的是全局配置
export const getAppConfig = async ({ groupId } = {} as any) => {
  const template = fs.readFileSync(path.resolve(__dirname, '../../../assets') + '/publish.html', 'utf8')
  const app_type = getAppTypeFromTemplate(template);
  const _NAMESPACE_ = pkg.appConfig[app_type].name ?? pkg.name;
  
  const options = !!groupId ? { type: "group", id: groupId } : {};
  const res = await API.Setting.getSetting([_NAMESPACE_], options);

  let config = {} as any;
  const originConfig = res[_NAMESPACE_]?.config || {};
  try {
    config =
      typeof originConfig === "string"
        ? JSON.parse(originConfig)
        : originConfig;
  } catch (e) {
    Logger.error("[publish] getAppConfig error", e);
  }
  return config;
};

// 使用平台设置的上传接口，不使用协作组的
export const getUploadService = async () => {
  const { uploadServer = {} } = await getAppConfig();
  const { uploadService } = uploadServer;
  if (!uploadService) {
    throw Error("无上传服务，请先配置应用上传服务");
  }
  return uploadService;
};

// 使用平台设置的集成接口，不使用协作组的
export const getCustomPublishApi = async () => {
  const { publishApiConfig = {} } = await getAppConfig();
  const { publishApi } = publishApiConfig;
  if (!publishApi) {
    Logger.warn(`[publish] 未配置发布集成接口`);
  }
  return publishApi;
};

/**
 * 获取平台设置的「是否本地化发布」
 */
export const getCustomNeedLocalization = async () => {
  const { publishLocalizeConfig } = await getAppConfig();
  const { needLocalization } = publishLocalizeConfig || {};
  if (!!needLocalization) {
    Logger.info("[publish] 此次发布为本地化发布");
  }
  return !!needLocalization;
};

// -- plugin-runtime --
export const getCustomConnectorRuntime = (appConfig, req) => {
  const { plugins = [] } = appConfig;
  const connectorPlugin = plugins.find((item) => item?.type === "connector");
  if (!connectorPlugin) {
    return "";
  }
  if (
    !connectorPlugin.runtimeUrl ||
    typeof connectorPlugin.runtimeUrl !== "string"
  ) {
    Logger.error(`[publish] 插件【${connectorPlugin}】没有设置runtime地址`);
    return "";
  }
  return connectorPlugin.runtimeUrl
};
