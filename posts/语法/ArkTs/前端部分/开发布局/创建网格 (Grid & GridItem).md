- Grid的子组件必须是GridItem组件。

## 布局方法

```
Grid() {
  // ...
}
.rowsTemplate('1fr 1fr 1fr') //控制列
.columnsTemplate('1fr 2fr 1fr') //控制行
```

## 设置主轴方向

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1748520236935-2b35a9f1-cdef-46c5-abe7-2835a7dcf1a0.png)

```
Grid() {
  // ...
}
.maxCount(3)
.layoutDirection(GridDirection.Row)
```

## 设置间距

```
Grid() {
  // ...
}
.columnsGap(10) //行间距
.rowsGap(15) //列间距
```