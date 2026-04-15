
## 常用方法

`os.rename(src,dst)` 重命名src→dst

`os.remove(path)` 删除目录为path的文件，如果path是一个文件夹，则抛出异常

`os.mkdir(path,mode)` 创建文件夹，mode：文件夹权限，缺省时为可读可写可执行

`os.getcwd()` 返回当前工作目录

`os.chdir(path)` 将path设为当前工作目录

`os.listdir(path)` 返回path下的文件和文件夹列表

`os.rmdir(path)` 删除path指定的空文件夹

`os.removedirs(path)` 删除多级目录，目录中不能有文件

## os.path模块

`os.path.abspath(path)` 返回指定文件的绝对路径

`os.path.split(path)` 将path分割成目录和文件名，返回一个元组

`os.path.splitext(path)` 将path分割成文件名和扩展名，返回一个元组

`os.path.exists(path)` 如果指定文件存在，返回True，否则返回False

`os.path.getsize(path)` 返回指定文件的大小（字节）

以下三种需要导入time模块

`os.path.getatime(path)` 返回指定文件最后一次的访问时间

`os.path.getctime(path)` 返回文件的创建时间

`os.path.getmtime(path)` 返回文件的最后一次修改时间