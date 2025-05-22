export const COOKIE_LOGIN_USER = "mybricks-login-user";

export const MySelf_COM_LIB = {
  comAray: [],
  id: '_myself_',
  title: '我的组件',
  defined: true,
};

export const MP_BASIC_COM_LIB = {
  id: "default",
  namespace: "mybricks.normal-miniapp.taro",
  
  // editJs: "http://127.0.0.1:8081/lib/edit.js",
  // coms: "http://127.0.0.1:8081/mp/rtCom.js",
  editJs: "./public/comlibs/comlib-h5-normal/0.3.85/edit.js",
  rtJs: "./public/comlibs/comlib-h5-normal/0.3.85/rt.js",
  coms: "./public/comlibs/comlib-h5-normal/0.3.85/rtCom.js",
  version: "0.3.85",
};

export const HARMONY_COM_LIB = {
  id: 'default',
  namespace: 'mybricks.normal-harmony.taro',
  editJs: "./public/comlibs/comlib-harmony-normal/0.0.4/edit.js",
  // editJs: "https://127.0.0.1:8000/libEdt.js",
  version: '0.0.4',
}

export const COMPONENT_NAMESPACE = {
  get systemPage () {
    if (window.__PLATFORM__ === 'harmony') {
      return 'mybricks.harmony.systemPage'
    }
    return 'mybricks.taro.systemPage'
  },
  get systemWebview () {
    if (window.__PLATFORM__ === 'harmony') {
      return 'mybricks.harmony.systemWebview'
    }
    return 'mybricks.taro.systemWebview'
  },
  get popup () {
    if (window.__PLATFORM__ === 'harmony') {
      return 'mybricks.harmony.popup'
    }
    return 'mybricks.taro.popup'
  }
}

export const LOCAL_EDITOR_ASSETS = {
  expression: {
    CDN: {
      codemirror: "/mfs/editor_assets/codemirror/codemirror_1.0.13_index.min.js",
    },
  },
  richtext: {
    CDN: {
      tinymce: "/mfs/editor_assets/richText/tinymce/5.7.1/tinymce.min.js",
      indent2emPluginCDN: "/mfs/editor_assets/richText/tinymce/5.7.1/plugins/indent2em/plugin.js",
      language: "/mfs/editor_assets/richText/tinymce/5.7.1/zh_CN.js",
    },
  },
  align: {
    CDN: {
      left: "/mfs/editor_assets/align/left.defc4a63ebe8ea7d.svg",
      rowCenter: "/mfs/editor_assets/align/center.c284343a9ff9672a.svg",
      right: "/mfs/editor_assets/align/right.a7763b38b84b5894.svg",
      top: "/mfs/editor_assets/align/top.98906024d52b69de.svg",
      columnCenter: "/mfs/editor_assets/align/center.100376f4ade480cd.svg",
      bottom: "/mfs/editor_assets/align/bottom.6ee532067ed440ca.svg",
      column: "/mfs/editor_assets/align/column-space-between.31d560c0e611198f.svg",
      row: "/mfs/editor_assets/align/row-space-between.ead5cd660c0f1c33.svg",
    },
  },
  array: {
    CDN: {
      sortableHoc: "/mfs/editor_assets/react-sortable/react-sortable-hoc-2.0.0_index.umd.min.js",
    },
  },
  expcode: {
    CDN: {
      prettier: {
        standalone: "/mfs/editor_assets/prettier/2.6.2/standalone.js",
        babel: "/mfs/editor_assets/prettier/2.6.2/parser-babel.js",
      },
      eslint: "/mfs/editor_assets/eslint/8.15.0/eslint.js",
      paths: {
        vs: "/mfs/editor_assets/monaco-editor/0.33.0/min/vs",
      },
      monacoLoader: "/mfs/editor_assets/monaco-editor/0.33.0/min/vs/loader.min.js",
    },
  },
  csseditor: {
    CDN: {
      prettier: {
        standalone: "/mfs/editor_assets/prettier/2.6.2/standalone.js",
        babel: "/mfs/editor_assets/prettier/2.6.2/parser-babel.js",
      },
      eslint: "/mfs/editor_assets/eslint/8.15.0/eslint.js",
      paths: {
        vs: "/mfs/editor_assets/monaco-editor/0.33.0/min/vs",
      },
      monacoLoader: "/mfs/editor_assets/monaco-editor/0.33.0/min/vs/loader.min.js",
    },
  },
  stylenew: {
    CDN: {
      prettier: {
        standalone: "/mfs/editor_assets/prettier/2.6.2/standalone.js",
        babel: "/mfs/editor_assets/prettier/2.6.2/parser-babel.js",
      },
      eslint: "/mfs/editor_assets/eslint/8.15.0/eslint.js",
      paths: {
        vs: "/mfs/editor_assets/monaco-editor/0.33.0/min/vs",
      },
      monacoLoader: "/mfs/editor_assets/monaco-editor/0.33.0/min/vs/loader.min.js",
    },
  },
  code: {
    CDN: {
      prettier: {
        standalone: "/mfs/editor_assets/prettier/2.6.2/standalone.js",
        babel: "/mfs/editor_assets/prettier/2.6.2/parser-babel.js",
      },
      eslint: "/mfs/editor_assets/eslint/8.15.0/eslint.js",
      paths: {
        vs: "/mfs/editor_assets/monaco-editor/0.33.0/min/vs",
      },
      monacoLoader: "/mfs/editor_assets/monaco-editor/0.33.0/min/vs/loader.min.js",
    },
  },
}

export const DESIGNER_STATIC_PATH = './public/designer-spa/3.9.346/index.min.js'
// export const DESIGNER_STATIC_PATH = 'https://f2.eckwai.com/kos/nlav12333/mybricks/designer-spa/3.9.137/index.min.js'