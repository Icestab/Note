# Linux 利用 rsync 实现全自动备份

## 前景提要：

在 Linux 系统中，我们经常需要备份一些重要的数据，比如 Docker 容器的数据，以便在需要时恢复。本文将介绍如何使用 rsync 工具实现 Docker 容器的自动备份。

工具：数据镜像备份工具 rsync + shell 脚本 + 定时任务命令 crontab

## 1. 脚本

```sh
#!/bin/bash

# 打印脚本开始执行时间
echo `date +"%Y/%m/%d-%H:%M:%S"`

echo "-------Start!--------"

# 获取当前是周几
WEEK_DAY=$(date +%w)
echo '今天星期'$WEEK_DAY

# 判断是否是周日，0就代表周日
if [ $WEEK_DAY -eq 0 ];then
　　# 如果是周日，就全量更新，所谓全量备份就是把之前增量备份的文件夹名字换掉
　　echo "今天是周天，全量备份"
　　# 使用tar命令打包，打包后压缩,配合(https://github.com/Icestab/BackupToCos)使用
　　# tar -zcf /mnt/data/docker/cos/data/backup.tar.gz -C /mnt/data/docker/pgback postgis
　　# 生成sha256校验值
　　# sha256sum /mnt/data/docker/cos/data/backup.tar.gz > /mnt/data/docker/cos/data/backup.tar.gz.sha256
　　# 旧的备份目录名称拼接上时间
　　filename=pgback_$(date +%Y%m%d)
　　# 修改旧的备份目录名称为filename
　　mv /mnt/data/docker/pgback/postgis /mnt/data/docker/pgback/$filename
else
　　echo "今天不是周天，增量备份数据库"
fi


#--------开始增量备份(/mnt/data/docker/pgback下没有postgis文件夹话就是全量了)---------

# 语法 rsync -avzP --delete 数据库所在目录 备份所在目录
# 其中 -avzp 和 --delete 的解释如下：
# -a: 归档模式，表示递归传输并保持文件属性
# -v：显示rsync过程中详细信息
# -z: 传输时进行压缩提高效率
# -P：显示文件传输的进度信息
# --delete：当源目录中的文件删除，同步后目标目录中的文件也会被删除
rsync -avzP --delete /mnt/data/docker/postgis /mnt/data/docker/pgback

#--------控制备份个数-------------------------------------------------------------

# 保留文件数，包含文件夹
ReservedNum=3
# 文件所在的上级目录，以下就叫父目录吧
FileDir=/mnt/data/docker/pgback
# 获取父目录中文件的数量
FileNum=$(ls -l $FileDir |sed 1d|wc -l)
# 当文件数量不再大于保留文件数时，结束循环
while (($FileNum > $ReservedNum)); do
　　# 获取创建时间最早的文件名称
　　OldFile=$(ls -rt $FileDir | head -1)
　　# 打印删除文件的信息,日志中可以看
　　echo $(date +"%Y/%m/%d-%H:%M:%S") "Delete File:"$OldFile
　　# 执行删除
　　rm -rf $FileDir/$OldFile
　　# 文件数量减1，继续循环判断
　　let "FileNum--"
done

#--------控制日志文件个数（命令和控制备份个数一致，不再说明）--------------------------

LogFileDir=/mnt/data/backup_database_log
LogFileNum=$(ls -l $LogFileDir |sed 1d|wc -l)
while (($LogFileNum > $ReservedNum)); do
　　LogOldFile=$(ls -rt $LogFileDir | head -1)
　　echo $(date +"%Y/%m/%d-%H:%M:%S") "Delete File:"$LogOldFile
　　rm -rf $LogFileDir/$LogOldFile
　　let "LogFileNum--"
done



echo "-------Complete!--------"
```

## 2. 将脚本添加到系统定时任务列表中

在 Linux 中执行命令 crontab -e 编辑定时任务列表，在末尾加入：

30 2 \* \* \* 脚本绝对路径 > 日志文件绝对路径 2>&1 &

ps：日志文件的名称最好拼接上时间，方便查看`日志文件绝对路径/backup_log_$(date +"\%Y-\%m-\%d").log`

就代表每天的凌晨 2 点 30 分会执行一次脚本，并将执行过程写入到日志文件中。

## 3. 后续提要

以上脚本只是备份了 Docker 容器的数据，如果需要备份其他数据，只需要修改脚本中的数据源和备份目录即可。

同时备份数据应该放在另外的磁盘上，防止数据丢失。如果必要可以同时将备份的数据上传到云存储，如阿里云 OSS、腾讯云 COS 等，以便在需要时恢复数据。

使用[BackupToCos](https://github.com/Icestab/BackupToCos)并将脚本的`tar`注释取消即可实现备份，如果需要每天备份，把`tar`命令移动到`if`语句外即可。
