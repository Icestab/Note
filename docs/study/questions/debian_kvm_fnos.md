# 无图形界面 Debian 用 KVM 安装飞牛 fnOS 完整指南

> **适用场景**：宿主机是纯命令行的 Debian 服务器，没有图形界面，通过 VNC 远程完成虚拟机安装。飞牛作为 NAS 系统，需要桥接网络实现局域网内独立访问。

## 环境说明

- **宿主机**：Debian 12（无桌面环境）
- **物理网卡**：`enp1s0`（你的可能不同，先用 `ip a` 确认）
- **目标**：创建飞牛虚拟机，桥接网络，两块数据盘

## 一、检测虚拟化支持

```bash
# 检查 CPU 是否支持虚拟化（Intel 看 vmx，AMD 看 svm）
grep -E "vmx|svm" /proc/cpuinfo

# 查看虚拟化类型
lscpu | grep -i virtualization

# 检查 KVM 模块是否加载
lsmod | grep kvm
```

如果有输出，说明软硬件都支持，可以继续。

## 二、安装 KVM 核心组件

```bash
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virtinst libosinfo-bin

# 启动 libvirtd 并设置开机自启
sudo systemctl enable --now libvirtd

# 验证安装
sudo virsh list --all
```

## 三、配置桥接网络（br0）

飞牛需要桥接网络才能被局域网内其他设备直接访问。这里用最传统的 `/etc/network/interfaces` 方式，不依赖 NetworkManager。

### 3.1 确认物理网卡名称

```bash
ip a
```

找到实际物理网卡名，本例假设为 `enp1s0`。

### 3.2 备份原配置

```bash
sudo cp /etc/network/interfaces /etc/network/interfaces.backup
```

### 3.3 编辑配置文件

```bash
sudo nano /etc/network/interfaces
```

替换为以下内容（根据你的网络类型选择）：

#### 情形 A：DHCP 自动获取 IP（大多数家庭网络）

```ini
# 回环接口
auto lo
iface lo inet loopback

# 物理网卡设为手动模式
auto enp1s0
iface enp1s0 inet manual

# 网桥配置（DHCP）
auto br0
iface br0 inet dhcp
    bridge_ports enp1s0
    bridge_stp off
    bridge_fd 0
    bridge_maxwait 0
```

#### 情形 B：静态 IP（服务器常用）

```ini
auto lo
iface lo inet loopback

auto enp1s0
iface enp1s0 inet manual

auto br0
iface br0 inet static
    address 192.168.1.100        # 换成你的 IP
    netmask 255.255.255.0
    gateway 192.168.1.1          # 换成你的网关
    dns-nameservers 8.8.8.8 114.114.114.114
    bridge_ports enp1s0
    bridge_stp off
    bridge_fd 0
    bridge_maxwait 0
```

### 3.4 网桥参数说明

| 参数 | 作用 |
| | - |
| `bridge_stp off` | 关闭生成树协议，避免 30 秒阻塞延迟 |
| `bridge_fd 0` | 转发延迟设为 0，接口启用即转发数据 |
| `bridge_maxwait 0` | 取消启动等待，加快系统启动速度 |

这三个参数让网桥"零延迟"启动，家庭环境完全适用。

### 3.5 重启网络使配置生效

```bash
sudo systemctl restart networking
```

> **提示**：此步骤会导致网络短暂中断几秒，SSH 连接可能断开，稍后重新连接即可。

### 3.6 验证桥接是否成功

```bash
ip a show br0      # 应该能看到 br0 拿到了 IP
bridge link        # 应该能看到 enp1s0 是 br0 的从属接口
```

### 3.7 放行桥接流量（如有防火墙）

```bash
sudo nft add rule ip filter FORWARD iifname "br0" accept
sudo nft add rule ip filter FORWARD oifname "br0" accept
```

> 如果没有使用 nftables 防火墙，可以跳过此步。

## 四、下载飞牛镜像并创建虚拟机

### 4.1 下载系统镜像

```bash
# 前往 fnnas.com 获取最新下载链接
wget -O ~/fnos.iso https://fnnas.com/download/fnos/latest/fnos.iso
```

### 4.2 创建存储目录

```bash
sudo mkdir -p /mnt/data/vm
sudo chown -R qemu:qemu /mnt/data/vm
```

### 4.3 创建虚拟机（系统盘 + 两块数据盘）

以下命令一条搞定，系统盘 64GB，数据盘 100GB 和 200GB：

```bash
sudo virt-install \
  --name fnos \
  --memory 4096 \
  --vcpus 2 \
  --os-variant debian11 \
  --cdrom ~/fnos.iso \
  --network bridge=br0 \
  --graphics vnc,listen=0.0.0.0,port=5900 \
  --noautoconsole \
  --disk path=/mnt/data/vm/fnos.qcow2,size=64,format=qcow2 \
  --disk path=/mnt/data/vm/fnos-data1.qcow2,size=100,format=qcow2 \
  --disk path=/mnt/data/vm/fnos-data2.qcow2,size=200,format=qcow2
```

**参数说明**：

| 参数                       | 说明                                               |
| -------------------------- | -------------------------------------------------- |
| `--name fnos`              | 虚拟机名称                                         |
| `--memory 4096`            | 内存 4GB                                           |
| `--vcpus 2`                | 2 核 CPU                                           |
| `--os-variant debian11`    | 使用 Debian 11 硬件模板（兼容性最好）              |
| `--cdrom ~/fnos.iso`       | 挂载安装镜像                                       |
| `--network bridge=br0`     | 桥接网络，独立 IP                                  |
| `--graphics vnc...`        | 开启 VNC 远程桌面，端口 5900                       |
| `--disk path=...,size=...` | 创建虚拟磁盘，三块盘依次是系统盘、数据盘1、数据盘2 |

