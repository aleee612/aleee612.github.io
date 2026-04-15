
`shutil.copy(src,dst)` 复制文件内容及权限

`shutil.copy2(src,dst)` 复制文件内容及所有信息状态

`shutil.copyfile(src,dst)` 复制文件，不复制文件属性，如果目标文件已存在则覆盖

`shutil.copytree(src,dst)` 递归复制文件夹内容及状态信息，如果目标文件夹已存在则抛出异常

`shutil.rmtree(path)` 递归删除文件夹

`shutil.move(src,dst)` 移动文件或递归移动文件夹，也可重命名文件和文件夹