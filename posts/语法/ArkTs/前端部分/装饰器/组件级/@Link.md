- 前面我们提到，`@prop`无法做到子->父的数据传输，因此我们使用`@Link`
- 用于建立父子组件之间的双向数据绑定关系

```
@Component
struct SonL{
    @Link myAge : number;
    build() {
      Text(this.myAge.toString())
        .fontSize(40)
    }
}

@Entry
@Component
struct Link_use{
  @State age : number = 20;
  build() {
    Column({space : 20}) {
      Text(this.age.toString())
        .fontSize(50)
      SonL({
        myAge: $age//引用传递
      })
    }
  }
}
```

1. 在子组件中使用`@link`修饰数据
2. 在父组件中使用`@State`，`@Prop`等修饰（ 成为响应式变量 ），不能是默认否则报错
3. 子组件中的数据**不能有初始值**
4. 以 **引用传递**`**$**`（而非值拷贝）的方式传递给子组件的 `**@Link**`（有点像cpp中的`&`）。

### **为什么** `**@Link**` **不能有初始值？**

1. **设计约束**：`**@Link**` 必须绑定到父组件的响应式变量（如 `**@State**`），数据源只能来自父组件
2. **引用特性**：`**@Link**` 是直接引用父组件变量，而非独立存储数据
3. **避免数据冲突**：如果允许初始化，可能导致父子组件数据不一致