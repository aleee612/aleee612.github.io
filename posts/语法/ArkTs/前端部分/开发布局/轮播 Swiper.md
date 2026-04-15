## 基本使用方法

```
Swiper() {
  Text('0')
    .width('90%')
    .height('100%')
    .backgroundColor(Color.Gray)
    .textAlign(TextAlign.Center)
    .fontSize(30)
  Text('1')
    .width('90%')
    .height('100%')
    .backgroundColor(Color.Green)
    .textAlign(TextAlign.Center)
    .fontSize(30)
  Text('2')
    .width('90%')
    .height('100%')
    .backgroundColor(Color.Pink)
    .textAlign(TextAlign.Center)
    .fontSize(30)
}
.loop(true)
.autoPlay(true)
.interval(1000)
.indicator(
  Indicator.dot()
    .left(0)
    .itemWidth(15)
    .itemHeight(15)
    .selectedItemWidth(30)
    .selectedItemHeight(15)
    .color(Color.Red) //未选择的颜色
    .selectedColor(Color.Blue) //选择了的颜色
)
.displayArrow(true, false)
.displayArrow({ 
  showBackground: true,
  isSidebarMiddle: true,
  backgroundSize: 24,
  backgroundColor: Color.White,
  arrowSize: 18,
  arrowColor: Color.Blue
  }, false)
```

- loop为true时，在显示第一页或最后一页时，可以继续往前切换到前一页或者往后切换到后一页。loop为false，则在第一页或最后一页时，无法继续向前或者向后切换页面。
- autoPlay为true时，会自动切换播放子组件。
- interval属性默认值为3000，单位毫秒，控制子组件与子组件之间的播放时间间隔。
- 自定义导航点样式：indicator，为true时显示导航点
- displayArrow属性，可以控制导航点箭头的大小、位置、颜色，底板的大小及颜色，以及鼠标悬停时是否显示箭头。

## 轮播方向 vertical

- true，在垂直方向上轮播；
- false，在水平方向上轮播。
- 默认值为false。

```
Swiper() {
  // ...
}
.indicator(true)
.vertical(false)
```

## 显示多个子组件：.displayCount()

```
Swiper() {
  //...
}
.indicator(true)
.displayCount(2)
```