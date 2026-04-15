# 基本使用方法

容器中的子元素依次入栈，后一个子元素覆盖前一个子元素，子元素可以叠加，也可以设置位置。

```
@Component
struct Stack_use{
  build(){
    Stack(){
      Column(){}
        .width('90%')
        .height('90%')
        .backgroundColor('rgb(46,117,182)')
      Text('')
        .width('60%')
        .height('60%')
        .backgroundColor('rgb(157,195,230)')
      Button('')
        .width('30%')
        .height('30%')
        .backgroundColor('rgb(222,235,247)')
    }.width('80%')
    .height('80%')
    .backgroundColor('rgb(191,191,191)')
  }
}
```

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1747022266903-09174c1e-7fee-4499-bb2c-86a769fb0b51.png)

- 会叠在一起
- 后者在上

# 使用zIndex控制层级

- zIndex中的值越大越往上

```
@Component
struct Zindex_use{
  build()
  {
    Stack({ }){
      Button('')
        .width('30%')
        .height('30%')
        .backgroundColor('rgb(222,235,247)')
        .zIndex(3)//控制显示层级
      Text('')
        .width('60%')
        .height('60%')
        .backgroundColor('rgb(157,195,230)')
        .zIndex(2)
      Column(){}
        .width('90%')
        .height('90%')
        .backgroundColor('rgb(46,117,182)')
    }
    .width('80%')
    .height('80%')
    .backgroundColor('rgb(191,191,191)')
  }
}
```