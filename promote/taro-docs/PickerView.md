# PickerView - 嵌入页面的滚动选择器。
场景：其中只可放置 picker-view-column 组件，其它节点不会显示。

## 类型
```tsx
ComponentType<PickerViewProps>
```

## 最佳实践
```render
import { useState } from 'react';
import { View, PickerView, PickerViewColumn } from '@tarojs/components';
import css from 'index.less';

export default () => {
  const [state, setState] = useState({
    "years": [
      1990,
      1991,
      1992,
      1993,
      1994,
      1995,
      1996,
      1997,
      1998,
      1999,
      2000,
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024
    ],
    "year": 2024,
    "months": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12
    ],
    "month": 2,
    "days": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31
    ],
    "day": 2,
    "value": [
      9999,
      1,
      1
    ]
  });
  const onChange = (e) => {
    setState((state) => {
      const val = e.detail.value
      return {
        ...state,
        year: state.years[val[0]],
        month: state.months[val[1]],
        day: state.days[val[2]],
        value: val
      }
    })
  }
  
  return (
    <View>
      <View>{state.year}年{state.month}月{state.day}日</View>
      <PickerView indicatorStyle='height: 50px;' style='width: 100%; height: 300px;' value={state.value} onChange={onChange}>
        <PickerViewColumn>
          {state.years.map(item => {
            return (
              <View>{item}年</View>
            );
          })}
        </PickerViewColumn>
        <PickerViewColumn>
          {state.months.map(item => {
            return (
              <View>{item}月</View>
            )
          })}
        </PickerViewColumn>
        <PickerViewColumn>
          {state.days.map(item => {
            return (
              <View>{item}日</View>
            )
          })}
        </PickerViewColumn>
      </PickerView>
    </View>
  )
}
```

## PickerViewProps

| 参数 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | :---: | :---: | --- |
| value | `number[]` |  | 否 | 数组中的数字依次表示 picker-view 内的 picker-view-column 选择的第几项（下标从 0 开始），数字大于 picker-view-column 可选项长度时，选择最后一项。 |
| defaultValue | `number[]` |  | 否 | 设置 React 非受控状态下的初始取值 |
| indicatorStyle | `string` |  | 否 | 设置选择器中间选中框的样式 |
| indicatorClass | `string` |  | 否 | 设置选择器中间选中框的类名 |
| maskStyle | `string` |  | 否 | 设置蒙层的样式 |
| maskClass | `string` |  | 否 | 设置蒙层的类名 |
| immediateChange | `boolean` | `false` | 否 | 是否在手指松开时立即触发 change 事件。若不开启则会在滚动动画结束后触发 change 事件。 |
| title | `string` |  | 否 | 选择器标题，建议标题控制在 12 个中文汉字长度内，避免出现截断现象, 截断部分将以 ... 形式展示 |
| ariaLabel | `string` |  | 否 | 无障碍访问，（属性）元素的额外描述 |
| onChange | `CommonEventFunction<onChangeEventDetail>` |  | 否 | 当滚动选择，value 改变时触发 change 事件，event.detail = {value: value}；value为数组，表示 picker-view 内的 picker-view-column 当前选择的是第几项（下标从 0 开始） |
| onPickStart | `CommonEventFunction` |  | 否 | 当滚动选择开始时候触发事件 |
| onPickEnd | `CommonEventFunction` |  | 否 | 当滚动选择结束时候触发事件 |

### onChangeEventDetail

| 参数 | 类型 |
| --- | --- |
| value | `number[]` |