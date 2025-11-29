# 在 WSL 下 Arch Linux 使用 fish Shell 配置代理，顺利完成 Docker 镜像拉取、构建和推送

## 引言

在 Windows 的 WSL 环境中运行 Arch Linux，使用 Docker 进行镜像管理时，网络代理配置常常成为瓶颈。本文分享如何在 fish shell 环境下配置代理，使 Docker 命令 `pull`、`build`、`login` 和 `push` 都能顺利使用代理访问网络。

---

## 环境说明

- 操作系统：Windows 10/11，WSL 2
- 发行版：Arch Linux（安装于 WSL）
- Shell：fish shell
- 代理类型：Socks5 代理，通过 HTTP 代理端口暴露
- 代理端口示例：`http://<代理地址>:<端口>`

---

## 一、fish shell 环境下代理变量配置

Fish shell 不同于 bash，环境变量设置有特殊语法。正确设置代理环境变量示例如下：

```fish
set -x http_proxy http://<代理地址>:<端口>
set -x https_proxy http://<代理地址>:<端口>
set -x HTTP_PROXY http://<代理地址>:<端口>
set -x HTTPS_PROXY http://<代理地址>:<端口>
```

> 注意 fish 会自动导出大写版本变量，即使你写的是小写。

---

## 二、Docker 守护进程代理配置

编辑 `/etc/docker/daemon.json`，配置 Docker daemon 的代理：

```json
{
  "proxies": {
    "http-proxy": "http://<代理地址>:<端口>",
    "https-proxy": "http://<代理地址>:<端口>"
  }
}
```

> 这里注意字段名称必须用中横线（kebab-case），否则 Docker 守护进程会因不识别字段启动失败。

重启 Docker：

```bash
sudo systemctl restart docker
```

---

## 三、Docker build 阶段代理配置

Docker build 阶段不自动继承守护进程代理，需手动传入 build 参数：

```bash
docker build \
  --build-arg HTTP_PROXY=http://<代理地址>:<端口> \
  --build-arg HTTPS_PROXY=http://<代理地址>:<端口> \
  --build-arg http_proxy=http://<代理地址>:<端口> \
  --build-arg https_proxy=http://<代理地址>:<端口> \
  -t myimage .
```

如需频繁构建可在 Dockerfile 中添加：

```Dockerfile
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG http_proxy
ARG https_proxy
```

这样保证 Go 等工具能顺利拉取依赖。

---

## 四、Docker 登录与推送

Docker 登录提示凭据未加密存储，这在 WSL 下属正常现象，风险较低。

```bash
docker login
```

输入账户密码后即可推送镜像：

```bash
docker push myimage:tag
```

---

## 五、总结

通过以上配置，成功解决 WSL Arch Linux 下 Docker 网络代理问题，实现了：

- 代理环境变量在 fish shell 的正确设置
- Docker daemon 代理配置的正确格式
- Docker build 阶段代理传递
- Docker 登录与推送的正常进行

希望本文能帮到同样在 WSL 环境下遇到代理瓶颈的朋友！
