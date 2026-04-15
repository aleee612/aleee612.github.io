# 作用

- 实现跨组件层级数据传递的装饰器

# 实现1对n -> 1对1

1. **自动响应式更新**：当 `**@Provide**` 的数据变化时，所有 `**@Consume**` 该数据的组件都会自动更新
2. **跨层级传递**：不需要通过 props 逐层传递
3. **类型安全**：TypeScript 支持类型检查
4. **多层级支持**：可以在任意层级的组件中消费数据

```
@Entry
@Component
struct ThemeProvider {
  @Provide themeColor: string = '#4285f4'

  build() {
    Column() {
      Button('Change Theme').onClick(() => {
        this.themeColor = this.themeColor === '#4285f4' ? '#ea4335' : '#4285f4'
      })
      ThemedComponent()
    }
  }
}

@Component
struct ThemedComponent {
  @Consume themeColor: string

  build() {
    Column() {
      Text('This text uses theme color')
        .fontColor(this.themeColor)
      ThemedNoUseComponent()
    }
  }
}

@Component
struct ThemedNoUseComponent {
  themeColor: string = '#4285f4';

  build() {
    Column() {
      Text('This text uses theme color')
        .fontColor(this.themeColor)
      DeepChildComponent()
    }
  }
}

// 更深层级的组件同样可以消费
@Component
struct DeepChildComponent {
  @Consume themeColor: string

  build() {
    Text('Deep child also uses theme')
      .fontColor(this.themeColor)
  }
}
```

1. 使用@Provide的为入口组件，子组件中要同步的变量由@Consume修饰
2. 可以做到多层以及跨层的传递
3. 对于被@Consume修饰的变量不能被传参
4. 需要使用**同样的参数名**进行传递