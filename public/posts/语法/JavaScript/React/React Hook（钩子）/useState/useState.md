# 引入
```js
import { useState } from 'react';
```
# 定义
- 一个React Hook（函数），它允许我们向组件添加一个状态变量，从而控制影响组件的渲染效果
- 和普通js不同的是，状态变量一旦发生变化组件的视图UI也会跟着变化（数据驱动视图）
- useState返回值是一个数组，第一个参数是**状态变量**，第二个参数是s**et函数用来修改状态变量**
- useState的参数将作为count的初始值
1. 要使用useState，需要使用`import React, { useState } from 'react';`引入所需的模块
```js
import React, { useState } from 'react';//两个都要导入
function App() {

  //设置状态变量
  const [count,setCount] = useState(0)
  
  //点击事件回调
  const handleClick1 = () => {
    setCount(count1+1)
  }
  return (
    <div className="App">
      {/*useState实现计数器*/}
      <button onClick = { handleClick1 }>{count}</button>

     </div>

   );

}
```

![](https://cdn.nlark.com/yuque/0/2025/png/55555653/1744542233780-7839037a-e3f6-4560-b5f0-2f32289f2a3e.png "null")←效果如图
- handleClick：用传入的新值修改count1，后重新使用新的count1渲染UI
# 规则
- 在react中，状态被认为是只读的，我们应该始终 **替换** 它而不是修改它，直接修改状态不能引发制图更新
- count++无法引发视图更新
- 直接修改原对象，不发生视图变化
```js
const[form,setForm] = useState({
    name:'aleee',
})
const handleChange = () => {//无修改
    name:'aaa'
}
const handleChange = () => {
    setForm({
    ...form,
    name:'aaa',
  })
}
```
# useState的重新渲染
重新渲染了什么？
1. **React 再次执行了函数组件的代码逻辑**。
2. 重新渲染的是**它本身所在的函数组件**
3. 它重新得到了新的 JSX。
4. React 会拿这个新 JSX 和上一次的 JSX 做对比（叫做 diff）。
5. 找到不同的地方，**只更新必要的部分**到 DOM 上。
所以你看到的是：
- 不管你组件有多大，React 会**重新执行整个组件函数**。
- 但最后只会对 **DOM 中变化的地方** 做更新（效率比较高）。
会不会效率很低？
- React 的设计是：**函数组件是纯函数，重新执行没副作用 + diff 算法高效**，所以不需要担心性能问题，React 已经做了优化。
- 但是：  
    如果组件逻辑**真的很复杂或包含大数据**，可以使用 `React.memo`、`useMemo`、`useCallback` 等做性能优化（之后可以学）