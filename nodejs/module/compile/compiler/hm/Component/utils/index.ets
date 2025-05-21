export * from './AppRouter'
export * from './AppWindow'

interface RadiusResult {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}
export function parseRadius(value: string | number): RadiusResult {
  // 去除所有空格，并按空格分割
  const values: string[] = (String(value)).trim().split(/\s+/);

  // 移除所有单位(px, em, rem等)
  const cleanValues: number[] = [];
  for (let i = 0; i < values.length; i++) {
    cleanValues.push(parseInt(values[i]));
  }

  // 结果对象
  const result: RadiusResult = {
    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0
  };

  // 根据值的数量进行不同处理
  if (cleanValues.length === 1) {
    // 如果只有一个值，四个角都使用相同的值
    result.topLeft = cleanValues[0];
    result.topRight = cleanValues[0];
    result.bottomRight = cleanValues[0];
    result.bottomLeft = cleanValues[0];
  }
  else if (cleanValues.length === 4) {
    // 如果有四个值，按顺序赋值：上左、上右、下右、下左
    result.topLeft = cleanValues[0];
    result.topRight = cleanValues[1];
    result.bottomRight = cleanValues[2];
    result.bottomLeft = cleanValues[3];
  }
  else {
    // 处理错误情况
    throw new Error('Invalid radius value format');
  }

  return result;
}