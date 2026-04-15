# 配置方面

## 跨域问题

![image-20251010194128369](C:\Users\Jiang\AppData\Roaming\Typora\typora-user-images\image-20251010194128369.png)

``` java
 @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        String origin = request.getHeader("Origin");
        if(origin!=null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }

        String headers = request.getHeader("Access-Control-Request-Headers");
        if(headers!=null) {
            response.setHeader("Access-Control-Allow-Headers", headers);
            response.setHeader("Access-Control-Expose-Headers", headers);
        }

        response.setHeader("Access-Control-Allow-Methods", "*");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        chain.doFilter(request, response);
    }
```

通过自定义过滤器解决跨域问题

## redis配置

redisTemplate():

**Jackson2JsonRedisSerializer**: 使用 Jackson 将 Java 对象序列化成 JSON 字符串再存入 Redis。作用在于对象存到redis会变成json字符串存储而不是二进制数据

**om.activateDefaultTyping(...)**: 这行代码非常关键，它在序列化为 JSON 时会额外加入一个 @class 属性，指明对象的完整类名。在反序列化（从 Redis 读取数据回 Java 对象）时，Jackson 可以根据这个属性准确地将 JSON 恢复成原始的 Java 对象类型，避免了类型转换的麻烦。

stringRedisTemplate():

单独的string类型的处理，返回就是字符串，省去了泛型

## 线程池配置

队列大小设置了无限大，然后方案是等待所有任务结束再关闭线程池

# 用户方面

## 用户注册

没啥说的，注意初始化的参数，同时初始化了收藏夹、未读信息等

## 用户登录

``` java
  //验证是否能正常登录
        //将用户名和密码封装成一个类，这个类不会存明文了，将是加密后的字符串
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(username, password);

        // 用户名或密码错误会抛出异常
        Authentication authenticate;
        try {
            authenticate = authenticationProvider.authenticate(authenticationToken);
        } catch (Exception e) {
            customResponse.setCode(403);
            customResponse.setMessage("账号或密码不正确");
            return customResponse;
        }
```

这里涉及Security相关 TODO

## 用户个人信息

```java
// 从redis中获取最新数据
User user = redisUtil.getObject("user:" + LoginUserId, User.class);
// 如果redis中没有user数据，就从mysql中获取并更新到redis
if (user == null) {
    user = userMapper.selectById(LoginUserId);
    User finalUser = user;
    CompletableFuture.runAsync(() -> {
        redisUtil.setExObjectValue("user:" + finalUser.getUid(), finalUser);  // 默认存活1小时
    }, taskExecutor);
}
```

如果redis中没有数据，从mysql获取然后异步更新到redis

## 用户退出登录

```java
public void logout() {
    Integer LoginUserId = currentUser.getUserId();
    // 清除redis中该用户的登录认证数据
    redisUtil.delValue("token:user:" + LoginUserId);
    redisUtil.delValue("security:user:" + LoginUserId);
    redisUtil.delMember("login_member", LoginUserId);   // 从在线用户集合中移除
    redisUtil.deleteKeysWithPrefix("whisper:" + LoginUserId + ":"); // 清除全部在聊天窗口的状态

    // 断开全部该用户的channel 并从 userChannel 移除该用户
    Set<Channel> userChannels = IMServer.userChannel.get(LoginUserId);
    if (userChannels != null) {
        for (Channel channel : userChannels) {
            try {
                channel.close().sync(); // 等待通道关闭完成
            } catch (InterruptedException e) {
                // 处理异常，如果有必要的话
                e.printStackTrace();
            }
        }
        IMServer.userChannel.remove(LoginUserId);
    }
}
```

退出登录需要删除channel，断开链接

# 用户资料相关

## 更新信息

``` java
    public CustomResponse updateUserInfo(@RequestParam("nickname") String nickname,
                                         @RequestParam("description") String desc,
                                         @RequestParam("gender") Integer gender) {
```

@RequestParam前端表单提交过来参数处理

## 更新头像

