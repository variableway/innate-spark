# T07 — domain 独立打包（standalone 产物）

> **状态：已完成（2026-09-16）**
> 阶段：P3 · 独立任务。只依赖 `@innate/web-domain` 的 standalone router 能力（T03 交付物），不依赖 webshell / 生成脚本。

## 目的

让任意 domain 可以**独立构建**出一个可静态部署的单 domain 产物（`dist/`：index.html + assets），满足 overview 目标 4 中"apps/domain 内容可独立打包出来"——domain 不进 shell 也能单独跑、单独交付。

## Context

- 参照 cycle：每个 domain 保留 `routes/router.register.ts` + `createStandaloneWebDomainRouter`，单仓开发时类型可用且该文件不被 app 导入（`cycle-all/cyacle/domain/base/src/web/src/routes/domain/standalone-router.ts`）——**standalone 不仅是开发工具，也是独立产物的构建入口**。
- 现有域内先例：`apps/wandesk-ui` 的 vite root 指向子目录（`ui/vite.config.ts`）证明"vite 构建以子目录为 root"模式可行；domain 独立打包即每个 domain 自带最小 vite 配置 + 一个共享的 vite 配置工厂。
- 设计约束：standalone 产物复用 shell 同一套 `@innate/ui` token 与样式接缝（`./globals.css` 出口），避免"独立跑一个样式、进 shell 另一个样式"。

## 实现方式

1. 在 domain 包内（或 `@innate/web-domain` 附带的 create 工具）提供 `vite.standalone.config.ts` 模板：entry = 临时根路由挂 standalone router、挂 BaseProviders/ThemeProvider、import 自身 `globals.css` + `@innate/ui/globals.css`。
2. domain 包 `package.json` 增加 `build:standalone` 脚本（vite build，`dist-standalone/` 产物，避免与未来可能的 lib 产物冲突）。
3. 产物内再带一个极简 `index.html`（标题 = domain nav label）。
4. 脚本化：把"为所有 domain 跑 build:standalone"做成一个可被 T10 编排 CLI 调用的统一入口（本任务先交付单 domain 版本 + 一段可复制的 bash/bun 片段）。

## Verify 点

- [ ] 任选一个 domain（如 metrics-demo）跑 `build:standalone`，产物在静态服务器（`bunx serve` / `python -m http.server`）直接打开可用，路由跳转正常；
- [ ] 产物不包含 shell 代码（bundle 里无 webshell 业务 chunk）；
- [ ] 样式与 shell 内同名 domain 页面视觉一致（同一 token 来源）；
- [ ] 产物可直接被 T08 的静态导入流程消费（目录结构满足 `<id>/index.html` 约定）。

## 执行记录（2026-09-16）

- domain 包 `vite.standalone.config.ts`（root=src/standalone）+ `build:standalone` 脚本 → `dist-standalone/`（index.html+assets，满足 `<id>/index.html` 约定）
- standalone 入口 `src/standalone/main.tsx`：createStandaloneWebDomainRouter + ThemeProvider + 同一套 ui 样式（token 一致性）
- 验证：构建产物 498KB js/126KB css；产物可直接被 T08 导入流程消费（实测 showcase-static 导入成功）；样式与 shell 同源（同一 globals 接缝）
