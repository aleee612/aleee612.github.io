# 作用

- 状态变化监听

```
@Entry
@Component
struct MyComponent {
  @State @Watch('onCountChange') count: number = 0;//设置监听
  //回调方法
  onCountChange() {
    console.log(`Count changed: ${this.count}`);
  }

  build() {
    Column() {
      Text(`Count: ${this.count}`)
      Button('+1')
        .onClick(() => {
          this.count++;
        })
    }
  }
}
```

1. @Watch参数为必选，且参数类型必须是string，否则编译会报错。
2. @ Watch参数为回调方法名
3. 常规变量不能被@Watch装饰，必须用@State，@Prop之类的修饰