```
 CompletableFuture.runAsync(() -> {
            redisUtil.delValue("user:" + uid);  // 删除redis缓存
            // 如果旧头像不是初始头像就去删除OSS的源文件
            if(user.getAvatar().startsWith(OSS_BUCKET_URL)) {                String filename = user.getAvatar().substring(OSS_BUCKET_URL.length());
                ossUtil.deleteFiles(filename);
            }
        }, taskExecutor);
```

这里异步考虑：

1. redis，oss节省顺序时间
2. 最关键的是可以直接返回更换成功之后的头像，其他的事情后台来做，不会影响用户体验

# 分区相关

```java
// 将分区表一次全部查询出来，再在内存执行处理逻辑，可以减少数据库的IO
QueryWrapper<Category> queryWrapper = new QueryWrapper<>();
List<Category> list = categoryMapper.selectList(queryWrapper);
```

一次查出来

分区是嵌套逻辑，后端进行了处理

> 游戏-->1网游2xxx·······

# 视频相关

## 获取单条视频

``` java
  CompletableFuture<Void> userFuture = CompletableFuture.runAsync(() -> {
                        map.put("user", userService.getUserById(video.getUid()));
                        map.put("stats", videoStatsService.getVideoStatsById(video.getVid()));
                    }, taskExecutor);

                    CompletableFuture<Void> categoryFuture = CompletableFuture.runAsync(() -> {
                        map.put("category", categoryService.getCategoryById(video.getMcId(), video.getScId()));
                    }, taskExecutor);
```

并行处理视频的信息，一个是用户信息，一个是分区信息

> #### 获取用户投稿数量
>
> 一个小接口，就是计算一下投稿数量多少

## 获取视频列表

### 获取列表系列

*获取收藏夹列表*

**一.拿到列表**

三种规则1.最近收藏2.最多播放3.最新投稿

1.最近收藏：Zset的倒序查询并且分页，然后直接按照list的顺序返回就行

``` java
 if (rule == 1) {
            set = redisUtil.zReverange("favorite_video:" + fid, (long) (page - 1) * quantity, (long) page * quantity);
        }
```

2.最多播放:自行排序

``` java
 case 2: result = videoService.getVideosWithDataByIdsOrderByDesc(list, "play", page, quantity);
break;
```

3.最新投稿:自行排序

``` java
  case 3:
                result = videoService.getVideosWithDataByIdsOrderByDesc(list, "upload_date", page, quantity);
                break;
```

**二.并行查询**

``` java
  try (SqlSession sqlSession = sqlSessionFactory.openSession(ExecutorType.BATCH)) {
            result.stream().parallel().forEach(map -> {
                Video video = (Video) map.get("video");
                QueryWrapper<FavoriteVideo> queryWrapper = new QueryWrapper<>();
                queryWrapper.eq("vid", video.getVid()).eq("fid", fid);
                map.put("info", favoriteVideoMapper.selectOne(queryWrapper));
            });
            sqlSession.commit();
        }
```

获取最近播放列表 逻辑同上

获取最近点赞列表 逻辑同上

获取用户投稿 逻辑同上

### 获取随机视频

**首次Feed流推荐**

```java
Set<Object> idSet = redisUtil.srandmember("video_status:1", count);
```

随机就行

**更多视频**

``` java
vidsList.forEach(set::remove);  // 去除已获取的元素
```

这里第一次更多是去掉首次feed的，多次的更多就是以前的所有的

 ``` java
 // 随机获取10个vid
         for (int i = 0; i < 10 && !set.isEmpty(); i++) {
             Object[] arr = set.toArray();
             int randomIndex = random.nextInt(set.size());
             idSet.add(arr[randomIndex]);
             set.remove(arr[randomIndex]);   // 查过的元素移除
         }
 ```

这里是去掉当次的视频，这样下次更多视频的时候就会去除

## 视频上传操作

**整体过程**

1. （前→后）询问当前分片序号
2. （前→后）分片上传到本地磁盘中
3. （前→后）提交投稿，把所有杂七杂八的信息都传过去
4. （后→OSS）a同步封面到OSS获取封面URL，b返回URL给前端，c同时把合并入库的任务给线程池
5. （后→OSS）异步线程上传并合并到OSS，得到视频URL
6. （后→mysql）插入视频的数据包括两个URL
7. （后→redis）存储视频信息，视频状态（未审核），视频统计数据

