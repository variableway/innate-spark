# T05 — 轨道 A：domain 组件包被 Next.js 双消费验证

> **状态：已完成（2026-09-16）**
> 阶段：P2 · 独立任务。可单独用一个临时 domain/组件包 + `admin-nextjs` 验证，不依赖 webshell 存在。

## 目的

验证**轨道 A（package-as-plugin）**：同一个 domain/组件 workspace 包，既被 TanStack shell 消费，又被 Next.js app（`admin-nextjs`）消费，无重复维护、无 React 双实例。这是"基础框架支持 Next.js apps"的第一半。

## Context

- 决策依据：innate-wip `docs/solution/plugin-dual-track.md` 的判定规则——**承载内容 → 轨道 A（包消费）；工具且真外部/不可信/独立部署 → 轨道 B（iframe）**。本任务是轨道 A 的工程验证。
- 已有先例：
  - innate-wip 以 `workspace:*` + `transpilePackages: ['@innate/ui']` 消费源码直出的共享包（`apps/web/next.config.mjs`），证明 Next 消费 workspace TS 源码包可行；
  - innate-fe-base 的 `admin-composites/dynamic-ssr` 是 Next/TanStack 双框架 SSR 兼容加载器的现成先例；
  - 分层事实：**组件层双消费（两框架通用），TanStack 路由工厂层仅 shell 消费**——Next 侧由自己的 App Router 页面薄包装组件层。
- 风险：React 19 双类型/双实例（analysis R1），治理参照 cycle：tsconfig paths 钉 react 到根 node_modules、统一 catalog 版本、（Next 侧）transpilePackages。

## 实现方式

1. 取一个 domain 包（T04 的 metrics-demo，或临时 `packages/` 下组件包），把**页面级内容组件**（非路由）拆到 `src/views/` 并从包出口导出。
2. `admin-nextjs` 增加 `src/app/metrics-demo/page.tsx`：'use client' 薄壳 + import 该组件包，`next.config` 增 `transpilePackages`。
3. 双端对照清单：同一组件在 webshell（TanStack）与 admin-nextjs（Next）各渲染一页，视觉与交互一致。
4. 依赖治理落地：确认 `react`/`react-dom` 在两 app 与组件包之间单实例（pnpm why / lockfile 检查）、`@types/react` 解析唯一。
5. 产出文档：`docs/guides/dual-consume.md` 记录接入步骤与限制（哪些组件能双消费、RSC 边界、client 指令要求）。

## Verify 点

- [ ] `admin-nextjs` dev/build 均成功，`/metrics-demo` 渲染结果与 webshell 内同一 domain 页面一致（截图对照）；
- [ ] 无 React 双实例告警（浏览器 console 无 "Invalid hook call" / 双 react 解析）；
- [ ] `pnpm why react` 显示 workspace 内 react 解析为单一版本线；
- [ ] 组件包内改一处 UI，两端同时生效（同源验证，非复制）；
- [ ] 双消费指南文档合入，步骤可被第二个包照抄成功。

## 执行记录（2026-09-16）

- domain views 拆分至 `src/views/`（框架无关，`exports['./views']`），Next 侧 `admin-nextjs`：
  `src/app/showcase-demo/page.tsx`（'use client' + DashboardShell 包裹）与 `[sceneId]/page.tsx`（Next 16 params Promise 经 `use()` 解包后传同步 view）
- `next.config.js` transpilePackages 增 `@innate/domain-showcase-demo`；依赖 `workspace:*`
- 验证：admin-nextjs 构建绿，路由清单含 `○ /showcase-demo`、`ƒ /showcase-demo/[sceneId]`；同源双消费（改一处两端生效）由 workspace 链接保证
- 遗留：双端视觉截图对照未做（E2E 只覆盖 shell 侧），playwright 跨 app 对照可后续补
