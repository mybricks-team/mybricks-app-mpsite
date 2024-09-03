import { Modal, message } from 'antd'
import { MaterialComlib } from '@/types'
import { addComlib } from './addComlib'
import { upgradeComlibByVersion } from './upgradeComlib'

function compareVersion(version1, version2) {
  return version1 === version2 ? 0 : 1;
}

const onComlibSelect = (ctx) => (comlib, cb) => {
  let libs = ctx.comlibs;
  if (!libs) {
    ctx.comlibs = [comlib];
  } else {
    const index = libs.findIndex((lib) => lib.fileId === comlib.fileId);

    if (index === -1) {
      libs.push(comlib);
      ctx.comlibs = libs;
      cb(comlib);
      message.info('添加组件库成功，请保存后刷新页面');
    } else {
      const res = compareVersion(comlib.version, libs[index].version);
      if (res === 1) {
        libs.splice(index, 1, comlib);
        cb(comlib);
        message.info('添加组件库成功，请保存后刷新页面');
      } else if (res === 0) {
        message.warn(`添加组件库暂无更新，当前组件库版本号为@${comlib.version}`);
      } else {
        message.warn('添加组件库版本过低，请更新后再次添加');
      }
    }
  }
};

export const comLibAdderFunc = ctx => (targetComlib) => {
  // 升级
  // if (targetComlib) {
  //   return new Promise((resolve) => {
  //     Modal.confirm({
  //       className: 'fangzhou-theme',
  //       okText: '确定',
  //       cancelText: '取消',
  //       title: `确认升级当前组件库到${targetComlib.version}版本吗？`,
  //       getContainer: () => document.body,
  //       onOk() {
  //         // onComlibSelect(targetComlib, resolve);
  //       },
  //     });
  //   });
  // }

  return new Promise((resolve) => {
    ctx.sdk.openUrl({
      url: 'MYBRICKS://mybricks-material/materialSelectorPage',
      params: {
        defaultSelected: ctx.comlibs,
        userId: ctx.user?.id,
        combo: true,
	      title: '选择组件库',
        type: 'com_lib',
        scene: "MP",
      },
      onSuccess: async ({ materials }: { materials: MaterialComlib[] }) => {
        /** 物料中心传过来的ID是物料中心ID，需要修改成组件本身的fileid */
        const material = ctx.comlibs.find(lib => lib.namespace === materials[0]?.namespace)
        if(material) {
          //更新
          const comlib = {
            ...material, 
            coms: materials[0].coms,
            editJs: materials[0].editJs,
            rtJs: materials[0].rtJs,
            version: materials[0].version
          }
          const addedComlib = await upgradeComlibByVersion(ctx, comlib)
          resolve(addedComlib)
        }else {
          //新增
          const addedComlib = await addComlib(ctx, materials[0])
          resolve(addedComlib)
        }
      }
    }) 
  })
}