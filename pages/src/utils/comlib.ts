
/** 组件库、组件相关utils */


function createScript(src, index) {
  var script = document.createElement('script')
  script.setAttribute('src', src)
  script.setAttribute('index', index)
  return script
}

export function myRequire(arr, onError): Promise<{ styles: any; rnStyles: any }> {
  return new Promise((resolve, reject) => {
    if (!(arr instanceof Array)) {
      console.error('arr is not a Array')
      return false
    }

    var REQ_TOTAL = 0,
      EXP_ARR = [],
      REQLEN = arr.length

    const styles: any = []
    const rnStyles: any = []

    const _headAppendChild = document.head.appendChild
    const _headInsertBefore = document.head.insertBefore

    document.head.appendChild = (ele) => {
      if (ele && ele.tagName?.toLowerCase() === 'style') {
        styles.push(ele)
      }
      _headAppendChild.call(document.head, ele)
      return ele
    }

    document.head.insertBefore = (...args) => {
      _headInsertBefore.call(document.head, ...args)
      rnStyles.push(args[0].cloneNode())

      const index = rnStyles.length - 1
      const _insertRule = args[0].sheet.insertRule

      args[0].sheet.insertRule = (...rule) => {
        if (!rnStyles[index].sheet) {
          _insertRule.call(args[0].sheet, ...rule)
        }

        if (!rnStyles[index].sheet.rules.length) {
          for (let i = 0; i < args[0].sheet.rules.length; i++) {
            rnStyles[index].sheet.insertRule(args[0].sheet.rules[i].cssText, i)
          }
        }

        let isAdded = false

        for (let i = 0; i < rnStyles[index].sheet.rules.length; i++) {
          const selectorText = rnStyles[index].sheet.rules[i].selectorText

          if (rule[0].startsWith(`${selectorText}{`)) {
            isAdded = true
            break
          }
        }

        if (!isAdded) {
          rnStyles[index].sheet.insertRule(
            rule[0],
            rnStyles[index].sheet.rules.length
          )
        }
      }

      return args[0]
    }

    arr.forEach(function (req_item, index, arr) {
      const script = createScript(req_item, index)
      document.body.appendChild(script)
      // getScriptStyle(req_item);
      ;(function (script) {
        script.onerror = (err) => {
          REQ_TOTAL++
          onError(err)
          if (REQ_TOTAL == REQLEN) {
            document.head.appendChild = _headAppendChild
            document.head.insertBefore = _headInsertBefore
          }
        }
        script.onload = function () {
          REQ_TOTAL++
          const script_index = script.getAttribute('index')
          EXP_ARR[script_index] = this

          if (REQ_TOTAL == REQLEN) {
            // resolve(EXP_ARR)
            resolve({ styles, rnStyles })
            // callback && callback.apply(this, EXP_ARR);
            document.head.appendChild = _headAppendChild
            document.head.insertBefore = _headInsertBefore
          }
        }
      })(script)
    })
  })
}

export const MySelfId = '_myself_';

export const isCloundModuleComboUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false
  }
  return url.indexOf('/material/components/combo') !== -1
}

export const getRtComlibsFromEdit = (comlibs) => {
  return comlibs.map(comlib => {

    /** 我的组件 */
    if (comlib?.id === MySelfId) {
      const comboComlib = new ComboComlibURL()
      comboComlib.setComponents(JSON.parse(JSON.stringify(comlib?.comAray)))
      return comboComlib.toRtUrl()
    }

    if (comlib?.rtJs) {
      return comlib.rtJs
    }

    /** 兜底尝试替换edit -> rt，一般规则目前是这样 */
    if (typeof comlib === 'string' && comlib.indexOf('/edit.js') !== -1) {
      return comlib.replace('/edit.js', '/rt.js')
    }

    return comlib
  })
}

export const getValidUrl = (url = '/api/material/components/combo') => {
  const tempPrefix = location.origin || 'https://xxx.com'
  if (url.indexOf('://') !== -1) {
    return new URL(url)
  }
  return new URL(tempPrefix + url)
}

export class ComboComlibURL {
  private _URL_ = new URL('https://xxx.com')

  constructor(url?) {
    const _url = getValidUrl(url)
    this._URL_ = _url
  }

  getComponents = () => {
    let comAry = this._URL_.searchParams.get('components')
    comAry = comAry.split(',')
    let components = []
    if (Array.isArray(comAry)) {
      comAry.forEach(com => {
        components.push({
          namespace: com.split('@')[0],
          version: com.split('@')[1]
        })
      })
    }
    return components
  }

  setComponents = (components) => {
    if (!Array.isArray(components)) {
      return
    }
    const queryStr = components.reduce((acc, cur) => {
      return `${acc}${!!acc ? ',' : ''}${cur.namespace}@${cur.version}`
    }, '')
    this._URL_.searchParams.set('components', queryStr)
  }

  deleteComponents = (namespace: string) => {
    const coms = this.getComponents()
    const deleteIdx = coms.findIndex(com => com.namespace === namespace)
    if (deleteIdx) {
      coms.splice(deleteIdx, 1)
    }
    this.setComponents(coms)
  }

  toRtUrl = () => {
    const rtURL = new URL(this.toString());
    rtURL.searchParams.set('comboType', 'rt');
    return rtURL.toString();
  }

  toEditUrl = () => {
    return this.toString()
  }

  toString = () => {
    return this._URL_.toString()
  }
}


export const getMySelfLibComsFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    myRequire([url], () => {
      reject(new Error('加载我的组件失败'))
    }).then(() => {
      /** 添加之后会有多组件存储于__comlibs_edit_需要合并下 */
      const firstComIdx = window['__comlibs_edit_'].findIndex(
        (lib) => lib.id === MySelfId,
      );
      const lastComIndex = window['__comlibs_edit_'].findLastIndex(
        (lib) => lib.id === MySelfId,
      );
      if (firstComIdx !== lastComIndex) {
        window['__comlibs_edit_'][firstComIdx].comAray = [
          ...window['__comlibs_edit_'][lastComIndex].comAray,
        ];
        window['__comlibs_edit_'].splice(lastComIndex, 1);
      }
      resolve(window['__comlibs_edit_'][firstComIdx]);
    })
  })
}

interface NameAndVersion {
  namespace: string,
  version?: string
}

type ComboLibType = 'rt' | 'edit'

export const getComlibsByNamespaceAndVersion = (nameAndVersions: NameAndVersion[], comboLibType: ComboLibType = 'edit') => {
  const comboComlibURL = new ComboComlibURL()
  comboComlibURL.setComponents(nameAndVersions)
  return getMySelfLibComsFromUrl(comboLibType === 'edit' ? comboComlibURL.toEditUrl() : comboComlibURL.toRtUrl());
}