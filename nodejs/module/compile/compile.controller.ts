import {
  Body,
  Controller,
  Inject,
  Get,
  Res,
  Post,
  Req,
  Query,
  Header,
  UseInterceptors,
} from "@nestjs/common";
import { Response } from "express";
import LimitInterceptor from "./../../common/interceptor/limitInterceptor";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
// import * as ci from "miniprogram-ci";
// import { minidev } from "minidev";
import API from "@mybricks/sdk-for-app/api";
import { AppProject } from "./api";
import {
  PublishError,
  PublishErrCode,
  downloadAssetsFromPath,
  unzipToDirectory,
  getComboFilesStringFromPath,
  localizeFile,
} from "./utils";
import { publishPush } from "./push";
import { Logger } from "@mybricks/rocker-commons";
import { compilerH5, compilerMiniapp, compilerHarmony } from "./compiler";
import { CompileType } from "./compiler/types";
import { getNextVersion } from "../tools/analysis";
import axios from "axios";

let ci;
try {
  ci = require("miniprogram-ci");
} catch (error) {}

const existMiniprogramCI = !!ci;

// import * as profiler from 'v8-profiler-node8';

const tempFolderPath = path.resolve(__dirname, "../../.tmp"); //临时目录

const DEP_MODULES = [
  {
    name: "F2",
    version: "3.8.12",
    library: "F2",
    urls: [
      // path.resolve(__dirname, './lib_modules/antv-f2/3.8.12/f2.min.js')
      path.resolve(__dirname, "./lib_modules/antv-f2/3.8.12/f2-all.min.js"),
    ],
  },
];

const getDepModules = (depModules) => {
  let modules = [];
  if (!Array.isArray(depModules)) {
    return modules;
  }

  depModules.forEach((dep) => {
    const findRes = DEP_MODULES.find(
      (module) => module.name === dep.name && module.version === dep.version
    );
    if (findRes) {
      modules.push(findRes);
    }
  });

  return modules;
};

const getTemplatePath = (type = "weapp") => {
  if (type === 'harmony') {
    return path.resolve(__dirname, `./templates/harmony.zip`);
  }
  return path.resolve(__dirname, `./templates/${type}`);
};

if (!fs.existsSync(tempFolderPath)) {
  fs.mkdirSync(tempFolderPath);
}

@Controller("api/compile")
export default class CompileController {
  @Get("/health")
  async health() {
    return "success";
  }

  @Post("/miniapp/searchUser")
  async searchUser(
    @Body("keyword") keyword: string,
  ) {
    try {
      Logger.info("[searchUser] 开始搜索用户...");
      Logger.info(
          `[searchUser] 调用 API.User.searchUserByKeyword, 参数 keyword: ${keyword}`
      );
      const data = await API.User.searchUserByKeyword({
          keyword,
      });
      Logger.info(`[searchUser] 成功，返回用户条数: ${data?.length}`);
      return data;
    } catch (e) {
        Logger.error(
            `[searchUser] 搜索用户报错: ${e?.message || JSON.stringify(e, null, 2)
            }`
        );
        throw e;
    }
  }

