# 基础用法

1. 是一个React Hook函数，用于在React组件中 **创建** 不是由 **事件** 引起而是由 **渲染**本身引起的操作，比如发送AJAX请求，更改DOM等等
2. 组件没有发生任何的用户事件（如点击button），组件渲染完毕后就需要和服务器要数据，整个过程属于“只由渲染引起的操作”
3. 语法：`useEffect(() => {参数1} , [参数2])`
4. 参数1是一个函数，可以把它叫做副作用函数，在函数内部可以**放置需要执行的操作**
5. 参数2是一个数组（可选参），在数组里放置依赖项，不同依赖项会影响第一个参数函数的执行，当是一个空数组的时候，副作用函数只会在渲染完毕后执行一次
```js fold
import React, { useEffect, useState } from 'react'
const URL = 'http://geek.itheima.net/v1_0/channels'
function UseEffect()
{
  const [list, setList] = useState([])
  useEffect(() => {
    async function getList() {
      const res = await fetch(URL)
      const jsonRes = await res.json()
      console.log(jsonRes)
      setList(jsonRes.data.channels)
    }
    getList()
  }, [])
  return(
    <div>
      this is UseEffect
      <ul>
        {list.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  )
}

export default UseEffect
```

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745225537526-321faa3d-ec8d-4fe3-ab44-288aa88a0ea7.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745225549426-151c7a1f-4602-489e-8601-2a613eb51af4.png)

# 依赖项参数（也就是参数二）
1. useEffect副作用函数的执行时机存在多种情况，根据传入参数项不同，会有不同的执行表现

|   |   |
|---|---|
|依赖项|副作用函数（参数1）执行时机|
|没有|组件初始渲染+组件更新时执行|
|空|只在初始渲染时执行一次|
|特定|组件初始渲染+特性依赖项变化时|

## 没有依赖项：
```js
import React, { useEffect, useState } from 'react'
function UseEffect() {
    const [count, setCount] = useState(0)
    useEffect(() => {
        console.log('useEffect')
    })
    return(
        <div>
            this is UseEffect
            <button onClick={() => setCount(count + 1)}>{count}</button>
        </div>
    )
}

export default UseEffect
```

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745227995431-2d6b9e1a-e332-4a59-a8c2-32cfd59b8b61.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745228003941-2b968fd1-a944-40cf-9436-e0091fe8dd02.png)
## 空依赖项
```js
import React, { useEffect, useState } from 'react'
function UseEffect() {
    const [count, setCount] = useState(0)
    useEffect(() => {
        console.log('useEffect')
    },[])
    return(
        <div>
            this is UseEffect
            <button onClick={() => setCount(count + 1)}>{count}</button>
        </div>
    )
}

export default UseEffect
```

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745228292287-923440f9-b3a3-48ee-b841-af3ad58e8ca3.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745228308996-ce6285f2-7568-4020-9aad-bcdbe2ede2b5.png)
## 特定依赖项
- 与无依赖项的区别：只有count发生变化才执行
```js
import React, { useEffect, useState } from 'react'
function UseEffect() {
    const [count, setCount] = useState(0)
    useEffect(() => {
        console.log('useEffect')
    },[count])
    return(
        <div>
            this is UseEffect
            <button onClick={() => setCount(count + 1)}>{count}</button>
        </div>
    )
}

export default UseEffect
```

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745228899807-2a091a1b-a0fe-411d-9afa-c08390dc0bb0.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745228916878-332ca29a-955c-4203-9e49-32d0be6838f3.png)
# 清除副作用
- 在useEffect中编写的由 **渲染本身** 引起的对接组件外部的操作，社区也经常把它叫做副作用操作，比如在useEffect中开启了一个定时器，我们想在组件卸载时把这个定时器再清理掉，这个过程就是清理副作用
```js
import React, { useEffect, useState } from 'react'
function Son()
{
    useEffect(() => {
        //实现副作用逻辑
        const timer = setInterval(()=>{
            console.log('定时器执行中...')
        },1000)
        return () => {
            //组件销毁时执行
            //清除副作用逻辑
            clearInterval(timer)
            console.log('组件销毁了')
        }
    },[])
    return <div>this is Son</div>
}
function UseEffect() {
    const [show, setShow] = useState(true)
    return (
        <div>
            {show && <Son />}
            <button onClick={() => setShow(false)}>删除Son组件</button>
        </div>
    ) 
}

export default UseEffect
```

- 也就是说在`return() => { }`中编写删除逻辑即可

- 初始状态 `show = true`，所以 `<Son />` 被挂载。
- `Son` 的 `useEffect` 中注册了一个定时器，每秒打印一次。
- 当点击按钮，执行 `setShow(false)`，React 重新渲染（重新渲染的是UseEffect组件），`show && <Son />` 条件为假，`Son` 被卸载。
- 组件卸载时（将组件视为对象（虚拟DOM），在卸载组件时调用清理，也就是delete这个对象），执行 `useEffect` 中的清理函数，`clearInterval` 被调用，定时器被清除，控制台打印“组件销毁了”。