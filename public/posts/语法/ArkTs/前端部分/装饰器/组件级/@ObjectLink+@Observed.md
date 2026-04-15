### 用法说明

- 用于子组件引用父组件传入的对象（通常是 `@Observed` 的对象）
- 可以直接读取和修改对象内容，父子组件共享引用

### 注意事项

- 用于组件间引用类型数据共享，推荐与 `@Observed` 一起使用

### 示例代码

```
@Observed
class Address {
  city: string
  street: string

  constructor(city: string, street: string) {
    this.city = city
    this.street = street
  }
}

@Observed
class Person {
  name: string
  address: Address

  constructor(name: string, address: Address) {
    this.name = name
    this.address = address
  }
}

@Component
struct ChildObjectLink {
  @ObjectLink address : Address
  build() {
    Column() {
      Text('密码的ObjectLink没办法直接修改对象嵌套对象')
      Text(`地址: ${this.address.city}`)
      Button('修改城市')
        .onClick(() => {
          this.address.city = '北京' // 修改嵌套属性
        })
    }
  }
}
@Entry
@Component
struct ObjectLink_use {
  @State person: Person = new Person("张三", new Address("上海", "南京路"))

  build() {
    Column() {
      Text('沟槽的Objectlink凭什么一定要在子组件才能用')
      ChildObjectLink({address: this.person.address})
    }
  }
}
```

1. 虽说这两的作用是修改“对象嵌套对象”，但其实并不是直接的修改，而是用了一个子组件用ObjectLink修饰对象中的的嵌套对象类型，然后再对它进行修改。
2. ObjectLink没办法在@Entry修饰的组件（也就是父组件）中使用