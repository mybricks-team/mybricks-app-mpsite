const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const common = require("./webpack.common");
const BuildPlugin = require('./buildplugin')
const HtmlWebpackInlineSourcePlugin = require('@effortlessmotion/html-webpack-inline-source-plugin')
// const config = require('../../config.prod.json');
const rootPath = path.resolve(__dirname, "./../../");
const outputPath = path.resolve(rootPath, './assets')

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimize: true,
  },
  output: {
    // publicPath: "",
    path: path.resolve(rootPath, "./assets"),
  },
  plugins: [
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ["**/*.LICENSE.txt"],
      // dangerouslyAllowCleanPatternsOutsideProject: true,
      cleanOnceBeforeBuildPatterns: ["**/*", "!favicon.ico*", "!css/**"],
    }),

    /** Copy 静态资源逻辑都在这，用CopyWebpackPlugin的话会让静态资源都走一遍编译，时间太长了，还编译不了rtComs */
    new BuildPlugin({
      outputPath
    }),

    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "../assets/index.html"),
      chunks: ["index"],
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    // }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
});
