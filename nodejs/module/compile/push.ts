import { Logger } from "@mybricks/rocker-commons";
import API from "@mybricks/sdk-for-app/api";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import { compressObjectToGzip } from "../tools/zip";
import { downloadAssetsFromPath, localizeFile } from "./utils";
import axios from "axios";

/**
 * 推送发布内容到目标机器
 */
export async function publishPush(params, uploadfolderPath) {
  const { projectPath } = params;

  let publishMaterialInfo;

  const startPublishTime = Date.now();
  Logger.info("[publish] 开始推送数据...");

  //
  const mySetting = await API.Setting.getSetting(["mybricks-app-mpsite"], {});
  let customPublishApi =
    mySetting["mybricks-app-mpsite"]?.config?.publishApiConfig?.publishApi;

  if (customPublishApi && !params.ignoreCustomPublish) {
    Logger.info("[publish] 有配置发布集成接口，尝试向发布集成接口推送数据...");

    try {
      publishMaterialInfo = await customPublish({
        //
        envType: params.envType,
        productId: params.fileId,
        title: params.fileName,
        publisherEmail: "",
        publisherName: "",
        version: params.version,
        type: "h5",
        groupId: 0,
        groupName: "",
        commitInfo: "",
        //
        projectPath,
        customPublishApi,
      });
    } catch (e) {
      Logger.error(`[publish] 推送数据失败: ${JSON.stringify(e, null, 2)}`);
      throw e;
    }
  } else {
    Logger.info("[publish] 未配置发布集成接口，尝试向静态服务推送数据...");

    try {
      publishMaterialInfo = await uploadFolder(projectPath, uploadfolderPath);
      if (publishMaterialInfo?.url?.startsWith("https")) {
        publishMaterialInfo.url = publishMaterialInfo.url.replace(
          "https",
          "http"
        );
      }
    } catch (e) {
      Logger.error(`[publish] 向静态服务推送数据失败！${JSON.stringify(e)}`);
      throw new Error("向静态服务推送数据失败！");
    }
  }
  //
  Logger.info(
    `[publish] 推送数据完成，耗时：${(Date.now() - startPublishTime) / 1000}s`
  );

  /*
  {
    "url":"/mfs/mpsite/h5/prod/571991859044421/index.html",
    "subPath":"/mpsite/h5/prod/571991859044421/index.html",
    "visitSubPath":"/mfs/mpsite/h5/prod/571991859044421/index.html"
  }
  */
  Logger.info(
    `[publish] publishMaterialInfo: ${JSON.stringify(publishMaterialInfo)}`
  );
  return publishMaterialInfo;
}

const getFilesFromFolder = async (
  dirPath,
  rootPath = dirPath,
  results = []
) => {
  const files = await fse.readdir(dirPath);

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const filePath = path.join(dirPath, file);
    const stat = await fse.stat(filePath);
    if (stat.isDirectory()) {
      const dirResults = await getFilesFromFolder(filePath, rootPath, results);
      results.concat(dirResults);
    } else {
      results.push({
        filePath,
        fileName: file,
        relativePath: path.relative(rootPath, dirPath),
      });
    }
  }
  return results;
};

async function uploadFolder(rootFolderPath, targetPath) {
  const hasProject = await fse.exists(rootFolderPath);
  if (!hasProject) {
    throw new Error("项目不存在，请检查构建产物");
  }
  const fileMetas = await getFilesFromFolder(rootFolderPath);

  const results = await Promise.all(
    fileMetas.map(async (file) => {
      const { filePath, fileName, relativePath } = file ?? {};
      const content = await fse.readFile(filePath, "utf-8");
      // return {
      //   content,
      //   folderPath: path.join(targetPath, relativePath),
      //   fileName,
      //   noHash: true
      // }
      return API.Upload.staticServer({
        content,
        folderPath: path.join(targetPath, relativePath),
        fileName,
        noHash: true,
      });
    })
  );

  const htmlResult = results.find((u) => path.extname(u.url) === ".html");

  Logger.info(`[publish] html 上传成功！地址：${htmlResult?.url}`);
  return htmlResult;
}

/**
 * 通过发布集成推送数据
 */
async function customPublish(params) {
  // 生成 content zip 包
  const tempFolderPath = path.resolve(__dirname, "../../.tmp"); //临时目录
  fse.ensureDirSync(tempFolderPath);

  const projectName = `project-${params.productId}-build-${params.type}`;
  const projectPath = path.resolve(tempFolderPath, `./${projectName}`);
  const localizePath = path.resolve(
    tempFolderPath,
    `./project-${params.productId}-localize-${params.type}`
  );

  // 复制一份，防止修改后，每次下载都是修改后的版本
  await fse.ensureDir(localizePath);
  await fse.copy(projectPath, localizePath, { overwrite: true });
  let downloadPath = localizePath;

  try {
    const meta = await fse.readJSON(path.resolve(downloadPath, "./.meta.json"));
    await localizeFile(downloadPath, [
      {
        filePath: path.resolve(downloadPath, `./js/${meta.configFileName}`),
        assetRelativePath: "./assets/",
      },
      {
        filePath: path.resolve(
          downloadPath,
          `./css/${meta.projectCssFileName}`
        ),
        assetRelativePath: "./../assets/",
      },
    ]);
    Logger.info(`[download] ${projectPath} localize success`);
  } catch (error) {
    Logger.error(
      `[download] zip ${projectPath} error, 资源本地化失败 ${JSON.stringify(
        error
      )}`,
      error
    );
  }

  const zipFilePath = await downloadAssetsFromPath(downloadPath, projectName);
  // 将 zipFilePath 读取为 arraybuffer
  let content = fs.readFileSync(zipFilePath);

  const dataForCustom = await compressObjectToGzip({
    env: params.envType,
    productId: params.productId,
    productName: params.productName,
    publisherEmail: params.publisherEmail,
    publisherName: params.publisherName,
    version: params.version,
    commitInfo: params.commitInfo,
    type: params.type,
    groupId: params.groupId,
    groupName: params.groupName,
    content: content,
  });

  // 计算发布集成推送数据的 MB 大小 (四舍五入)
  const megabytes =
    Math.round((Buffer.byteLength(dataForCustom) / (1024 * 1024)) * 100) / 100;

  Logger.info(`[publish] 发布集成推送数据大小(压缩后)为: ${megabytes} MB`);
  Logger.info(`[publish] version = ${params.version}`);

  const { code, message, data } = await axios
    .post(params.customPublishApi, dataForCustom, {
      headers: {
        "Content-Encoding": "gzip", // 指定数据编码为gzip
        "Content-Type": "application/json", // 指定数据类型为JSON
      },
    })
    .then((res) => res.data)
    .catch((e) => {
      Logger.error(`[publish] 发布集成接口出错: ${e.message}`, e);
      throw new Error(`发布集成接口出错: ${e.message}`);
    });
  if (code !== 1) {
    Logger.error(`[publish] 发布集成接口出错: ${message}`);
    throw new Error(`发布集成接口出错: ${message}`);
  }

  return data;
}
