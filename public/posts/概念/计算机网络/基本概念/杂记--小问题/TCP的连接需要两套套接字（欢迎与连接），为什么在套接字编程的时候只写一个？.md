
## 从 TCP 协议层看：确实有两套[[套接字]]

在 **TCP 服务器端**，实际上存在两种不同的[[套接字]]角色：
1. **欢迎[[套接字]]（listening socket）**
    - 用于监听连接请求（`listen()`）。
    - 它的唯一任务是等待客户端发来 `SYN`。
2. **连接[[套接字]]（connected socket）**
    - 一旦客户端发起连接并三次握手成功，**系统会自动生成一个新的[[套接字]]**，专门用于该连接。
    - 这个新[[套接字]]才是真正负责“通信”的那个。
    - 每一个客户端对应一个这样的连接[[套接字]]。

所以：  
在概念上，TCP 服务器端确实会同时存在 **两个不同作用的[[套接字]]**。

---
### 从编程层看：为什么只写一个？
- 因为在编程中，**系统自动帮我们创建第二个[[套接字]]**
```python
from socket import *

serverSocket = socket(AF_INET, SOCK_STREAM)  # ① 创建欢迎套接字
serverSocket.bind(('localhost', 12000))
serverSocket.listen(1)

print("服务器等待连接中...")
connectionSocket, addr = serverSocket.accept()  # ② 系统自动生成连接套接字
print("连接来自：", addr)

# 接下来就用 connectionSocket 通信
msg = connectionSocket.recv(1024).decode()
print("收到消息：", msg)
connectionSocket.close()
```
#### 关键点：
- `serverSocket` → 是“欢迎[[套接字]]”，只负责监听。
- `accept()` → 内核接收到连接请求后，**自动生成一个新的“连接[[套接字]]”**。
- `connectionSocket` → 是用于该客户端通信的“连接[[套接字]]”。

我们在代码里写的其实是：
> 一个监听的 socket（serverSocket）
> - 一个由 `accept()` 返回的 socket（connectionSocket）
---