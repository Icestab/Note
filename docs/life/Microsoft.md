# 关于更改微软账户密码后远程桌面仍然使用旧密码的问题

## 问题描述

最近，在修改微软账户密码后，我遇到了一个小困扰：无法通过新密码远程登录电脑。原因何在？这实际上是因为 Windows 并没有及时同步更新后的密码。这是因为，如果用户更改了密码，系统会要求至少使用旧密码登录一次，以完成同步过程。

然而，在启用了 Windows Hello 之后，情况发生了变化。我们发现，登录界面不再提供输入密码的选项。进一步观察账号设置时，你可能会注意到 PIN 码设置的删除选项被灰化，无法进行删除。这似乎意味着，最新版的 Windows 操作系统开始不支持密码登录。

## 解决方案

但问题总是有解决的办法。可以尝试以下操作：在账号信息设置中选择“改用本地账户登录”，系统会提示你进行密码验证（总算是让我找到一个输入密码的地方）。在这一步，你输入旧密码并验证通过后，无需继续下一步，直接关闭窗口即可。这样一来，再次远程登录时，你会发现旧密码已然不再有效。

微软似乎在积极推动无密码账户的理念。尽管如此，如果你的工作需要使用远程桌面服务，那么密码的存在依旧是不可或缺的。远程桌面，这一微软的经典功能，至今仍未能摆脱对密码的依赖。我们不确定微软需要多久才能重写这一部分代码，以便我们可以用更现代化的验证方法来代替传统的密码验证方式。