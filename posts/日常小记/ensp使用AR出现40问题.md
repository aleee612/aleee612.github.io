# 问题一：虚拟网卡出现冲突

### 问题出现原因：

- 电脑注册表中残存以前注册的虚拟网卡数据，导致出现`VirtualBox Host-Only Network #2`（在注册表内显示为`VirtualBox Host-Only Ethernet Adapter #2`）

### 分析问题：

- 出现这种情况大多是因为虚拟网卡配置不匹配导致，ensp中路由器正常运行要求正常运行的虚拟网卡，VirtualBox配置的虚拟网卡，ensp的AR_Base，WLAN_AC_Basse，WLAN_AD_Base，WLAN_AP_Base，WLAN_SAP_Base的.vbox文件中两处网卡配置是相同的
- 如图：![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1757745876476-fdd035d5-1b59-41e1-9804-70e248af53f9.png)![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1757745928010-bd798580-109c-4032-8a65-4cf703a392b2.png)![](https://cdn.nlark.com/yuque/0/2025/png/55421216/1757745973292-c69d9940-361c-4cc4-9489-9fce3aaf3426.png)

### 解决方法：

1. 修改所有的网卡配置为#2版本，不管#1（也就是默认）版本
2. 删除电脑注册表中的原有虚拟网卡，重装virtualbox，这样得到原有的网卡

### 新的疑问：

1. 为什么我不能删除#2并把配置全部还原为#1？
2. 为什么有一次配置完全相同了却依旧运行不了？