export interface ToJsonGlobal {
  comsReg: any,
  consReg: any,
  fxFrames: any,
  pinRels: any
}

export interface ToJsonPlugins {
  [pluginName: string]: any
}

export interface ToJsonScene {
  '-v': string,
  id: string,
  title: string,
  coms: {
    model: {
      style: Record<string, string | number>
    }
  }[],
  deps: {}[]
}

export interface ToJsonSchema {
  /** 全局数据 */
  global: ToJsonGlobal,
  /** 插件数据 */
  plugins?: ToJsonPlugins
  /** 页面数据 */
  scenes: ToJsonScene[]
}

export interface PageInfo {
  id: string,
  title?: string
}

export interface DumpPageJson {
  id: string,
  title: string,
  [keyname: string]: any,
}

interface UpdatePageInfo extends DumpPageJson {
}

interface DeletePageInfo extends DumpPageJson {

}

/** 不分页情况下的项目dump数据 */
export interface DumpMetaJson {
  openedPageAry: PageInfo[]
  pageAry: PageInfo[]
  projectContent: {
    ['xg.desn.stageview']: any
  },
  updatedPageAry?: UpdatePageInfo[]
  deletedPageAry?: DeletePageInfo[]
}

export interface DumpChangedPageInfos {
  needUpdate?: Map<string, UpdatePageInfo>
  updated?: Map<string, UpdatePageInfo>
  deleted?: Map<string, DeletePageInfo>
}

/** 分页情况下的项目dump数据 */
export interface DumpProjectJson {
  content: {
    ['xg.desn.stageview']: any
  }
}
