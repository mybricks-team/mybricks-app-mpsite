import { message } from "antd";

export const deleteComlib = (ctx: Record<string, any>, libDesc: Record<string, any>) => {
    const { namespace } = libDesc;
    if(!namespace) return message.error('缺少物料namespace')
    const index = ctx.comlibs.findIndex((lib) => lib.namespace===namespace);
    if (index !== -1) {
        ctx.comlibs.splice(index, 1)
    }

    console.log(ctx.comlibs, namespace)
    const winIndex = window['__comlibs_edit_'].findIndex((lib) => lib.namespace===namespace);
    if(winIndex!==-1){
        window['__comlibs_edit_'].splice(winIndex, 1)
    }
}