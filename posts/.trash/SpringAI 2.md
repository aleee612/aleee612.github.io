和LangChain4j名词之对应

![](https://image-yupan.cixingji.cloud/study/2fceb42e9cb96db31e12decd7675e1fb.png#vwid=1110&vhei=695)

# 基础

## Message

**消息列表**

![](../../../AppData/Roaming/Typora/typora-user-images/image-20251127195535382.png)

两个字段一个是role也就是角色，一个是content也就是文本描述。

要什么角色就new什么角色传输

``` java
SystemMessage systemMessage = new SystemMessage("你是一个编程助手，帮我学习编程");
UserMessage userMessage = new UserMessage(query);
return chatModel.call(systemMessage, userMessage);
```

## Prompt

在SpringAI中,是把**模型参数和消息列表的组合**抽象为Prompt

也就是`List messsages`+`chatOptions`

``` java
ZhiPuAiChatOptions chatOptions = ZhiPuAiChatOptions.builder()
                .model("glm-4.5")
                .maxTokens(15536)
                .temperature(0.0)
                .build();
        // 调用模型
        return chatModel.call(new
                Prompt(List.of(systemMessage,userMessage),chatOptions));
```

## ChatModel

**ModelAPI**

![流程如此](https://image-yupan.cixingji.cloud/study/image-20251127203131831.png#vwid=951&vhei=626)

同步响应

``` java
@GetMapping("/simple")
 public String simpleChat(@RequestParam(name = "query") String query) {
 return chatModel.call(query);
 }
```

流式响应（flux是发射流类）

``` java
@GetMapping("/stream/chat")
 public Flux<String> stream(@RequestParam(name = "query") String query) {
 return chatModel.stream(query);
 }
```

## AIService服务

**ChatClient**
AI Service，提供了很多高层抽象的、用起来更方便的 API，把 AI 应用当做**服务**来开发。

![很多功能](https://image-yupan.cixingji.cloud/study/image-20251127204614627.png#vwid=443&vhei=364)

# 初步应用

## 响应Json

使用service服务的这种模式下，在实际开发中肯定是更希望返回的是前端需要的json格式的数据，如下方案实现

``` java
@GetMapping("/response")
    public Book response() {
        return chatClient.prompt()
                .user("给我随机生成一本书，要求书名和作者都是中文")
                .call().entity(Book.class);
    }
```

## 拦截器Advisors

![工作流程](https://image-yupan.cixingji.cloud/study/image-20251127205536136.png#vwid=882&vhei=900)

	我们只需要实现CallAdvisor接口重写其中的方法即可。
	 adviseCall方法中的**chatClientRequest** 是封装了AI请求的对象，我们可以在Advisor方法中对其进行增强。 
	adviseCall方法中的**callAdvisorChain**可以让我们对当前的AI请求进行**放行**，并且返回 ChatClientResponse。
	我们可以增强ChatClientResponse后再返回。

代用的时候直接在builder中new就行。

``` java
 return chatClient.prompt()
                .advisors(new CallAdvisor1(), new CallAdvisor2())
                .user("给我随机生成一本女性成长的书，要求书名和作者都是中文")
                .call().entity(Book.class);
```

通过getorder调整顺序：getOrder的返回值越小在Advisor链中的顺序越靠前，也就是越早处理请求。

``` java
    public int getOrder() {
        return 0;
    }
```

##  Prompt Template

在 Spring AI 的开发过程中，Prompt Template（**提示词模板**） 的核心价值在于它能够将静态的提示 词结构与动态的业务数据分离，从而提升代码的可维护性和复用性。当你的应用需要与大型语言模型 （LLM）交互，且交互内容会根据用户输入或业务状态发生变化时，就是使用 Prompt Template 的典型 场景。



# RAG

## 基本

**RAG：（Retrieval-Augmented Generation） 检索增强生成。**通过外部数据库检索出相关的知识，然后把 问题和相关知识一起给到大模型来让模型生成回答。

**作用：**我们去问AI一些问题的时候，如果这个知识是模型在训练时没有涉及到的，这个时候AI就会出现幻觉 （看似合理但实则错误或虚构的信息）。 所以我们想要避免AI出现幻觉就需要让AI知道相关的知识。

 检索增强生成（RAG）技术其核心价值在于，它以一种成本效益高且灵活的方式，为LLM连接了一个可 实时更新的“外部知识库”，从而显著提升了AI应用的可靠性、时效性和专业性。

![工作流程](https://image-yupan.cixingji.cloud/study/image-20251130142904765.png#vwid=942&vhei=639)

**1、向量：**向量就像是一个有序的数字列表，或者说是多维空间中的一个点、一条有方 向的线段。这些数字共同描述了对象在某一个“特征空间”中的位置。

 **1、作用：**计算机无法直接理解人类语言，但极其擅长处理数字。一旦文本变成了向量 （即高维空间中的点），我们就可以运用强大的数学工具来处理它们，计算 相似度。（比如余弦相似度算法）

**2、Embedding：**把文本->多维向量的过程叫做Embedding 嵌入。

# Tool Calling

![image-20251130172053117](https://image-yupan.cixingji.cloud/study/image-20251130172053117.png#vwid=944&vhei=495)

就是把工具的name,description,input schema等信息也放入模型的请求中。 

模型如果觉得需要调用工具就会返回相关的工具调用消息，这个时候SpringAI会基于这个消息去调用工 具，得到一个工具调用的结果给到模型。

 模型再综合这个调用结果返回最终的答案。

步骤：**定义工具**+ **传入工具**

# MCP

MCP（模型上下文协议）是Anthropic公司推出的开放协议，旨在标准化大语言模型与外部工具、数据源的交互方式。

这样每个新工具或新模型的引入都可以不用重写代码或者重复写代码，对接mcp就行。

## MCP Server

给AI模型提供工具的服务，服务端

需要两部分：1、Config 2、

```java
/**
 * MCP（Model Context Protocol）服务配置类
 *
 * 这个配置类负责注册和配置MCP工具，使其能够被AI模型通过工具调用功能使用。
 * 它作为MCP工具和Spring AI框架之间的桥梁，将自定义工具暴露给AI模型。
 *
 * 主要职责：
 * 1. 注册MCP工具Bean到Spring容器
 * 2. 配置工具回调提供者（ToolCallbackProvider）
 * 3. 管理工具的生命周期和依赖注入
 **/
```



## MCP client

## 
