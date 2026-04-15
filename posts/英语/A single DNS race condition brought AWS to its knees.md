>Fault in DynamoDB system cascaded through AWS services, knocking major sites offline for hours
>
>在DynamoDB系统（某数据库？）中的错误（出现故障）主机流动在（级联影响了）AWS的服务器中，敲响严重的断网几个小时（×）导致主要网站离线好几个小时(√)
-  knocking ... offline：让...下线 / 不可用 

---
> Amazon has published a detailed postmortem explaining how a critical fault in DynamoDB's DNS management system cascaded into a day-long outage that disrupted major websites and services across multiple brands – with damage estimates potentially reachi+ng hundreds of billions of dollars.
> 
> 亚马逊云曾公开一个详细的尸检（事后分析报告）解释了如何一个严重的错误在DynamoDB 的DNS经营系统是如何发生的，逐级连锁导致了持续一天的断联（宕机），（打断）干扰了重要（知名的）web站点和服务器的停机通过多个商标（覆盖多个品牌） -  在最坏的打算下可能触及了上千亿的dollars（ hundreds of billions of dollars.）
- major：可以有重要的意思
- detailed：详细的
- posrmortem：尸检/事后检查/事后分析
- critical：严重的
- management：经营
- cascaded：逐级连锁
- outage：断联/宕机
- disrupted：打断/干扰
- multiple：覆盖，包含
- 亚马逊你惨了

---
> The incident began at 11:48 PM PDT on October 19 (7.48 UTC on October 20), when [customers reported increased DynamoDB API error rates](https://www.theregister.com/2025/10/20/amazon_aws_outage/) in the Northern Virginia US-EAST-1 Region. The root cause was a race condition in DynamoDB's automated DNS management system that left an empty DNS record for the service's regional endpoint.
> 
> 这件事故开始于八月19下午11：48在PDT（太平洋）时间，当时北美的US-EAST-1地区的客户反映DynamoDBAPI提高了其错误率。这个根本原因是一个竞态条件在DynamoDB 的自动化DNS经营系统 导致离开的一个用于记录服务器接口的工程DNS
- incident：事故
	- security incident：安全事件
	- network incident：网络事件
	- incident report：事件报告
	- incident management：事件管理
- reported：报告

> The DNS management system comprises two independent components (for availability reasons): a DNS Planner that monitors load balancer health and creates DNS plans, and a DNS Enactor that applies changes via Amazon Route 53.
> 
> 这个DNS经营系统
