### 概念
- **GET** 用于 **获取资源**。
- **安全（safe）** 的：不会改变服务器状态（理论上）。
- **幂等（idempotent）** 的：多次重复请求相同 URI，效果一样。
- 它通常是 **可缓存的**：代理/浏览器可以缓存 GET 请求的响应。
---
### 常见用法
- 打开网页：`GET /index.html`
- API 查询：`GET /api/users/123`
- 搜索：`GET /search?q=hello&page=2`
- 下载文件：`GET /files/manual.pdf`
参数一般放在 **URL 的 query string** 里（`?key=value`）。
---
### 请求特点
- **请求体（body）一般为空**：HTTP 标准没有禁止 GET 带 body，但几乎没人用，主流服务器/框架也可能不解析。
- **参数放在 URL 上**：所以有长度限制（不同浏览器和服务器对 URL 长度有上限，通常 2KB-8KB）。
- **容易被缓存**：带 `Cache-Control`、`ETag`、`Last-Modified` 等。
---
### 响应状态码常见情况
- `200 OK` → 成功拿到内容。
- `304 Not Modified` → 客户端有缓存，资源未更新。
- `404 Not Found` → 资源不存在。
- `403 Forbidden` → 没权限访问。
- `500` 系列 → 服务器炸了。