---
aliases:
  - inline
---
```java
public class InlineDemo {

    // 这个函数很短，很可能被 JIT 自动内联
    static int add(int a, int b) {
        return a + b;
    }
    public static void main(String[] args) {
        long start = System.nanoTime();
        int sum = 0;
        for (int i = 0; i < 1_000_000_000; i++) {
            sum += add(1, 2); 
            //替换后的方法相当于:
            sum += 1 + 2;
        }
        long end = System.nanoTime();
        System.out.println("Sum: " + sum);
        System.out.println("Time: " + (end - start) / 1_000_000 + " ms");
    }
}

```
- 如果一个方法没有被覆盖 & 很短，编译器就能够对它进行优化处理
- Java 没有显式的 `inline` 关键字，但 **JVM JIT 编译器**会在运行时做“方法内联”优化：
	- 热点小函数（比如 getter/setter）会被直接内联展开。
	- 减少方法调用开销，提高执行速度。
- 所以在 Java 里我们不用手写，JVM 自己决定。
- 虚拟机中的*即时编译器*比传统编译器的处理能力强的多，这种编译器可以准确知道类之间的*[[继承]]关系*，并能够检测出是否有类确实**覆盖**了给定的方法