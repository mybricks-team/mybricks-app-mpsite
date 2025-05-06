import { fileReader } from '../FileReaderEditor';
import { inject } from './inject';
// import { Editors as DomainEditors } from "@mybricks/editors-domain-common";

function typeCheck(variable: any, type: string): boolean {
  const typeMap: {
    [key: string]: string;
  } = {
    NULL: "[object Null]",
    ARRAY: "[object Array]",
    OBJECT: "[object Object]",
    STRING: "[object String]",
    NUMBER: "[object Number]",
    BOOLEAN: "[object Boolean]",
    FUNCTION: "[object Function]",
    FORMDATA: "[object FormData]",
    UNDEFINED: "[object Undefined]",
  };
  const checkType = /^\[.*\]$/.test(type) ? type : typeMap[type.toUpperCase()];

  return Object.prototype.toString.call(variable) === checkType;
}

export const editorAppenderFn = (editConfig, ctx) => {
  const editorsMap = {
    FILEREADER: fileReader,
  }

  let editor;
  try {
    editor = editorsMap[editConfig.type.toUpperCase()] || editConfig.render;
  } catch (err) {
    console.error(err);
  }

  inject(editConfig);

  if (typeCheck(editor, "function")) {
    return editor({ editConfig, ctx });
  }

  if (typeCheck(editor, "object") && typeCheck(editor.render, "function")) {
    return editor;
  }

  // const domainEditor = DomainEditors(editConfig, { domainModel: ctx?.appConfig?.datasource?.domainModel })

  // if (domainEditor) {
  //   if (ctx.appConfig.datasource) {
  //     return domainEditor
  //   }
  //   return '未配置数据源'
  // }

  return null
}

window.__editorAppender__= ({ editConfig }) => {
  return editorAppenderFn(editConfig)
}