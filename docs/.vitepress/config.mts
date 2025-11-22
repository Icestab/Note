import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    [
      'link', // 设置 favicon.ico，注意图片放在 public 文件夹下
      { rel: 'icon', href: '/f.ico' }
    ]
  ],
  title: '个人杂记',
  description: 'A Notes Site',
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    nav: [
      { text: '主页', link: '/' },
      { text: '资源', link: '/guide/Software' }
    ],

    sidebar: [
      {
        text: '生活',
        collapsed: false,
        items: [
          { text: '红米2100路由器刷机', link: '/life/RM2100' },
          { text: '科学上网', link: '/life/ss/vpn' },
          { text: 'Debian 配置 shadowsocks-libev', link: '/life/ss/ss' },
          { text: 'OpenWRT 配置 WireGuard 服务端及客户端配置教程', link: '/life/wg/wg' },
          { text: 'Netflix UWP Windows客户端除网络隔离的方法', link: '/life/netflix' },
          { text: 'Ventoy 安装教程', link: '/life/ventoy/ventoy' },
          { text: 'AI - stable-diffusion(AI绘画)的搭建与使用', link: '/life/sdweb/sdweb' },
          { text: '使用 caddy 自建 WebDAV 服务器', link: '/life/caddy/caddy' },
          { text: '玩客云刷 armbian 并安装 homeassistant', link: 'life/oc/oc' },
          { text: 'armbian 启用 smb 共享', link: 'life/samba' },
          { text: '本地化部署 vaultwarden 密码管理工具', link: '/life/vaultwarden' },
          { text: '关于更改微软账户密码后远程桌面仍然使用旧密码的问题', link: '/life/Microsoft' },
          { text: '为不方便自定义 ip 设备配置自动旁路由网关', link: '/life/dnsmasq' },
          { text: '让旁路由丢掉 NAT', link: '/life/bypass/bypass' },
          { text: '前端小技巧', link: '/study/html_css_js/html_css' },
          { text: 'Vue日常笔记', link: '/study/html_css_js/vue1' },
          {
            text: '突破限制：用 Termux 和 rsync 实现 Android 文件的真正增量备份',
            link: '/life/termux_rsync'
          },
          {
            text: '一次家庭网络故障排查：DNS环路导致的连接数爆表',
            link: '/life/dns_question'
          }
        ]
      },
      // {
      //   text: '前端',
      //   collapsed: false,
      //   items: []
      // },
      {
        text: '文学',
        collapsed: false,
        items: [{ text: '时间语录', link: '/study/literary/extract' }]
      },
      {
        text: '环境问题',
        collapsed: false,
        items: [
          { text: 'Centos7重置Mysql8 root 密码', link: '/study/questions/mysql_pass' },
          { text: 'Linux命令', link: '/study/questions/linux' },
          { text: 'SSH防止暴力破解', link: '/study/questions/ssh' },
          { text: 'Centos7 升级内核版本', link: '/study/questions/centos7' },
          { text: 'Python离线环境部署指南', link: '/study/questions/Python' },
          { text: 'oh-my-zsh安装与基本配置', link: '/study/questions/oh-my-zsh' },
          { text: 'Fish Shell的安装与基本配置', link: '/study/questions/fish' },
          {
            text: 'ubuntu-20.04.4-server安装与基本配置',
            link: '/study/questions/ubuntu-20.04.4-server'
          },
          { text: '自签名 ssl 证书生成', link: '/study/questions/make_cert' },
          {
            text: 'Linux 利用rsync实现全自动备份',
            link: '/study/questions/docker_backup'
          },
          { text: '使用coscmd快速将本地文件备份到COS', link: '/study/questions/coscmd' },
          {
            text: '使用 Certbot 自动获取 SSL 证书并自动更新',
            link: '/study/questions/certbot/certbot'
          },
          {
            text: '使用 Caddy TencentCloud 插件实现全自动 SSL 证书配置',
            link: '/study/questions/caddy_dnspod'
          },
          { text: 'vscode无法运行npm脚本', link: '/study/pnpm' },
          {
            text: 'PVE8- ZFS 阵列重组 替换硬盘，修复 efi 启动引导',
            link: '/study/questions/pve8-zfs'
          }
        ]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Icestab' }],
    docFooter: { prev: '上一页', next: '下一页' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present flysch'
    },
    lastUpdatedText: '上次更新',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '目录',
    outlineTitle: '页面导航',
    outline: 'deep',
    editLink: {
      pattern: 'https://github.com/Icestab/Note/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    }
  },
  markdown: {
    lineNumbers: true
  }
})
