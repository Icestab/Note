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
          { text: 'OpenWRT 配置 WireGuard 服务端及客户端配置教程', link: '/life/wg/wg' },
          { text: 'oh-my-zsh安装与基本配置', link: '/life/oh-my-zsh' },
          { text: 'Netflix UWP Windows客户端除网络隔离的方法', link: '/life/netflix' },
          { text: 'Ventoy 安装教程', link: '/life/ventoy/ventoy' },
          { text: 'AI - stable-diffusion(AI绘画)的搭建与使用', link: '/life/sdweb/sdweb' },
          { text: '使用 caddy 自建 WebDAV 服务器', link: '/life/caddy/caddy' }
        ]
      },
      {
        text: '前端',
        collapsed: false,
        items: [
          { text: '前端小技巧', link: '/study/html_css_js/html_css' },
          { text: 'Vue日常笔记', link: '/study/html_css_js/vue1' },
          { text: 'vscode无法运行npm脚本', link: '/study/pnpm' }
        ]
      },
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
          {
            text: 'ubuntu-20.04.4-server安装与基本配置',
            link: '/study/questions/ubuntu-20.04.4-server'
          }
        ]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Icestab' }],
    docFooter: { prev: '上一页', next: '下一页' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present flysch'
    },
    lastUpdatedText: '上次更新',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '目录',
    outlineTitle: '此页',
    outline: 'deep'
  },
  markdown: {
    lineNumbers: true
  }
})
