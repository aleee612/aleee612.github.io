
## **✅** **MySQL 导入 CSV 数据完整流程**

### 1. 进入 [[关系数据库标准语言SQL|MySQL]]

- **问题**：最开始 `mysql` 不是内部或外部命令，无法直接运行。

- **解决方案**：

1. 先 `cd` 进入 MySQL 的 `bin` 目录：

```
cd "C:\Program Files\MySQL\MySQL Server 8.2\bin"
```

2. 运行 MySQL 命令：

```
mysql -u your_username -p
```

3. 之后 `mysql` 仍然不可用，发现是 **环境变量未配置**，后续可通过 **添加 MySQL** `bin` **目录到环境变量** 彻底解决。

---

###  2. 进入数据库

- **目标**：进入 `mydjango` 数据库，确保数据存储在正确的库中。

- **执行**：

```
USE mydjango;
```

---

### 3. 发现 `LOAD DATA LOCAL INFILE` **受限制**

- **问题**：执行 `LOAD DATA LOCAL INFILE` 报错 **"file request rejected due to restrictions on access"**，意味着 MySQL 禁用了本地文件导入。

- **解决方案**：

1. **临时启用** `local_infile`（在 MySQL 里执行）：

```
SET GLOBAL local_infile = 1;
```

2. **重新登录 MySQL 时启用** `local-infile`：

```
mysql --local-infile=1 -u your_username -p
```

3. **永久修改** `my.ini`（如果不想每次都改）。

---

### 4. `LOAD DATA` **语法错误**

- **问题**：执行 `LOAD DATA LOCAL INFILE` 时报错 **SQL 语法错误**。

- **原因**：

1. **CSV 文件格式不匹配**（字段分隔符、引号、换行符）。

2. **MySQL 版本不同，**`LOAD DATA` **语法有些许差异**。

- **最终解决方案**：

```
LOAD DATA LOCAL INFILE 'C:/path/to/scores.csv'
INTO TABLE faqs_scores
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

---

### 5. 需要清空表并重新导入

- **问题**：想重新导入数据，需要先清空 `faqs_scores` 表。

- **解决方案**：  
    ***� 为什么不用** `DELETE FROM faqs_scores;`**？**

```
TRUNCATE TABLE faqs_scores;
```

- `TRUNCATE TABLE` **更快**，并且 **会重置自增 ID**，而 `DELETE` 只是删除数据，不重置 ID。

---

### **✅** **结论**

- **解决了**：

- MySQL 不能在 cmd 中运行的问题（环境变量）。

- `LOAD DATA LOCAL INFILE` 被禁用的问题（修改 `local_infile`）。

- `LOAD DATA` 语法错误（调整分隔符、引号、换行符）。

- 清空表并重新导入数据（`TRUNCATE TABLE`）。

- **学会了**：

- 如何在 cmd 进入 MySQL。

- 如何修改 MySQL 配置 (`my.ini`) 使 `LOAD DATA` 可用。

- 如何导入 CSV 到 MySQL 并处理格式问题。

- 如何清空表后重新导入数据。

---