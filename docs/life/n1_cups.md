# 使用一台电视盒子，把旧 HP 打印机秒变网络打印机

家里有一台老掉牙的 **HP LaserJet 1020**，打印质量一直不错，但最大的缺点就是**只能 USB 连接**。

如果每次打印都要插电脑，实在太麻烦了。刚好手里有一台吃灰的 **N1 电视盒子**，刷了 Armbian 后一直当作 Linux 小主机使用，于是决定把它改造成一台**网络打印服务器**。

整个过程不到半小时，完成后：

- Windows 自动发现打印机
- macOS 自动发现打印机
- Android 手机直接打印
- iPhone、iPad（支持 AirPrint）也可以直接打印

真正实现了一台老打印机"重获新生"。

## 硬件准备

- N1 电视盒子（或其它刷了 Armbian 的 ARM 设备）
- HP LaserJet 1020（其它 HP 打印机也基本类似）
- USB 数据线
- 局域网

系统环境：

- Armbian（Debian 系）

## 安装所需软件

安装三个软件即可：

```bash
apt update

apt install cups hplip avahi-daemon
```

它们分别负责：

| 软件         | 作用                                          |
| ------------ | --------------------------------------------- |
| cups         | Linux 打印服务器                              |
| hplip        | HP 官方 Linux 驱动                            |
| avahi-daemon | Bonjour / mDNS 服务，实现局域网自动发现打印机 |

## 连接打印机

将打印机通过 USB 连接到电视盒子，然后开机。

确认系统已经识别：

```bash
lsusb
```

能够看到类似：

```text
Bus 001 Device 003: Hewlett-Packard LaserJet 1020
```

说明硬件已经正常识别。

## 配置 CUPS

修改 CUPS 配置文件：

```bash
nano /etc/cups/cupsd.conf
```

### 修改监听地址

将

```text
Listen localhost:631
```

修改为：

```text
Listen 0.0.0.0:631
```

这样局域网其它设备才能访问 CUPS。

### 修改访问权限

把配置文件中的几处：

```text
Allow localhost
```

修改为：

```text
Allow all
```

通常需要修改四处（`/`、`/admin`、`/admin/conf` 等相关 `<Location>` 配置）。

## 初始化 HP 驱动

部分 HP 打印机需要下载官方插件。

执行：

```bash
hp-plugin
```

按照提示完成安装即可。

## 配置打印机

对于 HP1020：

```bash
hp-setup -i
```

进入命令行配置界面。

一路按照提示选择即可，驱动一般会自动识别。

配置完成以后，重启 CUPS：

```bash
systemctl restart cups
```

## 测试打印

浏览器打开：

```text
http://电视盒子IP:631
```

进入 CUPS 管理界面。

如果配置正确，就可以看到刚添加好的打印机。

建议：

- 打印一张测试页
- 确认打印正常
- 修改打印机名称
- 设置一个容易识别的位置（例如：书房、客厅）

这样以后局域网里的设备看到打印机时更容易区分。

## 自动发现打印机

由于安装了 **avahi-daemon**，它会自动将 CUPS 中的打印机通过 **mDNS（Bonjour）** 广播到局域网。

因此基本不需要再手动添加打印机。

我测试的设备均可直接发现：

- ✅ Windows
- ✅ macOS
- ✅ Android
- ✅ iPhone / iPad（AirPrint）

基本都是打开"添加打印机"后几秒钟就会自动出现，直接添加即可。

## 工作原理

整个流程其实很简单：

```text
USB 打印机
      │
      ▼
Armbian
 ├── CUPS（打印服务器）
 ├── HPLIP（HP 驱动）
 └── Avahi（Bonjour/mDNS）
      │
      ▼
局域网自动广播
      │
      ├── Windows
      ├── macOS
      ├── Linux
      ├── Android
      └── iPhone / iPad
```

其中：

- **CUPS** 负责接收打印任务。
- **HPLIP** 提供 HP 打印机驱动和固件支持。
- **Avahi** 负责局域网广播，让其它设备无需输入 IP 就能自动发现打印机。

## 总结

对于家里闲置的电视盒子来说，这算是一个非常实用的改造项目。

一台功耗只有几瓦的小设备，不仅可以承担 NAS、下载机等任务，还能顺便充当一台专业的网络打印服务器，让十几年前只能 USB 连接的老打印机重新支持现代网络打印。

整个方案成本几乎为零，却大幅提升了打印体验。如果你手里也有一台吃灰的电视盒子和一台老打印机，不妨试试看，让它们继续发挥余热。
