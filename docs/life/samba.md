# armbian 启用 smb 共享

## 前言

最近购入了一款支持 usb3.0 的电视盒子，刷入 armbian 后运行一些 docker 容器，接入的硬盘还有充足的容量，便想着共享出来可以给电视看电视剧等。

**准备工作**

- 一台运行 Armbian 的电视盒子
- 一块连接到电视盒子的硬盘(可参考[这里](../study/questions/linux.html#_4-挂载-usb-硬盘并设置开机自动挂载)挂在硬盘)
- 可用于访问电视盒子的设备（例如，Windows 电脑或其他电视盒子）

## **步骤**

### 1.安装 Samba

Samba 是一个用于在 Linux 和 Windows 系统之间共享文件和打印机的软件包。使用以下命令安装 Samba：

```sh
apt install samba
```

### 2.创建用户并设置 Samba 密码

为了安全地访问 Samba 共享，你需要创建一个 Samba 用户并设置密码。使用以下命令创建用户：

```sh
useradd -M -s /usr/sbin/nologin smb_user
```

使用以下命令设置密码：

```
smbpasswd -a smb_user
```

**注意：**

- `smb_user` 是你创建的 Samba 用户名，可以根据你的喜好进行修改。

- `-M`不创建用户的 home 目录，`-s /usr/sbin/nologin`不允许用户登录系统。

- 密码需要符合 Samba 的密码策略，建议使用强度较高的密码。

### 3.创建共享目录

你需要创建一个目录来存储你要共享的文件。使用以下命令创建目录：

```sh
mkdir /mnt/usb/smbshare
```

**注意：**

- `/mnt/usb/smbshare` 是共享目录的路径，可以根据你的实际情况进行修改。

### 4.设置共享权限

你需要设置共享目录的权限，以便 Samba 用户可以访问它。使用以下命令设置权限：

```sh
sudo chmod -R 770 smbshare
sudo chown -R smb_user:smb_user smbshare
```

**解释：**

- `chmod -R 770 smbshare` 命令将共享目录的权限设置为 775，这意味着所属用户和组才可读写该目录中的文件。
- `chown -R smb_user:smb_user smbshare` 命令将共享目录的所有权更改为 `smb_user` 用户。

**注意：**

- 如果你的 Samba 用户是组成员 ，你可以将 `smb_user:smb_user` 替换为组名，个人使用就不讨论多用户了，如有需要可以再创建一个组把用户加入组内。

### 5.修改配置文件

Samba 的配置文件是 `/etc/samba/smb.conf`。你需要编辑此文件来配置 Samba 服务。

**注意：**

- 在编辑配置文件之前，请先备份它：

```sh
sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.backup
```

在配置文件中，找到以下部分并进行修改：

```conf
[global]
    workgroup = WORKGROUP
    log file = /var/log/samba/log.%m
    max log size = 1000
    logging = file
    panic action = /usr/share/samba/panic-action %d
    server role = standalone server
    obey pam restrictions = yes
    unix password sync = yes
    passwd program = /usr/bin/passwd %u
    passwd chat = *Enter\snew\s*\spassword:* %n\n *Retype\snew\s*\spassword:* %n\n *password\supdated\ssuccessfully* .
    pam password change = yes
    map to guest = bad user
    min protocol = SMB2
    max protocol = SMB3
[ssd]
    path = /mnt/usb/smbshare
    browseable = yes
    writable = yes
    guest ok = no
    read only = no
    valid users = smb_user
    create mask = 0644
    directory mask = 0755
    public = no
    available = yes
```

**解释：**

在 Samba 配置文件中，`[global]`部分包含了一些全局设置，这些设置适用于 Samba 服务的整体行为。下面是每个选项的解释：

- `workgroup = WORKGROUP`: 指定 Samba 服务器所在的工作组（通常与 Windows 网络中的工作组名称相对应）。
- `log file = /var/log/samba/log.%m`: 设置 Samba 日志文件的路径，`%m`会被替换为连接的客户端的主机名。
- `max log size = 1000`: 指定日志文件的最大大小（以 KB 为单位）。
- `logging = file`: 指定日志记录类型为文件。
- `panic action = /usr/share/samba/panic-action %d`: 当 Samba 遇到严重错误时的应急动作脚本。
- `server role = standalone server`: 指定服务器角色为独立服务器。
- `obey pam restrictions = yes`: 指定 Samba 应该遵守 PAM（Pluggable Authentication Modules）的限制。
- `unix password sync = yes`: 启用 Unix 密码和 Samba 密码的同步。
- `passwd program = /usr/bin/passwd %u`: 指定用于更改用户密码的程序。
- `passwd chat = *Enter\snew\s*\spassword:* %n\n *Retype\snew\s*\spassword:* %n\n *password\supdated\ssuccessfully* .`: 定义了密码更改时的对话流程。
- `pam password change = yes`: 允许使用 PAM 模块更改密码。
- `map to guest = bad user`: 将未验证的用户映射为 guest 用户。
- `min protocol = SMB2`: 设置 Samba 服务的最小协议版本为 SMB2。
- `max protocol = SMB3`: 设置 Samba 服务的最大协议版本为 SMB3。

  在`[smbshare]`部分，定义了一个名为`smbshare`的共享资源，具体设置如下：

- `path = /mnt/usb/smbshare`: 指定共享资源的路径。
- `browseable = yes`: 设置该共享资源在网络上是可见的。
- `writable = yes`: 允许用户写入该共享资源。
- `guest ok = no`: 不允许匿名访问。
- `read only = no`: 设置该共享资源不是只读的。
- `valid users = smb_user`: 指定可以访问该共享资源的有效用户。
- `create mask = 0644`: 设置创建文件的默认权限。
- `directory mask = 0755`: 设置创建目录的默认权限。
- `public = no`: 指定该共享资源不是公共的。
- `available = yes`: 指定该共享资源是可用的。

  这些设置共同定义了一个名为`smbshare`的 Samba 共享，它允许指定的用户读写挂载在`/mnt/usb/smbshare`路径的存储设备。

### 6.重启 Samba 服务

为了使配置生效，你需要重启 Samba 服务：

```
systemctl restart smbd.service
```

### 7.访问 Samba 共享

现在，你应该能够从 Windows 或 Linux 客户端访问 Samba 共享了。

**在 Windows 上**

1. 打开文件资源管理器。
2. 在地址栏中输入 `\\ip_address\smbshare`，其中 `ip_address` 是电视盒子的 IP 地址。
3. 按下 Enter 键即可访问共享目录。

**在 Linux 上**

1. 打开文件管理器。
2. 在地址栏中输入 `smb://ip_address/smbshare`，其中 `ip_address` 是电视盒子的 IP 地址。
3. 按下 Enter 键即可访问共享目录。

**注意：**

- 确保你的防火墙设置允许 SMB 流量通过（默认端口为 139 和 445）。

**高级配置**

Samba 提供了多种配置选项，可以满足你的各种需求。
