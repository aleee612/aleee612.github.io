#### 为何/何时使用条件GET方法？
- 当需要确定当前缓存器中的对象为**最新**版本时
#### 如何确认是一个条件GET请求报文？
1. 请求报文使用[[GET]]方法
2. 请求报文中包含`If-Modified-Since:`[[Web和HTTP#请求报文|首部行]]
### 操作方式
1. [[Web缓存]]器在接收客户请求对象时向Web服务器发送一个条件GET执行最新检查，其中`If-modified-since`中的值为得到该对象时的`Last-Modified`![[Pasted image 20251001174033.png]]
2. Web服务器向缓存器发送响应报文
	-  若没被修改，则发送`304 Not Modified`，并不传送对象![[Pasted image 20251001174838.png]]