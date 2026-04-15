—— CMD（Windows 命令提示符）中的代码汇总成一个 .bat（批处理）文件

# 创建 .bat 文件

- 使用文本编辑器（如 记事本 或 VSCode）新建一个文件，并命名为 script.bat（或其他合适的名字）。

# 编写批处理脚本

在 .bat 文件中输入 CMD 命令，每个命令单独占一行。例如：

```bash
@echo off
echo Hello, this is a batch script!
cd C:\Users
dir
pause
```

@echo off：关闭命令回显，使 CMD 界面更整洁。

echo：输出文本信息。

cd：切换目录。

dir：列出目录下的文件。

pause：暂停执行，等待用户按键继续。

# 保存文件

将文件保存为 .bat 格式，确保文件类型不是 .txt，可以在“另存为”时选择 “所有文件”，然后手动输入 .bat 后缀。

# 运行 .bat 文件

双击 .bat 文件，或者在 CMD 中执行：

```bash
C:\path\to\script.bat
```

（替换为你的文件路径）

# 进阶功能（可选）

如果你的批处理脚本比较复杂，你可以：

## 使用变量

```bash
set name=阿离
echo Hello, %name%!
```

## 使用条件语句

```bash
if exist "C:\example.txt" (
echo File exists!
) else (
echo File not found!
)
```

## 使用循环

```bash
for %%i in (*.txt) do echo %%i
```

## 调用其他脚本

```bash
call another_script.bat
```

# 调试批处理文件

如果运行时出现问题，可以使用 cmd 手动执行 .bat，或者在文件开头添加：

```bash
@echo on
```

这样可以显示执行过程，方便排查错误。