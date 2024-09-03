import { ComlibRtUrl, ComlibEditUrl } from './../constants'

export function getApiUrl(uri) {
  return uri
}

export function setCookie(name, value, exdays) {
  const d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))

  const expires = "expires=" + d.toGMTString()
  document.cookie = name + "=" + value + "; " + expires
}

export function getCookie(name) {
  name = name + "="
  const ca = document.cookie.split(';')

  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
}

export function removeCookie(name) {
  document.cookie = `${name}=;expires=Thu,01 Jan 1970 00:00:00 UTC;path=/;`
}

export function getQueryString(name) {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");

  const r = window.location.search.substring(1).match(reg);
  if (r != null) {
    return r[2]
  }
  return null;
}

export function copyText(txt: string): boolean {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.value = txt
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  return true
}

import React from "react"

/**
 * 事件操作
 * ```js
 * eventOperation(() => {}).stop
 * ```
 * @param callback 函数
 */
export function eventOperation (callback: Function) {
  function fn(event: Event) {
    callback && callback(event)
  }

  fn.stop = function (event: Event) {
    if (typeof event.stopPropagation === 'function') {
      event.stopPropagation()
    } else {
      // TODO?
      // @ts-ignore
      const fn = event.evt?.stopPropagation

      if (typeof fn === 'function') {
        fn()
        event.cancelBubble = true
      }
    }

    fn(event)
  } as unknown as React.MouseEventHandler;

  return fn;
}

export function replaceUrlVal(paramName: string, replaceWith?: string, config = {url: location.search}): void {
  const oldUrl = config.url;
  let newUrl: undefined | string = oldUrl;

  if (!replaceWith) {
    newUrl = deleteUrlVal(paramName);
  } else if (oldUrl) {
    const re = eval('/('+ paramName+'=)([^&]*)/gi');
    if (re.test(oldUrl)) {
      newUrl = oldUrl.replace(re, paramName+'='+replaceWith);
    } else {
      newUrl = oldUrl + `&${paramName}=${replaceWith}`;
    }
  } else {
    newUrl = `?${paramName}=${replaceWith}`;
  }

  if (newUrl) {
    history.replaceState(null, '', newUrl);
  }

  
  // const oUrl = location.search.toString();
  // const re = eval('/('+ paramName+'=)([^&]*)/gi');
  // const nUrl = oUrl.replace(re, paramName+'='+replaceWith);
}

export function deleteUrlVal(name, baseUrl = location.search) {
  const query = baseUrl.slice(1);
  if (query.indexOf(name)>-1) {
    const obj: any = {}
    const arr: any = query.split("&");
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].split("=");
      obj[arr[i][0]] = arr[i][1];
    };
    Reflect.deleteProperty(obj, name);
    return '?' + JSON.stringify(obj).replace(/[\"\{\}]/g,"").replace(/\:/g,"=").replace(/\,/g,"&");
  };
}

export const isPublicVersion = () => {
  return new URL(window.location.href).hostname === 'mybricks.world'
}


class Storage {

  private setValue = (key, value) => {
    if (typeof value === 'string') {
      localStorage.setItem(key, value)
      return
    }
    localStorage.setItem(key, JSON.stringify(value))
  }

  private getValue = (key) => {
    let value = localStorage.getItem(key);
    try {
      value = JSON.parse(value);
      return value
    } catch (error) {
    }
    return value
  }

  getDevToolsPath = () => {
    return this.getValue(`wx_devtools_path`)
  }

  setDevToolsPath = (value: string) => {
    return this.setValue(`wx_devtools_path`, value)
  }


  getDevMode = (fileId) => {
    return this.getValue(`dev_mode_${fileId}`)
  }

  setDevMode = (fileId, type) => {
    this.setValue(`dev_mode_${fileId}`, type)
  }
}

export const storage = new Storage()

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}