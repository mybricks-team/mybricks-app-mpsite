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
}

declare const APP_ENV: 'development' | 'production';