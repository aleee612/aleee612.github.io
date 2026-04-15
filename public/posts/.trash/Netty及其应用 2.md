# Netty

项目的实时通信就是基于Netty实现的。以下是Netty部分的笔记：

## 引子

首先说NIO

![image-20251016212853121](https://image-yupan.cixingji.cloud/study/image-20251016212853121.png#vwid=850&vhei=781)

BIO：同步阻塞 IO （个人理解就是悲观锁）--数据的读写必须堵塞在一个线程里进行
NIO： 同步非阻塞（个人理解就是多线程）--- 面向缓冲的，基于通道的IO方法
AIO：异步非阻塞，就是NIO2代，基于事件和回调机制
例如你有1000个IO操作，如果使用NIO，是1000个线程反复调用read。如果使用多路复用，可以1个线程反复调用select，在数据就绪后，再调用read。还是能节约资源的

> [!NOTE]
> 异步 IO 是基于事件和回调机制实现的，也就是应用操作之后会直接返回，不会堵塞在那里，当后台处理完成，操作系统会通知相应的线程进行后续的操作。  

**Netty是什么？**Netty是一个基于NIO的CS框架，可以快速简单的开发网络应用程序；简化了TCP和UDP套接字服务器等网络编程。

**应用场景**

首先就是常用的框架比如RocketMQ、Elasticsearch

实现自己的HTTP服务器，类Tomcat

可以自己实现一个实时通信系统，我的项目就是基于Netty实现的通信

## 各部件

1、Channel：通道，所有数据的操作以及状态变更都在这个通道上，**每个用户的WebSocket连接就是一个Channel。**

2、EventLoop:事件循环，单线程执行器负责处理一个或多个Channel上的所有I/O事件，永不停止。

	单线程处理多个Channel：IO多路复用，**同redis的单线程监听的大量客户端	连接**，也就是NIO
	
	永不停止：也就是说一直循环等待，永远不停止，只要有被分配到他头上的	Channel来了操作，就是他来执行。

3、EventLoopGroup：事件循环组，一组事件循环的集合，用来管理和分配，项目中有BOSS和WORKER这两个

4、Pipeline：通道管道，是依附在Channel上的处理器链，也就是责任链模式的工作机制

## 启动流程

（详细见实时通信的实现逻辑）

(入站)**客户端发消息，服务器收消息**:**WebSocketHandler**+**ChatHandler**+**IMServer**

> IMServer：
>
> 客户端发起WebSocket连接到端口
>
> Boss接受连接，创建Channel
>
> Boss将这个新的Channel注册到work上的一个EventLoop上
>
> 开始执行这个Channel上的**Pipeline**处理数据

1. 读取过来责任链传过来的数据

2. JSON 反序列化成对象，并且再次拿到UserId封装到里面

3. 持久化数据：

   1. ``` java
      chatDetailedMapper.insert(chatDetailed);完整存
      redisUtil.zset("chat_detailed_zset")消息id缓存
      chatService.updateChat;会话状态更新
      ```

4. 准备推送数据：

   1. ``` java
      CompletableFuture.runAsync(() -> {聊天信息 chat 和发送者信息 user}, taskExecutor);
      ```

5. 推送数据：

   1. 获取发送者自己的Channel集合（多端同步）
   2. 获取接收者所有的Channel集合（消息转发）
   3. 出站：推送消息到对应的EventLoop上，启动出站Pipeline
      `for (Channel channel : from) { channel.writeAndFlush(IMResponse.message("whisper", map)); }`	

---

(出站)**服务端发消息，客户端收消息：WebSocketHandler**

1. 业务触发：定位到目标用户的**全部在线 Channel**。
2. 写入数据：承接上面的推送`writeAndFlush()`
3. 启动出站Pipeline流：消息从 Pipeline 的**尾部**（靠近应用层）开始向前（靠近网络层）流动，执行**出站处理器**。
4. 编码：IMResponse 对象编码-->WebSocketFrame 转换为网络可传输的原始字节流。
5. 发送：EventLoop 线程将这些字节流写入操作系统的 **Socket 发送缓冲区**，数据通过网络发送给客户端。

> 触发时机：聊天消息推送触发，评论通知推送，点赞通知推送

---

**总结：**

整个过程是围绕 **EventLoop** 和 **Pipeline** 循环往复：

- **收消息（入站）：** EventLoop 读数据 → Pipeline 从头到尾处理（解码、认证、业务）。
- **发消息（出站）：** 业务逻辑触发 → Pipeline 从尾到头处理（业务编码、协议编码） → EventLoop 写数据。

##  心跳机制

说心跳机制先说一下 **TCP长连接和短连接**

长连接就是在S和C之间建立连接一直持续，短连接就是读写完成之后就关闭连接

为什么需要心跳机制？

在长连接的情况下，如果一方断开连接了，CS之间没有交互的话，是不知道对方已经断开了的，所以引入心跳机制：

如果处于Idle状态（连接但无交互），C或S会发送一个特殊的数据包给对方，接收方接收到这个特殊数据报文，也返回一个特殊的数据报文，这就是一个PING-PONG 交互。

Netty的**心跳机制**

TCP本身有心跳机制，但是不太灵活，所以一般在应用层实现，对应到Netty就是核心类`IdleStateHandler`