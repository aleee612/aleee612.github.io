## 基本使用方法

```
Tabs() {
  TabContent() {
    Text('首页的内容').fontSize(30)
  }
  .tabBar('首页')


  TabContent() {
    Text('推荐的内容').fontSize(30)
  }
  .tabBar('推荐')


  TabContent() {
    Text('发现的内容').fontSize(30)
  }
  .tabBar('发现')
  
  TabContent() {
    Text('我的内容').fontSize(30)
  }
  .tabBar("我的")
}
```

## 导航栏位置 barPosition + BarPosition

- 默认为顶部

```
Tabs({ barPosition: BarPosition.Start }) {
  // ...
}
```

- 设置为底部

```
Tabs({ barPosition: BarPosition.End }) {
  // ...
}
```

- 设为侧边 -- vertical属性设置为true

- vertical为false时，tabbar的宽度默认为撑满屏幕的宽度，需要设置barWidth为合适值。
- vertical为true时，tabbar的高度默认为实际内容的高度，需要设置barHeight为合适值。

```
Tabs({ barPosition: BarPosition.Start }) {
  // TabContent的内容:首页、发现、推荐、我的
  // ...
}
.vertical(true)
.barWidth(100)
.barHeight(200)
```

## 控制滑动切换 -- scrollable

- 默认为true（即可以左右滑动切换）

```
Tabs({ barPosition: BarPosition.End }) {
  TabContent(){
    Column(){
      Tabs(){
        // ...
      }
    }
    .backgroundColor('#ff08a8f1')
    .width('100%')
  }
  .tabBar('首页')
}
.scrollable(false)
```

## 固定导航栏 -- barMode

- 不可滚动，无法被拖拽滚动，内容均分tabBar的宽度。
- 默认值为`BarMode.Fixed`，即不可滚动。

```
Tabs({ barPosition: BarPosition.End }) {
  // ...
}
.barMode(BarMode.Fixed)
```

- 设为可滚动

```
Tabs({ barPosition: BarPosition.Start }) {
  // ...
}
.barMode(BarMode.Scrollable)
```

## 自定义

- 在TabContent对应tabBar属性中传入自定义函数组件，并传递相应的参数。

```
@State currentIndex: number = 0;


@Builder tabBuilder(title: string, targetIndex: number, selectedImg: Resource, normalImg: Resource) {
  Column() {
    Image(this.currentIndex === targetIndex ? selectedImg : normalImg)
      .size({ width: 25, height: 25 })
    Text(title)
      .fontColor(this.currentIndex === targetIndex ? '#1698CE' : '#6B6B6B')
  }
  .width('100%')
  .height(50)
  .justifyContent(FlexAlign.Center)
}
TabContent() {
  Column(){
    Text('我的内容')  
  }
  .width('100%')
  .height('100%')
  .backgroundColor('#007DFF')
}
.tabBar(this.tabBuilder('我的', 0, $r('app.media.mine_selected'), $r('app.media.mine_normal')))
```