**分片上传的原理**

因为网络数据传输的本质是一串01字节，所以可以分片。

根据格式大小等生成一个唯一标识，这个唯一标识可以用来定位视频本身。

客户端来切割（给分片序号），服务器来合并（按照序号来合）。

**断点续传的原理**

根据拿着唯一标识找进度，服务器返回进度，然后客户端就可以直接接着传下一段。

秒传就是在断点续传的基础上判断是否传完了，传完了就返回成功 了

# 弹幕相关



首先因为DanmuWebSocketServer 类的实例不是由 Spring 容器管理的标准 Bean，想拿到数据库和缓存的内容只能定义成静态字段获取

**过程**

1.前端给后端发起一个websocket请求，**建立连接**

2.用户发送弹幕，服务器进行一系列的业务处理

​	a.token鉴权

​	b. 存入数据库和缓存

​	c.调用广播弹幕方法

3.广播消息给所有的客户端

4.用户离开的时候，断开连接

**广播机制**

服务器里面存在一个通讯录

``` java
// 对每个视频存储该视频下的session集合
    private static final Map<String, Set<Session>> videoConnectionMap = new ConcurrentHashMap<>();
```

有用户连接就会把session存到对应视频的集合里面

然后像每个连接都发一遍消息就是广播

``` java
// 步骤1：根据视频ID，获取所有观看该视频的客户端连接
    Set<Session> set = videoConnectionMap.get(vid);

    // 步骤2：使用并行流遍历所有连接，并向每个连接发送消息
    set.parallelStream().forEach(session -> {
        try {
            // 步骤3：通过session对象发送文本消息
            session.getBasicRemote().sendText(text);
```


# 消息系统
## **实时通信**

以下是**客户端**的代码逻辑

1.启动IM系统

​	1.1创建线程池--- boss池负责接受请求，worker池负责数据的读写

​	1.2启动服务器

​	1.3定义流水线---握手，token验证，更多机制

​	1.4启动端口

``` java
  // 1. 创建两个线程池
        EventLoopGroup boss = new NioEventLoopGroup();
        EventLoopGroup worker = new NioEventLoopGroup();

        // 2. 创建并配置服务器引导程序
        ServerBootstrap bootstrap = new ServerBootstrap();
        bootstrap.group(boss, worker)
                .channel(NioServerSocketChannel.class)
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel socketChannel) throws Exception {
                        // 3. 定义每个新连接的处理流水线
                        ChannelPipeline pipeline = socketChannel.pipeline();

                        pipeline.addLast(new HttpServerCodec()) // HTTP编解码
                                .addLast(new ChunkedWriteHandler()) // 处理大数据
                                .addLast(new HttpObjectAggregator(1024 * 64)) // 聚合HTTP消息
                                .addLast(new TokenValidationHandler()) // 【关键】自定义的Token验证处理器
                                .addLast(new WebSocketServerProtocolHandler("/im")) // WebSocket协议处理器
                                .addLast(new WebSocketHandler()); // 【关键】我们自己的核心业务处理器
                    }
                });
        // 4. 绑定端口并启动服务
        ChannelFuture future = bootstrap.bind(7071).sync();
```

2.分发到WebSocketHandler--- Handler起到分发的功能把事件分发给下面的具体业务

3.处理具体业务--- 例如私信 逻辑如下

---

**在线池是什么？**
在线池 就是 `IMServer` 类里的这个静态变量：

```java
public static final Map<Integer, Set<Channel>> userChannel = new ConcurrentHashMap<>();
```

它是一个 `Map` 结构是ID+连接

连接：`Channel`是一个客户端和服务器的网络连接通道。

作用在于维护 **在线** 功能

---

**处理发送方 (用户A)**

```java
// 4. 获取发送者自己的所有连接 (用于多端同步)
Set<Channel> from = IMServer.userChannel.get(user_id); // user_id 在这里是 101
if (from != null) {
    for (Channel channel : from) {
        channel.writeAndFlush(IMResponse.message("whisper", map));
    }
}

```
自身的多端同步

