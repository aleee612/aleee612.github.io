# Spring

## 谈谈Spring框架

他是一个开源的轻量级java框架。

一般说spring框架都指的是spring framework，是很多个模块的集合，比如AOP，IOC。

最核心的思想实际上就是不重新造轮子，开箱即用。

## 列举一些重要的模块？

Core Container ：IOC 

AOP：aspect，aop

Test：对单元测试JUnit、Mockito等常用测试框架支持

Web：有对MVC的实现，对WebSocket的支持。

## Spring中Bean的作用域

| 作用域                     | 描述                                                         |
| -------------------------- | ------------------------------------------------------------ |
| singleton                  | **容器中唯一的 Bean 实例**（默认）。                         |
| prototype                  | **每次获取都会创建新实例。** 也就是说，连续 getBean() 两次，得到的是不同的 Bean 实例。 |
| request                    | 每次 HTTP 请求创建新实例（仅 Web 应用）。                    |
| session                    | 每次 HTTP Session 创建新实例（仅 Web 应用）。                |
| application/global-session | 每个 Web 应用启动时创建一个实例（仅 Web 应用）。             |
| websocket                  | 每次 WebSocket 会话创建新实例（仅 Web 应用）。               |

## 注入Bean的方式

依赖注入 (Dependency Injection, DI) 的常见方式：

1. 构造函数注入：通过类的构造函数来注入依赖项。
2. Setter 注入：通过类的 Setter 方法来注入依赖项。
3. Field（字段） 注入：直接在类的字段上使用注解（如 @Autowired 或 @Resource）来注入依赖项。

## 实现Bean的方式

1、xml：<bean>标签和工厂标签

2、注解：@Component、@Repository、@Service等

3、Java配置类：@Configuration+@Bean手动创建bean逻辑

## Spring事务及失效场景

**Spring框架事务管理 (`@Transactional`)**

### 作用 

保证业务层面的**原子性**

### 功能

**简化开发** ：开发者无需编写 `connection.commit()`、`connection.rollback()`、`connection.close()` 等手动事务管理代码。只需通过 `@Transactional` 即可声明事务边界。

### 应用场景

1.  `commentMapper.insert(comment);` (插入评论)
2.  `videoStatsService.updateStats(...)` (更新视频统计)

如果第一步成功，但第二步因某种原因失败（如网络、死锁、异常），事务管理器会自动回滚第一步的插入操作，确保数据库中不会出现“评论已插入但统计数未更新”的不一致状态。

### 失效情况

​	**1、**Spring事务是根据AOP实现的，就是拿到代理对象加入事务逻辑，所以如果调用方式不是通过注入调用的，也就是没有被Spring容器管理，就会失效。
​	比如一个类的一个非事务方法调用事务方法，事务失效，没走容器
​	**1、解决：**把被调用的事务方法写到一个新service通过注入调用

​	2、方法不是`public`修饰符

​	3、抛出的异常类型是检查型异常，或者根本没写抛异常语句

## @Component和@Bean区别

| **特性**     | @Component                                  | @Bean                                                        |
| ------------ | ------------------------------------------- | ------------------------------------------------------------ |
| **作用目标** | 类                                          | 方法                                                         |
| **控制权**   | **Spring 自动管理**                         | **开发者手动控制**                                           |
| **使用条件** | 配合 **组件扫描** (`@ComponentScan`) 使用。 | 必须在带有 **`@Configuration`** 或 `@Component` 注解的类中使用。 |
| **创建过程** | spring 通过**反射**自动创建对象并注入依赖。 | 开发者在方法体内**手动实例化**对象，并将对象返回给 spring容器。 |
| **依赖注入** | `@Autowired` 或 `@Resource` 注解。          | 在方法参数中声明依赖，spring 会自动传入。                    |
| **适用场景** | 绝大多数**自定义的类**。                    | 1. **集成第三方库**（无法修改源码）。 2. **需要复杂初始化逻辑**。 3. **需要基于条件创建 Bean**。 |
| **衍生注解** | `@Service`, `@Controller`, `@Repository`    | 无                                                           |

# SpringBoot

## 三者关系

Spring：依赖注入、解耦 (AOP/IOC)

MVC：Spring的一个模块，注解开发的核心，比如Controller，requestmapping等

SpringBoot：

## 有什么优点？

1、提升开发效率：自动配置，起步依赖，开箱即用的功能

2、和Spring生态集成

3、Spring Boot 能够根据项目依赖自动配置大量的常见组件（如数据源、Web 容器、消息队列等），提供合理的默认设置。同时也允许开发者根据需要轻松覆盖或定制配置，极大减少了繁琐的手动配置工作。

