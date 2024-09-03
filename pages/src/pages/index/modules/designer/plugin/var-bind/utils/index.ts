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
