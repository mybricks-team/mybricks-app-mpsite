const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Plugins = require('@mybricks/sdk-for-app/plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const common = require('./webpack.common');
const BuildPlugin = require('./buildplugin')
const HtmlWebpackInlineSourcePlugin = require('@effortlessmotion/html-webpack-inline-source-plugin')
// const config = require('../../config.prod.json');
const rootPath = path.resolve(__dirname, './../../')
const outputPath = path.resolve(rootPath, './assets')

const { generateAssetMapPlugin } = Plugins.default;

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true
  },
  output: {
    // publicPath: "",
    path: path.resolve(rootPath, "./assets"),
  },
  plugins: [
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ['**/*.LICENSE.txt'],
      // dangerouslyAllowCleanPatternsOutsideProject: true,
      cleanOnceBeforeBuildPatterns: ['**/*', '!favicon.ico*', '!css/**'],
    }),
    
    /** Copy 静态资源逻辑都在这，用CopyWebpackPlugin的话会让静态资源都走一遍编译，时间太长了，还编译不了rtComs */
    new BuildPlugin({
      outputPath
    }),

    ...generateAssetMapPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../assets/index.html'),
      chunks: ['index'],
      assetsMap: [
        {
          tag: 'script',
          path: 'public/babel/standalone-7.12.10/babel.min.js',
          CDN: 'https://f2.beckwai.com/kos/nlav12333/mybricks/babel/standalone-7.12.10/babel.min.js'
        },
        {
          tag: 'script',
          path: 'public/terser/5.22.0/bundle.min.js',
          CDN: 'https://f2.beckwai.com/kos/nlav12333/mybricks/terser/bundle.min.js'
        },
        {
          tag: 'script',
          path: 'public/clean-css/5.3.2/cleancss-browser.js',
          CDN: 'https://f2.beckwai.com/kos/nlav12333/mybricks/clean-css/5.3.2/cleancss-browser.js'
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'setting.html',
      template: path.resolve(__dirname, '../assets/setting.html'),
      chunks: ['setting'],
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    // }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
});