4、内嵌web服务器

5、适合微服务架构

6、Spring Boot 为常用的构建工具（如 Maven 和 Gradle）提供了专门的插件

## 自动装配原理

自动装配机制是通过 ` @SpringBootApplication `启动的，这个注解本质上是三个注解的集合。`@Configuration`、`@EnableAutoConfiguration` 和 `@ComponentScan`

- @EnableAutoConfiguration: 启用 Spring Boot 的自动配置机制。它是自动配置的核心，允许 Spring Boot 根据项目的依赖和配置自动配置 Spring 应用的各个部分。
- @ComponentScan:启用组件扫描。描被 @Component（以及 @Service、@Controller 等）注解的类，并将这些类注册为 Spring 容器中的 Bean。默认情况下，它会扫描该类所在包及其子包下的所有类。
- @Configuration: 允许在上下文中注册额外的 Bean 或导入其他配置类。它相当于一个具有 @Bean 方法的 Spring 配置类。

@EnableAutoConfiguration是启动自动配置的关键，先详解一下这个注解：

``` java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage //作用：将main包下的所有组件注册到容器
@Import({AutoConfigurationImportSelector.class}) //加载自动装配类xxxAutoconfiguration
public @interface EnableAutoConfiguration {
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";
    Class<?>[] exclude() default {};
    String[] excludeName() default {};
}
```

他又有两个注解：

1. @AutoConfigurationPackage，该注解上有一个注解@Import(AutoConfigurationPackages.Registrar.class)，其中 Registrar 类的作用是将启动类所在包下的所有子包的组件扫描注入到spring容器中。**这也是为什么在spring boot中，把项目的controller、pojo、service、dao等包放在启动类同级目录下的原因。**
2. @Import(AutoConfigurationImportSelector.class)：其中AutoConfigurationImportSelector类中有一个getCandidateConfigurations()方法，他的作用是去找配置文件，
3. 该方法通过SpringFactoriesLoader.loadFactoryNames()方法查找位于META-INF/spring.factories文件中的所有自动配置类，并加载这些类。

