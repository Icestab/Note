# 使用 Certbot 自动获取 SSL 证书并自动更新

## 前言

近期免费证书有效期从 1 年缩短到 3 个月，避免经常要上云平台手动申请，所以想找个工具可以简单的申请、续期证书。通过了解，发现 Certbot 工具，但官方没提供 Dnspod 插件，于是找了 Python3 的插件用于获取。
::: tip 提示
如果你的是服务器有 80 或者 443 端口那么直接获取证书就行，此教程是为了解决家庭网络（无 80 或 443），例如 NAS 的证书需求。
:::
你在 `apt` 上找不到 `python3-certbot-dns-dnspod` 插件的原因是，它并没有直接在 `apt` 仓库中提供。为了使用 DNSPod 插件，你需要从 `Certbot` 官方插件库中手动安装插件。

### 解决方案：使用 `Certbot` 和 DNSPod 插件

### 步骤 1: 安装 `Certbot` 和相关依赖

首先，确保你已经安装了 `Certbot`：

```bash
sudo apt update
sudo apt install certbot
```

### 步骤 2: 使用 `pip` 安装 DNSPod 插件

你需要使用 `pip` 来安装 DNSPod 插件。首先，确保你已经安装了 `pip`，然后使用 `pip` 安装 `certbot-dnspod` 插件。

1. 安装 `pip`（如果还没有安装）：

   ```bash
   sudo apt install python3-pip
   ```

2. 使用 `pip` 安装 `certbot-dnspod` 插件：

   ```bash
   sudo pip3 install certbot-dnspod
   ```

::: tip 提示
如果提示无法安装可以参考说明强行安装(--break-system-packages)，不建议用虚拟环境使用，因为后续配置定时任务不方便。
:::

### 步骤 3: 配置 DNSPod API 密钥

1. 登录到 **DNSPod** 并创建 API 密钥。你可以在 DNSPod 控制台的【API】页面生成 API 密钥和 API Secret。

2. 创建配置文件以存储 DNSPod API 密钥。通常，这个文件存放在 `~/.secrets/certbot/dnspod.ini`，内容如下：

   ```ini
   certbot_dnspod_token_id = <your token id>
   certbot_dnspod_token = <your token>
   ```

   确保文件的权限是安全的：

   ```bash
   sudo chmod 600 ~/.secrets/certbot/dnspod.ini
   ```

### 步骤 4: 使用 DNSPod 插件申请证书

使用以下命令来申请证书：

```bash
sudo certbot certonly \
--authenticator certbot-dnspod \
--certbot-dnspod-credentials ~/.secrets/certbot/dnspod.ini \
-d example.com
```

- `--authenticator certbot-dnspod`：指定使用 DNSPod 插件。
- `--dns-dnspod-credentials ~/.secrets/certbot/dnspod.ini`：指定存储 API 密钥的配置文件。
- `-d yourdomain.com`：指定你要申请证书的域名。

### 步骤 5: 配置 Caddy 使用 Certbot 获取的证书

`Certbot` 会将证书存储在 `/etc/letsencrypt` 目录下，你可以在 Caddy 中使用这些证书。修改 `Caddyfile` 以指定证书文件路径：

```text
yourdomain.com {
    tls /etc/letsencrypt/live/yourdomain.com/fullchain.pem /etc/letsencrypt/live/yourdomain.com/privkey.pem
    reverse_proxy localhost:8080
}
```

### 步骤 6: 设置自动续期

通过设置 `cron` 或 `systemd` 定时任务，定期运行 `certbot renew` 命令来自动续期证书。

例如，使用 `cron`：

```bash
sudo crontab -e
```

添加以下行来每天自动检查并续期证书：

```bash
0 0 * * * certbot renew --quiet && systemctl reload caddy
```

### 更好的方法：使用 `certbot` 的钩子（hook）

`certbot` 提供了钩子（hooks）功能，可以在证书续期成功后执行指定的命令。你可以使用 `deploy-hook` 来仅在证书成功续期时重载 Caddy。

#### 使用 `deploy-hook`：

你可以通过设置 `certbot` 的钩子来确保只有在证书成功续期后，才会执行 `systemctl reload caddy`：

```bash
0 0 * * * certbot renew --quiet --deploy-hook "systemctl reload caddy"
```

解释：

- `--deploy-hook`：当证书续期成功时，会执行 `--deploy-hook` 后的命令。只有当证书被更新时，这个命令才会被执行。

这样，只有在 `certbot` 续期成功时，`systemctl reload caddy` 才会被执行。如果证书未续期，Caddy 不会被重新加载。

### 总结

本文介绍了如何通过 Certbot 和 DNSPod 插件自动化获取和更新 SSL 证书，尤其适用于没有 80 或 443 端口的家庭网络或 NAS 环境。通过以下步骤实现：

1. 安装 Certbot 工具和 `certbot-dnspod` 插件。
2. 配置 DNSPod API 密钥并安全存储。
3. 使用 DNSPod 插件通过 Certbot 申请 SSL 证书。
4. 配置 Caddy 使用 Certbot 获取的证书。
5. 设置自动续期机制，确保证书定期更新，避免过期。

通过这些步骤，你可以简化证书管理，确保网站的安全性始终得到保障。
