# 基础用法

- 在整个应用范围内可访问
- 持久化存储（应用关闭后数据仍然保留）
- 支持跨页面共享状态

```
// 在应用入口初始化AppStorage
AppStorage.setOrCreate('username', 'Guest')
AppStorage.setOrCreate('isLoggedIn', false)
```

# 与@StorageProp

- 和@Prop差不多（效果也是）,使用 `**@StorageProp**` 的组件不能直接修改 AppStorage
- `this.num`值改变，`AppStroe.get('key')`不会变（子不能传父）

```
// 在应用入口初始化AppStorage
AppStorage.setOrCreate('username', 'Guest')
AppStorage.setOrCreate('isLoggedIn', false)

@Entry
@Component
struct AppStorageExample {
  @StorageProp('username') username: string = 'Anonymous'
  @StorageProp('isLoggedIn') isLoggedIn: boolean = false

  build() {
    Column() {
      if (this.isLoggedIn) {
        Text(`Welcome, ${this.username}!`)
          .fontSize(20)
      } else {
        Text('Please log in')
          .fontSize(20)
      }

      Button('Login')
        .onClick(() => {
          // 使用新的API方法
          AppStorage.set('username', 'Alice')
          AppStorage.set('isLoggedIn', true)
        })
        .margin(10)

      Button('Local Change')
        .onClick(() => {
          // 本地修改不会影响AppStorage
          this.username = 'Local User'
        })
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}
```

# 与@StorageLink

```
// 初始化全局状态
AppStorage.setOrCreate('username', 'Guest')
AppStorage.setOrCreate('isLoggedIn', false)

@Entry
@Component
struct MainPage {
  // 双向绑定状态
  @StorageLink('username') username: string = 'Anonymous'
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false
  
  build() {
    Column({ space: 10 }) {
      if (this.isLoggedIn) {
        Text(`欢迎回来，${this.username}!`)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
      } else {
        Text('请先登录')
          .fontSize(16)
      }
      
      Button(this.isLoggedIn ? '退出登录' : '登录')
        .onClick(() => {
          // 修改会同步到AppStorage
          this.isLoggedIn = !this.isLoggedIn
          this.username = this.isLoggedIn ? 'Admin' : 'Guest'
        })
        .width('80%')
        
      Button('从AppStorage修改')
        .onClick(() => {
          // 直接操作AppStorage也会同步到组件
          AppStorage.set('username', 'System')
        })
        .width('80%')
    }
    .width('100%')
    .height('100%')
    .padding(20)
    .justifyContent(FlexAlign.Center)
  }
}
```

1. @StorageProp与@StorageLink不支持装饰Function类型（函数）的变量