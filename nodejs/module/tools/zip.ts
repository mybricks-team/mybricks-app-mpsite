import { Logger } from "@mybricks/rocker-commons";
const JSZip = require("jszip");
const zlib = require("zlib");

/**
 *  将 JavaScript 对象压缩成 ZIP 文件
 */
export async function compressJsonObjectToZip(
  jsonObject: Record<string, unknown>
) {
  try {
    const zipContent = JSON.stringify(jsonObject);
    const zip = new JSZip();
    zip.file("data.json", zipContent);
    const content = await zip.generateAsync({ type: "nodebuffer" });
    return content;
  } catch (e) {
    Logger.error("文件压缩失败！");
    throw e;
  }
}

/**
 * 解压 ZIP 文件回 JavaScript 对象
 * ZIP 数据读取 demo: const zipContent = JSON.parse(fs.readFileSync(filePath));
 */
export async function decompressZipToJsonObject(zipContent) {
  try {
    const unzippedContent = await JSZip.loadAsync(zipContent);
    const unzippedJsonObject = JSON.parse(
      await unzippedContent.file("data.json").async("text")
    );
    return unzippedJsonObject;
  } catch (e) {
    Logger.error("文件解压失败！");
    throw e;
  }
}

/**
 *  将 JavaScript 对象压缩成 GZIP 文件
 */
export function compressObjectToGzip(
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
export function decompressGzipToObject(
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

/**
 * 获取可用于文件名的当前时间
 */
export function getCurrentTimeForFileName() {
  var now = new Date();
  var eventString =
    now.getFullYear() +
    padZero(now.getMonth() + 1) +
    padZero(now.getDate()) +
    "_" +
    padZero(now.getHours()) +
    padZero(now.getMinutes()) +
    padZero(now.getSeconds());

  // 添加前导零的辅助函数
  function padZero(num) {
    return (num < 10 ? "0" : "") + num;
  }

  return eventString;
}
