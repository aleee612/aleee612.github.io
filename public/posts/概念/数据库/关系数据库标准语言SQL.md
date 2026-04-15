## 数据定义

### 模式的建立与删
```sql
CREATE SCHEMA [<模式名>] AUTHORIZATION <用户名>;

DROP SCHEMA <模式名> <CASCADE | RESTRICT>;
```
- 创造模式需要DBA权限，或者获得了CREATE SCHEMA权限
- CASCADE：级联，全部删除
- RESTRICT：限制，如果有数据库对象则拒绝删除语句的执行
### 数据库的建立与删除
```sql
CREATE DATABASE <数据库名>;
#防止重复定义
CREATE DATABASE IF NOT EXISTS <数据库名>;

DROP DATABASE <数据库名> <CASCADE | RESTRICT>;

SHOW DATABASES;#查看所有库
SHOW DATABASE();#查看当前库
```
### 字符集与排序规则
```sql
CREATE DATABASE <数据库名>
CHARACTER SET <字符集>
COLLATE <排序>;

#查看
SHOW VARIABLES LIKE 'character_set_database'
```
##### 常见字符集：
- UTF8，utfmb4（8+默认）
##### 排序规则：（以下两种皆为utfmb4适配）
- utf8mb4_0900_ai_ci
- utf8mb4_0900_as_cs
### 基本表的定义与删除
```sql
CREATE TABLE <表名>
(
<列名><数据类型>[列级完整性约束]
[,<列名><数据类型>[列级完整性约束]]
……
[,<表级完整性约束>]
);

DROP TABLE <表名>[RESTRICT | CASCADE];

#查看指定表
SHOW TABLE FROM <表名>
```
##### 常用数据类型：

| 数据类型                            | 解释                               |
| ------------------------------- | -------------------------------- |
| CHAR(n), CHARACTER(n)           | 长度为n的定长字符串                       |
| VARCHAR(n), CHARACTERVARCHAR(n) | 最大长度为n的变长字符串                     |
| CLOB                            | 字符串大对象                           |
| BLOB                            | 二进制大对象                           |
| INT, INTEGER                    | 整数（4字节）                          |
| SMALLINT                        | 短整数（2字节）                         |
| BIGINT                          | 大整数（8字节）                         |
| NUMERIC(p,d)                    | 定整数，由p位数字组成（不包括符号，小数点），小数点后有d位数字 |
| DECIMAL(p,d), DEC(p,d)          | 同NUMETRC相似，但数值精度不受p,d控制          |
| REAL                            | 取决于机器精度的单精度浮点数                   |
| DOUBLE PRECISION                | 取决于机器精度的双精度浮点数                   |
| FLOAT(n)                        | 可选精度的浮点数，精度至少为n位数字               |
| BOOLEAN                         | 逻辑布尔变量                           |
| DATE                            | 日期，包含年、月、日，格式为YYYY-MM-DD         |
| TIME                            | 时间，包含一日的时、分、秒，格式为HH：MM：SS        |
| TIMESTAMP                       | 时间戳类型                            |
| INTERVAL                        | 时间间隔类型                           |

### 基本表的修改
```sql
ALTER TABLE <表名>
    [ADD [COLUMN]<新列名><数据类型>[完整性约束]]
    [ADD <表级完整性约束>]
    [DROP[COLUMN]<列名>[CASCADE | RESTRICT]]
    [DROP CONSTRAINT <完整性约束>[CASCADE | RESTRICT]]
    [RENAME COLUMN <列名> TO <新列名>]
    [ALTER COLUMN <列名> TYPE <数据类型>];
```
- COLUMN写不写都不影响语句作用
### 索引的建立与删除
```sql
CREATE [UNIQUE][CLUSTER]INDEX <索引名>
ON <表名>(<列名>[<次序>][,<列名>[<次序>]]……);

ALTER INDEX <旧索引名> RENAME TO <新索引名>;

DROP INDEX <索引名>;
```
- UNIQUE：每一个索引值只对应唯一的数据记录
- CLUSTER：建立的是聚簇索引
- 注：修改索引名mysql无法实现
## 数据查询
### SELECT的一般语句
```sql
SELECT [ALL | DISTINCT]<目标列表表达式>[别名][,<目标列表表达式>[别名]]...
FROM <表名或视图名> [别名] [, <表名或视图名> [别名]]...| (<SELECT语句>) [AS] <别名>
[WHERE <条件表达式>]
[GROUP BY <列名 1> [HAVING <条件表达式>]]
[ORDER BY <列名 2> [ASC | DESC]]
[LIMIT <行数 1> [OFFSET <行数2>]]
```
- HAVING：满足条件的组输出
- GROUP BY：按列名1的值进行分组
- DISTINCT：去重
### 单表查询
- `SELECT *`：查询全部
---