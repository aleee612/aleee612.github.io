- `@State` 装饰器用于**管理组件内部的响应式状态**。
- 有点像`react`中的`@useState`

## 基本用法
```
import { Component, State } from '@arkui/core';
@Component
  struct Counter {
    @State count: number = 0;
    build() {
      Column() {
        Text(`Count: ${this.count}`)
          .fontSize(20)
        Button('Increment')
          .onClick(() => this.count++)
      }
    }
  }
```

- `@State count: number = 0;` **声明了一个状态变量** `count`，它是响应式的，值改变时 UI 会自动更新。
- `this.count++` 触发状态变化，UI 会重新渲染。

## 基本类型更新，对象类型，对象嵌套对象类型（无法实现）

```
class Person{
  name: string = "aleee";
  age: number = 18;

  constructor() {
  }
};
class Address {
  street: string = "St";
  city: string = "Sp";
  zip: string = "12";

  constructor() {}
}

class Person1 {
  name: string = "John";
  age: number = 30;
  address: Address = new Address();

  constructor() {}
};


@Entry
@Component
struct ExampleComponent {
  // 基本数据类型
  @State count: number = 0;
  @State aleee: Person = new Person();
  @State ewwww: Person1 = new Person1();
  build() {
    Column({ space: 15 }) {
      // 基本类型更新
      Text(`Count: ${this.count}`)
        .onClick(() => {
          this.count += 1;
        });
      //对象类型
      Text(`Aleee: ${this.aleee.age}`)
        .onClick(() => {
          this.aleee.age += 1;
        });
      //对象嵌套对象类型
      Text(`Ewwww: ${this.ewwww.address.city}`)
        .onClick(() => {
          this.ewwww.address.city = "oh!";
        });//此时的点击是无效的，@State无法做到嵌套对象的修改
      //要想做到修改的效果，可以使用直接修改对象的方法
      //注意此时必须包含对象中的所有成员属性，否则报错
      Text(`Ewwww: ${this.ewwww.address.city}`)
        .onClick(() => {
          this.ewwww.address = {
            street:  "St",//修改使用“ : ”
            city: "S12",
            zip: "12"
          }
        });
    }
    .padding(20)
  }
}
```

|   |   |   |
|---|---|---|
|方面|React|ArkTS|
|**定义方式**|`const [count, setCount] = useState(0)`|`@State count: number = 0`|
|**响应式机制**|基于 hook 的闭包和调度机制，每次调用组件函数重新生成 JSX|编译器通过装饰器自动生成响应式绑定关系|
|**更新方式**|`setCount(x)`<br><br>触发更新|直接修改变量 `this.count++`<br><br>即可更新|
|**渲染方式**|虚拟 DOM diff + 局部重渲染|编译期静态分析 + 更加原生的局部更新（靠 ArkUI 引擎）|
|**性能**|有 diff 阶段，性能不错但不是最极致|理论上性能更强，更新更精准（没有 diff 阶段）|