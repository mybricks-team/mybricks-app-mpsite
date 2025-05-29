import * as fs from "fs";
import * as fse from 'fs-extra';
import AdmZip from 'adm-zip';
import axios from "axios";
import * as path from "path";
import * as crypto from "crypto";

const JSZip = require('jszip');

export enum PublishErrCode {
  /** 普通错误，仅提示，就当没有errCode这个字段好了 */
  None = 0,
  /** 缺少appId和上传密钥 */
  NoAppIdAndUploadKey = '10001',
  /** 未配置上传白名单 */
  NoUploadWhiteList = '10002',
  /** 上传密钥错误 */
  InvalidAppSecret = '10003'
}


export class PublishError extends Error {
  constructor(errCode: PublishErrCode, ...args) {
    super(...args)

    this.errCode = errCode
  }

  errCode: PublishErrCode = PublishErrCode.None
}

async function zipDirectory(zip, dirPath) {
  const files = await fse.readdir(dirPath);

  for (let index = 0; index < files.length; index++) {
    const fileName = files[index];
    const fullPath = path.join(dirPath, fileName);
    const file = fse.statSync(fullPath);
    if (file.isDirectory()) {
      const childDir = zip.folder(fileName);
      await zipDirectory(childDir, fullPath);
    } else {
      zip.file(fileName, fs.readFileSync(fullPath));
    }
  }
}

const DOWNLOAD_TEMP_FOLDER = path.resolve(__dirname, './../../.download-assets');

// export const downloadAssetsFromPath = async (folderPath, assetsZipName) => {
//   await fse.ensureDir(DOWNLOAD_TEMP_FOLDER);

//   if (!await fse.exists(folderPath)) {
//     throw new Error('no exist folderPath need zip')
//   }

//   const zip = new JSZip();

//   await zipDirectory(zip, folderPath);

//   const zipResult = await zip.generateAsync({ type: 'nodebuffer' });

//   await fse.writeFile(path.resolve(DOWNLOAD_TEMP_FOLDER, `./${assetsZipName}.zip`), zipResult);

//   return path.resolve(DOWNLOAD_TEMP_FOLDER, `./${assetsZipName}.zip`)
// }

export const downloadAssetsFromPath = async (folderPath, assetsZipName) => {
  await fse.ensureDir(DOWNLOAD_TEMP_FOLDER);

  if (!await fse.exists(folderPath)) {
    throw new Error('no exist folderPath need zip');
  }

  const zip = new AdmZip();
  
  // 直接添加整个文件夹
  zip.addLocalFolder(folderPath);

  // 生成zip文件的完整路径
  const zipFilePath = path.resolve(DOWNLOAD_TEMP_FOLDER, `${assetsZipName}.zip`);
  
  // 写入zip文件
  zip.writeZip(zipFilePath);

  return zipFilePath;
}

export const unzipToDirectory = async (zipFilePath, targetDirectory) => {
  console.log('zipFilePath', zipFilePath)
  // 检查zip文件是否存在
  if (!await fse.exists(zipFilePath)) {
    throw new Error('zip file does not exist');
  }

  // 确保目标目录存在
  await fse.ensureDir(targetDirectory);

  try {
    const zip = new AdmZip(zipFilePath);
    
    // 解压所有文件到目标目录
    zip.extractAllTo(targetDirectory, /* overwrite */ true);

    return targetDirectory;
  } catch (error) {
    throw new Error(`Failed to extract zip file: ${error.message}`);
  }
}

const getFilesFromDirectory = async (dirPath, relativePath = [], result = []) => {
  const files = await fse.readdir(dirPath);
  for (let index = 0; index < files.length; index++) {
    const fileName = files[index];
    const fullPath = path.join(dirPath, fileName);
    const file = fse.statSync(fullPath);
    if (file.isDirectory()) {
      await getFilesFromDirectory(fullPath, relativePath.concat(fileName), result)
    } else {
      result.push({
        path: relativePath,
        fileName,
        fileString: await fse.readFile(fullPath, 'utf-8')
      })
    }
  }
  return result
}

export const getComboFilesStringFromPath = async (folderPath) => {
  return await getFilesFromDirectory(folderPath);
}

export function getNextVersion(version, max = 100) {
  if (!version) return "1.0.0";
  const vAry = version.split(".");
  let carry = false;
  const isMaster = vAry.length === 3;
  if (!isMaster) {
    max = -1;
  }

  for (let i = vAry.length - 1; i >= 0; i--) {
    const res = Number(vAry[i]) + 1;
    if (i === 0) {
      vAry[i] = res;
    } else {
      if (res === max) {
        vAry[i] = 0;
        carry = true;
      } else {
        vAry[i] = res;
        carry = false;
      }
    }
    if (!carry) break;
  }

  return vAry.join(".");
}

/**
 * @description 本地化文件
 * @param projectPath 
 * @param files 需要本地化的文件数组，会讲这些文件的远程链接下载到本地，目前主要是图片
 * @returns 
 */
export const localizeFile = async (projectPath, files) => {
  const allRemoteAssetsMap = {};
  let count = 0;
  // 中间的?是非贪婪模式，避免将多个Url合并成一个
  const imgRegex = /https?:\/\/.*?\.(png|jpg|jpeg|gif|webp)/gi;

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const content = await fse.readFile(file.filePath, 'utf-8')

    const imgMatches = content.match(imgRegex)

    if (imgMatches) {
      imgMatches.forEach(match => {
        const url2Hash = getContentHash(match, 20)
        if (!allRemoteAssetsMap[match]) {
          allRemoteAssetsMap[match] = `img_${url2Hash}`
        }
      });
    }
  }

  if (Object.keys(allRemoteAssetsMap).length === 0) {
    return
  }

  await fse.ensureDir(path.resolve(projectPath, `./assets`));

  const assets = await Promise.all(Object.keys(allRemoteAssetsMap).map((url) => {
    const name = allRemoteAssetsMap[url];
    const imgPath = path.resolve(projectPath, `./assets/${name}${url.match(/\.(\w+)$/i)[0]}`);
    return new Promise((resolve, reject) => {
      axios.get(url, { responseType: 'arraybuffer' })
        .then(async res => {
          await fse.writeFile(imgPath, Buffer.from(res.data));
          resolve({
            url,
            assetName: `${name}${url.match(/\.(\w+)$/i)[0]}`,
          });
        })
        .catch(err => {
          reject(err);
        })
    })
  }));

  return Promise.all(files.map(async file => {
    let content = await fse.readFile(file.filePath, 'utf-8');
    assets.forEach(asset => {
      const regexp = new RegExp(asset.url, 'g');
      content = content.replace(regexp, `${file.assetRelativePath}${asset.assetName}`);
    })
    await fse.writeFile(file.filePath, content, 'utf-8');
  }))
}

function getContentHash (fileContent, len = 8) {
  return crypto.createHash('md5').update(fileContent ?? Math.random()).digest('hex').slice(0, len);
}

export * from "./pinyin"
export * from "./string"