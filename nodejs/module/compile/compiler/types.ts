
export enum CompileType {
  h5 = 'h5',
  weapp = 'weapp',
  alipay = 'alipay',
  dd = 'dd'
}

export interface DepModule {
  name: string,
  version: string,
  /** export到全局的umd名称 */
  library: string
  urls: []
}

export type DepModules = DepModule[]