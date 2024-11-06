/**
 * @description 本文件为支持前后端发布的通用代码，请勿加入定制逻辑至此
 */


import { getAxiosInstance, getMessageFromAxiosErrorException } from "@mybricks/sdk-for-app/api/util";
import * as path from 'path';
import * as zlib from 'zlib';
import * as axios from 'axios';
import * as fs from 'fs';
import API from "@mybricks/sdk-for-app/api";

import { Logger } from "@mybricks/rocker-commons";

// function updateFrontEnd(params: { target: 'prod' | 'staging' | 'debug'; files: Array<{ fileName: string, folderPath: string, content: string }>; fileId: string, version: string }): Promise<{
//   /** 请求的绝对路径，例如 /runtime/xxx/xxx */
//   requestPathPrefix: string
// }> {
//   return new Promise((resolve, reject) => {
//     getAxiosInstance()
//       .post('/paas/api/project/frontEnd/push', params, {
//         maxBodyLength: Infinity // 设置最大请求体长度为无限大，或其他具体值
//       })
//       .then(({ data }: any) => {
//         if (data?.code === 1) {
//           resolve(data.data)
//         } else {
//           reject(`${data?.stack || data?.message || '更新前端产物失败，未知错误'}`)
//         }
//       })
//       .catch((e: any) => {
//         reject(getMessageFromAxiosErrorException?.(e, '更新前端产物失败，未知错误'))
//       })
//   });
// }

function updateService(params: { envType: string; json: any; database: { filePubId: string | number }; fileId: number | string, version: string }): Promise<{
  /** 请求的绝对路径，例如 /runtime/xxx/xxx */
  requestPathPrefix: string
}> {
  return new Promise((resolve, reject) => {
    getAxiosInstance()
      .post('/paas/api/project/service/push', params, {
        maxBodyLength: Infinity // 设置最大请求体长度为无限大，或其他具体值
      })
      .then(({ data }: any) => {
        if (data?.code === 1) {
          resolve(data.data)
        } else {
          reject(`${data?.stack || data?.message || '更新服务失败，未知错误'}`)
        }
      })
      .catch((e: any) => {
        reject(getMessageFromAxiosErrorException?.(e, '更新服务失败，未知错误'))
      })
  });
}


/**
 *  将 JavaScript 对象压缩成 GZIP 文件
 */
