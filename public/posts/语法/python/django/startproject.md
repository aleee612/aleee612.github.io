# 功能

- 用来**创建一个新的 Django 项目**的命令
- 会自动生成一套基本的项目结构和必要的配置文件

# 基本用法

```
django-admin startproject mysite
```

或者（如果你在虚拟环境里安装了 Django）：

```
python -m django startproject mysite
```

会创建一个目录结构如下：

```
mysite/
├── manage.py
└── mysite/
    ├── __init__.py
    ├── settings.py
    ├── urls.py
    ├── asgi.py
    └── wsgi.py
```

|   |   |
|---|---|
|文件/目录|用途说明|
|`manage.py`|管理脚本，执行各种 Django 命令用的（比如启动开发服务器）|
|`mysite/`|项目的配置包（和项目名同名）|
|`__init__.py`|让 Python 把这个目录当作模块用|
|`settings.py`|项目的配置文件，比如数据库、应用等|
|`urls.py`|URL 路由配置文件|
|`asgi.py`|异步部署用的入口|
|`wsgi.py`|Web 服务器网关接口，部署用的入口|

---

如果你想**把项目建在当前目录**，可以加个 `.`：

```
django-admin startproject mysite .
```

这样就不会再额外套一层 `mysite/mysite/` 目录了，很适合初始化一个 Git 项目时使用。