1. 针对设备和应用的属性信息（比如显示区域、深浅色、分辨率），设计出相匹配的布局。
2. 当屏幕发生动态改变时（比如分屏、横竖屏切换），同步更新应用的页面布局。

## 引入

```
import { mediaquery } from '@kit.ArkUI';
```

- 通过matchMediaSync接口设置媒体查询条件，保存返回的条件监听句柄listener

```
let listener: mediaquery.MediaQueryListener = this.getUIContext().getMediaQuery().matchMediaSync('(orientation: landscape)');
```

- 给条件监听句柄listener绑定回调函数onPortrait，当listener检测设备状态变化时执行回调函数。在回调函数内，根据不同设备状态更改页面布局或者实现业务逻辑。

```
onPortrait(mediaQueryResult: mediaquery.MediaQueryResult) {
  if (mediaQueryResult.matches as boolean) {
    // do something here
  } else {
    // do something here
  }
}
listener.on('change', onPortrait);
```

## 基本使用方法

```
import { mediaquery, window } from '@kit.ArkUI';
import { common } from '@kit.AbilityKit';


@Entry
@Component
struct MediaQueryExample {
  @State color: string = '#DB7093';
  @State text: string = 'Portrait';
  // 当设备横屏时条件成立
  listener:mediaquery.MediaQueryListener = this.getUIContext().getMediaQuery().matchMediaSync('(orientation: landscape)');


  // 当满足媒体查询条件时，触发回调
  onPortrait(mediaQueryResult:mediaquery.MediaQueryResult) {
    if (mediaQueryResult.matches as boolean) { // 若设备为横屏状态，更改相应的页面布局
      this.color = '#FFD700';
      this.text = 'Landscape';
    } else {
      this.color = '#DB7093';
      this.text = 'Portrait';
    }
  }


  aboutToAppear() {
    // 绑定当前应用实例
    // 绑定回调函数
    this.listener.on('change', (mediaQueryResult: mediaquery.MediaQueryResult) => {
      this.onPortrait(mediaQueryResult)
    });
  }


  aboutToDisappear() {
    // 解绑listener中注册的回调函数
    this.listener.off('change');
  }


  // 改变设备横竖屏状态函数
  private changeOrientation(isLandscape: boolean) {
    // 获取UIAbility实例的上下文信息
    let context:common.UIAbilityContext = this.getUIContext().getHostContext() as common.UIAbilityContext;
    // 调用该接口手动改变设备横竖屏状态
    window.getLastWindow(context).then((lastWindow) => {
      lastWindow.setPreferredOrientation(isLandscape ? window.Orientation.LANDSCAPE : window.Orientation.PORTRAIT)
    });
  }


  build() {
    Column({ space: 50 }) {
      Text(this.text).fontSize(50).fontColor(this.color)
      Text('Landscape').fontSize(50).fontColor(this.color).backgroundColor(Color.Orange)
        .onClick(() => {
          this.changeOrientation(true);
        })
      Text('Portrait').fontSize(50).fontColor(this.color).backgroundColor(Color.Orange)
        .onClick(() => {
          this.changeOrientation(false);
        })
    }
    .width('100%').height('100%')
  }
}
```