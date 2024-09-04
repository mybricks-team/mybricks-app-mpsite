import data from './data';
import VarList from './VarList';
import { Plugin } from './Icons';
import { setCSSVar } from "./utils/index"
import { itemTypes } from './enum';


export default function pluginVarbind(config?: any) {
  return {
    name: 'mybricks.desn.plugin.var-bind',
    title: '图文同步列表',
    author: 'MoYukai',
    ['author.zh']: '莫煜楷',
    version: '1.0.0',
    description: '图文同步列表',
    data,
    contributes: {
      sliderView: {
        tab: {
          //在SliderView扩展一个Tab
          title: '图文同步',
          icon: Plugin,
          apiSet: ['variables', 'canvas', 'theme'],
          render(args) {
            //View渲染
            return <VarList {...args} />;
          },
        },
      },
    },
    activate(args) {
      //初始化时挂载颜色变量
      let colorList = args.data.varAry.filter((item) => item.type === itemTypes.COLOR);
      colorList = colorList.map((item) => {
        return { ...item, name: item.title };
      });
      setCSSVar(colorList)
    },
    beforeDump(args) {
      //当dump总体数据时回调（保存）
      //debugger
    },
  }
};
