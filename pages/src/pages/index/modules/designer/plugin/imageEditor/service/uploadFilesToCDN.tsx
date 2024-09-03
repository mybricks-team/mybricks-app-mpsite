interface UploadConfig {
  dir?: string;
  pid?: string;
  allowRewrite?: string;
  allowHash?: string;
  useFileName?: boolean;
}
const defaultUploadConfig = {
  pid: 'power',
  allowRewrite: 'true',
  allowHash: 'false',
};
/**
 * 上传文件到CDN
 * @param fileList 文件列表
 * @param config 上传配置
 * @returns
 */
export const uploadFilesToCDN = (fileList: File[] | FileList, config?: UploadConfig): Promise<any> => {
  const form = new FormData();
  const { useFileName, ...uploadConfig } = config || {};

  const uuid = (pre = 'u_', len = 6) => {
    const seed = 'abcdefhijkmnprstwxyz0123456789',
      maxPos = seed.length;
    let rtn = '';
    for (let i = 0; i < len; i++) {
      rtn += seed.charAt(Math.floor(Math.random() * maxPos));
    }
    return pre + rtn;
  };

  // 文件名不能有中文
  // 长度为 1 ~ 255个字符，只能包含数字 [0-9] 英文字母 [a-zA-Z] 中划线 - 下划线 _ 波浪线 ~ 点 .
  const fileNameReg = /[0-9a-zA-Z_~\-\.]{1,255}/g;
  // 开头不能是中划线 -， 点.
  const fileNameReg2 = /[0-9a-zA-Z_~][0-9a-zA-Z_~\-\.]{0,254}/g;
  const formatFileName = (name: string) => {
    const extname = name.split('.').pop().toLocaleLowerCase();
    if (!useFileName) {
      return `${uuid()}.${extname}`;
    }
    const temp = (name?.match(fileNameReg) || []).join('');
    const res = (temp?.match(fileNameReg2) || [])[0]?.substr(-255);
    return res.includes('.') ? res : `${uuid()}.${extname}`;
  };

  Array.from(fileList).forEach((file) => {
    if (file) {
      const fileName = formatFileName(file.name);
      form.append('files[]', file, fileName);
    }
  });
  if (!form.get('files[]')) {
    return Promise.reject('无可上传文件');
  }
  const mergeConfig = {
    ...defaultUploadConfig,
    ...(uploadConfig || {}),
  };
  Object.keys(mergeConfig).forEach((key) => {
    form.append(key, mergeConfig[key]);
  });
  const token = atob('MTEwOTJfMjcwOTUzMzcyNTFmM2UzNjc3YWE3ODc2OWFjNjM0ZGQ=')
  return fetch(
    `https://kcdn.corp.kuaishou.com/api/kcdn/v1/service/npmUpload/multiple?token=${token}`,
    { method: 'POST', body: form },
  )
    .then((res) => res.json())
    .then((res) => {
      (res?.data?.fileResults || []).map((item) => {
        item.cdnUrl = item.cdnUrl.replace('ali-ec.static.yximgs.com', 'f2.eckwai.com');
      });
      return res;
    });
};
