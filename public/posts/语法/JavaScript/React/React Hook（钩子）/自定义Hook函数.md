# 基础语法
- 自定义Hook是以use开头的函数，通过自定义Hook函数可以用来实现逻辑的封装和复用
```js
import { useState } from "react"
function useToggle(){//自定义的Hook
    const [value,setValue] = useState(true)
    const toggle = () => setValue(!value)
    return {value,toggle}//返回一个对象
}
function Hook(){
    const { value,toggle } = useToggle(false) 
    return (
        <div>
            {value && <div>this is div</div>}
            <button onClick={toggle}>toggle</button>
        </div>
    )
}

export default Hook
```
![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745322424454-0b5d03ba-7328-46eb-bfc2-273ae3f9d812.png)![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1745322434890-c33d86c1-b78d-40f2-b010-babad6a3fbaf.png)
- `return { value, toggle }`返回一个对象，有两个属性（value，toggle）
- `const { value,toggle } = useToggle(false)`是对象解构
- 对象解构**只看属性名字**不看顺序，数组解构是**看属性顺序**的不看名字