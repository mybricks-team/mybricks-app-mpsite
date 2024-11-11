# RadioGroup - 单项选择器，内部由多个 Radio 组成。
场景：仅可放置于 `<PickerView />` 中，其孩子节点的高度会自动设置成与 picker-view 的选中框的高度一致

## 类型
```tsx
ComponentType<RadioGroupProps>
```

## RadioGroupProps

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | :---: | --- |
| name | `string` | 否 | 组件名字，用于表单提交获取数据。 |
| onChange | `CommonEventFunction` | 否 | RadioGroup 中选中项发生改变时触发 change 事件，detail = {value:[选中的radio的value的数组]} |

### onChangeEventDetail

| 参数 | 类型 |
| --- | --- |
| value | `string[]` |