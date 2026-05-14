# resume.justdev.cn

## 简介

这是一个 Next.js 项目，用于展示我的个人简历。并且接入了 Agent 可以向我发起提问。

默认采用 Dify 的 Provider，为了方便使用自定义的模型，也提供了兼容 OpenAI 和 Anthropic API 的 Provider 实现（参考 .env.example）。

## 快速上手（Fork 后修改成自己的简历）

1. 编辑项目根目录的 [`resume.json`](./resume.json) —— 所有简历内容（个人信息、技能、工作经历、项目、教育等）都在这一份文件里。文件顶部已通过 `$schema` 字段关联 [`resume.schema.json`](./resume.schema.json)，VS Code 会提供字段补全、hover 描述、必填字段警告与 `mode` 等枚举值的下拉提示
2. 替换 [`app/components/TargeVersion/index.tsx`](./app/components/TargeVersion/index.tsx) 中的 `https://resume.justdev.cn` 为你自己的域名
3. `npm run dev` 本地预览，`npm run build:pdf` 生成 PDF

> 仅修改 `resume.json` 内容时不需要做额外操作。如果调整了 `resume.schema.json` 的字段结构，请运行 `npm run build:types` 同步 TypeScript 类型 [`types/resume.d.ts`](./types/resume.d.ts)（`npm run build` 也会通过 `prebuild` 钩子自动生成）。

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
