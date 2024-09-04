import tinycolor from 'tinycolor2';
import { Operator } from '../types';

export function parseColor(color: ColorFormats.HSLA | string, operators: Operator[]) {
  const hsla = tinycolor(color).toHsl();
  operators.map(({ property, rate }) => {
    hsla[property] = hsla[property] * rate;
    if (hsla[property] < 0) {
      hsla[property] = 0;
    } else if (hsla[property] > 100) {
      hsla[property] = 100;
    }
  });
  return hsla;
}

export function hsla2rgba(hsla: ColorFormats.HSLA) {
  const color = tinycolor(hsla).toRgbString();
  return color;
}

export function rgb2Hex(rgb){
  return tinycolor(rgb).toHexString();
}