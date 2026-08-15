# 个人杂记

> 基于 [VitePress](https://vitepress.dev/) 打造的个人博客。记录内容不定，故自定义为「杂记」。

[![Deploy VitePress site to Pages](https://github.com/Icestab/Note/actions/workflows/deploy.yml/badge.svg)](https://github.com/Icestab/Note/actions/workflows/deploy.yml)

[🖥️ 在线预览](https://flysch.top)

## 内容板块

- **生活** — 生活中折腾各种设备的点点滴滴（路由器刷机、科学上网、NAS、打印机、AI 绘画等）
- **学习** — 学习途中遇到的困难与完成的项目（环境问题排查、前端笔记等）
- **文学** — 喜欢的语句与随记

## 技术栈

- [VitePress](https://vitepress.dev/)（Vue 驱动的静态站点生成器）
- [Bun](https://bun.sh/)（包管理器 / 运行时）

## 本地开发

```bash
# 安装依赖
bun install

# 启动开发服务器（默认 http://localhost:5173）
bun run docs:dev

# 构建生产版本
bun run docs:build

# 本地预览构建产物
bun run docs:preview
```

## 目录结构

```
docs/
├── .vitepress/
│   └── config.mts      # 站点配置（导航、侧边栏、主题等）
├── index.md            # 首页
├── guide/              # 资源导航
├── life/               # 生活杂记
├── study/              # 学习杂记
└── public/             # 静态资源（无需处理的文件）
```

## 部署

推送到 `main` 分支后，[GitHub Actions](.github/workflows/deploy.yml) 会自动构建并通过 GitHub Pages 部署。

## 许可证

[MIT](./LICENSE)
