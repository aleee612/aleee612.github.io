# 父组件->子组件 数据传输 + 状态管理

`**@Prop**` 是 ArkTS 中用于**父子组件单向数据同步**的装饰器，它允许父组件向子组件传递数据，并在子组件内部建立对数据的响应式绑定。

## 基本概念

- **单向同步**：父组件到子组件的数据流向
- **响应式**：子组件会响应父组件传递的数据变化
- **局部修改**：子组件可以修改 `**@Prop**` 变量，但不会同步回父组件，即子 -x-> 父，单向传递

```
@Component
struct Son{
  @Prop myname : string = "";
  build(){
    Text(this.myname)
      .fontSize(40);
  }
}

@Entry//项目入口处
@Component
struct Index {
  name : string = 'aleee';
  build() {
    Column({space : 20}){
      Text(this.name)
        .fontSize(50);
      Son({
        myname : this.name
      });
    };
  }
}
```

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1746259179464-ebc5d6e7-61b9-42a8-9153-2421ca866f49.png)

1. 在子组件中使用@prop修饰要传递的属性
2. 在父组件调用子组件时使用`{ 子组件属性 : this.父组件属性 }`传递数据

- 要想双向，用link[@Link](https://gangangan.yuque.com/org-wiki-gangangan-gc84w7/fzithg/ggseav43gg7ofg1t "@Link")