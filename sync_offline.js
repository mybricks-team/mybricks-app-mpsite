const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { minimatch } = require('minimatch');
const packageJSON = require('./package.json');

const zip = new JSZip();
const rootDir = zip.folder(packageJSON.name);
const zipDirPath = path.join(__dirname);

/**
 * gitignore 风格的排除规则
 * - 以 / 开头：只匹配根目录
 * - 否则：匹配所有层级
 */
const ignorePatterns = [
  '/pages',           // 只排除根目录的 pages（前端构建产物）
  '*.zip',
  '.github',
  '.DS_Store',
  '.babelrc',
  '.npmrc',
  '.npmignore',
  '.eslintrc.js',
  '.prettierrc',
  'package-lock.json',
  'yarn.lock',
  '.idea',
  '.git',
  '.vscode',
  'sync.js',
  'sync_offline.js',
  '.tmp',
  '.download-assets',
  'miniprogram-ci',
  'sass',
  'less',
  'core-js',
  'babel-register',
  'caniuse-lite',
  'reactivity',
  'cos-nodejs-sdk-v5',
  'chokidar',
  'get-proxy',
  'html-minifier',
  'jimp',
  'licia',
  'html-minifier-terser',
  'moment-timezone',
  'ajv',
  'request',
  'preset-env',
  'regenerate-unicode-properties',
  'svgo',
  'css-tree',
  'har-validator',
  'acorn',
  'glob',
  'path-scurry',
  'core-js-compat',
  'pixelmatch',
  'babel-core',
  'babel-generator',
  'utif',
  'needle',
  'bmp-js',
  'yaml',
  'mdn-data',
  'autoprefixer',
  'psl',
  'exif-parser',
  'electron-to-chromium'
];

function isIgnored(fullPath) {
  const relativePath = path.relative(zipDirPath, fullPath).replace(/\\/g, '/');
  return ignorePatterns.some(pattern => {
    if (pattern.startsWith('/')) {
      // 只匹配根目录
      return minimatch(relativePath, pattern.slice(1), { dot: true });
    }
    // 匹配任意层级
    return minimatch(relativePath, `**/${pattern}`, { dot: true }) ||
           minimatch(relativePath, pattern, { dot: true });
  });
}

function read(zip, files, dirPath) {
  files.forEach(function (fileName) {
    const fullPath = dirPath + '/' + fileName;
    if (isIgnored(fullPath)) return;
    const file = fs.statSync(fullPath);
    if (file.isDirectory()) {
      read(zip.folder(fileName), fs.readdirSync(fullPath), fullPath);
    } else {
      zip.file(fileName, fs.readFileSync(fullPath));
    }
  });
}

read(rootDir, fs.readdirSync(zipDirPath), zipDirPath);

zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 }
}).then((content) => {
  fs.writeFileSync(path.join(__dirname, `./${packageJSON.name}-${Date.now()}.zip`), content, 'utf-8');
  console.log(`离线包打包完成，请将 ${packageJSON.name}.zip 拖拽到平台进行离线安装`);
});
