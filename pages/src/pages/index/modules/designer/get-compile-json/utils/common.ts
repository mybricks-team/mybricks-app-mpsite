export function getComsFromPageJson (pageJson)  {
  /** 多场景 */
  if (Array.isArray(pageJson?.scenes)) {
    return pageJson?.scenes.reduce((acc, cur) => {
      return {
        ...acc,
        ...(cur?.coms || {})
      }
    }, {})
  }
  /** 非多场景 */
  return pageJson?.coms ?? {}
}