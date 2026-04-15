# 什么是 `venv`？

Python 自带的模块，用来创建**虚拟环境**。这样每个项目可以拥有自己独立的 Python 库，不会互相污染，非常适合搞开发、做实验时保持环境干净整洁

# 怎么用？

#### 1. 创建虚拟环境

```
python -m venv myenv
```

- `myenv` ：虚拟环境的名字

#### 2. 激活虚拟环境

**Windows（CMD）**

```
myenv\Scripts\activate
```

**Windows（PowerShell）**

```
.\myenv\Scripts\Activate.ps1
```

**macOS / Linux**

```
source myenv/bin/activate
```

激活成功后，命令行前面会出现一个 `(myenv)` 的提示符。

---

#### 3. 安装依赖

一旦激活虚拟环境后，用 `pip` 安装的库只对当前环境有效：

```
pip install requests
```

---

#### 4. 退出虚拟环境

```
deactivate
```

---

#### 5. 保存和恢复依赖

**保存当前安装的包**

```
pip freeze > requirements.txt
```

**在其他机器上恢复环境**

```
pip install -r requirements.txt
```

---