**处理接收方 (用户B)**

```java
// 5. 获取接收方的所有连接
// chatDetailed.getAnotherId() 获取到的是接收方B的ID，即 202
Set<Channel> to = IMServer.userChannel.get(chatDetailed.getAnotherId()); 
if (to != null) {
    for (Channel channel : to) {
        channel.writeAndFlush(IMResponse.message("whisper", map));
    }
}
```
实时发送给别人

---

**用户是怎么连接上的？？？**

在IMserver的websocket的连接的过程中，有一个步骤是`TokenValidationHandler`

在 `TokenValidationHandler.java` 的 `channelRead0` 方法中，当它成功验证了客户端发送的**第一条WebSocket消息**里的Token之后，由以下两行核心代码实现的：

1.  **身份绑定：**
    
    ```java
    ctx.channel().attr(AttributeKey.valueOf("userId")).set(uid);
    ```
2.  **加入在线池：**
    ```java
    IMServer.userChannel.get(uid).add(ctx.channel());
    ```

> 这个类的作用在于他的`channelRead0`方法
>
> ```java
>     Command command = JSON.parseObject(tx.text(), Command.class);
>     String token = command.getContent();
> ```
>
> 先处理文本消息帧
>
> 然后吧用户信息和channel绑定上
>
> ```java
>     if (uid != null) {
>         // 将uid绑到ctx上
>         ctx.channel().attr(AttributeKey.valueOf("userId")).set(uid);
> 
>         // 将channel存起来 (加入在线池)
>         if (IMServer.userChannel.get(uid) == null) {
>             Set<Channel> set = new HashSet<>();
>             set.add(ctx.channel());
>             IMServer.userChannel.put(uid, set);
>         } else {
>             IMServer.userChannel.get(uid).add(ctx.channel());
>         }
>         redisUtil.addMember("login_member", uid);
> 
>         // 移除token验证处理器，以便以后使用无需判断
>         ctx.pipeline().remove(TokenValidationHandler.class);
>         
>         // 保持消息的引用计数，以确保消息不会被释放
>         tx.retain();
>         // 将消息传递给下一个处理器
>         ctx.fireChannelRead(tx);
>     }
> ```
>
> *   **`ctx.channel().attr(...)`**: 将验证成功的`uid`附加到当前的`Channel`（连接）上，这样后续的处理器就能随时知道这个连接属于哪个用户。
> *   **`IMServer.userChannel.put(...)`**: **加入在线池**。它将当前这个`Channel`对象，添加到全局在线池`userChannel`中与`uid`对应的集合里。**从这一刻起，这个用户在IM系统中才算真正“在线”**。
> *   **`ctx.pipeline().remove(...)`**: **动态修改管道**。我的任务（验证）已经完成了，对于这个连接，请把我从处理流水线上移除掉

以下是**服务端**的代码逻辑

``` java
public class IMServer {

    // 存储每个用户的全部连接   id--> 所有websocket链接的集合
    
    public static final Map<Integer, Set<Channel>> userChannel = new ConcurrentHashMap<>();

    public void start() throws InterruptedException {

        // 主从结构
        EventLoopGroup boss = new NioEventLoopGroup();
        EventLoopGroup worker = new NioEventLoopGroup();

        // 绑定监听端口
        ServerBootstrap bootstrap = new ServerBootstrap();
        bootstrap.group(boss, worker)
                .channel(NioServerSocketChannel.class)

                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel socketChannel) throws Exception {
                        ChannelPipeline pipeline = socketChannel.pipeline(); // 处理流

                        // 添加 Http 编码解码器
                        pipeline.addLast(new HttpServerCodec())
                                // 添加处理大数据的组件
                                .addLast(new ChunkedWriteHandler())
                                // 对 Http 消息做聚合操作方便处理，产生 FullHttpRequest 和 FullHttpResponse
                                // 1024 * 64 是单条信息最长字节数
                                .addLast(new HttpObjectAggregator(1024 * 64))
                                .addLast(new TokenValidationHandler())
                                // 添加 WebSocket 支持
                                .addLast(new WebSocketServerProtocolHandler("/im"))
                                .addLast(new WebSocketHandler());

                    }
                });
        ChannelFuture future = bootstrap.bind(7071).sync();

    }
}

```





