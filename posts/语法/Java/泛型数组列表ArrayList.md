---
aliases:
  - ArrayList
---

- 对标cpp中的vector
- 但与vector不同的是ArrayList的<>中不允许使用基本数据类型，因此需要使用[[对象包装器与自动装箱|包装类]]
### 声明数组列表
- 构造一个空数组列表
```java
ArrayList<Emp> staff = new ArrayList<Emp>();
```
- 也可使用[[类与对象#声明局部变量：var|var]]代替开头的`ArrayList<Emp>`
```java
var staff = new ArrayList<Emp>();
```
- 若没写var这样写也是可以的（菱形语法）：
```java
ArrayList<Emp> staff = new ArrayList<>();
```
### 容量的定义及扩/缩容
#### 定义数组大小
```java
staff.ensureCapacity(100);
```
#### 扩容
```java
var staff = new ArrayList<>(100);
```
#### 将存储块的大小调整为保存当前元素数量所需要的存储空间：trimToSize()
- 也就是空的存储空间会回收的意思
```java
staff.trimToSize();
```
#### 返回数组列表包含的实际元素个数：size()
- 注意返回的值相当于size，而非Capacity
```java
staff.size(); // 等价数组的arr.length
```
### 增删改查
#### 增加元素：add（）
- 永远返回true
```java
staff.add(new Emp());
staff.add(n,e);//在第n个位置插入元素e
```
#### 删除元素：remove()
```java
staff.remove(n);
```
#### 访问元素：get()&set()
```java
//下标由0开始
staff.set(i, a); //修改第i个元素的值，i <= size - 1
staff.get(i); //获得第i个元素
```
#### 遍历数组
```java
for(Emp e : staff)
{
	...
}
for(int i = 0;i < staff.size();i++)
{
	Emp e = staff.get(i);
}
```
### 拷贝
#### 普通数组元素拷贝->泛型数组列表：toArray()
```java
var a = new X[list.size()];
list.toArray(a);
```