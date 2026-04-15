> `.then` 是 JavaScript / ArkTS 中用于**处理异步操作结果**的方法，是 **Promise 对象的一部分**。
### 用一句话解释：
`.then` 是对异步操作说：“当你做完了某件事，把结果交给我处理”。

---
### 语法结构：
```js fold
异步函数().then((结果) => {
  // 拿到结果后要做的事
})
```
---
### 举个奶茶店的例子（继续刚才的）：
```js fold
makeMilkTea().then((tea) => {
  console.log("我拿到奶茶了：", tea)
})
```
这个意思是：
“我点了一杯奶茶，等你做好以后我会收到奶茶，然后打印一下”。

---
### 示例代码对比：
#### 异步函数返回一个 Promise：
```js fold
function getData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("数据来了！")
    }, 2000)
  })
}
```
#### 使用 `.then` 来处理返回值：
```js fold
getData().then((data) => {
  console.log(data)  // 打印 “数据来了！”
})
```
---
### 那 `.then` 什么时候用？
当你**不使用** `async/await`，而是直接处理 `Promise` 的时候。

---
### 补充：`.then` 可以链式写法
```js
fetchData()
  .then(data => processData(data))
  .then(result => showResult(result))
  .catch(error => console.error(error))  // 处理异常
```

---

如果你用 ArkTS 写组件，比如异步加载数据，可以像这样：
```ts
@Entry
@Component
struct MyPage {
  message: string = '加载中...'

  build() {
    Column() {
      Text(this.message)
    }
  }

  aboutToAppear() {
    getData().then(data => {
      this.message = data
    })
  }
}
```

---