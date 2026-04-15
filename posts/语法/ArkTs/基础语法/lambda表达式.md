# 基础语法：
- `(参数1, 参数2, ...):返回值类型 => { 函数体 }`
- 一般写法：
```ts
(name:string)=>{
  ...
  return;
}
```
# 一个参数时可以使用：
```ts
let square = x =>{
  return x * x;
}
let result = square(4);  // 结果是 16
```
# 省略大括号：
```ts
(x:number,y:number)=>a+b;//相当于return a+b;
(x:number,y:number)=>return a+b;//报错
```
# 省略参数 **-** 省略参数括号：
```ts
let greet = () => "Hello, TypeScript!";

let message = greet();  // 结果是 "Hello, TypeScript!"
```