
- List的子组件必须是ListItemGroup或ListItem，ListItem和ListItemGroup必须配合List来使用。

## 基本使用方法

```
@Entry
@Component
struct CityList {
  build() {
    List() {
      ListItem() {
        Text('北京').fontSize(24)
      }
      ListItem() {
        Text('上海').fontSize(24)
      }
    }
    .alignListItem(ListItemAlign.Center)
  }
}
```

## 设置主轴方向

### 默认为垂直
```
List() {
  // ...
}
.listDirection(Axis.Vertical)
```
### 设为水平
```
List() {
  // ...
}
.listDirection(Axis.Horizontal)
```
## 设置交叉布局
- 构建的是一个两列的垂直列表
```
List() {
  // ...
}
.lanes(2)
```

- 当其取值为LengthConstrain类型时，表示会根据LengthConstrain与List组件的尺寸自适应决定行或列数。

```
@Entry
@Component
struct EgLanes {
  @State egLanes: LengthConstrain = { minLength: 200, maxLength: 300 };
  build() {
    List() {
      // ...
    }
    .lanes(this.egLanes)
  }
}
```

## 自定义样式

### 添加分割线

```
class DividerTmp {
  strokeWidth: Length = 1;
  startMargin: Length = 60;
  endMargin: Length = 10;
  color: ResourceColor = '#ffe9f0f0';


  constructor(strokeWidth: Length, startMargin: Length, endMargin: Length, color: ResourceColor) {
    this.strokeWidth = strokeWidth;
    this.startMargin = startMargin;
    this.endMargin = endMargin;
    this.color = color;
  }
}
@Entry
@Component
struct EgDivider {
  @State egDivider: DividerTmp = new DividerTmp(1, 60, 10, '#ffe9f0f0');
  build() {
    List() {
      // ...
    }
    .divider(this.egDivider)
  }
}
```

### 添加滚动条

```
List() {
  // ...
}
.scrollBar(BarState.Auto)
```