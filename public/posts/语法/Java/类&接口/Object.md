- 所有的对象数据类型都扩展了Object类
---
## 变量
- 可以用Object引用任何类型的变量
```java
Object obj = new Emp("Harry",0000);
```
- 想要对类中的内容进行操作依旧需要对其进行强制类型转换成具体的类的对象
## equals方法
- 用于检测一个对象是否等于另一个对象
- Object类中实现的equals方法是确定两个对象引用是否相等
#### a.equals(b)与Object.equals(a,b)的区别
- `Objects.equals(a, b)` 是安全版的 `a.equals(b)`
- `a.equals(b)`若a为null，则会报空指针错误
```java
public static boolean equals(Object a, Object b) {
    return (a == b) || (a != null && a.equals(b));
}
```
- `Objects.equals(a, b)` 做了安全防护，只有a!=null时才会去调用`a.equals(b)`
### getClass方法
- 返回一个对象所属的类
### 重写equals
![[Pasted image 20251005145539.png]]
![[Pasted image 20251005145550.png]]
### 比较数组
```java
static boolean equals(xxx[] a, xxx[] b){ }
```
- 若数据元素，长度相同则为true
- xxx可以是任意基本数据类型
## hashCode方法
- 又名**散列码**，是由对象导出的一个整型值
- **相同**的对象散列码**相同**，而**不同**的对象散列码基本**不会相同**
#### 常用方法
```java
a.hashCode() == b.hashCode();
```
- 两个对象的比较
```java
int hashCode()
```
- 返回对象的散列码
```java
static int hash(Object... objects)
```
- 返回一个由所有提供对象（objects）的散列码组合而成的散列码
```java
static int hashCode(Object a)
```
- 返回a的散列码，若a为null则为0
## toString方法
- 返回表示对象值的一个字符串
![[Pasted image 20251005151808.png]]
- 会打印出类名+散列码
- 可以不写`x.toString()`而写作`""+x`，同理，且对于基本类型也可使用
- 数组继承了toString()方法，因此在使用`""+arr`时会生成`[I`+散列码的形式。此时使用方法Srrays.toString即可
```java
String s = Arrays。toString(arr);
```
