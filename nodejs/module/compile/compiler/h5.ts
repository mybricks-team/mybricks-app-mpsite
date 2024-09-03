import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as crypto from "crypto";

import { BaseCompiler } from './base'

class H5Compiler extends BaseCompiler {

  get htmlFilePath() {
    return path.resolve(this.projectPath, './index.html');
  }

  get appJsFilePath() {
    const files = fse.readdirSync(path.resolve(this.projectPath, './js'))
    return path.resolve(this.projectPath, `./js/${files.find(name => name.startsWith('app.'))}`);
  }

  validateData = (data) => {
    this.transformData({ data })
  }

  injectComlibsScriptContent = async (data) => {
    if (!Array.isArray(data?.allComponents?.comlibs)) {
      return
    }
    const res = await Promise.all(data?.allComponents?.comlibs.map(t => t.rtJs).filter(t => !!t).map(t => this.getScrtptContentFromNetwork(t)));
    // 这里只需要让_mybricks_loaded_comlibs_调用的时候执行组件初始化就行，这个时机才有React、Taro依赖的东西，同时不需要返回有意义的对象，因为rendertaro会去获取_comlib_rt_的东西
    const scriptContent = `
      function execComlibs () {
        ${res.map(r => r.content).join('\n')}
      };
      window._mybricks_loaded_comlibs_ = function () { execComlibs(); return Promise.resolve({}) }
    `
    return scriptContent
  }


  handleTemplate = async (data,comlibsContent) => {
    let htmlContent = await fse.readFile(this.htmlFilePath, 'utf-8');
    const comlibsFileName = `comlib.${getContentHash(comlibsContent)}.js`;
    await fse.writeFile(path.resolve(this.projectPath, `./js/${comlibsFileName}`), comlibsContent, 'utf-8')

    const projectCssFileName = `project.${getContentHash(data.cssContent)}.css`;
    await fse.writeFile(path.resolve(this.projectPath, `./css/${projectCssFileName}`), data.cssContent, 'utf-8')

    const configFileName = `config.${getContentHash(data.injectScriptContent)}.js`;
    await fse.writeFile(path.resolve(this.projectPath, `./js/${configFileName}`), data.injectScriptContent, 'utf-8')

    const injectCodeContent = decodeURIComponent(data.allModules);
    const injectCodeFileName = `inject-code.${getContentHash(injectCodeContent)}.js`;
    await fse.writeFile(path.resolve(this.projectPath, `./js/${injectCodeFileName}`), `
function _mybricks_inject_code_ () {
  return (function(comModules) {
    ${injectCodeContent};
    console.log('allComModules', comModules)
    return comModules;
  })({});
}
`, 'utf-8')

    const vconsoleJsContent = await fse.readFile(this.getAssets('vconsole').filePath, 'utf-8');
    await fse.writeFile(path.resolve(this.projectPath, './js/vconsole.min.js'), vconsoleJsContent, 'utf-8');

    // 写入文件，做本地化的时候可以拿到hash后的文件去本地化
    await fse.writeJSON(path.resolve(this.projectPath, './.meta.json'), {
      injectCodeFileName,
      configFileName,
      projectCssFileName,
      comlibsFileName,
    })

    // /** 注入所有动态JS */
    // modifyFileContent(this.appJsFilePath, str => {
    //   let allModules = decodeURIComponent(data.allModules)
    //   allModules = `
    //     function _mybricks_inject_code_ () {
    //       return (function(comModules) {
    //         ${allModules};
    //         console.log('allComModules', comModules)
    //         return comModules;
    //       })({});
    //     }
    //   `;
    //   return str.replace(/\'TEMPLATE\:COMMODULES\'/g, allModules).replace(/\"TEMPLATE\:COMMODULES\"/g, allModules)
    // })

    htmlContent = htmlContent.replace('<meta injectscript>', `<script src="./js/${configFileName}"></script><script src="./js/${injectCodeFileName}"></script>`)
      .replace('<meta injectcomlibs>', `<script src="./js/${comlibsFileName}"></script>`)
      .replace('<meta injectcss>', `<link href="./css/${projectCssFileName}" rel="stylesheet">`)
      .replace('<meta injectvconsole>', `<script>(function(){var openVconsole=new URL(location.href).searchParams.get('vconsole');if(openVconsole){var script=document.createElement('script');script.src='./js/vconsole.min.js';document.getElementsByTagName('head')[0].appendChild(script);script.onload=function(){if(VConsole){new VConsole()}}}})()</script>`)

    await fse.writeFile(this.htmlFilePath, htmlContent, 'utf-8');
  }
}

export const compilerH5 = async ({ data, projectPath, depModules,injectComlibsScriptContent }: any, { Logger }) => {
  const compiler = new H5Compiler({ projectPath });
  compiler.validateData(data);
  await compiler.handleTemplate(data,injectComlibsScriptContent);
}

function modifyFileContent(path, callback) {
  let str = fs.readFileSync(path, 'utf8');
  str = callback?.(str)
  fs.writeFileSync(path, str, { encoding: 'utf8' });
}


function getContentHash (fileContent, len = 8) {
  return crypto.createHash('md5').update(fileContent).digest('hex').slice(0, len);
}