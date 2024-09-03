export function getRealHostName(requestHeaders) {
  let hostName = requestHeaders.host;
  if (requestHeaders["x-forwarded-host"]) {
    hostName = requestHeaders["x-forwarded-host"];
  } else if (requestHeaders["x-host"]) {
    hostName = requestHeaders["x-host"].replace(":443", "");
  }
  return hostName;
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
 * 解析出对象中所有字符类型的值
 * @param obj 被解析对象
 * @returns 对象中所有字符类型的值
 */
function extractStringsFromJSON(obj) {
  let strings = [];

  function explore(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "string") {
          strings.push(obj[key]);
        } else if (typeof obj[key] === "object") {
          explore(obj[key]);
        }
      }
    }
  }

  explore(obj);
  return strings;
}

/**
 * 获取 template 中所有的图片资源地址 (图片资源一定是通过引擎提供的上传逻辑来的)
 */
export function analysisAllImageUrl(
  template: string,
  json: any,
  origin: string
): string[] {
  const matches1 = (
    template.match(
      /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g
    ) || []
  ).filter((url) => url.includes("/mfs/files/"));

  const matches2 = extractStringsFromJSON(json)
    .filter((url) => url.includes("/mfs/files/"))
    .map((url) => {
      if (url.startsWith("/mfs/files")) return origin + url;
      return url;
    });

  return [...new Set([...matches1, ...matches2])];
}