function compressObjectToGzip(
  inputObject: Record<string, unknown>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const inputJSON = JSON.stringify(inputObject);
      zlib.gzip(inputJSON, (err, compressedData) => {
        if (err) {
          reject(err);
        } else {
          resolve(compressedData);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 解压 GZIP 文件回 JavaScript 对象
 */
function decompressGzipToObject(
  compressedData: Buffer
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    zlib.gunzip(compressedData, (err, decompressedJSON) => {
      if (err) {
        reject(err);
      } else {
        try {
          const objectData = JSON.parse(decompressedJSON.toString());
          resolve(objectData);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

interface PushMeta {
  fileId: number,
  version: string,
  /** 环境信息 */
  envType: string,
  /** 产物类型 */
  type: string

  commitInfo?: string,

  productId?: string | number,
  productName?: string

  publisherEmail?: string,
  publisherName?: string

  groupId?: string,
  groupName?: string
}

interface PushParamsV1 {
  metaInfo: PushMeta,

  /** html文件内容 */
  html: string,
  /** 公共依赖 */
  globalDeps?: {
    path: string,
    content: string
  }[],
  /** js文件 */
  js?: {
    name: string,
    content: string
  }[]
  /** 图片文件 */
  images?: {
    path: string,
    content: string
  }[]
}
interface PushParamsV2 {
  metaInfo: PushMeta,

  /** 压缩包文件Buffer */
  content: Buffer
}
/** 推送前端产物到自定义接口 */
function pushFrontEndToRemote(schemaVer: 'v1', apiPath: string, params: PushParamsV1): Promise<{ url: string }>;
/** 推送前端产物到自定义接口 */
function pushFrontEndToRemote(schemaVer: 'v2', apiPath: string, params: PushParamsV2): Promise<{ url: string }>;

async function pushFrontEndToRemote(schemaVer: 'v1' | 'v2' = 'v2', apiPath, params: PushParamsV1 | PushParamsV2) {
  let requestPath = apiPath.trim()
  if (!requestPath || typeof requestPath !== 'string') {
    throw new Error('自定义发布必须填写合法的 http 接口')
  }

  if (!schemaVer) {
    throw new Error('schemaVer 是必填参数')
  }

  let customPushParams
  const { metaInfo } = params;

  if (schemaVer === 'v1') {
    const v1Params = params as PushParamsV1;
    customPushParams = await compressObjectToGzip({
      env: metaInfo.envType,
      productId: metaInfo.fileId,
      productName: metaInfo.productName,
      publisherEmail: metaInfo.publisherEmail,
      publisherName: metaInfo.publisherName || "",
      version: metaInfo.version,
      commitInfo: metaInfo.commitInfo,
      type: metaInfo.type,
      groupId: metaInfo.groupId,
      groupName: metaInfo.groupName,
      content: {
        html: v1Params.html,
        js: v1Params.js,
        images: v1Params.images,
        globalDeps: v1Params.globalDeps,
      },
    });
  }

  if (schemaVer === 'v2') {
    const v2Params = params as PushParamsV2;
    customPushParams = await compressObjectToGzip({
      env: metaInfo.envType,
      productId: metaInfo.fileId,
      productName: metaInfo.productName,
      publisherEmail: metaInfo.publisherEmail,
      publisherName: metaInfo.publisherName || "",
      version: metaInfo.version,
      commitInfo: metaInfo.commitInfo,
      type: metaInfo.type,
      groupId: metaInfo.groupId,
      groupName: metaInfo.groupName,
      content: v2Params.content,
    });
  }

  const { code, message, data } = await (axios as any)
    .post(requestPath, customPushParams, {
      headers: {
        "Content-Encoding": "gzip", // 指定数据编码为gzip
        "Content-Type": "application/json", // 指定数据类型为JSON
      },
    })
    .then((res) => res.data)
    .catch((e) => {
      throw new Error(`发布集成接口出错: ${e.message}`);
    });
  if (code !== 1) {
    throw new Error(`发布集成接口出错: ${message}`);
  }

  return data;
}

interface PushFrontEndParams {
  metaInfo: PushMeta
  /** 文件内容 */
  files?: Array<{ fileName: string, folderPath: string, content: string, noFileId?: boolean }>
}

async function pushFrontEnd(pushParams: PushFrontEndParams) {
  if (!Array.isArray(pushParams?.files)) {
    throw new Error('pushFrontEnd files 不合法，请提供合法的前端推送产物');
  }

  const rootPath = path.join('/app', pushParams?.metaInfo?.type ?? 'unknown', pushParams?.metaInfo?.envType);
  const rootPathWithFileId = path.join(rootPath, `${pushParams?.metaInfo.fileId}`);

  const res = await Promise.all(pushParams.files.map(file => {
    return API.Upload.staticServer({
      content: file.content,
      folderPath: path.join(file.noFileId ? rootPath : rootPathWithFileId, file.folderPath),
      fileName: file.fileName,
      noHash: true
    })
  }))

  return res
}

interface ComlibJsFileItem {
  name: string
  content: string
}

interface pushBackEndParams {
  database: any,
  json: any,
  comlibs?: ComlibJsFileItem[]
}


interface PushProjectParams extends pushBackEndParams, PushFrontEndParams {}


const pushService = async (pushParams: PushProjectParams) => {
  return await updateService({
    envType: pushParams.metaInfo.envType,
    fileId: pushParams.metaInfo?.fileId,
    version: pushParams.metaInfo?.version,

    json: pushParams.json,
    database: pushParams.database,
  })
}



interface SnapshotParams {
  metaInfo: PushMeta,
  frontEnd: any,
  backEnd: pushBackEndParams,
}

const snapshot = async (data: SnapshotParams) => {
  const content = !Buffer.isBuffer(data) ? await compressObjectToGzip(data as any) : data;
  await API.Upload.saveProducts({
    fileId: data.metaInfo.fileId as number,
    version: data.metaInfo.version,
    type: data.metaInfo.envType,
    content,
  });
}

const getSnapshot = async ({ fileId, version, envType }): Promise<SnapshotParams> => {
  const { assetPath } = await API.File.getPubAssetPath({ fileId, version, envType });

  if (!fs.existsSync(assetPath)) {
    throw new Error(`获取 ${fileId}@${envType}@${version} 快照失败，快照不存在`);
  }
  const content = fs.readFileSync(assetPath);
  const params = await decompressGzipToObject(content);
  return params as any as SnapshotParams
}

const download = async () => {

}

interface PushRemote extends Omit<PushParamsV1, 'metaInfo'> {
  api: string,
}

/** 推送前后端产物，并保存快照 */
const pushAndSnapshot = async (metaInfo: PushMeta, {
  pushToPlatform,
  pushToRemote,
  snapshot,
}: {
  /** 推送到平台的内容， */
  pushToPlatform: Omit<PushProjectParams, 'metaInfo'>,
  /** 推送到远程接口的产物内容，建议使用构建后的产物内容，用户仅写入文件即可 */
  pushToRemote?: PushRemote,
  /** 存储快照的内容，建议存储构建前的产物内容，可以方便回滚和下载时二次修改 */
  snapshot?: Omit<SnapshotParams, 'metaInfo'>,
}, {
  logScope = '[push and snapshot]:'
}) => {
  const { files, database, comlibs, json } = pushToPlatform;

  let urls = [];

  let remoteUrl = '';

  if (!pushToRemote?.api) {
    Logger.info(`${logScope} 开始推送产物到平台`)
    urls = await AppProject.pushFrontEnd({
      metaInfo: {
        fileId: metaInfo.fileId,
        envType: metaInfo.envType,
        type: metaInfo.type,
        version: metaInfo.version
      },
      files: files
    })
    Logger.info(`${logScope} 推送前端产物到平台成功`)
  
    try {
      await AppProject.pushService({
        metaInfo: {
          fileId: metaInfo.fileId,
          envType: metaInfo.envType,
          type: metaInfo.type,
          version: metaInfo.version
        },
        database,
        comlibs,
        json
      })
      Logger.info(`${logScope} 推送后端产物到平台成功`)
    } catch (error) {
      Logger.info(`${logScope} 推送后端产物到平台失败 ${error?.stack ?? error}`)
    }
  } else {
    Logger.info(`${logScope} 发现自定义推送API ${pushToRemote.api}，开始推送产物`)
    const { url } = await AppProject.pushFrontEndToRemote('v1', pushToRemote.api, {
      metaInfo,
      ...pushToRemote,
    })
    Logger.info(`${logScope} 推送产物到 ${pushToRemote.api} 成功，访问地址为 ${url}`)
    remoteUrl = url
  }

  if (snapshot) {
    Logger.info(`${logScope} 存储快照文件`)
    await AppProject.snapshot({ 
      metaInfo: {
        fileId: metaInfo.fileId,
        envType: metaInfo.envType,
        type: metaInfo.type,
        version: metaInfo.version
      },
      frontEnd: snapshot.frontEnd,
      backEnd: snapshot.backEnd
    });
    Logger.info(`${logScope} 存储快照文件成功`)
  }


  return {
    urls,
    remoteUrl,
  }
}

export const AppProject = {
  /** 推送前后端产物，并保存快照 */
  pushAndSnapshot,
  /** 推送前端产物到自定义接口 */
  pushFrontEndToRemote,
  /** 推送前端产物到平台 mfs */
  pushFrontEnd,
  /** 推送服务Fx产物到平台运行时 */
  pushService,
  /** 记录快照，用于回滚 */
  snapshot,
  /** 获取快照信息，用于回滚 */
  getSnapshot,
  /** 下载产物 */
  download,
}