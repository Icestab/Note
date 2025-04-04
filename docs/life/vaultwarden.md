# 本地化部署 vaultwarden 密码管理工具

## 前言

如果非要说第一个密码管理工具那肯定大部分人都是浏览器自带的，但是浏览器自带的有很多弊端，所以严格意义上来说我接触的第一个是 iCloud 钥匙串，但是 iCloud 钥匙串的缺点也很明显，仅限于苹果生态使用，像我这样的大多数人就算有 iPhone 也不见得用 Mac，所以一款跨平台的密码管理工具就很有必要了。

**1password** 估计很多人都听过或者用过这款工具，没错我在当时也选择了它，很明显这款工具最大的缺点就是订阅制收费，所以在当时我选择和别人组队。但好景不长，一年后队长选择放弃，而我也无奈的只能导出我的所有密码，没有了 1password 总得找个替代品，在队长的推荐下所以我就选择了 **safe-in-cloud** 。这是一款使用免费，需要借助第三方工具同步的密码管理工具，但是其高级功能（生物识别收费，不过收费价格还算合理）所以我前前后后买过三次（Windows，iPhone，Android），一直使用到如今。

**Passkeys**

> Passkeys are an easier and more secure alternative to passwords. They let you sign-in with just your fingerprint, face scan, or screen lock.

在 Passkeys 的官网中，我们可以看到其对密码的描述，简单来说就是使用指纹、人脸识别、屏幕锁定等替代密码的方式，来替代传统的密码。重要的是现在越来越多的网站开始使用这种替代密码的方式，如果你是苹果全家桶，那么你是幸运的，因为苹果已经将这种替代密码的方式集成到了系统中，所以你只需要在系统设置中开启即可。不过对于 Android 和 Windows 来说，他们之间的并无法同步，虽然提供的跨设备访问 Passkeys 的功能，但是目前我使用无法成功使用，网上对于手机提供 Passkeys 给 PC 端使用的教程也少之又少，也找不到解决方法，所以部署一个本地的支持 Passkeys 的密码管理工具就很有必要了。很遗憾截止写稿时，safe-in-cloud 还没有提供支持 Passkeys 的版本，所以只能使用其他支持 Passkeys 的密码管理工具。

## 部署 vaultwarden

在 vaultwarden wiki 中有详细的部署教程，我在这里提供一总最快捷的部署方式，当然前提是你已经安装好了 Docker 和 Caddy（或者其他反向代理工具并配置了 HTTPS）。

Vaultwarden 是一个轻量级的 Bitwarden 服务器 API 实现，它用 Rust 编写，目标是提供一个低资源消耗的 Bitwarden 服务，适合个人和小型团队使用。下面将详细介绍如何快速部署 Vaultwarden，包括环境准备、安装步骤、配置以及安全性考量。

### 1. 环境准备

在开始部署之前，需要确保你的系统环境满足以下条件：

- **操作系统**：支持大多数 Linux 发行版，如 Ubuntu、Debian、CentOS 等。也可以在 Windows 和 macOS 上运行，但主要推荐在 Linux 服务器上部署。
- **硬件要求**：虽然 Vaultwarden 以低资源消耗闻名，但至少应确保有 1GB RAM 和 1GHz CPU，以保证运行的流畅性。磁盘空间根据你的用户量和存储的数据量来决定，起步至少需要 10GB。
- **网络配置**：确保服务器的指定端口（默认为 80 和 443）对外开放，以便用户访问 Vaultwarden 服务。

### 2. 安装步骤

#### 使用 Docker 部署（推荐）

1. **安装 Docker**：确保你的系统中安装了 Docker。可以访问 Docker 的官方文档来查找适合你操作系统的安装指南或者[玩客云刷 armbian 并安装 homeassistant](./oc/oc)这篇文件也提及了如何安装 docker。
2. **拉取 Vaultwarden 镜像**：在终端运行以下命令来拉取最新版本的 Vaultwarden Docker 镜像：
   ```sh
   docker pull vaultwarden/server:latest
   ```
3. **启动容器**：使用以下命令启动 Vaultwarden 容器：

   ```sh
   docker run -d --name vaultwarden -v /vw-data/:/data/ -p 80:80 vaultwarden/server
   ```

   这里`/vw-data/`是你想在主机上用于存储 Vaultwarden 数据的路径，`80:80`是端口映射配置，将容器的 80 端口映射到主机的 80 端口。

4. **docker-compose 部署**：如果你更喜欢使用 docker-compose 来进行部署，可以参考 Vaultwarden 的[官方文档](https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose),这篇文章详细提供包括 Caddy 在内的配置文件。如果你像我一样已经有了一个具备 HTTPS 的 Caddy 服务器，你只需要在`docker-compose.yml`中添加`vaultwarden`服务：
   ```yaml
   version: '3.8'
   services:
     vaultwarden:
       image: vaultwarden/server:latest
       container_name: vaultwarden
       network_mode: bridge #使用默认的桥接网络
       restart: always
       environment:
         TZ: 'Asia/Shanghai'
         ADMIN_TOKEN: 'xxxxxx' #设置管理员token
         SIGNUPS_ALLOWED: 'true' #允许注册，一般在第一次注册之后关闭
         SIGNUPS_VERIFY: 'true' #设置注册邮箱验证，此处设置需要配置好SMTP才生效
       volumes:
         - './data:/data' #在docker-compose.yml同级目录创建的文件夹
       ports:
         - '8888:80' #映射80端口
   ```
   你在其他地方可能会看到关于 websocket 的配置，我这里没有配置，因为翻阅官方文档后发现，Vaultwarden 默认已经支持 websocket，所以无需额外配置。

