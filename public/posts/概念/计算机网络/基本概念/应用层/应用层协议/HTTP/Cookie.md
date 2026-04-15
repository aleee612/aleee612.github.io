- 用户与服务器的交互
- 允许站点对用户进行**跟踪**
### 四个组件
1. 在HTTP**响应**报文中的一个cookie首部行
	- 服务器使用Set-Cookie响应消息头发布cookie
		`Set-Cookie: tracking=tI8rk7joMx44S2Uu85nSWc`
2. 在HTTP**请求**报文中的一个cookie首部行
	- 客户端自动将Cookie消息头添加到HTTP首部并返回给服务器
		`Cookie: tracking=tI8rk7joMx44S2Uu85nSWc`
3. 在用户端系统中保留有一个cookie文件，并由用户的浏览器进行管理（所以服务器端不存储cookie）
4. 位于Web站点的一个后端数据库
### 标识方式
![[Pasted image 20250930213548.png]]
- 用户首次访问一个站点时（服务器）提供一个用户标识
- 后继会话中浏览器向服务器传递一个cookie首部，向服务器标识用户
- 风险：可能导致信息泄露