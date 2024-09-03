import { isNumber, isObject, cloneDeep } from "lodash";
import { Modal, message } from "antd";
// import { MaterialComlib } from './../../../types'
import {
  ComboComlibURL,
  getMySelfLibComsFromUrl,
  getComlibsByNamespaceAndVersion,
} from "@/utils/comlib";
import { initMaterials } from "./initMaterials";
import { addComlib } from "./addComlib";
import { upgradeLatestComlib, upgradeComlibByVersion } from "./upgradeComlib";
import { deleteComlib } from "./deleteComlib";

const init = () => {
  if (!window["__comlibs_edit_"]) {
    window["__comlibs_edit_"] = [];
  }

  if (!window["__comlibs_rt_"]) {
    window["__comlibs_rt_"] = window["__comlibs_edit_"];
  }

  if (!window["CloudComponentDependentComponents"]) {
    window["CloudComponentDependentComponents"] = {};
  }
};

const MySelfId = "_myself_";

export default (ctx) => (libDesc) => {
  init();

  const mySelfLib = ctx?.comlibs.find((t) => t?.id === MySelfId);

  const addSelfLibComponents = (components) => {
    components.forEach((component) => {
      const mySelfLib = ctx?.comlibs.find((t) => t?.id === MySelfId);
      const index = mySelfLib.comAray.findIndex(
        (item) => item.namespace === component.namespace
      );

      /** 当前组件已经存在 */
      if (index !== -1) {
        mySelfLib.comAray[index] = {
          materialId: component.materialId,
          namespace: component.namespace,
          version: component.version,
        };
      } else {
        mySelfLib.comAray.push({
          materialId: component.materialId,
          namespace: component.namespace,
          version: component.version,
        });
      }
    });

    return mySelfLib.comAray;
  };

  const removeSelfLibComponents = (comNamespaces) => {
    const mySelfLib = ctx?.comlibs.find((t) => t?.id === MySelfId);
    comNamespaces.forEach((comNamespace) => {
      const removeIdx = mySelfLib?.comAray?.findIndex?.((item) => {
        return item.namespace === comNamespace;
      });
      mySelfLib.comAray.splice(removeIdx, 1);
    });
  };

  const updateSelfLibComponent = (component) => {
    const mySelfLib = ctx?.comlibs.find((t) => t?.id === MySelfId);
    if (!component?.namespace || !component?.version) {
      return mySelfLib.comAray;
    }

    mySelfLib.comAray.forEach((com) => {
      if (com.namespace === component?.namespace) {
        com.version = component.version;
      }
    });

    return mySelfLib.comAray;
  };

  const getSelfComponents = () => {
    return mySelfLib?.comAray.filter((com) => isObject(com));
  };

  // const LATEST_COMLIBS = cloneDeep(ctx.latestComlibs || []);

  return new Promise(async (resolve, reject) => {
    (async () => {
      /** 带加载命令，如：新增组件、更新组件、更新组件库 */
      if (libDesc?.cmd) {
        const { cmd, libId, comNamespace } = libDesc;
        const comlib = window["__comlibs_edit_"].find(
          (lib) => lib.id === libId
        );

        let index = -1;
        let com;
        switch (cmd) {
          // case 'upgradeCom':
          //   index = comlib.comAray.findIndex((com) => com.namespace === comNamespace);

          //   if (index !== -1) {
          //     com = comlib.comAray[index];
          //     const closeLoad = message.loading({
          //       key: 'loading',
          //       content: '物料加载中……',
          //       duration: 200,
          //     })
          //     const component = await MaterialService.getMateralMaterialInfo({ namespace: comNamespace }).finally(()=>closeLoad())
          //     if (component.version === com.version) {
          //       message.warn('当前组件已经是最新版本了～')
          //       return
          //     }
          //     Modal.confirm({
          //       className: 'fangzhou-theme',
          //       okText: '确定',
          //       cancelText: '取消',
          //       centered: true,
          //       title: `请确认是否升级组件“${com.title}”到最新版本`,
          //       getContainer: () => document.body,
          //       onOk() {
          //         const newComponents = updateSelfLibComponent(component)
          //         getComlibsByNamespaceAndVersion(newComponents).then((newComlib) => {
          //           resolve({
          //             id: '_myself_',
          //             title: '我的组件',
          //             defined: true,
          //             comAray: newComlib?.comAray || []
          //           })
          //         })
          //       },
          //     });
          //   }
          //   break;
          // case 'deleteCom': /** 需要resolve一个comlib对象 */
          //   index = comlib.comAray.findIndex((com) => com.namespace === comNamespace);

          //   if (index !== -1) {
          //     com = comlib.comAray[index];
          //     Modal.confirm({
          //       className: 'fangzhou-theme',
          //       okText: '确定',
          //       cancelText: '取消',
          //       centered: true,
          //       title: `请确认是否删除组件“${com.title}”，当前操作不可逆！`,
          //       getContainer: () => document.body,
          //       onOk() {
          //         removeSelfLibComponents([comNamespace])
          //         resolve(ctx?.comlibs.find(t => t?.id === MySelfId));
          //       },
          //     });
          //   }
          //   break;
          // case 'addCom':
          //   ctx.sdk.openUrl({
          //     url: 'MYBRICKS://mybricks-material/materialSelectorPage',
          //     params: {
          //       defaultSelected: getSelfComponents(),
          //       userId: ctx.user?.id,
          //       combo: true,
          //       tags: [APP_TYPE]
          //     },
          //     onSuccess: ({ materials, updatedMaterials }) => {
          //       const newComponents = addSelfLibComponents(materials)
          //       getComlibsByNamespaceAndVersion(newComponents).then((newComlib) => {
          //         resolve({
          //           id: '_myself_',
          //           title: '我的组件',
          //           defined: true,
          //           comAray: newComlib?.comAray || []
          //         })
          //       })
          //     }
          //   })

          //   break
          case "deleteComLib":
            deleteComlib(ctx, { ...libDesc, namespace: libDesc?.libNamespace });
            resolve(true);
            break;
          case "upgradeComLib":
            const upgradedComlib = await upgradeLatestComlib(ctx, {
              ...libDesc,
              namespace: libDesc?.libNamespace,
              id: libId,
            });
            return resolve(upgradedComlib);
          default:
            break;
        }
        return;
      }

      /** 不带命令，且描述为空，即页面初始化，加载组件及组件库 */
      if (!libDesc) {
        // 此处加载报错，会导致引擎一直处于加载中
        try {
          const comlibs = await initMaterials(ctx);
          return resolve([...comlibs]);
          // return resolve([...comlibs, "https://f2.beckwai.com/udata/pkg/eshop/fangzhou/temp/edit.debdd533f35e278c.js"])
        } catch (e) {
          console.error(e);
        }
      }

      /** 不带命令，增加、更新组件库，新增时comLibAdder resolve的组件库会带到libDesc来 */
      if (libDesc?.editJs) {
        const material = ctx.comlibs.find(
          (lib) => lib.namespace === libDesc?.libNamespace
        );
        if (material) {
          //upgrade
          const comlib = {
            ...material,
            ...libDesc,
          };
          const addedComlib = await upgradeComlibByVersion(ctx, {
            ...comlib,
            namespace: comlib?.libNamespace,
            id: libDesc?.libId,
          });
          return resolve(addedComlib);
        } else {
          //新增
          const addedComlib = await addComlib(ctx, {
            ...libDesc,
            namespace: libDesc?.libNamespace,
            id: libDesc?.libId,
          });
          return resolve(addedComlib);
        }
      }
    })().catch(() => {});
  });
};
