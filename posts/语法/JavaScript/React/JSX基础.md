# js表达式

使用引号传递字符串

识别javaScript变量

函数调用和方法调用

使用javaScript变量

```
const count = 1;
function getName() {
  return 'aleee';
}
function App() {
  return (
    <div className="App">
      this is app
      {/* 使用引号传递字符串 */}
      {' this is aleee'}
      {/* 识别js变量 */}
      {count}
      {/* 函数调用和方法调用 */}
      { getName() }
      {new Date().getDate()}
      {/* 使用javaScript变量 */}
      <div style={{color: 'red'}}>this is div</div>

    </div>

  );
}
```

![](https://cdn.nlark.com/yuque/0/2025/png/55555653/1744542232254-a5d4dc41-491c-4d62-a860-c8781d0293f8.png "null")

←结果如图

# 列表渲染

```
const list=[
  { id:1,name:'aleee'},
  { id:2,name:'qc'},
  { id:3,name:'hyy'}
]
function App() {
  return (
    <div className="App">
      {/*渲染列表*/}
      <ul>
        {list.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>

    </div>

  );
}
```

![](https://cdn.nlark.com/yuque/0/2025/png/55555653/1744542232332-0e514754-83bf-4af4-9187-fca2c23a0746.png "null")

←结果如图

- map循环哪个结构，return哪个结构

- 注意事项：加上一个独一无二的key（字符串，number id）

- key：React框架内部使用，提升列表更新性能

# 条件渲染

## 逻辑与运算符&& 三元表达式 ( ? : )

```
const islogin = true;
function App() {
  return (
    <div className="App">
      {/* 逻辑与 && */}
      { islogin && <span>this is span</span> }
      <br/>
      {/* 三元运算 */}
      { islogin ? <span>aleee</span> : <span>loading</span> }
    </div>

  );
}
```

![](https://cdn.nlark.com/yuque/0/2025/png/55555653/1744542232401-6364d572-5e2f-4b9c-932c-8149d8e9c731.png "null")

←结果如图

## 复杂条件渲染

```
//文章类型
const articleType = 1 //0 1 3
//定义核心函数
function getArticleType1(){
  switch(articleType){
    case 0:
      return '普通文章';
    case 1:
      return '图文';
    case 3:
      return '视频';
    default:
      return '未知类型';
  }
}
function getArticleType2(){
  if(articleType===0){
    return '普通文章';
  }
  else if(articleType===1){
    return'图文';
  }
  else if(articleType===3){
    return '视频';
  }
  else{
    return '未知类型';
  }
}
function App() {
  return (
    <div className="App">
      {/* 调用函数渲染不同的模板 */}
      {getArticleType1()}
      {getArticleType2()}
    </div>

  );
}
```