> **关于 `--os-variant debian11`**：飞牛基于 Debian 12，但你的 KVM 模板库可能只到 Debian 11，使用 debian11 模板完全兼容，对系统运行无任何影响。

## 五、通过 VNC 远程完成系统安装

### 5.1 确认虚拟机状态

```bash
sudo virsh list --all | grep fnos
```

状态为 `running` 即正常。

### 5.2 用 VNC 客户端连接

在你的另一台电脑上打开 **VNC Viewer**（或 Windows 远程桌面），连接：

```
<你的Debian服务器IP>:5900
```

### 5.3 按提示完成安装

- 选择语言、时区
- 磁盘分区：建议选择第一块盘（vda）作为系统盘
- 设置管理员账号密码
- 等待安装完成

### 5.4 安装完成后的处理

安装完成后系统提示重启，**直接关闭 VNC 窗口**，回到宿主机命令行：

```bash
# 强制关机
sudo virsh destroy fnos

# 查看当前磁盘列表
sudo virsh domblklist fnos
```

输出中如果 `sda` 显示为 `-`（无挂载镜像），说明光盘已自动弹出，无需额外操作。

如果 `sda` 仍显示 ISO 路径，执行：

```bash
sudo virsh change-media fnos sda --eject
```

> 报错 `No disk found whose source path or target is hdc`？说明光驱设备名不是 `hdc`，用 `virsh domblklist fnos` 确认实际名称后替换。

### 5.5 重新启动虚拟机

```bash
sudo virsh start fnos
```

## 六、访问飞牛 NAS 进行初始化

### 6.1 获取虚拟机 IP

```bash
# 方法一：用 virsh 查询
sudo virsh domifaddr fnos

# 方法二：去路由器后台查看新增设备
```

### 6.2 浏览器访问

打开浏览器输入：

```
http://<飞牛IP>:8000
```

按页面指引完成首次初始化设置。

### 6.3 初始化存储空间

登录飞牛后台后，在 **存储管理** 中可以看到三块磁盘：

- **vda**：系统盘（不要动它）
- **vdb**：数据盘1（100GB）
- **vdc**：数据盘2（200GB）

格式化并创建存储空间，即可开始使用。

## 七、常用 virsh 管理命令速查

### 虚拟机生命周期

| 命令                                  | 作用                 |
| ------------------------------------- | -------------------- |
| `sudo virsh list --all`               | 查看所有虚拟机状态   |
| `sudo virsh start fnos`               | 启动                 |
| `sudo virsh shutdown fnos`            | 正常关机             |
| `sudo virsh destroy fnos`             | 强制断电（卡死时用） |
| `sudo virsh autostart fnos`           | 设置开机自启         |
| `sudo virsh autostart --disable fnos` | 取消自启             |

### 信息查看

| 命令 | 作用 |
| - | |
| `sudo virsh dominfo fnos` | 查看详细信息 |
| `sudo virsh domifaddr fnos` | 查看 IP 地址 |
| `sudo virsh domblklist fnos` | 查看磁盘列表 |
| `sudo virsh domstats fnos` | 性能统计 |

### 配置编辑

| 命令                                   | 作用          |
| -------------------------------------- | ------------- |
| `sudo virsh edit fnos`                 | 编辑 XML 配置 |
| `sudo virsh dumpxml fnos > backup.xml` | 导出备份      |

### 磁盘管理

| 命令 | 作用 |
| | -- |
| `qemu-img create -f qcow2 /path/disk.qcow2 100G` | 创建新磁盘文件 |
| `sudo virsh attach-disk fnos /path/disk.qcow2 vdd --persistent` | 热添加磁盘 |
| `sudo virsh blockresize fnos vdb 200G` | 在线扩容磁盘 |

## 八、排错锦囊

### 虚拟机无法启动

```bash
# 查看错误日志
sudo journalctl -xeu libvirtd | tail -50
sudo tail -50 /var/log/libvirt/qemu/fnos.log
```

### 桥接网络不通

```bash
# 确认 br0 拿到 IP
ip a show br0

# 确认桥接成员
bridge link

# 手动给虚拟机重新分配网络
sudo virsh destroy fnos
sudo virsh start fnos
```

### 宿主机重启后虚拟机不自动运行

```bash
# 设置开机自启
sudo virsh autostart fnos

# 确认状态
sudo virsh dominfo fnos | grep Autostart
```

### VNC 连接不上

```bash
# 确认 VNC 端口监听
sudo ss -tlnp | grep 5900

# 检查防火墙
sudo ufw status  # 如果用了 ufw
sudo nft list ruleset  # 如果用了 nftables
```

## 九、可选：宿主机文件共享给飞牛

如果想把宿主机上的文件共享给飞牛使用，推荐用 **Virtiofs**（性能最好）：

```bash
# 编辑虚拟机配置
sudo virsh edit fnos
```

在 `<domain>` 标签内添加：

```xml
<memoryBacking>
  <access mode="shared"/>
</memoryBacking>

<devices>
  ...
  <filesystem type="mount" accessmode="passthrough">
    <driver type="virtiofs"/>
    <source dir="/home/user/shared"/>
    <target dir="hostshare"/>
  </filesystem>
</devices>
```

保存后重启虚拟机，在飞牛里挂载：

```bash
sudo mount -t virtiofs hostshare /mnt/host-share
```

> 注意：飞牛相册、影视等套件仅支持 SMB/NFS 远程挂载路径，如需给套件使用，建议在宿主机搭建 Samba 服务，然后在飞牛后台通过远程挂载连接。
