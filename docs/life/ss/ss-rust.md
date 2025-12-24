# Debian 13 上部署 shadowsocks-rust：从官方下载到 systemd 管理的完整实践

> 目标：**稳定、自用、可维护**
> 不追求“玄学优化”，不依赖一键脚，不引入不必要的组件。

## 一、背景说明

Shadowsocks Rust（shadowsocks-rust）是目前最成熟、最现代的 Shadowsocks 实现之一，但官方**并未提供 apt 仓库**，仅提供：

- GitHub Releases（二进制）
- snap 包

由于 snap 对网络服务存在诸多限制（sandbox、权限、systemd 行为不透明），本文选择：

> **直接使用官方 Releases 二进制 + systemd 管理**

适用环境：

- Debian 13
- 自用节点
- 少量客户端（手机 / 路由器 / PC）

## 二、直接在 Debian 上下载 shadowsocks-rust Releases

### 1️⃣ 确认系统架构

```bash
uname -m
```

常见结果：

- `x86_64`
- `aarch64`

### 2️⃣ 从 GitHub Releases 下载（二进制）

以下示例以 **x86_64 Linux GNU** 为例（版本号按需替换）：

```bash
cd /tmp

wget https://github.com/shadowsocks/shadowsocks-rust/releases/download/v1.24.0/shadowsocks-v1.19.4.x86_64-unknown-linux-gnu.tar.xz
```

或使用 `curl`：

```bash
curl -LO https://github.com/shadowsocks/shadowsocks-rust/releases/download/v1.24.0/shadowsocks-v1.19.4.x86_64-unknown-linux-gnu.tar.xz
```

### 3️⃣ 解压并安装到 /usr/local/bin

```bash
tar -xf shadowsocks-v1.24.0.x86_64-unknown-linux-gnu.tar.xz

sudo install -m 0755 ssserver ssservice ssurl /usr/local/bin/
```

验证：

```bash
ssserver -V
```

## 三、生成 2022 AEAD 密钥

不使用人工输入的“密码”，而是使用 **Shadowsocks 2022 AEAD 的随机 key**。

```bash
ssservice genkey -m "2022-blake3-aes-256-gcm"
```

输出示例（截断）：

```text
U4x7Pp9e7YpZ0cZb...
```

> key 很长是**正常且正确的**，它不是口令，而是加密材料。

## 四、编写 JSON 配置文件

示例路径：

```bash
/etc/shadowsocks-rust/server.json
```

示例内容：

```json
{
  "server": "0.0.0.0",
  "server_port": 8388,
  "method": "2022-blake3-aes-256-gcm",
  "password": "上一步生成的完整 key",
  "timeout": 300,
  "mode": "tcp_and_udp"
}
```

JSON 的优点：

- 避免在 CLI 中处理超长 key
- 配合 systemd 更稳定
- 可读、可维护
- ["::", "0.0.0.0"]在 rust 无效，如需同时监听 IPV4 和 IPV6 请直接写 "::"

## 五、编写 systemd 服务文件

这是**本文的重点部分**。

### 1️⃣ 创建 systemd unit

```bash
sudo nano /etc/systemd/system/shadowsocks-rust.service
```

内容如下：

```ini
[Unit]
Description=Shadowsocks Rust Server
After=network.target
Wants=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/ssserver -c /etc/shadowsocks-rust/server.json
Restart=on-failure
RestartSec=5

# 基础安全加固（不过度）
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 说明

- **不使用 snap**
- **不使用环境变量注入**
- **不强行调 nofile**
- unit 行为一眼可读，方便以后自己或别人接手

### 2️⃣ 启动并设置开机自启

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now shadowsocks-rust
```

查看状态：

```bash
systemctl status shadowsocks-rust
```

查看日志：

```bash
journalctl -u shadowsocks-rust -f
```

## 六、导出连接信息：ssurl + 二维码

### 1️⃣ 使用 ssurl 生成连接

```bash
ssurl --encode /etc/shadowsocks-rust/config.json
```

输出示例：

```text
ss://....
```

### 2️⃣ 使用 qrencode 生成二维码（方便手机）

安装工具：

```bash
sudo apt install qrencode
```

生成二维码：

```bash
ssurl --encode /etc/shadowsocks-rust/config.json | qrencode -t ANSIUTF8
```

效果：

- 手机端扫码即用
- 避免手动复制长 key
- 几乎 0 出错率

## 七、内核参数：只启用 BBR + fq

不堆参数，只启用 **真正有意义的组合**。

```bash
cat >/etc/sysctl.d/99-bbr-fq.conf <<'EOF'
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
EOF

sysctl --system
```

验证：

```bash
sysctl net.ipv4.tcp_congestion_control
sysctl net.core.default_qdisc
```

## 八、关于 nofile / ulimit

对于自用 shadowsocks-rust：

- 连接数低
- 长连接为主
- 默认 1024 / 4096 FD 完全足够

`nofile` 是**容量上限，不是性能优化项**，不刻意修改。

## 九、总结

这套部署方案的核心思想是：

> **只做“必要且有明确收益”的事情**

最终得到的是：

- 官方二进制
- systemd 管理
- 现代加密体系
- 清晰、可回滚的配置
- 极低的维护成本

对一个 **长期自用的 shadowsocks-rust 节点** 来说，这已经是可以放心运行、无需频繁干预的状态。
