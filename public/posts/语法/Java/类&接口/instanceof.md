## 基本语法
```java
对象 instanceof 类名
```
- **作用**：判断某个对象是否是指定类的实例，或者该类的子类实例
- **返回值**：`true` 或 `false`
- **不会抛异常**（如果对象是 `null` → 返回 `false`）
---
## 示例
```java
class Animal {}
class Dog extends Animal {}

Animal a = new Animal();
Dog d = new Dog();
Animal ad = new Dog();

System.out.println(a instanceof Animal); // true
System.out.println(d instanceof Dog);    // true
System.out.println(d instanceof Animal); // true，Dog 是 Animal 子类
System.out.println(ad instanceof Dog);   // true，ad 实际是 Dog 对象
System.out.println(a instanceof Dog);    // false，Animal 不是 Dog
System.out.println(null instanceof Dog); // false，null 返回 false
```
---
## 使用场景
1. **类型安全的强制类型转换**
```java
Animal animal = new Dog();
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;  // 安全转换
}
```
2. **多态场景判断具体类型**
```java
void printAnimal(Animal a) {
    if (a instanceof Dog) {
        System.out.println("这是条狗");
    } else if (a instanceof Cat) {
        System.out.println("这是只猫");
    }
}
```
---
## 注意点
- `instanceof` 是 **在运行时判断实际对象类型**，和声明类型无关
- 对于接口也适用：
```java
interface Flyable {}
class Bird implements Flyable {}

Bird b = new Bird();
System.out.println(b instanceof Flyable); // true
```
- Java 16+ 还可以配合 **Pattern Matching** 使用：
```java
if (obj instanceof String s) {
    System.out.println(s.length()); // 自动把 obj 转成 String
}
```
---
