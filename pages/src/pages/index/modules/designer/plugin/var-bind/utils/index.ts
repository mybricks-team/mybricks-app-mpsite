import { rgb2Hex } from './color';
export function isTheme(color: string | undefined): boolean {
  if (typeof color === 'string') {
    return !!color.match(/^\-\-/);
  }
  return false;
}

export function isGradient(color: string): boolean {
  if (color?.match(/\-gradient/)) {
    return true;
  } else {
    return false;
  }
}

export function setCSSVar (colorList) {
  const cssVarList = colorList.map((item) => {
    const { id, name ,value } = item;
    const root = document.documentElement;
    root.style.setProperty(id, rgb2Hex(value));
    return {
      label:name,
      value:`var(${id})`,
      resetValue:rgb2Hex(value)
    };
  });

  window.MYBRICKS_CSS_VARIABLE_LIST = [
    {
      "title": "颜色同步",
      "options": cssVarList
    },
  ]
}
