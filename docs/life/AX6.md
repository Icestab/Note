# 小米 Redmi AX6 自定义 OpenWrt 固件编译全记录

> 从 AC2100+N1 旁路由到一台高性能主力路由的升级之路

使用 AC2100 + N1 旁路由的组合我已经坚持了多年。
AC2100 作为主路由其实日常使用问题不大，但由于它的硬件性能有限，想要承担更多负载、作为科学上网流量入口时明显有些吃力。因此我通过 N1 盒子做旁路由，依靠它优秀的 **AES 加密能力** 来跑代理功能。
虽然这种方案运行稳定，但旁路由本质上使用起来还是麻烦：

- 需要复杂的 DHCP、路由策略
- 一旦主路由或旁路由掉线，家里网络容易出问题
- 插两个设备既费电也占空间

因此我一直想找到一台能够同时满足主路由和科学上网需求的设备。经过长期物色，我最终选择了 **小米 Redmi AX6**。

## 为什么选择红米 AX6？

理由主要有以下几点：

### ① 价格便宜

二手市场常见**不到 100 元**即可入手，性价比极高。

### ② 性能强劲

- Qualcomm IPQ8071A SoC
- 4 核 A53 CPU
- NSS 加速能力（可用于路由转发加速）
  这性能足以代替 N1 作为主力科学上网机器。

### ③ 社区极其活跃

AX6 是 OpenWrt 社区热门机型之一，不仅有大量现成的编译固件，还有许多开发者提供源码，便于我们自行定制固件。

在众多仓库中，我主要参考了以下两个优秀项目：

- **固件源码：**
  [https://github.com/VIKINGYFY/immortalwrt](https://github.com/VIKINGYFY/immortalwrt)
- **编译流程参考：**
  [https://github.com/fightroad/AX6-OpenWRT](https://github.com/fightroad/AX6-OpenWRT)

非常感谢这两位作者的付出，让我能够顺利完成这次自定义固件编译。

---

## 一、破解 AX6 并刷入过渡固件

要想给 AX6 刷入自己编译的 OpenWrt，第一步当然是破解。

我参考了恩山的这篇教程，流程清晰且成功率高：
👉 [https://www.right.com.cn/forum/thread-8455880-1-1.html](https://www.right.com.cn/forum/thread-8455880-1-1.html)

完成后，你可以选择刷入作者推荐的固件，或继续往下进行完全自定义固件的编译。

---

## 二、自定义 OpenWrt 固件编译

既然想替代 AC2100 + N1 的组合，我的目标是：

- 保证主路由基本功能
- 保留当前旁路由使用的所有代理功能
- **尽量保持固件简洁、高性能**

因此我需要的插件如下：

| 功能     | 插件              |
| -------- | ----------------- |
| 科学上网 | luci-app-ssr-plus |
| 代理增强 | mosdns            |
| DDNS     | ddns-go           |
| VPN      | wireguard-tools   |
| 网络服务 | UPnP              |
| 网络唤醒 | WOL               |
| 应用管理 | istorex           |

因为**现成固件不是太臃肿，就是缺插件**，所以只能亲自编译。

幸运的是，fightroad 的 AX6 项目给出了完整的编译示例：
👉 [https://github.com/fightroad/AX6-OpenWRT](https://github.com/fightroad/AX6-OpenWRT)

我们要做的只是：

### ① 在 `diy.sh` 中加入所需插件

例如添加 SSR-Plus、mosdns、ddns-go 等 feed 源。

### ② 进入 `make menuconfig` 清理不需要的组件

把没必要的默认插件取消，比如：

- openvpn
- samba
- 过多的 luci app
- 不需要的 IPv6 工具
- sing-box（如果你用 SSR-Plus）

### ③ 执行编译

```
make defconfig
make -j$(nproc)
```

阿里云 / 腾讯云等服务器速度很快，我的编译基本一次成功。

编译成果仓库：
👉 [https://github.com/Icestab/AX6-OpenWRT](https://github.com/Icestab/AX6-OpenWRT)

欢迎有兴趣的朋友下载体验，也欢迎 PR 或讨论。

---

## 三、一些额外经验分享

### 1. 关于 WSL 或 Linux 环境编译

我一开始用 WSL2 Ubuntu 编译，但遇到 PATH 空间问题、磁盘空间不足等问题，后来改用云服务器效率更高。

### 2. 关于镜像源下载慢

编译工具链（toolchain）常常卡在慢速镜像上，这与 download 脚本的镜像顺序有关。如果你在海外机器上编译，可以考虑修改下载脚本，移除中国镜像源以提高速度。

### 3. 高性能机器的加速编译技巧

如 32C64G 机器，可使用：

```
make -j$(nproc)
```

并用 tmpfs 加速：

```
export FORCE_UNSAFE_CONFIGURE=1
```

或将 build_dir、staging_dir 等放进 RAM（若内存足够）。

---

## 四、总结：AX6 是 AC2100+N1 升级的完美选择

经过这次编译和部署，我可以很好地确认：

- AX6 性能足以替代 AC2100 + N1
- 自定义固件让功能完全可控
- 运行稳定，功耗更低
- 社区资源丰富，可长期维护

如果你也在寻找一款百元级的高性能 OpenWrt 路由器，AX6 绝对值得考虑。

---

## 后记

在继续研究自动化编译的时候发现 VIKINGYFY 作者有自己的自动化编译模版[OpenWRT-CI](https://github.com/VIKINGYFY/OpenWRT-CI),我根据我的需求自己修改了一下[红米 AX6 个人 fork 版本](https://github.com/Icestab/OpenWRT-CI),专用于 AX6 固件编译。
