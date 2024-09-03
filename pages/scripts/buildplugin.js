const fse = require('fs-extra');
const path = require('path');

module.exports = class BuildPlugin {
  constructor (props) {
    this._props = props;
  }

  apply (compiler) {
    compiler.hooks.done.tap('BuildPluginDone', () => {
      const { outputPath } = this._props;

      fse.ensureDirSync(path.resolve(outputPath, './public'))
      fse.copySync(path.resolve(__dirname, '../public'), path.resolve(outputPath, './public'))

      // fse.ensureDirSync(path.resolve(outputPath, './css'))
      // fse.copySync(path.resolve(assetsPath, './css'), path.resolve(outputPath, './css'))
    });
  }
};
