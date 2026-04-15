# JVM笔记

## 分类

![image-20251116221631974](https://image-yupan.cixingji.cloud/study/image-20251116221631974.png)

![](https://image-yupan.cixingji.cloud/study/ffce1a32010fbfd148460bda416beed0.png)

## 存储内容

堆：所有使用 `new` 关键字创建的 Java **对象实例**、所有 Java **数组**本身、实例变量

元空间：被加载类的完整信息、静态变量 、方法信息

Java虚拟机栈：**栈帧：**局部变量表：存放方法参数、方法内部定义的局部变量（主要是基本数据类型和对象的引用地址）。

程序计数器：存储当前线程正在执行的**字节码指令的地址**