  /**
   * preview
   */
  @Post("/miniapp/preview")
  @UseInterceptors(LimitInterceptor)
  async miniappPreview(
    @Body("userId") userId: string,
    @Body("fileId") fileId: number,
    @Body("fileName") fileName: string,
    @Body("data") data: any,
    @Body("type") type: string = "weapp",
    @Req() req: any
  ) {
    try {
      if (!existMiniprogramCI) {
        throw new Error("当前平台环境不支持小程序上传，请联系管理员");
      }

      fse.ensureDirSync(tempFolderPath);

      const projectName = `project-${fileId}-preview-${type}`;
      const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

      await fse.ensureDir(projectPath);
      await fse.emptyDir(projectPath);
      await fse.copy(getTemplatePath(type), projectPath);

      if (type === "weapp") {
        if (!data?.ci?.appid || !data?.ci.privateKey) {
          throw new PublishError(
            PublishErrCode.NoAppIdAndUploadKey,
            "请先配置小程序ID和小程序上传密钥"
          );
        }
      }

      try {
        Logger.info("[preview] upload system api");
        await AppProject.pushService({
          metaInfo: {
            fileId,
            envType: "staging",
            version: "1.0.0",
            type,
          },
          json: data.services,
          database: data.database,
        });
        Logger.info("[preview] upload system success");
      } catch (e) {
        Logger.info(
          `[preview] upload system fail, ${
            e?.stack ?? e?.message ?? "未知错误"
          }`
        );
      }

      Logger.info("[preview] init miniapp template start");
      await compilerMiniapp(
        {
          data,
          projectPath,
          projectName,
          fileName,
          depModules: getDepModules(data.depModules),
          origin: req.headers.origin,
          type,
        },
        { Logger }
      );

      Logger.info("[preview] init miniapp template success");

      // 不上传
      // return {
      //   code: 1,
      //   message: "构建成功",
      //   qrcode: "",
      // };

      let timestamp = new Date().getTime();
      Logger.info("[preview] compile miniapp");
      const res = await compileWxAppCI(projectPath, data, "preview");
      Logger.info("[preview] compile miniapp success");
      Logger.info(
        "[preview] 上传小程序耗时" +
          (new Date().getTime() - timestamp).toString() +
          "ms"
      );
      return {
        code: 1,
        message: "构建成功",
        qrcode: res.qrcode,
      };
    } catch (error) {
      Logger.error("[preview] preview fail " + error.message);
      return {
        code: -1,
        errCode: error.errCode,
        message: error.message || "构建失败，未知错误",
        innerMessage: error?.message?.replace("Error:", "")?.trim(),
        qrcode: "",
        stack: error?.stack,
      };
    }
  }

