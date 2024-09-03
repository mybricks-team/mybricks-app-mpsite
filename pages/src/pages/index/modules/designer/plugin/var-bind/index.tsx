import data from './data';
import VarList from './VarList';

import { Plugin } from './Icons';

export default function pluginVarbind(config?: any) {
  console.log('pluginVarbind', config);
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
    activate(args) { },
    beforeDump(args) {
      //当dump总体数据时回调（保存）
      //debugger
    },
  }
};
