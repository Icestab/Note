# oh-my-zsh安装与基本配置

zsh是一个Linux下强大的shell, 由于大多数Linux产品安装以及默认使用bash shell, 但是丝毫不影响极客们对zsh的热衷, 几乎每一款Linux产品都包含有zsh，通常可以用apt、urpmi或yum等包管理器进行安装

zsh是bash的增强版，其实zsh和bash是两个不同的概念，zsh更加强大

通常zsh配置起来非常麻烦，且相当的复杂，所以oh-my-zsh是为了简化zsh的配置而开发的，因此oh-my-zsh算是zsh的配置

## 1 、准备

**查看当前系统使用的shell**

```shell
ubuntu@ubuntu:~$ echo $SHELL
/bin/bash
```

**查看系统自带哪些shell**

```shell
ubuntu@ubuntu:~$ cat /etc/shells 
# /etc/shells: valid login shells
/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
/usr/bin/tmux
/usr/bin/screen
```

## 2、安装zsh

**开始安装**

`sudo apt install zsh -y`

**再次查看**

```shell
ubuntu@ubuntu:~$ cat /etc/shells 
# /etc/shells: valid login shells
/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
/usr/bin/tmux
/usr/bin/screen
/bin/zsh
/usr/bin/zsh
```

表明已经安装好zsh

**配置**

zsh设为默认shell

```shell
chsh -s /bin/zsh
reboot
```

::: tip 提示

若总是报错`chsh: PAM: Authentication failure`
直接修改用户的配置
`vim /etc/passwd/`

查看系统当前使用的shell

```shell
ubuntu% echo $SHELL 
/bin/zsh
```

表明已经将zsh设置为默认shell

:::

## 3、安装oh-my-zsh

`sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"`

或者

 `sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"`

如果github无法连接，可以使用gitee

```sh
https://gitee.com/mirrors/oh-my-zsh/raw/master/tools/install.sh
```

出现下面界面成功安装：

![z1](./z1.png)

## 4、个性化

### 1.主题

`vim ~/.zshrc`

![z2](./z2.png)

使用下面命令使配置生效，我喜欢**ys**

`source ~/.zshrc`

安装字体解决zsh乱码问题

`apt install fonts-powerline -y`

### 2.插件

ohmyzsh强大的地方就强大在其有丰富的插件，但是我个人推荐的插件不多6个，其中4个是自带的2个需要自己安装（`https://github.com/zsh-users`上有各种插件可以自行选择）

```shell
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

**安装完成之后需要配置zsh的配置文件**

`vim ~/.zshrc`

**打开文件之后在plugins中增加以下内容：**

```shell
plugins=(
        git
        z
        extract
        zsh-syntax-highlighting
        zsh-autosuggestions
        history
)
```

- git：常用的git命令缩写

- z：自动跳转（及其推荐使用）

- extract：解压通过x命令解压任何类型的压缩文件

- zsh-syntax-highlighting：命令高亮（及其推荐）

- zsh-autosuggestions：命令自动补齐（及其推荐）

- history：查看历史命令

**启用配置文件：**

```bash
source ~/.zshrc
```

