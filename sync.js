const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const axios = require('axios');
const FormData = require('form-data');
const packageJSON = require('./package.json');

const zip = new JSZip();
/** 根目录 */
const rootDir = zip.folder(packageJSON.name);
const args = process.argv.slice(2);

if (!args[0] || !args[0].startsWith('--origin=')) {
  console.log('发布应用失败，未配置发布源。');
  console.log('请按 node sync.js --origin=[域名] 规则配置，如：node sync.js --origin=https://my.mybricks.world');
  process.exit();
}
const domain = args[0].replace('--origin=', '');
const noServiceUpdate = args[1] && args[1].indexOf('--noServiceUpdate') > -1;

/** 遍历文件 */
function read (zip, files, dirPath) {
  files.forEach(function (fileName) {
    const fillPath = dirPath + '/' + fileName;
    const file = fs.statSync(fillPath);
    if (file.isDirectory()) {
      const childDir = zip.folder(fileName);
      const files = fs.readdirSync(fillPath)
      read(childDir, files, fillPath);
    } else {
      zip.file(fileName, fs.readFileSync(fillPath));
    }
  });
}

const zipDirPath = path.join(__dirname);
/** 过滤不打进zip包的文件名 */
const filterFileName = [
  '.DS_Store',
  'node_modules',
  '.npmignore',
  '.eslintrc.js',
  '.prettierrc',
  'package-lock.json',
  'yarn.lock',
  'pages',
  packageJSON.name + '.zip',
  '.idea',
  '.git',
  '.tmp',
  '.vscode',
  'sync.js'
];
const files = fs.readdirSync(zipDirPath).filter(filename => {
  return !filterFileName.includes(filename);
});

read(rootDir, files, zipDirPath);

zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: {
    level: 9
  }
}).then((content) => {
  console.log('应用打包压缩完成，开始发布应用...');
  console.log(`本次是否更新了服务端: ${!noServiceUpdate}`);

  // fs.writeFileSync(path.join(__dirname, `./${packageJSON.name}.zip`), content, 'utf-8');
  const formData = new FormData();
  formData.append('action', 'app_publishVersion');
  formData.append('userId', Buffer.from('em91eW9uZ3NoZW5nQGt1YWlzaG91LmNvbQ==', 'base64').toString('utf-8'));
  formData.append('payload', JSON.stringify({
    name: (packageJSON.mybricks ? packageJSON.mybricks.title : '') || packageJSON.name,
    version: packageJSON.version,
    namespace: packageJSON.name,
    type: 'app',
    installInfo: JSON.stringify({
      path: `/asset/app/${packageJSON.name}/${packageJSON.version}/${packageJSON.name}.zip`,
      changeLog: '优化部分逻辑，修复若干 bug',
      noServiceUpdate: noServiceUpdate
    }),
    creator_name: Buffer.from('em91eW9uZ3NoZW5nQGt1YWlzaG91LmNvbQ==', 'base64').toString('utf-8') || '',
    icon: packageJSON.mybricks ? packageJSON.mybricks.icon : '',
    description: packageJSON.mybricks ? (packageJSON.mybricks.description || packageJSON.description) : packageJSON.description,
    createTime: Date.now(),
  }));
  formData.append('file', content, `${packageJSON.name}.zip`);

  // formData.append('type', 'app');
  // formData.append('name', packageJSON.name);
  // formData.append('namespace', packageJSON.name);
  // formData.append('version', packageJSON.version);
  // formData.append('icon', packageJSON.mybricks ? packageJSON.mybricks.icon : '');
  // formData.append('description', packageJSON.mybricks ? (packageJSON.mybricks.description || packageJSON.description) : packageJSON.description);
  // /** 暂时写死创建者 */
  // formData.append('creatorName', Buffer.from('em91eW9uZ3NoZW5nQGt1YWlzaG91LmNvbQ==', 'base64').toString('utf-8'));
  // formData.append('changeLog', '优化部分逻辑，修复若干 bug');
  // formData.append('file', content, `${packageJSON.name}.zip`);
  // 发送请求
  axios
    .post(domain + '/central/api/channel/gateway', formData, {
      headers: formData.getHeaders()
    })
    .then(res => {
      if (res.data.code === 1) {
        console.log(res.data.message || '应用发布成功!');
      } else {
        throw new Error(res.data.message || '发布应用接口错误');
      }
    })
    .catch(error => {
      console.log('发布应用失败：', error.message);
    });
});
