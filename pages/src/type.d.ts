declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare interface Window {
  React: React;
  Vue: Vue;
  ReactDOM: ReactDOM;
  designerRef: any
  mybricks: any

  __PLATFORM__: string

  /** 是否老文件 */
  __isOldFile__: boolean

  /** 存储类型 */
  __type__: 'mpa' | 'spa'
}

declare const APP_ENV: 'development' | 'production';