// 组件导入路径
const COMPONENT_PACKAGE_NAME = "../components"

// [TODO] 自动生成
export const COMPONENT_META = {
  "mybricks.taro.systemPage": {
    // 导入方式
    dependencyImport: {
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["MyBricksSystemPage", "MyBricksSystemPageController"],
      importType: "named",
    },
    componentName: "MyBricksSystemPage",
  },
  "mybricks.taro.button": {
    // 导入方式
    dependencyImport: {
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["MyBricksButton", "MyBricksButtonController"],
      importType: "named",
    },
    componentName: "MyBricksButton",
  },
  "mybricks.taro.text": {
    // 导入方式
    dependencyImport: {
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["MyBricksText", "MyBricksTextController"],
      importType: "named",
    },
    componentName: "MyBricksText",
  },
  "mybricks.taro.image": {
    // 导入方式
    dependencyImport: {
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["MyBricksImage", "MyBricksImageController"],
      importType: "named",
    },
    componentName: "MyBricksImage",
  },
  "mybricks.taro.containerList": {
    // 导入方式
    dependencyImport: {
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: [
        "MyBricksContainerList",
        "MyBricksContainerListController",
      ],
      importType: "named",
    },
    componentName: "MyBricksContainerList",
  },
  "mybricks.taro._muilt-inputJs": {
    dependencyImport: {
      packageName: COMPONENT_PACKAGE_NAME,
      dependencyNames: ["codes"],
      importType: "named",
    },
  },


  // "mybricks.taro._toString": {
  //   // 导入方式
  //   dependencyImport: {
  //     packageName: COMPONENT_PACKAGE_NAME,
  //     dependencyNames: ["myBricks_toString"],
  //     importType: "named",
  //   },
  //   componentName: "myBricks_toString",
  // },
};
