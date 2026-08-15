# Linux 命令

## 1. 删除当前文件夹下的文件（不删除子目录）

只删除当前目录层级下的文件，不递归到子目录：

```sh
find . -maxdepth 1 -type f -delete
```

- `-maxdepth 1`：限制查找深度为 1，避免进入子目录。

::: tip 为什么不用 `| xargs rm`

早期的写法是 `find . -maxdepth 1 -type f | xargs rm`，但遇到文件名含空格时会出错。更安全的方式是直接用 `find` 自带的 `-delete`，或搭配 `-print0`：

```sh
find . -maxdepth 1 -type f -print0 | xargs -0 rm
```

:::

## 2. 后台运行程序与日志重定向

### 部署 golang 到 Linux

1. 交叉编译：`CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" main.go`
2. 后台运行并记录日志：

```sh
nohup ./xxx.sh > log.txt 2>&1 &
```

- `> log.txt`：覆盖写入日志；`>> log.txt`：追加写入日志。

### `&`、`nohup` 与重定向详解

| 写法 | 前台 / 后台 | 关终端后 | 日志去向 |
|------|------------|---------|----------|
| `命令 &` | 后台 | 进程结束 | 仍输出到屏幕 |
| `nohup 命令` | 前台 | 继续运行 | 写入 `nohup.out` |
| `nohup 命令 &` | 后台 | 继续运行 | 写入 `nohup.out` |

- `&`：让进程在后台运行，但关闭终端后进程仍会结束。
- `nohup`：使进程在退出终端后继续运行，日志默认写入当前目录的 `nohup.out`。

### `2>&1` 与 `/dev/null`

```sh
nohup 命令 > /dev/null 2>&1 &
```

- `1`：标准输出（stdout），`2`：标准错误（stderr）。
- `> /dev/null`：把标准输出丢弃到「黑洞」。
- `2>&1`：把标准错误重定向到标准输出（即也丢进黑洞）。
- `/dev/null`：黑洞设备，写入的数据会被直接丢弃，常用于丢弃不需要的日志。

::: tip 提示

`2>` 重定向的是程序运行时系统产生的错误提示（如命令拼写错误），而非程序自身的业务日志。加了 `2>&1` 后这些提示也会被丢弃。

:::

## 3. 硬盘 / 磁盘测速

`dd` 可用来简单测试磁盘读写速度。

**测写速度**（`/dev/zero` 只产生空字符流，不产生读 IO）：

```sh
time dd if=/dev/zero of=test.dbf bs=8k count=300000
```

**测读速度**（`/dev/null` 是黑洞，写到这里不产生 IO）：

```sh
time dd if=/dev/sda1 of=/dev/null bs=8k
```

示例输出与计算：

```
300000+0 records in
300000+0 records out
real 0m36.669s
```

写速度 = `8 * 300000 / 1024 / 36.669 ≈ 63.9 MB/s`。

::: tip 更专业的测速工具

- `hdparm -t /dev/sda`：快速测读速度。
- `fio`：功能强大的磁盘压测工具，可模拟多种读写场景。

:::

## 4. 挂载 USB 硬盘并设置开机自动挂载

**1. 查看磁盘并创建挂载点：**

```sh
lsblk            # 查看磁盘/分区信息
mkdir /mnt/usbhd # 创建挂载点
```

**2. （新硬盘）格式化：**

```sh
mkfs.ext4 /dev/sdb1
```

**3. 临时挂载并查看：**

```sh
mount /dev/sdb1 /mnt/usbhd
df -h
```

**4. 开机自动挂载：**

```sh
nano /etc/fstab
```

在末尾添加一行：

```
UUID=xxxx /mnt/usbhd ext4 defaults 0 2
```

保存后执行 `mount -a` 使配置生效，再 `df -h` 查看结果。

::: tip fstab 字段说明

`UUID=xxxx /mnt/usbhd ext4 defaults 0 2` 各字段含义：

1. `UUID=xxxx`：分区唯一标识，用 `blkid /dev/sdb1` 查询。使用 UUID 可避免磁盘顺序变化导致挂载错误。
2. `/mnt/usbhd`：挂载点目录。
3. `ext4`：文件系统类型。
4. `defaults`：默认挂载选项，等价于 `rw,suid,dev,exec,auto,nouser,async`。
5. `0`：是否被 dump 备份工具检查（0 不检查，1 每天检查）。
6. `2`：启动时是否被 fsck 检查（0 不检查，1 根文件系统优先检查，2 其次）。

:::

## 5. 查看配置文件（过滤注释和空行）

```sh
grep -v "^#" /etc/ssh/sshd_config | sed '/^$/d'
```

- `grep -v "^#"`：过滤掉以 `#` 开头的注释行。
- `sed '/^$/d'`：删除空行。

## 6. 压缩与打包

```sh
tar -czvf 备份.tar.gz /path/to/dir   # 打包并 gzip 压缩
tar -xzvf 备份.tar.gz -C /target     # 解压到指定目录
tar -cjvf 备份.tar.bz2 /path         # 使用 bzip2 压缩
tar -xjvf 备份.tar.bz2               # 解压 bzip2 压缩包
zip -r 备份.zip /path                # 打包为 zip
unzip 备份.zip -d /target            # 解压 zip
```

参数记忆：`c` 创建、`x` 解包、`z` gzip、`j` bzip2、`v` 显示过程、`f` 指定文件。

## 7. 磁盘空间与文件大小

```sh
df -h      # 查看各分区磁盘使用情况（人类可读）
du -sh dir # 查看目录总大小
du -h --max-depth=1 . # 查看当前目录下各子项大小
```

## 8. 查找文件与内容

```sh
find /path -name "*.log"        # 按文件名查找
find /path -type f -size +100M  # 查找大于 100M 的文件
find /path -type f -mtime -7    # 查找 7 天内修改过的文件
grep -rn "关键词" /path         # 递归搜索文件内容
grep -i "关键词" file           # 忽略大小写搜索
```

## 9. 查看端口与网络连接

```sh
ss -tlnp     # 查看所有监听的 TCP 端口及进程
ss -tunap    # 查看所有 TCP/UDP 连接
lsof -i :8080 # 查看占用 8080 端口的进程
```

## 10. 服务与系统管理

```sh
systemctl status 服务名   # 查看服务状态
systemctl start 服务名    # 启动服务
systemctl stop 服务名     # 停止服务
systemctl restart 服务名  # 重启服务
systemctl enable 服务名   # 设置开机自启
systemctl disable 服务名  # 取消开机自启
journalctl -u 服务名 -f   # 实时查看服务日志
```

## 11. 文本处理

```sh
awk '{print $1}' file        # 打印第一列
awk -F: '{print $1}' file    # 指定分隔符
sed 's/旧/新/g' file         # 替换文本
sed -n '10,20p' file         # 查看第 10 到 20 行
sort file                    # 排序
uniq file                    # 去重（常与 sort 联用）
```

## 12. 同步备份（rsync）

```sh
rsync -avz /source/ /target/          # 增量同步
rsync -avz --delete /source/ /target/ # 同步并删除目标端多余文件
rsync -avz user@host:/remote/ /local/ # 从远程同步到本地
```

- `-a`：归档模式，保留权限等信息；`-v`：显示详情；`-z`：压缩传输。
