---
aliases:
  - 抽象类
  - abstract
---

- 包含一个或多个抽象方法的类本身必须被声明为抽象
- **抽象方法（abstract method）**：
	- 是 **没有方法体** 的方法（不写 `{}`）
	- 只是定义了 **方法签名**（名字、参数、返回类型）
	- **子类必须去实现它**
```java
public abstract class Person
{
	...
	public abstract String getDescription();
	...
}
```
- 即使不包含抽象方法也可以将类声明为抽象类
- 抽象类不能实例化，即无法创建对象（但可以创建一个具体子类的对象，也可以引用子类的对象）
---
- e.g： 
```java
public class abstract_usr {  
    public static void main(String[] args) {  
        Child ch = new Child();  
        ch.Abs();  
    }  
}  
abstract class Father{  
    public Father(){ }
    protected abstract void Abs();  
}  
class Child extends Father{  
    public Child(){  
        super();  
    }  
    public void Abs(){  
        System.out.println("Abs");  
    }  
}
```
