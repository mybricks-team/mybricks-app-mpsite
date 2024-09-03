import { message } from 'antd'
import { myRequire } from '@/utils/comlib'
const ComLib_Edit = '__comlibs_edit_'
export const addComlib = async (ctx: Record<string, any>, newComlib: Record<string, any>) => {
    const { id, editJs, namespace } = newComlib
    if(!namespace) return message.error('缺少物料namespace')
    try {
        const { styles } =  await myRequire([editJs], (error) => {
            Promise.reject(error)
        })
        ctx.comlibs.push(newComlib);
        const loadedComlib = window[ComLib_Edit].find(lib => lib.namespace===namespace);
        loadedComlib.id = id;
        loadedComlib._styleAry = styles;
        return loadedComlib
    } catch (error) {
        throw error
    }
   
}