:::tip
避免管理员密码泄露，建议加密密码：`docker run --rm -it vaultwarden/server /vaultwarden hash`

执行命令后，会返回一个加密后的管理员密码，将其复制并使用`ADMIN_TOKEN`环境变量设置即可。
:::

### 3. 配置

- **环境变量**：Vaultwarden 支持通过环境变量来配置大多数设置。例如，设置管理员邮箱、SMTP 服务器等。具体的环境变量列表可以在 Vaultwarden wiki 中找到。
- **反向代理**：为了安全性考虑，建议使用 Nginx 或 Caddy 作为反向代理，并配置 SSL 以启用 HTTPS。这样可以确保数据传输的安全性。

下面提供一个官网的 caddy 例子：

```

# Uncomment this in addition with the import admin_redir statement allow access to the admin interface only from local networks
# (admin_redir) {
#        @admin {
#                path /admin*
#                not remote_ip private_ranges
#        }
#        redir @admin /
# }

{$DOMAIN} {
  log {
    level INFO
    output file {$LOG_FILE} {
      roll_size 10MB
      roll_keep 10
    }
  }

  # Uncomment this if you want to get a cert via ACME (Let's Encrypt or ZeroSSL).
  # tls {$EMAIL}

  # Or uncomment this if you're providing your own cert. You would also use this option
  # if you're running behind Cloudflare.
  # tls {$SSL_CERT_PATH} {$SSL_KEY_PATH}

  # This setting may have compatibility issues with some browsers
  # (e.g., attachment downloading on Firefox). Try disabling this
  # if you encounter issues.
  encode gzip

  # Uncomment to improve security (WARNING: only use if you understand the implications!)
  # If you want to use FIDO2 WebAuthn, set X-Frame-Options to "SAMEORIGIN" or the Browser will block those requests
  # header / {
  #	# Enable HTTP Strict Transport Security (HSTS)
  #	Strict-Transport-Security "max-age=31536000;"
  #	# Disable cross-site filter (XSS)
  #	X-XSS-Protection "0"
  #	# Disallow the site to be rendered within a frame (clickjacking protection)
  #	X-Frame-Options "DENY"
  #	# Prevent search engines from indexing (optional)
  #	X-Robots-Tag "noindex, nofollow"
  #	# Disallow sniffing of X-Content-Type-Options
  #	X-Content-Type-Options "nosniff"
  #	# Server name removing
  #	-Server
  #	# Remove X-Powered-By though this shouldn't be an issue, better opsec to remove
  #	-X-Powered-By
  #	# Remove Last-Modified because etag is the same and is as effective
  #	-Last-Modified
  # }

  # Uncomment to allow access to the admin interface only from local networks
  # import admin_redir

  # Proxy everything to Rocket
  # if located at a sub-path the reverse_proxy line will look like:
  #   reverse_proxy /subpath/* <SERVER>:80
  reverse_proxy <SERVER>:80 {
       # Send the true remote IP to Rocket, so that Vaultwarden can put this in the
       # log, so that fail2ban can ban the correct IP.
       header_up X-Real-IP {remote_host}
       # If you use Cloudflare proxying, replace remote_host with http.request.header.Cf-Connecting-Ip
       # See https://developers.cloudflare.com/support/troubleshooting/restoring-visitor-ips/restoring-original-visitor-ips/
       # and https://caddy.community/t/forward-auth-copy-headers-value-not-replaced/16998/4
  }
}
```

在这个例子中提供的配置方法和禁止外网访问的方法。如果需要，可以参考 Caddy 官方文档以获取更多信息。

提供一个另外的思路来禁止通过 caddy 访问 vaultwarden,这样的话你只能通过内网 ip 地址访问 vaultwarden 的 admin。

```

example.com {
    @notAdmin not path /admin*
    handle @notAdmin {
        reverse_proxy 127.0.0.1:8080
    }

    @admin path /admin*
    handle @admin {
        respond "Not Found" 404
    }
}
```

### 4. 安全性考量

- **启用 HTTPS**：强烈建议通过反向代理启用 HTTPS，以确保数据传输过程中的加密。
- **定期更新**：定期更新 Docker 镜像或 Vaultwarden 本身，以确保安全漏洞得到修复。
- **备份数据**：定期备份`/vw-data/`目录（对于 Docker 部署），以防数据丢失。
- **禁止外网访问**：如果 Vaultwarden 部署在公网上，请确保只允许内部网络访问 admin。

## 结语

部署 Vaultwarden 是一个相对简单的过程，尤其是通过 Docker。它提供了一个轻量级、安全的密码管理服务器解决方案，非常适合那些希望自己掌控数据的个人或小团队。遵循上述步骤，你可以快速启动并运行你自己的 Vaultwarden 实例。不过，别忘了定期更新和备份，保证系统的安全和数据的安全。
