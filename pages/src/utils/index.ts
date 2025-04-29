export function copyText(txt: string): boolean {
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.value = txt;
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
  return true;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 判断当前设计文件的平台 */
export function isDesignFilePlatform (target: 'h5' | 'harmony' | 'miniprogram') {
  if (target === 'h5') {
    return window.__PLATFORM__ === 'h5'
  }
  // if (target === 'weapp') {
  //   return !window.__PLATFORM__  || (window.__PLATFORM__ !== 'h5' && window.__PLATFORM__ !== 'harmony')
  // }

  if (target === 'harmony') {
    return window.__PLATFORM__ === 'harmony'
  }

  if (target === 'miniprogram') {
    return !window.__PLATFORM__ || (window.__PLATFORM__ !== 'h5' && window.__PLATFORM__ !== 'harmony')
  }
}

export function getPageTitlePrefix () {
  switch (true) {
    case isDesignFilePlatform('h5'): {
      return 'H5'
    }
    case isDesignFilePlatform('miniprogram'): {
      return '小程序'
    }
    case isDesignFilePlatform('harmony'): {
      return '鸿蒙'
    }
  }
}