  /**
   * publish
   */
  @Post("miniapp/publish")
  @UseInterceptors(LimitInterceptor)
  async miniappPublish(
    @Body("userId") userId: string,
    @Body("fileId") fileId: number,
    @Body("fileName") fileName: string,
    @Body("data") data: any,
    @Body("type") type: string = "weapp",
    @Req() req: any
  ) {
    try {
      if (!existMiniprogramCI) {
        throw new Error("当前平台环境不支持小程序上传，请联系管理员");
      }

      fse.ensureDirSync(tempFolderPath);

      const projectName = `project-${fileId}-build-${type}`;
      const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

      await fse.ensureDir(projectPath);
      await fse.emptyDir(projectPath);
      await fse.copy(getTemplatePath(type), projectPath);

      if (type === "weapp") {
        if (!data?.ci?.appid || !data?.ci.privateKey) {
          throw new PublishError(
            PublishErrCode.NoAppIdAndUploadKey,
            "请先配置小程序ID和小程序上传密钥"
          );
        }
      }

      try {
        Logger.info("[preview] upload system api");
        await AppProject.pushService({
          metaInfo: {
            fileId,
            envType: "prod",
            version: "1.0.0",
            type,
          },
          json: data.services,
          database: data.database,
        });
        Logger.info("[preview] upload system success");
      } catch (e) {
        Logger.info(
          `[preview] upload system fail, ${
            e?.stack ?? e?.message ?? "未知错误"
          }`
        );
      }

      Logger.info("[publish] init miniapp template start");

      await compilerMiniapp(
        {
          data,
          projectPath,
          projectName,
          fileName,
          depModules: getDepModules(data.depModules),
          origin: req.headers.origin,
          type,
        },
        { Logger }
      );

      Logger.info("[publish] init miniapp template success");

      // 不上传
      // return {
      //   code: 1,
      //   message: "构建成功",
      //   qrcode: ''
      // }

      if ([CompileType.alipay, CompileType.dd].includes(type as CompileType)) {
        return {
          code: 1,
          message: "构建成功",
        };
      }

      let timestamp = new Date().getTime();
      Logger.info("[publish] compile miniapp");
      const res = await compileWxAppCI(projectPath, data, "publish");
      Logger.info("[publish] compile miniapp success");
      Logger.info(
        "[publish] 上传小程序耗时" +
          (new Date().getTime() - timestamp).toString() +
          "ms"
      );

      return {
        code: 1,
        message: "构建成功",
      };
    } catch (error) {
      Logger.error("[publish] publish fail " + error.message, error);
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `构建失败，错误码：${error.code}` : "构建失败"),
        innerMessage: error?.message?.replace("Error:", "")?.trim(),
        stack: error?.stack,
      };
    }
  }

  /**
   * 支付宝预览
   */
  // @Post("/alipay/preview")
  // @UseInterceptors(LimitInterceptor)
  // async alipayPreview(
  //   @Body("userId") userId: string,
  //   @Body("fileId") fileId: number,
  //   @Body("fileName") fileName: string,
  //   @Body("data") data: any,
  //   @Body("type") type: string = CompileType.alipay,
  //   @Req() req: any
  // ) {
  //   try {
  //     fse.ensureDirSync(tempFolderPath);

  //     const projectName = `project-${fileId}-preview-${type}`;
  //     const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

  //     await fse.ensureDir(projectPath);
  //     await fse.emptyDir(projectPath);
  //     await fse.copy(getTemplatePath(type), projectPath);

  //     if (type === CompileType.alipay) {
  //       if (!data?.ci?.appid || !data?.ci.privateKey) {
  //         throw new PublishError(
  //           PublishErrCode.NoAppIdAndUploadKey,
  //           "请先配置小程序ID和小程序上传密钥"
  //         );
  //       }
  //     }

  //     Logger.info("[preview] init miniapp template start");

  //     await compilerMiniapp(
  //       {
  //         data,
  //         projectPath,
  //         projectName,
  //         fileName,
  //         depModules: getDepModules(data.depModules),
  //         origin: req.headers.origin,
  //         type,
  //       },
  //       { Logger }
  //     );

  //     Logger.info("[preview] init miniapp template success");

  //     let timestamp = new Date().getTime();
  //     Logger.info("[preview] compile miniapp");
  //     const res = await compileAlipayAppCI(projectPath, data, "preview");
  //     Logger.info("[preview] compile miniapp success");
  //     Logger.info(
  //       "[preview] 上传小程序耗时" +
  //         (new Date().getTime() - timestamp).toString() +
  //         "ms"
  //     );
  //     return {
  //       code: 1,
  //       message: "构建成功",
  //       // qrcode: res.qrcode,
  //     };
  //   } catch (error) {
  //     Logger.error("[preview] preview fail " + error.message, error);
  //     return {
  //       code: -1,
  //       errCode: error.errCode,
  //       message: error.message || "构建失败，未知错误",
  //       qrcode: "",
  //       stack: error?.stack,
  //     };
  //   }
  // }

  /**
   * compile
   */
  @Post("miniapp/compile")
  @UseInterceptors(LimitInterceptor)
  async miniappCompile(
    @Body("userId") userId: string,
    @Body("fileId") fileId: number,
    @Body("fileName") fileName: string,
    @Body("data") data: any,
    @Body("type") type: string = "weapp",
    @Req() req: any
  ) {
    try {
      fse.ensureDirSync(tempFolderPath);

      const projectName = `project-${fileId}-build-${type}`;
      const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

      await fse.ensureDir(projectPath);
      await fse.emptyDir(projectPath);
      await fse.copy(getTemplatePath(type), projectPath);

      let backEndRes = {};

      try {
        Logger.info("[preview] upload system api");
        backEndRes = await AppProject.pushService({
          metaInfo: {
            fileId,
            envType: "prod",
            version: "1.0.0",
            type,
          },
          json: data.services,
          database: data.database,
        });
        Logger.info("[preview] upload system success");
      } catch (e) {
        Logger.info(
          `[preview] upload system fail, ${
            e?.stack ?? e?.message ?? "未知错误"
          }`
        );
      }

      Logger.info("[compile] init miniapp template start");

      await compilerMiniapp(
        {
          data,
          projectPath,
          projectName,
          fileName,
          depModules: getDepModules(data.depModules),
          origin: req.headers.origin,
          type,
        },
        { Logger }
      );

      Logger.info("[compile] init miniapp template success");

      return {
        code: 1,
        message: "构建成功",
        data: {
          backEndProjectPath: backEndRes?.data?.data?.projectPath || "",
        },
      };
    } catch (error) {
      Logger.info("[compile] compile fail " + error.message, error);
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `构建失败，错误码：${error.code}` : "构建失败"),
        stack: error?.stack,
      };
    }
  }

  /**
   * compile
   */
  @Post("harmony/compile")
  @UseInterceptors(LimitInterceptor)
  async harmonyCompile(
    @Body("userId") userId: string,
    @Body("fileId") fileId: number,
    @Body("fileName") fileName: string,
    @Body("data") data: any,
    @Body("type") type: string = "harmony",
    @Req() req: any
  ) {
    try {
      fse.ensureDirSync(tempFolderPath);

      const projectName = `project-${fileId}-build-${type}`;
      const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

      await fse.ensureDir(projectPath);
      await fse.emptyDir(projectPath);
      await unzipToDirectory(getTemplatePath(type), projectPath)

      Logger.info("[compile] init harmony template start");

      await compilerHarmony(
        {
          data,
          projectPath,
          projectName,
          fileName,
          depModules: getDepModules(data.depModules),
          origin: req.headers.origin,
          type,
        },
        { Logger }
      );

      Logger.info("[compile] init harmony template success");

      return {
        code: 1,
        message: "构建成功",
        data: {
          
        },
      };
    } catch (error) {
      Logger.info("[compile] compile harmony fail " + error.message, error);
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `构建失败，错误码：${error.code}` : "构建失败"),
        stack: error?.stack,
      };
    }
  }

  /**
   * h5 publish
   */
  @Post("h5/publish")
  async h5Publish(
    @Body("userId") userId: string,
    @Body("fileId") fileId: number,
    @Body("fileName") fileName: string,
    @Body("data") data: any,
    @Body("injectComlibsScriptContent") injectComlibsScriptContent: any,
    @Req() req: any
  ) {
    const type = "h5";
    try {
      const { envType = "prod" } = data;

      fse.ensureDirSync(tempFolderPath);

      const projectName = `project-${fileId}-build-${type}`;
      const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

      await fse.ensureDir(projectPath);
      await fse.emptyDir(projectPath);
      await fse.copy(getTemplatePath(type), projectPath);

      Logger.info(`[publish] compile ${type} template start`);

      await compilerH5(
        {
          data,
          projectPath,
          projectName,
          fileName,
          depModules: getDepModules(data.depModules),
          injectComlibsScriptContent: decodeURIComponent(
            injectComlibsScriptContent
          ),
        },
        { Logger }
      );

      Logger.info(`[publish] compile ${type} template success`);

      // Logger.info("[publish] getLatestPub begin");

      // const latestPub = (
      //   await API.File.getLatestPub({
      //     fileId,
      //     type: 'H5-线上',
      //   })
      // )?.[0];

      // Logger.info(`[publish] getLatestPub ok`);

      // console.log(publishPushParams);
      // const version = getNextVersion(latestPub?.version);

      const latestPub = (
        await API.File.getLatestPub({
          fileId,
          type: "H5-线上",
        })
      )?.[0];

      Logger.info(`[publish] getLatestPub ok`);

      const version = getNextVersion(latestPub?.version);

      let publishPushParams = {
        projectPath,

        envType: "prod",
        version,

        userId,
        fileId,
        fileName,
      };

      const publishMaterialInfo = await publishPush(
        {
          ...publishPushParams,
        },
        `/mpsite/h5/${envType || "prod"}/${fileId}`
      );

      Logger.info("[publish] API.File.publish: begin ");
      const result = await API.File.publish({
        userId,
        fileId,
        extName: "mp-site",
        commitInfo: "",
        content: JSON.stringify({ ...publishMaterialInfo, json: data }),
        type: `H5-线上`,
      });

      Logger.info("[publish] API.File.publish: ok " + JSON.stringify(result));

      return {
        code: 1,
        data: publishMaterialInfo,
        message: "发布成功",
      };
    } catch (error) {
      Logger.error("[publish] publish fail " + JSON.stringify(error));
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `发布失败，错误码：${error.code}` : "发布失败"),
        stack: error?.stack,
      };
    }
  }

  /**
   * h5 preview
   */
  @Post("h5/preview")
  async h5Preview(
    @Body("userId") userId: string,
    @Body("fileId") fileId: number,
    @Body("fileName") fileName: string,
    @Body("data") data: any,
    @Body("injectComlibsScriptContent") injectComlibsScriptContent: any,
    @Req() req: any
  ) {
    const type = "h5";
    try {
      fse.ensureDirSync(tempFolderPath);

      const projectName = `project-${fileId}-preview-${type}`;
      const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

      await fse.ensureDir(projectPath);
      await fse.emptyDir(projectPath);
      await fse.copy(getTemplatePath(type), projectPath);

      Logger.info(`[publish] compile ${type} template start`);

      await compilerH5(
        {
          data,
          projectPath,
          projectName,
          fileName,
          depModules: getDepModules(data.depModules),
          injectComlibsScriptContent: decodeURIComponent(
            injectComlibsScriptContent
          ),
        },
        { Logger }
      );

      Logger.info(`[publish] compile ${type} template success`);

      let publishPushParams = {
        projectPath,
        ignoreCustomPublish: true,
      };

      const publishMaterialInfo = await publishPush(
        { ...publishPushParams },
        `/mpsite/h5/only-preview/${fileId}`
      );

      return {
        code: 1,
        data: publishMaterialInfo,
        message: "预览成功",
      };
    } catch (error) {
      Logger.error("[publish] publish fail " + JSON.stringify(error));
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `预览失败，错误码：${error.code}` : "预览失败"),
        stack: error?.stack,
      };
    }
  }

  @Get("download")
  async download(
    @Query("fileId") fileId: number,
    @Query("type") type: string = "weapp",
    @Query("backend") backend: string = "",
    @Query("localize") localize: 0 | 1 = 0,
    @Res() response: Response
  ) {
    fse.ensureDirSync(tempFolderPath);
    const projectName = `project-${fileId}-build-${type}`;
    const projectPath = path.resolve(tempFolderPath, `./${projectName}`);
    const localizePath = path.resolve(
      tempFolderPath,
      `./project-${fileId}-localize-${type}`
    );

    if (backend) {
      // 如果存在后端项目路径，则创建一个 project-${fileId}-all-build-${type} 的文件夹
      // 然后将小程序项目和后端项目合并复制到这个文件夹下
      // 小程序的文件夹名字为 weapp，原路径为 projectPath
      // 后端的文件夹名字为 backend，原路径为 backend
      // 然后将这个文件夹打包

      const allProjectPath = path.resolve(
        tempFolderPath,
        `./project-${fileId}-all-build-${type}`
      );

      await fse.ensureDir(allProjectPath);

      await fse.emptyDir(allProjectPath);

      await fse.copy(projectPath, path.resolve(allProjectPath, "./weapp"));
      await fse.copy(backend, path.resolve(allProjectPath, "./backend"));

      const zipFilePath = await downloadAssetsFromPath(
        allProjectPath,
        projectName
      );

      Logger.info(
        `[download] zip ${projectPath} success，zip file ==> ${zipFilePath}`
      );

      response.sendFile(zipFilePath);
      return;
    }

    try {
      let downloadPath = projectPath;

      if (!(await fse.pathExists(projectPath))) {
        Logger.info(`[download] ${projectPath} is not Exist`);
        throw new Error("下载失败，文件不存在，请重新构建");
      }

      // H5才支持资源本地化，将所有图片资源下载到本地之后再打包，TODO，目前有点粗暴
      if (!!localize && type === "h5") {
        // 复制一份，防止修改后，每次下载都是修改后的版本
        await fse.ensureDir(localizePath);
        await fse.copy(projectPath, localizePath, { overwrite: true });
        downloadPath = localizePath;

        Logger.info(`[download] ${projectPath} localize start`);
        try {
          const meta = await fse.readJSON(
            path.resolve(downloadPath, "./.meta.json")
          );
          await localizeFile(downloadPath, [
            {
              filePath: path.resolve(
                downloadPath,
                `./js/${meta.configFileName}`
              ),
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
      }

      const zipFilePath = await downloadAssetsFromPath(
        downloadPath,
        projectName
      );

      Logger.info(
        `[download] zip ${projectPath} success，zip file ==> ${zipFilePath}`
      );

      response.sendFile(zipFilePath);
    } catch (error) {
      Logger.error(
        `[download] zip ${projectPath} error, ${error.message}`,
        error
      );
      response.send({
        code: -1,
        message: error.message || "下载失败",
        stack: error?.stack,
      });
    }
  }

  @Get("queryFiles")
  async queryFiles(
    @Query("fileId") fileId: number,
    @Query("type") type: string = "weapp"
  ) {
    fse.ensureDirSync(tempFolderPath);
    const projectName = `project-${fileId}-build-${type}`;
    const projectPath = path.resolve(tempFolderPath, `./${projectName}`);

    try {
      if (!(await fse.pathExists(projectPath))) {
        Logger.info(`[download] ${projectPath} is not Exist`);
        throw new Error("下载失败，文件不存在，请重新构建");
      }

      const result = await getComboFilesStringFromPath(projectPath);

      Logger.info(`[download] zip ${projectPath} success`);

      return {
        code: 1,
        data: result,
      };
    } catch (error) {
      Logger.error(
        `[download] zip ${projectPath} error, ${error.message}`,
        error
      );
      return {
        code: -1,
        errCode: error.errCode,
        message:
          error?.message ||
          (error.code ? `构建失败，错误码：${error.code}` : "构建失败"),
        stack: error?.stack,
      };
    }
  }
}

/** 构建并上传小程序项目 */
async function compileWxAppCI(
  projectPath,
  data,
  type: "preview" | "publish" = "preview"
) {
  let timestamp = new Date().getTime();

  if (!data?.ci?.appid || !data?.ci.privateKey) {
    throw new Error("构建失败，请配置小程序ID和小程序上传密钥");
  }

  console.log("开始上传项目", projectPath);
  Logger.info("开始上传项目", projectPath);
  const project = new ci.Project({
    appid: data.ci.appid?.trim(),
    privateKey: data.ci.privateKey?.trim(),
    type: "miniProgram",
    projectPath: projectPath,
  });

  try {
    if (type === "publish") {
      const uploadResult = await ci.upload({
        version: data.ci.version || "1.0.0",
        project,
        desc: data.ci.desc || "默认描述",
        setting: {
          es6: false,
          es7: false,
          minify: false,
          codeProtect: false,
          autoPrefixWXSS: false,
        },
        useCOS: true,

        /** 这个分析无用文件非常占用性能 */
        allowIgnoreUnusedFiles: false,
        // threads: 3,
      });
      console.log("上传耗时", new Date().getTime() - timestamp, "ms");
      return {
        qrcode: "",
      };
    } else {
      const previewResult = await ci.preview({
        version: "1.0.0",
        project,
        desc: "hello",
        setting: {
          es6: false,
          es7: false,
          minify: false,
          codeProtect: false,
          autoPrefixWXSS: false,
        },
        // threads: 3,
        useCOS: true,
        qrcodeFormat: "base64",
        qrcodeOutputDest: path.resolve(projectPath, "./destination.txt"),

        bigPackageSizeSupport: true,

        /** 这个分析无用文件非常占用性能 */
        allowIgnoreUnusedFiles: false,
      });
      Logger.info("上传耗时", new Date().getTime() - timestamp, "ms");
      console.log("上传耗时", new Date().getTime() - timestamp, "ms");
      return {
        qrcode: fs.readFileSync(
          path.resolve(projectPath, "./destination.txt"),
          "utf-8"
        ),
      };
    }
  } catch (error) {
    if (error.code == 20003 && error.message?.indexOf?.("-10008")) {
      // 'Error: {"errCode":-10008,"errMsg":"invalid ip: 122.224.86.195, reference: https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html"}'
      throw new PublishError(PublishErrCode.NoUploadWhiteList, error.message);
    } else if (error.code == 20003 && error.message?.indexOf?.("ticket")) {
      // Error: {"errCode":-1,"errMsg":"get new ticket fail: innerCode: -80002"}
      throw new PublishError(PublishErrCode.InvalidAppSecret, error.message);
    } else {
      throw new Error(error.message);
    }
  }
}

/** 上传支付宝小程序 */
// async function compileAlipayAppCI(
//   projectPath,
//   data,
//   type: "preview" | "publish" = "preview"
// ) {
//   let timestamp = new Date().getTime();

//   if (!data?.ci?.appid || !data?.ci.privateKey) {
//     throw new Error("构建失败，请配置小程序ID和小程序上传密钥");
//   }

//   console.log("开始上传项目", projectPath);
//   Logger.info("开始上传项目", projectPath);
//   // const project = new ci.Project({
//   //   // appid: "2021004166659416",
//   //   // privateKey: data.ci.privateKey,
//   //   // type: "miniProgram",
//   //   // projectPath: projectPath,
//   // });

//   try {
//     if (type === "publish") {
//       const uploadResult = await ci.upload({
//         version: data.ci.version || "1.0.0",
//         project,
//         desc: data.ci.desc || "默认描述",
//         setting: {
//           es6: false,
//           es7: false,
//           minify: false,
//           codeProtect: false,
//           autoPrefixWXSS: false,
//         },
//         useCOS: true,

//         /** 这个分析无用文件非常占用性能 */
//         allowIgnoreUnusedFiles: false,
//         // threads: 3,
//       });
//       console.log("上传耗时", new Date().getTime() - timestamp, "ms");
//       return {
//         qrcode: "",
//       };
//     } else {
//       const previewResult = await minidev.preview({
//         appId: "2021004166659416",
//         clientType: "alipay",
//         project: projectPath,
//         ignoreHttpDomainCheck: true,
//         ignoreWebViewDomainCheck: true,
//       });

//       Logger.info("上传耗时", new Date().getTime() - timestamp, "ms");
//       console.log("上传耗时", new Date().getTime() - timestamp, "ms");
//       return {
//         qrcode: fs.readFileSync(
//           path.resolve(projectPath, "./destination.txt"),
//           "utf-8"
//         ),
//       };
//     }
//   } catch (error) {
//     if (error.code == 20003 && error.message?.indexOf?.("-10008")) {
//       // 'Error: {"errCode":-10008,"errMsg":"invalid ip: 122.224.86.195, reference: https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html"}'
//       throw new PublishError(PublishErrCode.NoUploadWhiteList, error.message);
//     } else if (error.code == 20003 && error.message?.indexOf?.("ticket")) {
//       // Error: {"errCode":-1,"errMsg":"get new ticket fail: innerCode: -80002"}
//       throw new PublishError(PublishErrCode.InvalidAppSecret, error.message);
//     } else {
//       throw new Error(error.message);
//     }
//   }
// }
