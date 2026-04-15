- 不允许扩展的类 / 方法
### 定义
#### final类
```java
public final class Exe extends Mng
{
	...
}
```
- 禁止继续派生Exe的子类
- final类中的所有方法自动地转化为final方法，而不包括字段，字段需独立声明[[类与对象#final实例字段|final]]
#### final方法
```java
public class Emp
{
	public final String getName()
	{
		return name;
	}
}
```
- 这样，子类无法覆盖该方法
### 使用场景
- 需要确保方法/类不会在子类中改变语义
