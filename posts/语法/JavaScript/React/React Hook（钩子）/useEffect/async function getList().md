`async function getList()` 是什么？
在 `useEffect` 中 **定义了一个异步函数** `getList`：
```js
async function getList() {
  const res = await fetch(URL)
  const jsonRes = await res.json()
  console.log(jsonRes)
  setList(jsonRes.data.channels)
}
```
这段代码的意思是：
我要从 URL 发请求，等数据回来之后，再调用 `setList()` 更新页面上的列表。
- `async` 表示这是一个**异步函数**。
- `await fetch(URL)` 表示**等网络请求结果返回**。
- `await res.json()` 是**把结果解析成 JSON**。

---
为什么要把它包进 `getList()` 而不是 `useEffect` 直接用 async？
React 不允许 `useEffect(() => { ... }, [])` 这个函数直接用 `async`，所以我们**只能在里面定义一个** `async function` **然后手动调用**：
```js
useEffect(() => {
  async function getList() {
    ...
  }
  getList() // 立即执行这个异步函数
}, [])
```

---
### 整体逻辑串起来说是：
1. 页面一加载（`useEffect` 空依赖数组），执行一次副作用。
2. 定义一个异步函数 `getList`。
3. 在函数里发起网络请求（`fetch`），获取频道列表。
4. 拿到数据后，更新状态 `setList(...)`
5. React 重新渲染页面，显示列表。