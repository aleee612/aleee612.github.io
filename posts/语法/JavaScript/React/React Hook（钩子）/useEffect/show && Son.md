这是 React 中非常经典的一个组件卸载（销毁）示例，我们来逐步解释你问的两个问题：

---
### 1. `setShow(false)` 为什么能删除组件？
```js
const [show, setShow] = useState(true)
```
这行代码用 `useState` 声明了一个名为 `show` 的状态，初始值是 `true`。这个状态决定是否渲染 `Son` 组件。
```js
{show && <Son />}
```
这是一种 **条件渲染** 的写法，等价于：
```js
if (show) {
    return <Son />
} else {
    return null
}
```
所以，当 `show` 是 `true` 时，`<Son />` 会被渲染；当你点击按钮调用 `setShow(false)` 后，`show` 就变成 `false`，React 会重新渲染组件，这时条件不满足，`<Son />` 不会被渲染，相当于这个组件“被删除”了。

---

### 2. `{show && <Son />}` 是干什么用的？
这是 JavaScript 的逻辑与（`&&`）运算符在 JSX 中的用法，常用于条件渲染。
它的作用就是：**当** `show` **为** `true` **时，才渲染** `<Son />` **组件**。否则什么都不渲染（渲染为 `false`，React 会忽略）。

---
### 简单总结一下你这个例子的逻辑：
- 初始状态 `show = true`，所以 `<Son />` 被挂载。
- `Son` 的 `useEffect` 中注册了一个定时器，每秒打印一次。
- 当点击按钮，执行 `setShow(false)`，React 重新渲染，`show && <Son />` 条件为假，`Son` 被卸载。
- 组件卸载时，执行 `useEffect` 中的清理函数，`clearInterval` 被调用，定时器被清除，控制台打印“组件销毁了”。

---
如果你想试试更有趣的效果，也可以加个“显示组件”的按钮，变成 toggle 逻辑，随时挂载/卸载组件来观察效果。