const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const packageJSON = require('./package.json');

const zip = new JSZip();
/** 根目录 */
const rootDir = zip.folder(packageJSON.name);
// /** 遍历文件 */
function read (zip, files, dirPath) {
  files.forEach(function (fileName) {
    const fillPath = dirPath + '/' + fileName;
    const file = fs.statSync(fillPath);
    if (file.isDirectory()) {
      const childDir = zip.folder(fileName);
      const files = fs.readdirSync(fillPath)
      read(childDir, files, fillPath);
    } else {
      // console.log(fillPath);
      zip.file(fileName, fs.readFileSync(fillPath));
    }
  });
}

const zipDirPath = path.join(__dirname);
/** 过滤不打进zip包的文件名 */
const filterFileName = [
  '.github',
  '.DS_Store', 
  '.babelrc',
  '.npmrc',
  '.npmignore', 
  '.eslintrc.js', 
  '.prettierrc', 
  'package-lock.json',
  'yarn.lock',
  'pages',
  '.idea',
  '.git',
  '.vscode',
  'sync.js',
  'sync_offline.js',
  '.github',
  '.tmp',
  '.download-assets'
];

const files = fs.readdirSync(zipDirPath).filter(filename => {
  return filterFileName.indexOf(filename) === -1 && filename.indexOf('.zip') === -1;
});

read(rootDir, files, zipDirPath);

zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: {
    level: 9
  }
}).then((content) => {
  fs.writeFileSync(path.join(__dirname, `./${packageJSON.name}-${Date.now()}.zip`), content, 'utf-8');
  console.log(`离线包打包完成，请将 ${packageJSON.name}.zip 拖拽到平台进行离线安装`);
});
