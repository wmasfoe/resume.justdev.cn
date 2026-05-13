# resume.justdev.cn

## 简介

这是一个 Next.js 项目，用于展示我的个人简历。并且接入了 Agent 可以向我发起提问。

默认采用 Dify 的 Provider，为了方便使用自定义的模型，也提供了兼容 OpenAI 和 Anthropic API 的 Provider 实现（参考 .env.example）。

## 技术栈

- Next.js
- Tailwind CSS
- TypeScript
- Vercel

## TODO

- [x] 增加开源项目板块
- [x] 外链增加 个人博客、Github 地址
- [x] LLM workflow 支持阅读当前页面
- [x] 在线版主题优化
- [ ] 项目构建、部署统一采用 Github workflow

## 鸣谢

本项目目前采用 Vercel 部署、Github Actions 构建 PDF 文件，感谢 Vercel 和 Github Actions 提供的免费服务。

> Vercel 机器构建 PDF 有格式问题

感谢 Dify 提供的免费额度，使项目可以低成本运行。

感谢得力小助理 Claude Code、Codex.
