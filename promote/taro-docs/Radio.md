# Radio - 单选项目。
场景：仅可放置于 `<PickerView />` 中，其孩子节点的高度会自动设置成与 picker-view 的选中框的高度一致

## 类型
```tsx
ComponentType<RadioProps>
```

## 最佳实践
```render
import { useState } from 'react';
import { View, Head, Text, Radio, RadioGroup, Label } from '@tarojs/components';
import css from 'index.less';

export default () => {
  const [state, setState] = useState({
    list: [
      {
        value: '美国',
        text: '美国',
        checked: false
      },
      {
        value: '中国',
        text: '中国',
        checked: true
      },
      {
        value: '巴西',
        text: '巴西',
        checked: false
      },
      {
        value: '日本',
        text: '日本',
        checked: false
      },
      {
        value: '英国',
        text: '英国',
        checked: false
      },
      {
        value: '法国',
        text: '法国',
        checked: false
      }
    ]
  })

  return (
    <View className={css.container}>
      <Head title='Radio' />
      <View className={css['page-body']}>
        <View className={css['page-section']}>
          <Text>默认样式</Text>
          <Radio value='选中' checked>选中</Radio>
          <Radio style='margin-left: 20rpx' value='未选中'>未选中</Radio>
        </View>
        <View className={css['page-section']}>
          <Text>推荐展示样式</Text>
          <View className={css['radio-list']}>
            <RadioGroup>
              {state.list.map((item, i) => {
                return (
                  <Label className={css['radio-list__label']} for={i} key={i}>
                    <Radio className={css['radio-list__radio']} value={item.value} checked={item.checked}>{item.text}</Radio>
                  </Label>
                )
              })}
            </RadioGroup>
          </View>
        </View>
      </View>
    </View>
  )
}
```

## RadioProps

| 参数 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | :---: | :---: | --- |
| value | `string` |  | 否 | `<Radio/>` 标识。当该`<Radio/>` 选中时，`<RadioGroup/>`的 change 事件会携带`<Radio/>`的 value |
| checked | `boolean` | `false` | 否 | 当前是否选中 |
| disabled | `boolean` | `false` | 否 | 是否禁用 |
| color | `string` | `"#09BB07"` | 否 | Radio 的颜色，同 css 的 color |
| name | `string` |  | 否 | Radio 的名字 |
| nativeProps | `Record<string, unknown>` |  | 否 | 用于透传 `WebComponents` 上的属性到内部 H5 标签上 |
| ariaLabel | `string` |  | 否 | 无障碍访问，（属性）元素的额外描述 |
| onChange | `CommonEventFunction<{ value?: string; }>` |  | 否 | <radio-group/> 中的选中项发生变化时触发 change 事件 |