当前项目在更新数据的时候，是单纯的先更数据库再删除缓存，没有加入删除失败重试的机制，通过选型，选择了**Canal**进行监听Mysql的操作，并且接管删除缓存和重试操作。

首先就是得知道Canal的原理，为什么能实现以上流程。

## Canal的原理

要了解Canal的原理，首先得知道Mysql主从复制的原理

### Mysql主从复制

第一步： 数据库发生变化，Master **写**到 **binlog**。

第二步： Slave 进程连接 Master，把 **binlog** 里的内容 **复制** 到自己的 **relay log** 中。

第三步：Slave 另一个进程 **读取** **relay log**，并把它里面的操作 **执行** 在自己的数据库上。

通俗易懂来说就是 「抄作业」

### Canal实现监听的机制

第一步：canal模拟slave的交互协议，伪装自己是slave，向master发送dump协议（其实就是不断传输的一个动作）

第二步：master收到dump请求，建立连接，开始推送binlog给canal

第三步：canal解析binlog（字节流）

### Canal实现同步的机制

还在学习......

## Canal实现监听

### 安装Canal

![](https://image-yupan.cixingji.cloud/study/image-20251019215111987.png#vwid=500&vhei=282)

安装完成

### 修改配置

``` properties
# position info
canal.instance.master.address=127.0.0.1:3306
canal.instance.master.journal.name=binlog.000001
canal.instance.master.position=157
```

配置以上信息及账号密码

### 启动Canal

这里发生报错了，一顿排查之后发现是因为我的数据库的binlog不叫binlog，叫DESKTOP-xxxx-bin.000001，修改配置文件之后启动成功

``` mysql
SHOW MASTER STATUS;
```

![image-20251019165338280](https://image-yupan.cixingji.cloud/study/image-20251019165338280.png#vwid=325&vhei=104)

### Spring配置

``` xml
 <dependency>
            <groupId>com.alibaba.otter</groupId>
            <artifactId>canal.client</artifactId>
            <version>1.1.4</version>
        </dependency>
```

``` yaml
canal:
  # 部署到208上，port默认为11111
  server: 127.0.0.1:11111
  # 实例名，与之前复制example之后那个文件夹名称一致
  destination: redis
# 设置canal消息日志打印级别
logging:
  level:
    top.javatool.canal.client: warn
```

### 创建账号

``` mysql
CREATE USER canal IDENTIFIED BY 'canal';  
GRANT SELECT, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'canal'@'%';
-- GRANT ALL PRIVILEGES ON *.* TO 'canal'@'%' ;
FLUSH PRIVILEGES;
```

### 创建监听类

``` java
import com.alibaba.otter.canal.client.CanalConnector;
import com.alibaba.otter.canal.client.CanalConnectors;
import com.alibaba.otter.canal.protocol.CanalEntry;
import com.alibaba.otter.canal.protocol.Message;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.net.InetSocketAddress;
import java.util.List;

@Component
public class CanalListener {
    /**
     * 解析数据
     *
     * @param beforeColumns 修改、删除后的数据
     * @param afterColumns  新增、修改、删除前的数据
     * @param dbName        数据库名字
     * @param tableName     表大的名字
     * @param eventType     操作类型（INSERT,UPDATE,DELETE）
     * @param timestamp     消耗时间
     */
    private static void dataDetails(List<CanalEntry.Column> beforeColumns, List<CanalEntry.Column> afterColumns, String dbName, String tableName, CanalEntry.EventType eventType, long timestamp) {

        System.out.println("数据库：" + dbName);
        System.out.println("表名：" + tableName);
        System.out.println("操作类型:" + eventType);
        if (CanalEntry.EventType.INSERT.equals(eventType)) {
            System.out.println("这是一条新增的数据");
        } else if (CanalEntry.EventType.DELETE.equals(eventType)) {
            System.out.println("删除数据：" + afterColumns);
        } else {
            System.out.println("更新数据：更新前数据--" + afterColumns);
            System.out.println("更新数据：更新后数据--" + beforeColumns);

        }
        System.out.println("操作时间：" + timestamp);
    }

    @PostConstruct
    public void run() throws Exception {
        CanalConnector conn = CanalConnectors.newSingleConnector(new InetSocketAddress("124.111.11.111", 11111), "example", null, null);
        while (true) {
            conn.connect();
            conn.subscribe(".*\\..*");
            // 回滚到未进行ack的地方
            conn.rollback();
            // 获取数据 每次获取一百条改变数据
            Message message = conn.getWithoutAck(100);
            //获取这条消息的id
            long id = message.getId();
            int size = message.getEntries().size();
            if (id != -1 && size > 0) {
                // 数据解析
                analysis(message.getEntries());
            } else {
                //暂停1秒防止重复链接数据库
                Thread.sleep(1000);
            }
            // 确认消费完成这条消息
            conn.ack(message.getId());
            // 关闭连接
            conn.disconnect();
        }
    }

    /**
     * 数据解析
     */
    private void analysis(List<CanalEntry.Entry> entries) {
        for (CanalEntry.Entry entry : entries) {
            // 解析binlog
            CanalEntry.RowChange rowChange = null;
            try {
                rowChange = CanalEntry.RowChange.parseFrom(entry.getStoreValue());
            } catch (Exception e) {
                throw new RuntimeException("解析出现异常 data:" + entry.toString(), e);
            }
            if (rowChange != null) {
                // 获取操作类型
                CanalEntry.EventType eventType = rowChange.getEventType();
                // 获取当前操作所属的数据库
                String dbName = entry.getHeader().getSchemaName();
                // 获取当前操作所属的表
                String tableName = entry.getHeader().getTableName();
                // 事务提交时间
                long timestamp = entry.getHeader().getExecuteTime();
                for (CanalEntry.RowData rowData : rowChange.getRowDatasList()) {
                    dataDetails(rowData.getBeforeColumnsList(), rowData.getAfterColumnsList(), dbName, tableName, eventType, timestamp);

                }
            }
        }
    }

}

```

#### 问题

**问题1：**这里面遇到了一个问题，就是即使导入完坐标了，但是还是没有protocol这个类，导致很多报错

**解决1：**发现是由于版本比帖子的版本高，canal取消了这个，解决办法是再导入一个包

```xml
<dependency>
  <groupId>com.alibaba.otter</groupId>
  <artifactId>canal.protocol</artifactId>
  <version>1.1.6</version>
</dependency>
```

**问题2：**运行之后，Springboot类反倒是启动不起来了，一直卡住了。

**解决2：**发现原来是上面的代码有问题，详细状况：

		1、@PostConstruct 方法默认在主线程运行，run方法有个无限循环。
	
		2、Spring容器初始化之后，会调用带上面注解的方法，然后主线程被永久阻塞。
	
		3、用一个新线程异步启动run方法new Thread。

### 成果

``` 
数据库：cixingji
表名：user
操作类型:UPDATE
更新数据：更新前数据--[index: 0
等等一堆
```

## Canal实现同步Redis

### 两种策略

经过了解和搜索，发现有两种同步方式：

**1.Kafka手动处理Json消息解析**

此方法的最大的坏处在于，只要存在多个表，那内部逻辑就是一大堆的If else的循环，非常耦合。后续想要同步到其他组件比如ElasticSearch，又需要写新的逻辑

``` java
 // 步骤 1: 【必须】手动添加 if/else 链来分发到不同的 ES 逻辑
    if ("commodity".equals(table)) {
        // 步骤 2: 【必须】实现转换逻辑，将 Map 转换为 CommodityDocument
        for (Map<String, String> row : message.getData()) {
            CommodityDocument doc = convertMapToCommodityDocument(row); // 转换方法
            esService.index("commodity_index", doc);
        }
        
    } else if ("order".equals(table)) {
        // 步骤 3: 【必须】实现转换逻辑，将 Map 转换为 OrderDocument
        for (Map<String, String> row : message.getData()) {
            OrderDocument doc = convertMapToOrderDocument(row); // 转换方法
            esService.index("order_index", doc);
        }
```

**2.引入CanalStarter及EntryHandler实现类**

这种方法的实现起来还算可以，并没有特别复杂，主要在于耦合度很低，扩展性也很强。

原理就是Handler来自动化字段反射和类型转换，以及Handler匹配字段和实体类通过注解

### 其他同上

### Spring配置

``` xml
<dependency>
  <groupId>top.javatool</groupId>
  <artifactId>canal-spring-boot-starter</artifactId>
  <version>1.2.1-RELEASE</version>
</dependency>
```

### 创建Handler类

``` java
@CanalTable("user")
@Component
@AllArgsConstructor
@Slf4j
public class NmsUserHandler  implements EntryHandler<User> {

    private final RedisTemplate<Object,Object> redisTemplate;

    @Override
    public void insert(User nmsUser) {
        log.info("[新增]"+nmsUser.toString());
        redisTemplate.opsForValue().set("user:"+nmsUser.getUsername(),nmsUser);
        Object o = redisTemplate.opsForValue().get("user:ns0");
        System.out.println(o);
    }

    @Override
    public void update(User before, User after) {
        log.info("[更新]"+after.toString());
        redisTemplate.opsForValue().set("user:"+after.getUsername(),after);
        Object o = redisTemplate.opsForValue().get("user:snn7");
        System.out.println(o);
    }

    @Override
    public void delete(User nmsUser) {
        log.info("[删除]"+nmsUser.getUsername());
        redisTemplate.delete("user:"+nmsUser.getUsername());
    }
}
```

这里遇到了**问题**：项目的RedisTemplate的泛型是`<String,Object>` ，不符合这个同步的代码

**解决：**在RedisConfig加入一个新的方法，叫别的名字，泛型返回值改成`<Object,Object>`，即可使用

### 配置同步的表

```java
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "user") // 标明对应的数据库表名
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    @Column(name="uid")
    @TableId
    private Integer uid;
    @Column(name="username")
    private String username;
    @Column(name="password")
    private String password;
    //及其他
}

```

也就是说在实体类的上面加上`@Table(name = "表名")`，在每个属性上面加入 `@Column(name="属性")`

### 效果

``` bash
2025-10-20 21:17:05.316  INFO 20616 --- [xecute-thread-1] c.c.backend.im.handler.NmsUserHandler    : [更新]User{uid=1, username='cixingji', nickname='ccvxv', avatar='https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png', background='https://tinypic.host/images/2023/11/15/69PB2Q5W9D2U7L.png', gender=2, description='这个人很懒，什么都没留下~', exp=0, coin=0.0, vip=0, state=0, role=1, auth=0, authMsg='', createDate=Thu Jul 17 21:00:34 CST 2025, deleteDate=null}
null
```

## Canal实现删重

实现canal进行redis删除失败的时候，进行重试删除。

### 两种策略

策略1：即时重试，不需要添加新组件。

策略2：异步补偿-->死信队列。需要添加MQ。

**策略1**：

```java
// ... 注入 RedisTemplate ...
@Service
@Slf4j
public class RedisService {
  
@Retryable(
    value = {RedisConnectionFailureException.class, RedisBusyException.class}, // 指定触发重试的异常
    maxAttempts = 3, // 最大重试次数
    backoff = @Backoff(delay = 1000) // 延迟1秒后重试
)
public void delete(String key) {
    log.warn("Attempting to delete Redis key: {}", key);
    // 如果连接Redis失败，会抛出异常，触发重试
    redisTemplate.delete(key); 
}

// 增加一个 Recover 方法，用于最终失败后的处理（例如发送告警）
@Recover
public void recoverDelete(RedisException e, String key) {
    log.error("Final attempt to delete key {} failed! Error: {}", key, e.getMessage());
    // 【关键】：这里是即时重试失败后的最终处理点
    // 比如：发送邮件告警，或者写入一个本地的重试表
}
```

策略1只能实现redis偶尔的抖动，网络小故障。

准备使用**策略2**，可以应用于redis长时间宕机。

> #### 为什么叫做死信/异补
>
> **死信队列：**消息在消费过程中，故障了或者失败了
>
> **异步 ：** 交给一个独立的服务实现。
>
> **补偿 ：** 独立的服务持续监听重试队列，等待Redis或ES恢复之后，再进行补偿的“重试”。

### 一、引入Kafka

#### 1.配置

 ``` xml
 <dependency>
       <groupId>org.springframework.kafka</groupId>
       <artifactId>spring-kafka</artifactId>
       <version>2.2.6.RELEASE</version>
</dependency>
 ```

``` yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      auto-offset-reset: latest
      max-poll-records: 100
      max-partition-fetch-bytes: 1000000
```



### 二、**定义补偿消息体**DTO

``` java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyncFailDTO implements Serializable {
    private String tableName;        // 哪个表失败了
    private String operationType;    // INSERT, UPDATE, DELETE
    private String key;              // Redis key (用于删除操作)
    private Object data;             // 失败时要同步的完整数据对象（例如 User 对象）
    private Long timestamp = System.currentTimeMillis();
}
```

### 三、修改 Canal Handler（生产者）

``` java
  // 引入 Kafka 模板
    private final KafkaTemplate<String, Object> kafkaTemplate;
    // 注入泛型正确的 RedisTemplate<Object, Object>
    private final RedisTemplate<Object,Object> redisTemplate;

    // 定义补偿 topic 名称
    private static final String COMPENSATION_TOPIC = "canal_redis_compensation";

    private void handleRedisOperation(String opType, String key, User user) {
        try {
            log.info("[尝试 Redis 同步] Op:{} Key:{}", opType, key);

            // 核心逻辑：执行 Redis 操作
            if ("DELETE".equals(opType)) {
                redisTemplate.delete(key);
            } else { // INSERT 或 UPDATE
                redisTemplate.opsForValue().set(key, user);
            }

        } catch (Exception e) {
            // 如果 Redis 操作失败（例如连接异常、宕机等），则进入补偿流程
            log.error("[Redis 失败] 发送补偿消息到 Kafka. Key: {}", key, e);

            // 1. 构造失败消息体
            SyncFailDTO failMessage = new SyncFailDTO("user", opType, key, user);
                     // 发送完整的 User 对象，以便重试时可以正确 SET
            // 2. 发送到补偿队列 (使用 key 作为 Kafka key，确保同一 key 的消息有序)
            kafkaTemplate.send(COMPENSATION_TOPIC, key, failMessage);
        }
    }
```

### 四、创建补偿消费者服务（消费者）

``` java
public class RedisCompensationConsumer {
    // 注入 RedisTemplate (泛型需与 Canal Handler 中保持一致)
    private final RedisTemplate<Object,Object> redisTemplate;
    
    // 【可选】引入 Spring Retry 或自行实现重试机制
    
    // 监听步骤 3 中定义的 topic
    @KafkaListener(topics = "canal_redis_compensation", groupId = "redis-compensation-group")
    public void listen(SyncFailMessage message) {
        String key = message.getKey();
        String opType = message.getOperationType();
        
        log.warn("[补偿开始] 尝试重新同步 key: {}，操作: {}", key, opType);

        try {
            // 核心逻辑：再次尝试 Redis 操作
            if ("DELETE".equals(opType)) {
                redisTemplate.delete(key);
            } else { // INSERT 或 UPDATE
                // 这里的 data 需要进行类型转换，Spring Kafka 默认是 Map，需要反序列化回 User
                // 简化：如果之前发送的就是 User 对象（依赖正确的 JsonSerializer/Deserializer 配置）
                redisTemplate.opsForValue().set(key, message.getData());
            }
            log.info("[补偿成功] key: {}", key);
        } catch (Exception e) {
            // 【关键】：如果补偿失败，则需要延迟或重复消费
            // 1. Kafka 默认重试：如果抛出异常，Kafka 可能会根据配置自动重试几次。
            // 2. 延迟重试：更高级的方案是，将此消息发送到一个**延迟队列**或**真正的死信队列（DLQ）**，等待更长时间再重试，防止对宕机的Redis造成持续压力。
            log.error("[补偿失败] key: {}，将等待 Kafka 重试或进入下一步 DLQ 流程。", key, e);
            
            // 抛出异常，让 Kafka 消费者机制介入重试 (或配置手动 Ack/Nack)
            throw new RuntimeException("Redis compensation failed, waiting for Kafka retry.", e); 
        }
    }
}
```

## Canal实现同步ES

### 引入ES通用工具类

已有

### 创建要同步的Document

要同步哪个表的哪些字段，这里面就只需要有这些字段

``` java
// UserDocument.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDocument {
    @Id // 假设使用 userId 作为 ES 文档 ID
    private Long id; 
    private String username;
    private String nickname;
    private String phone;
    // ... 仅包含需要ES搜索的字段
}
```

### 在Handler类加入ES逻辑

``` java
@CanalTable("user")
@Component
@AllArgsConstructor
@Slf4j
public class NmsUserHandler implements EntryHandler<User> {

    private final RedisTemplate<Object, Object> redisTemplate;
    private final EsService esService; // 【新增】注入 ES Service

    // --- 辅助方法：将 DB 实体转换为 ES Document ---
    private UserDocument convertToDocument(User user) {
        // 【核心逻辑】：实现数据转换和字段筛选
        return new UserDocument(
            user.getUserId(),
            user.getUsername(),
            user.getNickname(),
            user.getPhone()
        );
    }

    @Override
    public void insert(User user) {
        // Redis 逻辑...
        redisTemplate.opsForValue().set("user:" + user.getUsername(), user);

        // 【新增 ES 逻辑】
        UserDocument doc = convertToDocument(user);
        esService.index("user_index", doc.getId().toString(), doc);
    }

    @Override
    public void update(User before, User after) {
        // Redis 逻辑...
        redisTemplate.opsForValue().set("user:" + after.getUsername(), after);

        // 【新增 ES 逻辑】
        UserDocument doc = convertToDocument(after);
        esService.index("user_index", doc.getId().toString(), doc); // ES 索引是幂等的，可以直接用 index/upsert
    }

    @Override
    public void delete(User user) {
        // Redis 逻辑...
        redisTemplate.delete("user:" + user.getUsername());

        // 【新增 ES 逻辑】
        esService.delete("user_index", user.getUserId().toString());
    }
}
```

### 效果

## Kafka学习（Canal）

各部分组件如下

### 各部分

**Producer**

生产者，负责创建和发送消息

**Consumer** 

消费者，负责阅读和处理消息

**Broker** 

可以看做是一个Kafka实例，负责存储，接收，发送消息

**Topic** 

是在Broker中的一类数据的分类

**Partition** 

Partition是Topic的物理切分，也就是分区，一个Partition相当于一个独立的通道一个独立的线程

> 一个Topic的多个Partition是可以在不同的Broker中运行的

### 工作流程

#### 流程

每条消息的的结构：Key+Value

1、生产者发送消息，把消息发送给Broker，并且指定Topic，指定Key。

2、Broker接收到消息之后，根据Topic和Key，把消息追加写到指定Partition的末尾；消息写入成功后，就会拿到一个Offset偏移量，也就是这个消息在Partition的位置编号。

3、消费者读取消息，向Broker请求订阅某个Topic，消费者是主动向Broker询问：有没有新消息。（订阅以Topic为单位）

4、消费者处理完这批消息之后，告诉Broker：我已经看完了编号为xx的消息了。这个xx就是新的Offset，Broker会记录这个记录，重复3。

![image-20251109163848521](https://image-yupan.cixingji.cloud/study/image-20251109163848521.png#vwid=729&vhei=234)

#### key

Key是分区路由，用来保证同一个**Partition**的顺序性。

指定Key：一般都是拿主键id来保障顺序性。

在不指定Key的情况下，分区策略就会变成：
早期版本是轮询（均匀的发送到Topic的所有Partition），新版本是粘性分区（生产者会尝试把连续的消息一直发给同一个Partition，直到满再换）

指定分区也可以有顺序，但是这样扩展性就没有了，而且写死分区ID会导致数据全都放在一个分区里，资源倾斜。

#### 生产者

**批量发送**：

不会每发送一条消息就发给broker的分区，在客户端内存中维护一个 **缓冲区**，满足下面这两个条件

1、达到设定的最大等待时间 (`linger.ms`)

2、积累的消息达到设定的批量大小 (`batch.size`) 

#### 消费者

**消费进度管理**：

### 工作原理

整体是

Kafka通过**发布/订阅（Publish/Subscribe）模型**实现异步通信：

- **生产者（Producer）**：将消息**异步发送**到指定主题（Topic）的分区（Partition），无需等待消费者确认。发送过程是**非阻塞**的，允许生产者快速处理下一个任务。
- **存储层（Broker）**：消息被追加写入到磁盘上的**Commit Log**（日志文件），保证了消息的**持久性**和**顺序性**。
- **消费者（Consumer）**：消费者组（Consumer Group）以**拉取（Pull）模式**从Broker中获取消息，并独立管理自己的消费位移（Offset）。消息的处理是**独立且异步**的

### 幂等不丢失原理

#### 生产者端的

使用**同步发送**（至少等待 Leader 确认）和配置 `acks=all` 结合**幂等性**和**事务**机制，确保消息**不丢失且不重复**。

| **机制/配置**                          | **作用**                 | **核心原理**                                                 |      |
| -------------------------------------- | ------------------------ | ------------------------------------------------------------ | ---- |
| **消息确认机制 (`acks`)**              | 控制消息发送的可靠级别。 | <ul><li>`acks=0`：发送即成功，可能丢失。</li><li>`acks=1`：等待 Leader 写入成功，可能丢失（Leader 宕机）。</li><li>**`acks=all` (或 `-1`)**：等待所有 ISR 中的副本同步成功才返回成功，**极大地保障不丢失**。</li></ul> |      |
| **幂等性 (`enable.idempotence=true`)** | **保证消息不重复**。     | 启用后，生产者自带一个唯一的 PID（Producer ID）和序列号。Broker 根据 PID 和序列号来判断该消息是否已被写入，如果已被写入则直接丢弃，**解决重试导致的重复问题**。 |      |
| **事务机制**                           | **保证原子性写入**。     | 确保跨多个分区、多条消息的发送要么全部成功，要么全部失败，是实现**Exactly-Once**语义的基础 |      |

#### 消费者端的

| **场景**         | **机制与处理**                             | **详细说明**                                                 |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------ |
| **保障不丢失**   | 手动提交位移（`enable.auto.commit=false`） | 消费者只有在**完成业务逻辑处理**后，才手动调用 `commitSync()` 或 `commitAsync()` 提交位移。如果在处理过程中宕机，位移未提交，重启后会**从上一次成功提交的位移处开始消费**，实现消息重试。 |
| **处理消息重复** | 业务幂等性设计                             | 由于手动提交位移可能导致消息重复消费，消费者必须设计业务层的幂等性。如：使用**数据库唯一约束**，或使用消息中的**业务唯一 ID**（如订单号）在 Redis 或 DB 中进行去重判断。 |
| **处理消息失败** | 死信队列                                   | 当消费者多次重试（在业务代码中捕获异常并循环重试）后仍无法成功处理某条消息时，不应无限重试导致阻塞。正确的做法是：将该消息写入一个**单独的“死信队列”主题**（DLQ Topic），由专门的监控或人工介入处理，并提交当前失败消息的位移，让主流程继续。 |