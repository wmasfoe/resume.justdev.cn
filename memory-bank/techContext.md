# 技术上下文

## 技术栈

### 核心框架
- Next.js - React 框架
- TypeScript - 类型安全
- Tailwind CSS - 样式处理

### 依赖组件
- monaco-editor - 代码编辑器集成
- i18next - 国际化支持
- API 路由处理

## 开发环境

### 项目结构
```
app/                  # Next.js 应用主目录
├── api/             # API 路由
├── components/      # React 组件
├── styles/          # 样式文件
├── utils/           # 工具函数
config/              # 配置文件
hooks/               # React Hooks
i18n/                # 国际化配置
public/              # 静态资源
service/             # 服务层
types/               # TypeScript 类型定义
```

### 配置文件
- next.config.js - Next.js 配置
- tailwind.config.js - Tailwind CSS 配置
- tsconfig.json - TypeScript 配置
- .eslintrc.json - ESLint 配置
- .editorconfig - 编辑器配置

## 技术约束

### 浏览器兼容性
- 支持现代浏览器
- 响应式设计适配移动端

### 性能要求
- 首屏加载时间 < 3s
- 编辑操作响应时间 < 100ms
- PDF 生成时间 < 5s

### 代码规范
- 使用 TypeScript 强类型
- ESLint + Prettier 代码格式化
- 组件化开发
- 模块化设计

## 开发工具
- VS Code - 主要IDE
- Git - 版本控制
- npm - 包管理器
