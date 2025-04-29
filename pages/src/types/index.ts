export * from './user';
export * from './material';
export * from './schema'

export type AnyType = any;

export enum DEV_MODE {
  upload = 'upload',
  devtools = 'devtools'
}

export enum CompileType {
  h5 = 'h5',
  weapp = 'weapp',
  alipay = 'alipay',
  dd = 'dd',
  miniprogram = 'miniprogram',
  harmony = 'harmony'
}