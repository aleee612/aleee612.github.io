## 引入
```js
import { useRef } from "react"
```
## 使用和绑定
```js
//React中获取DOM

import { useRef } from 'react';

//1. useRef生成ref对象 绑定到dom标签上
//2. dom可用时，ref.current获取dom
//3. 渲染之后DOM生成之后才可用
function GetDOM(){
    const inputRef = useRef(null);
    const showDom = () => {
        console.dir(inputRef.current);
    }
    return(
        <div className = "GetDOM">
            <input type = "text" ref={inputRef} />
            <button onClick={showDom}>获取DOM</button>
        </div>
    )
}

export default GetDOM;
```

![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1744641215631-670f5b2a-851a-4f47-80e2-a51d204fd59e.png)