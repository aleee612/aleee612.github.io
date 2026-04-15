- 用于处理Java中的代码块
- lambda表达式就是一个代码块，以及必须传入代码的变量范围
### 基本语法
```java
(String first,String second) ->
{
	if(first.length() < second.length()) return -1;
}
  ```
- 即使没有参数也要使用空括号（）
```java
() -> { 
	for (int i = 100; i >= 0; i--) 
		system.out.println(i);
}
```
- 如果参数类型可推到则可忽略类型（但是依旧得传参）
- 若方法仅一个参数且类型可推导，则可省略小括号
```java
int num = b -> b.length();
```
### 函数式接口
- 对于只有一个抽象方法的接口，需要使用这种接口的对象时可以提供一个lambda表达式
- 无法对拥有多个抽象方法的接口使用函数式接口，因为编译器无法识别
```java
Greater g = (name) -> System.out.println(name);
```
- 在Java中，对lambda表达式所能做的也只是转换为函数式接口。这也就意味着lambda表达式只能用于有且仅有一个抽象方法的接口
- Java中的lambda不像别的语言那样有返回值（它的返回值是由函数接口调用的），因为lambda本身并没有类型（除非对应到是哪个接口）。因此lambda必须由接口变量接收，也就是函数式接口
### 方法引用
- 如果lambda表达式作为参数传递的时候可以通过自动类型判断
- 此时直接把方法传递到构造器，通过编译器生成一个函数式接口的实例，覆盖这个接口的抽象方法来调用给定的方法
```java
var time = new Timer(1000, event -> System.out.println(event));
var time = new Timer(1000,System.out::println);
```
- 此时可以发现println并没有传任何的参数进去，这是因为编译器自动完成了
- 方法引用通过类型判断自动找出了传递的类型是什么
#### 方法引用实例
![[Pasted image 20251027111750.png]]
#### 方法引用常见形式
1. 静态方法引用
```java
ClassName::staticMethod
Function<String, Integer> f = Integer::parseInt; // 相当于 s -> Integer.parseInt(s)
```
2. 实例方法引用（特定对象）
 ```java
instance::instanceMethod
List<String> list = List.of("a","b"); list.forEach(System.out::println); // 相当于 s -> System.out.println(s) 
 ```  
3. 实例方法引用（任意对象）
```java    
ClassName::instanceMethod
BiPredicate<String, String> equals = String::equals; // 相当于 (a,b) -> a.equals(b)
```
4. 构造方法引用
```java
ClassName::new
Supplier<ArrayList<String>> sup = ArrayList::new; // 相当于 () -> new ArrayList<String>()
```
### 闭包特性
- lambda中可以保存自由变量的值，即外部传进来的变量
- 但在lambda表达式中只能引用值不会改变的变量，因为在lambda中更改变量是不安全的操作，在lambda外也不安全。
- 所以其实lambda能捕获的变量其实是事实最终变量，也就是后续不会再改变的变量
- 当一个lambda中出现this.关键字时，表示创建这个lambda表达式的方法的this.参数（比如在类里面就是调用这个类中的方法）
### 使用lambda
- 通常为希望代码延迟执行，或在一个单独的线程中运行代码，或多次运行，在适当的位置运行，在某种条件下执行等
- 可能提供/接收的函数式接口![[Pasted image 20251027115759.png]]
- 基本类型的函数式接口 ![[Pasted image 20251027120516.png]]