![image-20251017182542430](https://image-yupan.cixingji.cloud/study/image-20251017182542430.png#vwid=903&vhei=258)

### 过程

1. 启动：@SpringBootApplication，标记启动类，开始激活装配
2. 扫描：@ComponentScan+@AutoConfigurationPackage，扫描组件
   - （范围）@AutoConfigurationPackage：通过注解导入的Registrar类，注册启动类所在的包是基础包，也就是设置了一个默认的扫描最大范围
   - （执剑人）@ComponentScan：启动组件扫描器，扫描被@Component等注解修饰的类，默认根据上面的Registrar类
3. 发现：@Import(AutoConfigurationImportSelector.class)，发现配置清单（位于META-INF/spring.factories）
4. 判断：配置清单上的每一个自动配置的类都会有一个**@ConditionalXXXX**这样的注解，用来判断需不需要装配，比如拿数据库举例子：
   @ConditionalOnClass(DataSource.class)：判断有没有DataSource这个类，没有就不用加载数据库相关的自动配置的逻辑
   @ConditionalOnMissingBean(DataSource.class)：判断是不是自己手动配置（@Bean），不是再帮你自动配置
   **两个一般一起用**
5. 注册：**ConfigurationClassPostProcessor类（继承于BeanFactoryPostProcessor类）**，解析通过上面的判断的自动配置类，然后把配置类内部的@Bean方法转化成BeanDefiniton注册到Spring容器里面 ----- 这些BeanDefiniton在生命周期里面实例化成Bean实例

### 关系

自动装配是通过@SpringBootApplication启动的，而这个注解有三个注解`@Configuration`、`@EnableAutoConfiguration` 和 `@ComponentScan`

@SpringBootApplication

- `@Configuration`：标明启动类本身是一个配置类
- `@ComponentScan`：启动组件扫描
- `@EnableAutoConfiguration`：启动自动配置，进入逻辑
  - @AutoConfigurationPackage，该注解上有一个注解@Import(AutoConfigurationPackages.Registrar.class)
  - @Import(AutoConfigurationImportSelector.class)

## Spring的循环依赖问题

### 出现原因

一个类初始化的时候需要另一个类的实例，反过来也是

### 框架怎么解决的

spring默认是支持自动解决单例的循环依赖问题的

关键在于**提前暴露**：在A实例化完但是还没依赖注入（属性填充）的时候，直接把A暴露出来给B用

---

**三级缓存** 

IOC容器里面维护了三个Map存储不同阶段的Bean实例

|              | Map名称                 | 存储内容                                                     | 作用                                     |
| :----------- | :---------------------- | :----------------------------------------------------------- | :--------------------------------------- |
| **一级缓存** | `singletonObjects`      | 存储**完整、初始化完毕**的单例Bean。（bean）                 | 正常的Bean容器。                         |
| **二级缓存** | `earlySingletonObjects` | 存储**提前暴露**的Bean实例，**可能是代理对象或原始对象**。（Bean） | 存放已暴露但尚未完全初始化的Bean。       |
| **三级缓存** | `singletonFactories`    | 存储一个**工厂对象** （逻辑）                                | 负责判断要不要代理并且返回给二级缓存实例 |

---



1.  A开始创建
2.  （A到3级）暴露A的工厂：实例化A但是在DI之前，把ObjectFactory放到三级缓存里，来负责A的早期引用
3.  **A的属性注入：** A开始进行属性注入，发现依赖B，于是开始查找B。
4.  B开始创建
5.  **B的属性注入：** B开始进行属性注入，发现依赖A，于是开始查找A。
6.  查找A（三级缓存触发）： B尝试从一级缓存、二级缓存查找A，都未找到。它会访问**三级缓存**，发现A对应的 `ObjectFactory`。
7.  **（A到2级）工厂执行：** B执行这个 `ObjectFactory`。Factory会判断：A是否需要AOP代理？
    *   如果**需要**代理，Factory会生成A的代理对象。
    *   如果**不需要**代理，Factory直接返回A的原始对象。
    *   **无论返回什么，** 这个对象都会被放入**二级缓存** ，并从三级缓存中移除。
8.  （B从2级拿的A）**B获取A并初始化：** B拿到A的半成品，完成自己的属性注入，并完成初始化。此时B是一个完整的Bean。
9.  **A完成初始化：** B完成后，Spring回到A的初始化流程。A拿到完整的B，完成自己的属性注入。
10.  **（A到1级）A最终入库：** A完成所有初始化步骤（包括 `init` 方法、AOP代理创建等），最终将完整的A放入**一级缓存** (`singletonObjects`)，并从二级缓存中移除。

---

**总结：** 第三级缓存 (`singletonFactories`) 是一个**缓冲层**，它将**生成早期Bean实例的决定权**延迟到了真正需要解决循环依赖的那一刻，从而确保了AOP代理的正确性和完整性。

---

### 情况总结

| 场景分类                           | AOP 需求           | 注入方式        | 循环依赖   | 最少所需的缓存级别 | 原因                                                         |
| :--------------------------------- | :----------------- | :-------------- | :--------- | :----------------- | :----------------------------------------------------------- |
| **正常                 Bean 创建** | 有/无              | -               | 无问题     | **一级缓存**       | 仅需最终存储完整的 Bean 实例。                               |
| **循环依赖 (简单)**                | **均无 AOP**       | Setter/Field    | **能解决** | **二级缓存**       | 仅需提前暴露原始实例，无需 AOP 决策逻辑。                    |
| **循环依赖 (复杂)**                | **至少一方有 AOP** | Setter/Field    | **能解决** | **三级缓存**       | 需要 `ObjectFactory` 延迟 AOP 代理的生成和决策，确保早期引用是 AOP 后的对象。 |
| **循环依赖 (无效)**                | 有/无              | **Constructor** | 不能解     | --                 | 无法在实例化前提前暴露实例。                                 |

### 框架不能解决的

#### 构造器互相注入的

为什么？因为构造器创建bean的时候DI和实例化的是一个步骤（调用构造器方法）

过程：尝试实例化 A 时发现需要 B，转而实例化 B；实例化 B 时发现需要 A，又转而实例化 A。死锁

**解决：**a.改为Setter 注入或者@Resource注解 b.在其中一个Bean对象的构造函数参数上使用`@Lazy`

#### Prototype作用域的

为什么？三级缓存是为单例模式设计的

过程：同上

**解决：**a.改为单例 b.手动模拟三级缓存

> 注入 `ObjectProvider<B>` 或 `Provider<B>`，而非 B 实例。在需要 B 时，手动调用 `getObject()` 或 `get()` 获取新的原型实例。

## Bean的生命周期

承接自动装配的第 5 步，Spring 的 **BeanFactory** 中已经拥有了所有需要的 BeanDefinition：

1. 用户通过 @Service, @Repository 等注解定义的 BeanDefinition。
2. Spring Boot 自动配置通过 @Bean 方法生成的 BeanDefinition。

### 1. 实例化（Instantiation）

容器根据 BeanDefinition 使用反射创建 Bean 对象的**原始实例**。下面的两个情况被实例化。

- 对于 XML 配置，Spring 从 `<bean>` 标签中读取 `class` 属性
- 对于注解配置，Spring 通过 `@Component` 等注解找到对应的类

### 2. 属性赋值（Populate Properties）

在实例化后，Spring 容器将为 Bean 注入配置的属性值和依赖的其他 Bean。

- XML 配置中的 `<property>` 或 `<constructor-arg>` 标签
- 注解配置中的 `@Autowired`、`@Resource` 等注解
- setter 方法注入或构造函数注入

### 3. 初始化（Initialization）

初始化阶段是 Bean 准备就绪前的最后一步，包含多个回调方法的执行。按照执行顺序：

#### 3.1 Aware 接口回调

Spring 提供了一系列的 Aware 接口，用于让 Bean 获取 Spring 容器的特定资源：

- **BeanNameAware**：通过 `setBeanName(String name)` 方法获取 Bean 在容器中的名称
- **BeanClassLoaderAware**：通过 `setBeanClassLoader(ClassLoader classLoader)` 方法获取加载 Bean 的类加载器
- **BeanFactoryAware**：通过 `setBeanFactory(BeanFactory beanFactory)` 方法获取 BeanFactory 容器实例
- **ApplicationContextAware**：通过 `setApplicationContext(ApplicationContext applicationContext)` 方法获取 ApplicationContext 容器实例

#### 3.2 BeanPostProcessor 前置处理

`BeanPostProcessor` 接口的 `postProcessBeforeInitialization(Object bean, String beanName)` 方法在初始化前被调用，可以对 Bean 进行加工处理。

#### 3.3 初始化回调

- **InitializingBean 接口**：实现该接口的 Bean 会调用 `afterPropertiesSet()` 方法
- **自定义 init-method**：通过 XML 的 `init-method` 属性或 `@Bean` 注解的 `initMethod` 属性指定的初始化方法

#### 3.4 BeanPostProcessor 后置处理

`BeanPostProcessor` 接口的 `postProcessAfterInitialization(Object bean, String beanName)` 方法在初始化后被调用，可以对初始化完成的 Bean 进行最后的加工处理。

### 4. 使用（In Use）

初始化完成后，Bean 就可以被应用程序使用了。

- 单例（Singleton）Bean：容器启动时就完成实例化和初始化，一直存在直到容器关闭
- 原型（Prototype）Bean：每次请求时创建新实例，使用完后由客户端负责销毁

### 5. 销毁（Destruction）

当容器关闭时，对于单例 Bean，会执行销毁操作：

- **DisposableBean 接口**：实现该接口的 Bean 会调用 `destroy()` 方法
- **自定义 destroy-method**：通过 XML 的 `destroy-method` 属性或 `@Bean` 注解的 `destroyMethod` 属性指定的销毁方法



## 谈谈对IOC的理解

（是什么）

IOC也就是控制反转，要谈谈IOC，就要先说一下控制反转是什么。

传统的开发方式就是A依赖于B，那就是A 手动new一个B的对象出来；而IOC的方式是不需要new对象，而是通过IOC容器也就是Spring来帮助我们实例化对象，需要什么对象，就去IOC容器里取出来就行。

所以说控制反转的意思就是“把对象创建管理什么的 权利交给外部环境IOC”。

（为什么）（好处）

那为什么要使用IOC？解决了什么问题？

对象之间的耦合度变低，也可以说依赖程度；资源容易管理，比如使用**spring容器很容易实现一个单例**，而**传统模式得自己写。**

没有IOC是这样的：

> Service 层想要使用 Dao 层的具体实现的话，需要通过 new 关键字在`UserServiceImpl` 中手动 new 出 `IUserDao` 的具体实现类 `UserDaoImpl`（不能直接 new 接口类）。

- ![image-20251123204339925](https://image-yupan.cixingji.cloud/study/image-20251123204339925.png)

有IOC是这样的：

- ![image-20251123204523971](https://image-yupan.cixingji.cloud/study/image-20251123204523971.png)

### IOC的初始化流程

![](https://image-yupan.cixingji.cloud/study/modb_20210820_670124aa-0166-11ec-a707-00163e068ecd.png)

IOC 初始化 = 准备工作 + **自动装配**(找图纸) + 注册拦截器 +  **Bean 生命周期**(造实物)。

#### 准备工作

开启工厂 `BeanFactory`。

#### 自动装配

自动装配的流程，产生BeanDefinition。

#### 注册拦截器

AOP 拦截器：发现你的类上有 `@Transactional`（事务）或 `@Aspect`，它就在生命周期最后一步帮你生成动态代理

自动注入拦截器：专门负责识别 `@Autowired` 注解，并在“属性填充”阶段把你要的 Bean 塞进去。

#### Bean 生命周期

最后走一遍生命周期生成Bean实例

bean的生命周期里的是执行拦截器

## 谈谈对AOP的理解

（是什么）

aop就是面向切面编程，主要的思想就是把横切关注的地方从核心业务逻辑分离出来，

切面Aspect：对关注点封装的类。

通知类型有哪些？

Before**前置通知**：在方法调用之前触发

After**后置通知**：在方法调用之后触发

AfterReturning**返回通知**：在方法调用完成，返回返回值之后触发

AfterThrowing**异常通知**：在方法调用中抛出异常后触发

Around**环绕通知**：可以在**任意前后触发**，还可以直接拿到目标对象，要执行的方法

（为什么）

为什么要用AOP？解决了什么问题？

比如**日志记录、事务管理、权限控制**、接口限流等，如果一直重复实现这些行为，代码会特别冗余，难以维护。

``` java
// 日志注解
@Target({ElementType.PARAMETER,ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {
    /**
     * 描述
     */
    String description() default "";
    /**
     * 方法类型 INSERT DELETE UPDATE OTHER
     */
    MethodType methodType() default MethodType.OTHER;
}
// 日志切面
@Component
@Aspect
public class LogAspect {
  // 切入点，所有被 Log 注解标注的方法
  @Pointcut("@annotation(cn.annotation.Log)")
  public void webLog() {
  }
   /**
   * 环绕通知
   */
  @Around("webLog()")
  public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
    // 省略具体的处理逻辑
  }
  // 省略其他代码
}
```

``` java
@Log(description = "method1",methodType = MethodType.INSERT)
public CommonResponse<Object> method1() {
      // 业务逻辑
      xxService.method1();
      // 省略具体的业务处理逻辑
      return CommonResponse.success();
}
```

（怎么实现的？）

spring AOP就是基于**动态代理**实现的，我详细聊聊**Spring AOP 的实现机制**

### Spring AOP 的实现机制

**A.如何实现剥离？**

一共有三个对象，真实对象（Target）、代理对象（Proxy）、增强逻辑（Advice）

工作流程：

1. 接收到方法调用。
2. 执行增强逻辑（如 `@Before` 的通知）。
3. **将调用转发给真实对象。**
4. 执行增强逻辑（如 `@After` 的通知）。
5. 返回结果。

**B.机制一：JDK动态代理（基于接口）**

条件：至少实现了一个接口

*为什么至少实现了一个接口？因为JDK动态代理生成的类已经继承了Proxy类，由于单继承，所以它只能通过实现接口的方式实现代理*

原理：利用了Java原生的API `Proxy` `InvocationHandler`

1. 运行的时候动态生成一个代理类，这个类和真实对象是兄弟关系，实现同一个接口
2. 通过实现InvocationHandler插入增强的逻辑
3. 调用代理对象，走的增强逻辑

**C.机制二：CGLIB动态代理（基于继承）**

条件：无（没实现接口只能用它）

原理：利用字节码

1. 运行的时候操作字节码，生成一个代理类，这个类和真实对象是父子关系
2. 子类会重写目标中所有非final的方法
3. 重写的方法中加入增强逻辑

*为什么不能重写final方法？因为final方法不能重写*

> public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
> // 1. 执行前置增强 (如 @Before)
> beforeAdvice();
> try {
> // 2. 调用真实目标对象的方法
> result = method.invoke(targetObject, args);
> // 3. 执行后置增强 (如 @AfterReturning)
> afterReturningAdvice(result);
> } catch (Exception e) {
> // 4. 执行异常增强 (如 @AfterThrowing)
> afterThrowingAdvice(e);
> throw e;
> } finally {
> // 5. 执行最终增强 (如 @After)
> afterFinallyAdvice();
> }

D.总结

JDK动态代理限制在于只能代理接口定义的方法，CGLIB动态代理限制在于不能代理final类、方法。

**Spring的默认：智能选择，有接口JDK动态代理，没有接口就CGLIB**

**SpringBoot2.x以上版本：默认CGLIB-->为了避免不必要的报错(比如注入实现类)**

**什么场景我们会强制使用CGLIB？**

一、希望代理没在接口定义的方法	

二、希望代理类就是目标类的类型@Autowired直接按照实现类类型注入

> 所以一般都用@resource按类型

> 如果使用JDK代理，生成的代理对象只实现了接口，并不是实现类类型，会导致注入失败。而CGLIB代理生成的代理对象是目标类的子类，可以同时匹配接口类型和具体类类型。

