# SSH防止暴力破解
个人购买云服务器后防止被SSH暴力破解，应当做好必有的安全措施。
## 1.修改默认端口
ssh默认22端口，一般暴力扫描都是扫描22端口，所以修改为不常用的端口能有效防止被扫描。
``` shell
#进入配置文件
vim /etc/ssh/sshd_config

#找到#Port22，将#去掉并添加端口Port xxx(自己设定)，注意是添加，保留两个端口确保另外一个不能使用的时候还可以用22，测试成功再去掉22

#重启ssh服务
systemctl restart sshd

#进入服务器-网络与安全-安全组-配置规则-添加安全组规则，将上面自定义的端口添加进去，如果服务器有开启防火墙的话(建立开启)，必须开放自定义端口
firewall-cmd --zone=public --add-port=xxx/tcp --permanent

#重启防火墙
systemctl restart firewalld.service

#测试成功后，只需进入配置文件将Port 22添加注释即可
vim /etc/ssh/sshd_config
#Port 22
```
## 2.使用密钥登录
禁止密码登录启用密钥登录是防止被暴力破解最有效的手段，一般云服务器都提供了ssh密钥的生成界面，按照参考操作即可。
## 3.禁止root ssh，启用普通用户
``` shell
#创建普通用户
useradd xxx
passswd xxx

#生成登录密钥,为保障安全私钥不建议网络传输，所以生成密钥建议在本机操作，然后通过网络把公钥传输到云主机
ssh-keygen -N '' -f ~/.ssh/xxxkey_rsa

#将上述命令生成的~/.ssh/yolrekey_rsa.pub文件拷贝到服务器，并执行以下命令配置好密钥登录
mkdir -p /home/xxx/.ssh

cat /tmp/xxxkey_rsa.pub >> /home/xxx/.ssh/authorized_keys

chown -R xxx:xxx /home/xxx/.ssh && chmod 700 /home/xxx/.ssh && chmod 600 /home/xxx/.ssh/authorized_keys

#使用以下命令登录服务器
ssh -i ~/.ssh/xxxkey_rsa -p[端口号] xxx@ip

#如果可成功登录，则说明密钥登录配置成功，登录成功后可执行 su root切换至root权限进行操作，便可以禁用root登录了
vim /etc/ssh/sshd_config
添加：PermitRootLogin no
```
## 4.云防火墙定期检查
由于个人用户一般不具有固定ip，所以没办法设置ip白名单，不过个人宽带ip虽然定期改变，但是一般处于一个网络段范围。  
建议个人用户仍然设置ip地址段白名单。  
云厂商一般提供防范措施，能够看到有谁在扫描我们服务器，建议定期将这些ip添加到防火墙。