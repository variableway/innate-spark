# T02 — TanStack webshell 骨架

> **状态：已完成（2026-09-16）**
> 阶段：P1 · 独立任务。与 T03（契约包）无硬依赖：本任务先用占位数组对接 outlet，契约包就绪后替换为生成文件即可。

## 目的

在 innate-fe-base 新建 `apps/webshell`：一个最小的 TanStack 宿主应用，提供布局（sidebar + header + 内容区）、**outlet 挂载点**、插件导航消费位与 feature flag 开关机制。它是后续所有 domain 插件的宿主。

## Context

- 模板来源：`base/innate-fe-base/apps/admin-tanstack`（TanStack Start + @tanstack/react-router ^1.132 文件路由 + Vite 7 + Tailwind 4 + `@innate/ui`），复制后裁剪出最小壳。
- 架构参照：cycle 的宿主组装方式——宿主 `createWebRouter({ domains, rootOutlets: { app: AppLayout, admin: AdminAppLayout } })`，**布局实例由宿主注入，插件只声明挂到哪个 outlet**（`cycle-all/cyacle/app/src/web/src/router.ts:20-47`）。
- 导航消费参照：innate-wip 的三处联动（`apps/web/components/sidebar.tsx` / `header.tsx` / 首页 tile），翻一个 flag 三处同时变化。
- 约束：第一版走 **纯 SPA**（不用 Nitro SSR），规避 TanStack Start SSR × 静态导出组合的未验证风险（analysis R6）。

## 实现方式

1. `cp -R apps/admin-tanstack apps/webshell` 后裁剪：去掉 admin 业务页面，保留 `@innate/ui`、ThemeProvider、tailwind 接线、tsconfig 预设引用。
2. 路由结构：根 layout（sidebar/header shell）+ 首页 + 一个 `/plugins/$pluginId` **占位路由**（先渲染 "not implemented"，T06 会填充 iframe 逻辑；TanStack SPA 参数路由无 innate-wip 的 static-export 阻塞）。
3. 定义 outlets 常量：`export const OUTLETS = { app: 'app', admin: 'admin' } as const`（参照 `cycle-all/cyacle/domain/base/src/web/src/routes/config/outlets.ts`），并预留 root 隐式 outlet。
4. 插件消费位：`src/plugins/registry.ts` 暂为**手写占位数组**，类型仅约束 `{ id, name, enabled, nav }`（对齐 innate-wip `SitePlugin` 的最小集）；sidebar/header/首页 tile 从 registry 读取渲染。
5. feature flags：`src/plugins/site-features.ts` 集中开关（innate-wip 同名文件的模式），HMR 下翻 flag 即时生效。
6. 在 `packages/ui` 的 `globals.css` 基础上，shell 根样式加 `#root { isolation: isolate }`（cycle 样式契约）。
7. 根 README 记录：端口（避开已占用的 4003/4010/4011/4012/5173，如 4020）、启动方式、outlet 约定。

## Verify 点

- [ ] `pnpm --filter webshell dev` 起 4020 端口，首页/布局正常渲染，HMR 生效；
- [ ] 手写占位 registry 里增删一条假插件，sidebar、header、首页 tile 三处联动变化，**零 JSX 改动**；
- [ ] 翻 `site-features.ts` 中某 flag 为 false，对应导航消失、直达 URL 仍可达（约定：flag 只控导航可见性）；
- [ ] `/plugins/anything` 占位路由 200 返回；
- [ ] `pnpm --filter webshell build`（SPA 模式）产出 dist，本地静态服务可打开。

## 执行记录（2026-09-16）

已落地 `apps/webshell`：Vite 7 + TanStack Router（code-based）纯 SPA，端口 4020（未与既有端口冲突）。
- root + `_app`/`_admin` 两个 pathless outlet 布局路由；`/plugins/$pluginId` 占位路由已实现（非占位，T06 直接填充）
- registry + site-features flags；sidebar / header 计数 / 首页 tile 三处消费同一数据源
- 样式聚合顺序：`@innate/ui/globals.css`(base) → `styles.gen.css`(domains) → `app.css`（含 `#root{isolation:isolate}`）
- 技术偏差说明：未复制 admin-tanstack（TanStack Start/Nitro），按任务文档"第一版纯 SPA"决策直接建 Vite SPA，复用 @innate/ui 与其主题体系
- 验证：typecheck/build 绿；E2E 4 用例含壳启动、参数路由 200（playwright）
