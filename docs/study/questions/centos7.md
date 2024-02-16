# Centos7 升级内核版本

## 1、查看当前内核版本

```shell
$ uname -r
3.10.0-1160.el7.x86_64

$ uname -a
Linux localhost.localdomain 3.10.0-1160.el7.x86_64 #1 SMP Mon Oct 19 16:18:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux

$ cat /etc/redhat-release 
CentOS Linux release 7.9.2009 (Core)
```

## 2、升级内核

#### 更新yum源仓库

```shell
$ yum -y update
```

#### 启用 ELRepo 仓库

ELRepo 仓库是基于社区的用于企业级 Linux 仓库，提供对 RedHat Enterprise (RHEL) 和 其他基于 RHEL的 Linux 发行版（CentOS、Scientific、Fedora 等）的支持。
ELRepo 聚焦于和硬件相关的软件包，包括文件系统驱动、显卡驱动、网络驱动、声卡驱动和摄像头驱动等。

```shell
#导入ELRepo仓库的公共密钥

rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
#安装ELRepo仓库的yum源

yum install https://www.elrepo.org/elrepo-release-7.el7.elrepo.noarch.rpm
#rpm -Uvh https://www.elrepo.org/elrepo-release-7.el7.elrepo.noarch.rpm
```

## 3、查看可用的系统内核包

```shell
yum --disablerepo="*" --enablerepo="elrepo-kernel" list available
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
 * elrepo-kernel: linux-mirrors.fnal.gov
elrepo-kernel/primary_db                                    | 2.0 MB  00:00:02     
可安装的软件包
kernel-lt.x86_64                         5.4.181-1.el7.elrepo         elrepo-kernel
kernel-lt-devel.x86_64                   5.4.181-1.el7.elrepo         elrepo-kernel
kernel-lt-doc.noarch                     5.4.181-1.el7.elrepo         elrepo-kernel
kernel-lt-headers.x86_64                 5.4.181-1.el7.elrepo         elrepo-kernel
kernel-lt-tools.x86_64                   5.4.181-1.el7.elrepo         elrepo-kernel
kernel-lt-tools-libs.x86_64              5.4.181-1.el7.elrepo         elrepo-kernel
kernel-lt-tools-libs-devel.x86_64        5.4.181-1.el7.elrepo         elrepo-kernel
kernel-ml.x86_64                         5.16.11-1.el7.elrepo         elrepo-kernel
kernel-ml-devel.x86_64                   5.16.11-1.el7.elrepo         elrepo-kernel
kernel-ml-doc.noarch                     5.16.11-1.el7.elrepo         elrepo-kernel
kernel-ml-headers.x86_64                 5.16.11-1.el7.elrepo         elrepo-kernel
kernel-ml-tools.x86_64                   5.16.11-1.el7.elrepo         elrepo-kernel
kernel-ml-tools-libs.x86_64              5.16.11-1.el7.elrepo         elrepo-kernel
kernel-ml-tools-libs-devel.x86_64        5.16.11-1.el7.elrepo         elrepo-kernel
perf.x86_64                              5.16.11-1.el7.elrepo         elrepo-kernel
python-perf.x86_64                       5.16.11-1.el7.elrepo         elrepo-kernel

```

## 4、安装最新长期支持版本内核

```shell
$ yum --enablerepo=elrepo-kernel install kernel-lt
```

kernel-ml 主线最新版本

`--enablerepo` 选项开启 CentOS 系统上的指定仓库。默认开启的是 `elrepo`，这里用 `elrepo-kernel` 替换。

## 5、设置 grub2 

内核安装好后，需要设置为默认启动选项并重启后才会生效

#### 查看系统上的所有可用内核：

```shell
$ sudo awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
0 : CentOS Linux (5.4.181-1.el7.elrepo.x86_64) 7 (Core)
1 : CentOS Linux (3.10.0-1160.el7.x86_64) 7 (Core)
2 : CentOS Linux (0-rescue-7d2155314bbf7543a1024df4ab69de3a) 7 (Core)
```

#### 设置新的内核为grub2的默认版本

服务器上存在4 个内核，我们要使用 5.4 这个版本，可以通过 `grub2-set-default 0` 命令或编辑 `/etc/default/grub` 文件来设置

#### 方法1、通过 `grub2-set-default 0` 命令设置

其中 0 是上面查询出来的可用内核

`grub2-set-default 0`

#### 方法2、编辑 `/etc/default/grub` 文件

设置 GRUB_DEFAULT=0，通过上面查询显示的编号为 0 的内核作为默认内核：

```shell
$ vim /etc/default/grub
GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR="$(sed 's, release .*$,,g' /etc/system-release)"
GRUB_DEFAULT=0
GRUB_DISABLE_SUBMENU=true
GRUB_TERMINAL_OUTPUT="console"
GRUB_CMDLINE_LINUX="crashkernel=auto rd.lvm.lv=cl/root rhgb quiet"
GRUB_DISABLE_RECOVERY="true"
```

#### 生成 grub 配置文件并重启

```shell
$ grub2-mkconfig -o /boot/grub2/grub.cfg
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-5.4.181-1.el7.elrepo.x86_64
Found initrd image: /boot/initramfs-5.4.181-1.el7.elrepo.x86_64.img
Found linux image: /boot/vmlinuz-3.10.0-1160.el7.x86_64
Found initrd image: /boot/initramfs-3.10.0-1160.el7.x86_64.img
Found linux image: /boot/vmlinuz-0-rescue-7d2155314bbf7543a1024df4ab69de3a
Found initrd image: /boot/initramfs-0-rescue-7d2155314bbf7543a1024df4ab69de3a.img
done
$ reboot
```

## 6、验证

```shell
$ uname -r
5.4.181-1.el7.elrepo.x86_64
```

## 7、删除旧内核（可选）

#### 查看系统中全部的内核：

```shell
$ rpm -qa | grep kernel
kernel-lt-5.4.181-1.el7.elrepo.x86_64
kernel-tools-libs-3.10.0-1160.el7.x86_64
kernel-3.10.0-1160.el7.x86_64
kernel-tools-3.10.0-1160.el7.x86_64
```

#### 方法1、yum remove 删除旧内核的 RPM 包

```shell
$ yum remove kernel-tools-libs-3.10.0-1160.el7.x86_64 \
kernel-3.10.0-1160.el7.x86_64 \
kernel-tools-3.10.0-1160.el7.x86_64
```

#### 方法2、yum-utils 工具

如果安装的内核不多于 3 个，`yum-utils` 工具不会删除任何一个。只有在安装的内核大于 3 个时，才会自动删除旧内核。

安装yum-utils

`$ yum install yum-utils`

删除旧版本　

`package-cleanup --oldkernels`
