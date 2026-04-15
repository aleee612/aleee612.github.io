- 一个**纵向排列的容器组件**，它将其子组件按照**垂直方向**（从上到下）依次排列。类似地，`Row` 是**横向排列**的容器组件。

### 基本特性：

1. **布局方向**：子组件默认从上到下垂直排列
2. **主轴方向**：垂直方向（对应 `justifyContent` 属性）
3. **交叉轴方向**：水平方向（对应 `alignItems` 属性）
4. **常用属性**：

- `space`：子组件之间的间距
- `justifyContent`：主轴对齐方式
- `alignItems`：交叉轴对齐方式

# 基础使用：

#### 1. 基础垂直布局

```
@Entry
@Component
struct MyComponent {
  build() {
    Column({ space: 10 }) {  // 子组件间距10vp
      Text('第一行').fontSize(20)
      Text('第二行').fontColor(Color.Red)
      Button('按钮').width(100)
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}
```

#### 2. 组合布局（嵌套 `Row`）

```
@Entry
@Component
struct ComplexLayout {
  build() {
    Column() {
      Text('标题').fontSize(24)
      
      Row() {  // 在 Column 中嵌套横向排列
        Text('姓名：')
        Text('张三').fontWeight(FontWeight.Bold)
      }.margin({ top: 10 })
      
      Divider()  // 分割线组件
      
      Column() {  // 嵌套子 Column
        Text('详情1')
        Text('详情2')
      }.padding(10)
    }
  }
}
```

#### 3. 对齐方式控制

```
Column({ space: 20 }) {
  Text('居左文本').alignSelf(ItemAlign.Start)//为什么是start不是begin()
  Text('居中文本').alignSelf(ItemAlign.Center)
  Text('居右文本').alignSelf(ItemAlign.End)
}
.width('80%')
.height(200)
.backgroundColor('#f0f0f0')
.justifyContent(FlexAlign.SpaceEvenly)  // 主轴均匀分布
.alignItems(HorizontalAlign.Center)     // 交叉轴居中
```

## 主轴排列方式

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1748518913558-ac7740d7-e761-4c67-8b0b-5bb12a6699bb.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1746666057087-94327d42-bfc7-4e35-b470-a1d45a2f9e63.png)

## 交叉轴排列方式：

### Column：alignItems + HorizontalAlign

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1748518979846-2e89e64d-dd19-49a2-b48e-8b990935a123.png)

```
Column({}) {
  //...
}.width('100%').alignItems(HorizontalAlign.Start)
```

### Row：alignItems + VerticalAlign

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1748519076526-815d753e-d6a8-4e61-90a9-444580386b65.png)

```
Row({}) {
 //...
}.width('100%').alignItems(VerticalAlign.Top)
```

## 自适应拉伸组件Blank

```
Row() {
  Text('Bluetooth').fontSize(18)
  Blank()
  Toggle({ type: ToggleType.Switch, isOn: true })
}.width('100%')
```

## 自适应缩放：

### .layoutWeight()

```
 Row() {
    Column() {
      Text('layoutWeight(1)')
       .textAlign(TextAlign.Center)
    }.layoutWeight(1).backgroundColor(0xF5DEB3).height('100%')

    Column() {
      Text('layoutWeight(2)')
       .textAlign(TextAlign.Center)
    }.layoutWeight(2).backgroundColor(0xD2B48C).height('100%')

    Column() {
      Text('layoutWeight(3)')
       .textAlign(TextAlign.Center)
    }.layoutWeight(3).backgroundColor(0xF5DEB3).height('100%')
}.backgroundColor(0xffd306).height('30%')
```

### .with()固定配比

```
Row() {
  Column() {
    Text('left width 20%')
      .textAlign(TextAlign.Center)
  }.width('20%').backgroundColor(0xF5DEB3).height('100%')
  
  Column() {
    Text('center width 50%')
      .textAlign(TextAlign.Center)
  }.width('50%').backgroundColor(0xD2B48C).height('100%')

  Column() {
    Text('right width 30%')
      .textAlign(TextAlign.Center)
  }.width('30%').backgroundColor(0xF5DEB3).height('100%')
}.backgroundColor(0xffd306).height('30%')
```

## 自适应延伸

### 使用Scroll组件

```
@Entry
@Component
struct ScrollExample {
  scroller: Scroller = new Scroller();
  private arr: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];


  build() {
    Scroll(this.scroller) {
      Row() {
        ForEach(this.arr, (item?:number|undefined) => {
          if(item){
            Text(item.toString())
          }
        })
      }.height('100%')
    }
    .scrollable(ScrollDirection.Horizontal) // 滚动方向为水平方向
    .scrollBar(BarState.On) // 滚动条常驻显示
    .scrollBarColor(Color.Gray) // 滚动条颜色
    .scrollBarWidth(10) // 滚动条宽度
    .edgeEffect(EdgeEffect.Spring) // 滚动到边沿后回弹
  }
}
```

- 水平：.scrollable(ScrollDirection.Horizontal)
- 竖直：.scrollable(ScrollDirection.Vertical)