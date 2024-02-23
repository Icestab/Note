# Python 离线环境部署指南

在某些情况下，我们可能无法直接通过互联网安装 Python 第三方库，这可能是由于网络限制、安全策略或其他因素导致的。这时，离线安装 Python 库就显得尤为重要。本文将指导您如何在一台联网的电脑上下载所需的 Python 库及其依赖项，并在另一台无法联网的电脑上进行安装。

## 1.导出项目依赖

首先，我们需要确定项目所依赖的所有 Python 库。在有网络的环境中，通过以下命令可以将当前环境中安装的所有库及其版本导出到一个文本文件中：

```shell
pip freeze > requirements.txt
```

此命令会创建一个`requirements.txt`文件，其中列出了所有已安装库的名称和版本号，这为我们接下来下载这些库提供了依据。

## 2.下载所有依赖

接下来，我们将使用`pip download`命令来下载`requirements.txt`文件中列出的所有库及其依赖项。这一步骤需要在一台能够访问互联网的电脑上进行：

```shell
pip download -r requirements.txt -d ./tmp
```

此命令会将所有必需的包下载到当前目录下的`tmp`文件夹中。`-d ./tmp`指定了下载目录，您可以根据需要更改此目录。

## 3.批量离线安装

最后，我们需要将下载的包以及`requirements.txt`文件复制到目标电脑上。在目标电脑上，我们将使用`pip install`命令来安装这些包，命令如下：

```shell
pip install --no-index --find-links=./tmp -r requirements.txt --target=DIR
```

- `--no-index`告诉 pip 不要使用 Python 包索引(PyPI)。
- `--find-links=./tmp`指定 pip 在哪里查找下载的包。请确保路径与您存放包的实际路径相匹配。
- `--target=DIR`指定了包安装的目标目录，您可以根据需要更改此目录。

通过以上步骤，您可以在没有互联网连接的环境中安装 Python 库及其依赖项，极大地方便了在受限环境中的 Python 项目部署。

## 补充：使用 pypi-server 搭建私有 PyPI 服务器

在讨论 Python 离线环境部署的过程中，一个值得提及的解决方案是搭建私有的 PyPI 服务器，这对于管理和分发企业内部的 Python 包尤为重要。`pypi-server`是一个流行的工具，可以帮助您搭建一个轻量级的 PyPI 兼容服务器，让您能够在本地网络中托管和分发 Python 包。

### pypi-server 简介

`pypi-server`（也称为`pypiserver`）是一个极简的 PyPI 兼容服务器，它允许您在内部网络中部署自己的包索引服务。这对于以下场景非常有用：

- 在没有互联网连接的环境中分发 Python 包。
- 分发私有的 Python 包，这些包不适合或不希望发布到公共 PyPI 上。
- 加速依赖包的安装过程，尤其是在大型团队或多人协作的项目中。

### 搭建 pypi-server

搭建`pypi-server`的过程相对简单，以下是基本的步骤：

1. **安装 pypi-server：** 首先，在一台能够连接互联网的机器上安装`pypiserver`。通常，您可以通过 pip 进行安装：

   ```bash
   pip install pypiserver
   ```

2. **准备包文件夹：** 创建一个文件夹来存放您的包。将所有`.whl`和`.tar.gz`格式的包复制到此文件夹中。

3. **启动服务器：** 使用以下命令启动`pypi-server`，其中`/path/to/packages/`是您存放包的文件夹路径：

   ```bash
   pypi-server -p 8080 /path/to/packages/
   #或
   pipy-server run --port 8080 /path/to/packages/
   ```

   这将在本地的 8080 端口启动服务器。您可以根据实际情况选择合适的端口。

4. **使用私有服务器：** 在需要安装包的机器上，通过修改 pip 的安装源来使用您的私有服务器。例如：

   ```bash
   pip install --extra-index-url http://your-server-address:8080/simple/ some-package
   ```

   其中`your-server-address`是托管`pypi-server`的服务器地址。

   如果在使用 HTTP 而非 HTTPS 时遇到问题，可以通过配置 pip 以信任您的私有服务器的 HTTP 地址来解决。这意味着您需要告诉 pip 在安装包时忽略对特定服务器的 SSL 证书验证。请注意，这种方法可能会使您的连接更容易受到中间人攻击，因此应仅在安全的内部网络中使用。

   ### 使用 HTTP 配置 pip

   要让 pip 信任您的私有 PyPI 服务器的 HTTP 地址，您可以在安装命令中使用`--trusted-host`选项。这个选项允许 pip 在没有加密的情况下与服务器通信，示例如下：

   ```bash
   pip install some-package --extra-index-url http://your-server-address:8080/simple/ --trusted-host your-server-address
   ```

   - `--extra-index-url`指定了您的私有 PyPI 服务器地址。
   - `--trusted-host your-server-address`告诉 pip 信任该 HTTP 服务器地址，其中`your-server-address`是您的服务器的主机名或 IP 地址。

   ### 永久配置

   如果您不希望每次安装包时都输入这些选项，可以将它们永久添加到 pip 的配置文件中。pip 的配置文件通常位于以下位置之一：

   - 在 Unix 和 macOS 上：`$HOME/.pip/pip.conf`
   - 在 Windows 上：`%USERPROFILE%\pip\pip.ini`

   添加以下内容到 pip 的配置文件中：

   ```ini
   [global]
   extra-index-url = http://your-server-address:8080/simple/
   trusted-host = your-server-address
   ```

   通过这种方式配置后，您在使用 pip 安装包时就不再需要每次都指定`--extra-index-url`和`--trusted-host`选项了。

   ::: tip 安全提示

   尽管在某些情况下使用 HTTP 可能是必要的，但我们强烈建议在可能的情况下使用 HTTPS 来保证通信的安全性。如果您的私有 PyPI 服务器支持 HTTPS，最好配置和使用 HTTPS 连接。在内部网络中，您可以考虑使用自签名证书，或者如果您的组织有内部 CA（证书颁发机构），也可以使用内部 CA 颁发的证书来实现 HTTPS 连接。

   :::

### 注意事项

- **安全性：** 在生产环境中使用`pypi-server`时，请考虑实施适当的安全措施，比如使用认证、HTTPS 等。
- **备份：** 定期备份您的包文件夹，以防数据丢失。
- **维护：** 定期更新`pypi-server`和托管的包，以确保安全性和依赖性的最新性。

通过搭建私有 PyPI 服务器，您可以在完全离线的环境中或是在内部网络中高效地管理和分发 Python 包，这对于提高开发效率和保障代码安全都有重要意义。
