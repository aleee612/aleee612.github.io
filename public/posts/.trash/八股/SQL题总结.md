## SQL题总结

###  基础

distinct是去重,修饰要查的字段的

as修改字段名字，修饰要查的字段

order by排序，可按照字段排序，再加desc是降序 再加limit x是取前x行

group by分组，可按照字段分组

having是代替where在group by +聚合函数（avg max等）的情况下

### 多表

join 第二个表 on 条件，连接两个表

![](https://image-yupan.cixingji.cloud/study/image-20251117204011738.png)

in用来子查询在where 的条件语句中使用比如 age in `一个新的查询`