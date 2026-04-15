
- 初始化列表用于在对象创建时直接初始化类成员，而不是先默认初始化再赋值。
# 语法
`class 类名 {`
`类型 成员变量;`
`public:`
`类名(参数) : 成员变量(参数值) { ... }`
`};`

```
class Person {    
    int age;
public:  
        Person(int a) : age(a) { }  // 直接初始化 age
};

//等价于
class Person {
    int age;
public:
    Person(int a) {        
    age = a;  // 这里是赋值，不是初始化    
    }
};
```

- 但使用初始化列表更高效，可以避免多次赋值。

- ---
# 为什么使用初始化列表？
- 当成员是对象、引用或常量时，必须使用初始化列表，否则编译报错。
- 普通变量（提高_效率_）
```
class Example {
    int x, y;
public:    
    Example(int a, int b) : x(a), y(b) { }  // 推荐
};
```
- 常量成员（必须使用）
```
class Example {
    const int x;
public:
    Example(int a) : x(a) { }  // 必须使用初始化列表
};
```
- 引用成员（必须使用）
```
class Example {  
    int& ref;
public:   
    Example(int& a) : ref(a) { }  // 必须用初始化列表
  };
```
- 类对象成员（避免二次构造）
```
class A {public:    A(int x) { }};
class B {    A a;public:    B(int y) : a(y) { }  // 直接构造 a，而不是先默认构造再赋值};
```
- ✅ 初始化列表的优势效率更高，直接初始化，而不是先默认构造再赋值。  
    必须使用（对于 const、引用、无默认构造的类成员）。  
    适用于类成员变量、继承时的基类构造。
- 🚫 初始化列表不能用于变量的重新赋值（仅限初始化）。  
    需要先计算值再初始化的情况（除非计算能在 : 后面完成）。  
    最佳实践：能用初始化列表的情况尽量用，提高代码效率！