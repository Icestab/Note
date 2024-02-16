# Linux 命令

## 1.删除当前文件夹文件，不删除子目录文件

```
find . -maxdepth 1 -type f | xargs rm

-maxdepth 1 限制深度为1的查找，避免删除子目录文件。

```

## 2.部署 golang

1.在 linux 环境换编译代码  
`CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" main.go`  
2.运行项目  
`nohup ./xxx.sh >log.txt 2>&1 & `  
后台运行文件，并将日志保存到 log 文件中，>log.txt 覆盖源文件，>>log.txt 追加源文件

## 命令详解：

### & 后台运行

命令 参数 &：在原有的命令和参数后面加空格&，此时当有日志时仍然会输出到屏幕，但进程会在后台运行，我们在前台仍然可以执行其他命令。只是关闭 putty 终端后该进程还是会结束，而且我们并不想在前台看到那些日志。

### nohup 始终运行

nohup 命令 参数：nohup 的位置在命令的前面，即使关闭 putty 终端该进程仍然会继续执行，其日志不会输出到前台，而是记录在当前目录的 nohup.out 文件中。没有&默认情况是在前台执行，所以前台被占用也无法输入其他命令，而且 ctrl+c 仍然会结束当前前台程序。

### nohup 结合 &

nohup 命令 参数 &：当两者结合使用时，进程会在后台始终运行，关闭 putty 终端或在前台 ctrl+c 都不会关闭，日志输出到 nohup.out。

命令示例： nohup 命令 参数 &

> 输出文件
> 假如我们不想把日志输出到 nohup.out，而是想输出到 test.out

示例：nohup 命令 参数 >test.out &

### /dev/null 黑洞设备

通常一些 java 框架如 spring 都会配置记录日志，我们并不需要 linux 来记录日志，而且时间长了 nohup.out 文件会变的非常大，所以我们把 linux 中的日志全部丢到/dev/null 中，相当于垃圾桶，就不会再产生 linux 日志了。

示例：nohup 命令 参数 >/dev/null &

### 2>&1 错误输出

有一种很流行的命令格式是：nohup 命令 参数 >/dev/null 2>&1 &，比上面多了个 2>&1。2 是错误信息输出 ，1 是标准信息输出。>/dev/null 是将 1 放进黑洞， 2>&1 是将 2 放进 1，最终都进入黑洞。我们要搞清楚，2 并不是程序运行时的异常日志，而是 linux 系统中的错误提示，比如 nohup 命令中，这个命令我们输错，少打了一个字母，系统会立即给我们提示。而你加了 2>&1 以后，这个错误提示就进入黑洞，你只能一脸茫然的干瞪眼。

## Linux 硬盘测速

写速度：

time dd if=/dev/zero of=test.dbf bs=8k count=300000
其中/dev/zero 是一个伪设备，它只产生空字符流，对它不会产生 IO，所以，IO 都会集中在 of 文件中，of 文件只用于写，所以这个命令相当于测试磁盘的写能力。

输出的结果类似(因为一般更长测试时间更准确，所以可以设置 count 大一些)：
300000+0 records in
300000+0 records out

real 0m36.669s
user 0m0.185s
sys 0m9.340s

所以写速度为：8\*300000/1024/36.669=63.916M/s

读速度：

time dd if=/dev/sda1 of=/dev/null bs=8k
因为/dev/sdb1 是一个物理分区，对它的读取会产生 IO，/dev/null 是伪设备，相当于黑洞，of 到该设备不会产生 IO，所以，这个命令的 IO 只发生在/dev/sdb1 上，也相当于测试磁盘的读能力

输出的结果类似：
448494+0 records in
448494+0 records out

real 0m51.070s
user 0m0.054s
sys 0m10.028s

所以 sda1 上的读取速度为：8\*448494/1024/51.070=68.61M/s