## 聊天系统

``` java
// 提交第一个任务：去获取用户资料
CompletableFuture<Void> userFuture = CompletableFuture.runAsync(() -> {
    map.put("user", userService.getUserById(finalChat.getUserId()));
}, taskExecutor);

// 提交第二个任务：去获取聊天记录
CompletableFuture<Void> detailFuture = CompletableFuture.runAsync(() -> {
    map.put("detail", chatDetailedService.getDetails(from, to, 0L));
}, taskExecutor);

// 等待两个任务都执行完毕
userFuture.join();
detailFuture.join();
```

并发的获取资料和记录

## 点赞系统

```java
if(!Objects.equals(video.getUid(), uid)) {
    // 更新最新被点赞的视频
    redisUtil.zset("be_loved_zset:" + video.getUid(), vid);
    msgUnreadService.addOneUnread(video.getUid(), "love");
    // netty 通知未读消息
    Map<String, Object> map = new HashMap<>();
    map.put("type", "接收");
    Set<Channel> channels = IMServer.userChannel.get(video.getUid());
    if (channels != null) {
        for (Channel channel: channels) {
            channel.writeAndFlush(IMResponse.message("love", map));
        }
    }
}
```

点赞通知别人也是消息系统的一部分，通过channel通知未读消息



# TODO

总结所有异步处理的操作

threadlocal实现的currentuser解析

# CurrentUser

### 微循环4：视频基础（创建/详情/列表）

- Controller

- controller/VideoController.java

- POST /videos（创建占位：title/desc/categoryId）

- GET /videos/{id}（详情）

- GET /videos（分页列表，支持 category/keyword/排序）

- Service

- service/video/VideoService.java

- Long createDraft(VideoCreateDTO dto, Long uploaderId)

- VideoDetailVO getById(Long id, Long viewerId)

- PageVO<VideoCardVO> pageQuery(VideoQueryDTO dto)

- Impl

- service/impl/video/VideoServiceImpl.java

- 先 createDraft → getById → pageQuery

- 依赖 VideoMapper.insertDraft/selectById/pageQuery

- Mapper

- mapper/VideoMapper.java

- int insertDraft(Video video)

- Video selectById(Long id)

- List<Video> pageQuery(VideoQueryDTO dto)

- long countQuery(VideoQueryDTO dto)

### 微循环5：视频上传与转码（直传+回调）

- Controller

- controller/VideoUploadController.java

- POST /videos/upload-token（生成直传凭证）

- POST /videos/{id}/upload-callback（对象存储回调）

- POST /videos/{id}/transcode-callback（转码完成回调）

- GET /videos/{id}/status

- Service

- service/video/VideoUploadService.java

- UploadTokenVO issueUploadToken(Long uploaderId, UploadApplyDTO dto)

- void onUploadCallback(Long videoId, UploadCallbackDTO dto)

- void onTranscodeCallback(Long videoId, TranscodeCallbackDTO dto)

- VideoStatusVO getStatus(Long videoId)

- Impl

- service/impl/video/VideoUploadServiceImpl.java

- 先 issueUploadToken（签名/STS/预签）→ onUploadCallback（写入源文件地址，置状态 UPLOADED）→ onTranscodeCallback（写入 m3u8/封面，置状态 PUBLISHED）→ getStatus

- 依赖：

- VideoMapper.updateUploadInfo/updateTranscodeInfo/updateStatus

- OSSConfig/FileUploadConfig/FfmpegConfig（配置读取）

- 队列可后置（先直调/假回调）

- Mapper

- mapper/VideoMapper.java

- int updateUploadInfo(Long id, String originUrl, Long size, String mime)

- int updateTranscodeInfo(Long id, String playUrl, String coverUrl, Long duration)

- int updateStatus(Long id, Integer status)