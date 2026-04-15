- 为布局提供规律性的结构，解决多尺寸多设备的动态布局问题。通过将页面划分为等宽的列数和行数，可以方便地对页面元素进行定位和排版。（也就是适应不同尺寸页面用的）
## 容器断点
- 设备宽度范围划分：![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1748518888520-71a7153a-6cf9-4a5e-bb41-efe17bbd9a67.png)
```ts
@State bgColors: ResourceColor[] =
    ['rgb(213,213,213)', 'rgb(150,150,150)', 'rgb(0,74,175)', 'rgb(39,135,217)', 'rgb(61,157,180)', 'rgb(23,169,141)',
      'rgb(255,192,0)', 'rgb(170,10,33)'];
// ...
GridRow({
  breakpoints: {
    value: ['320vp', '600vp', '840vp', '1440vp', '1600vp'], // 表示在保留默认断点['320vp', '600vp', '840vp']的同时自定义增加'1440vp', '1600vp'的断点，实际开发中需要根据实际使用场景，合理设置断点值实现一次开发多端适配。
    reference: BreakpointsReference.WindowSize
  }
}) {
   ForEach(this.bgColors, (color:ResourceColor, index?:number|undefined) => {
     GridCol({
       span: {
         xs: 2, // 窗口宽度落入xs断点上，栅格子组件占据的栅格容器2列。
         sm: 3, // 窗口宽度落入sm断点上，栅格子组件占据的栅格容器3列。
         md: 4, // 窗口宽度落入md断点上，栅格子组件占据的栅格容器4列。
         lg: 6, // 窗口宽度落入lg断点上，栅格子组件占据的栅格容器6列。
         xl: 8, // 窗口宽度落入xl断点上，栅格子组件占据的栅格容器8列。
         xxl: 12 // 窗口宽度落入xxl断点上，栅格子组件占据的栅格容器12列。
       }
     }) {
       Row() {
         Text(`${index}`)
       }.width("100%").height('50vp')
     }.backgroundColor(color)
   })
}                                                                    
```
- GridCol做子组件，内部传入`span:{ }`控制不同窗口列数
## 控制布局总列数：GridRow({ columns: n })
```ts
class CurrTmp{
  currentBp: string = 'unknown';
  set(val:string){
    this.currentBp = val
  }
}
let BorderWH:Record<string,Color|number> = { 'color': Color.Blue, 'width': 2 }
@State bgColors: ResourceColor[] =
    ['rgb(213,213,213)', 'rgb(150,150,150)', 'rgb(0,74,175)', 'rgb(39,135,217)', 'rgb(61,157,180)', 'rgb(23,169,141)',
      'rgb(255,192,0)', 'rgb(170,10,33)'];
@State currentBp: string = 'unknown';
Row() {
  GridRow({ columns: 4 }) {
    ForEach(this.bgColors, (item: ResourceColor, index?:number|undefined) => {
      GridCol() {
        Row() {
          Text(`${index}`)
        }.width('100%').height('50')
      }.backgroundColor(item)
    })
  }
  .width('100%').height('100%')
  .onBreakpointChange((breakpoint:string) => {
    let CurrSet:CurrTmp = new CurrTmp()
    CurrSet.set(breakpoint)
  })
}
.height(160)
.border(BorderWH)
.width('90%')
```
## 排列方向
### 默认从左往右排列
```ts
GridRow({ direction: GridRowDirection.Row }){}
```
### 改为从右往左
```ts
GridRow({ direction: GridRowDirection.RowReverse }){}
```
## 子组件间距
```ts
GridRow({ gutter: 10 }){}
GridRow({ gutter: { x: 20, y: 50 } }){}
```
- x：列之间，y：行之间
## 子组件GridCol详解
### span（占用列数）
- 默认为1
- 当类型为number时，子组件在所有尺寸设备下占用的列数相同。
- 当类型为GridColColumnOption时，支持六种不同尺寸（xs, sm, md, lg, xl, xxl）设备中子组件所占列数设置，各个尺寸下数值可不同。（也就是传入'xs'，'sm'，'md' 等的数据）
```ts
let Gspan:Record<string,number> = { 'xs': 1, 'sm': 2, 'md': 3, 'lg': 4 }
GridCol({ span: 2 }){}
GridCol({ span: { xs: 1, sm: 2, md: 3, lg: 4 } }){}
GridCol(){}.span(2)
GridCol(){}.span(Gspan)
```
### offset（偏移列数）
- 默认为0
- 当类型为number时，子组件偏移相同列数。
- 当类型为GridColColumnOption时，支持六种不同尺寸（xs, sm, md, lg, xl, xxl）设备中子组件所占列数设置,各个尺寸下数值可不同。
```ts
let Goffset:Record<string,number> = { 'xs': 1, 'sm': 2, 'md': 3, 'lg': 4 }
GridCol({ offset: 2 }){}
GridCol({ offset: { xs: 2, sm: 2, md: 2, lg: 2 } }){}
GridCol(){}.offset(Goffset) 
```
### order（元素序号）
- 当子组件设置不同的order时，order较小的组件在前，较大的在后。
- 当类型为number时，子组件在任何尺寸下排序次序一致。
- 当类型为GridColColumnOption时，支持六种不同尺寸（xs, sm, md, lg, xl, xxl）设备中子组件排序次序设置。

```
let Gorder:Record<string,number> = { 'xs': 1, 'sm': 2, 'md': 3, 'lg': 4 }
GridCol({ order: 2 }){}
GridCol({ order: { xs: 1, sm: 2, md: 3, lg: 4 } }){}
GridCol(){}.order(2)
GridCol(){}.order(Gorder)
```