# T04 — 示例 domain 插件（全链路验证）

> **状态：已完成（2026-09-16）**
> 阶段：P1 · 独立任务。若 T02/T03 尚未合入，可在本任务内以最小内联版 shell/contract 先验证，但推荐在其后执行以避免一次性引入太多变量。

## 目的

做一个**真实内容**的 domain 插件，端到端验证"新建 domain 目录 → 出现在 shell 导航 → flag 可关 → 直达路由可用"的目标链路。这是 overview 验收口径 1、2 的首次实测。

## Context

- **素材来源（已定）**：用 `apps/web-showcase` 的展示内容做 demo domain 的素材——把 showcase 的一部分（建议：scenes 场景样例区或某个组件分组页）抽成 domain 包的 views，数据/元数据复用 `@innate/scene-catalog` + `@innate/scene-mocks`。showcase 已在仓内且有 Pages 部署先例，抽出的 views 后续还能服务 T05（同一组件包双消费）与 T07（standalone 产物即一个可独立部署的"迷你 showcase"）。

- 插件单元的目录约定（本任务确立，后续任务沿用）：innate-fe-base 根下 `domains/<name>/`，包名 `@innate/domain-<name>`，`src/index.ts` 导出 `webDomain`，`exports` 含 `./globals.css`。
- 数据来源：`packages/scene-mocks`（纯 TS 零依赖，7 场景共享 mock）——选一个有图表/表格数据的场景，让插件有真实渲染量。
- 组件来源：`@innate/ui` 原语 + `@innate/admin-composites`（chart-area-interactive、data-table 等 L2 组件可直接复用）。
- 消费链参照：webshell（T02）的 sidebar/header/首页 tile 三处 registry 消费。

## 实现方式

1. 建 `domains/metrics-demo/`（pnpm workspace 需在 `pnpm-workspace.yaml` 的 `packages:` 增加 `domains/*`）。
2. `src/index.ts`：`export const webDomain = createWebDomain('metrics-demo').addRoute('app', (parent) => …).addCapability('nav', { label: 'Metrics Demo', icon: …, path: '/metrics-demo' })`，路由树内至少一个列表页 + 一个详情参数路由。
3. 页面用 scene-mocks 数据渲染 chart/table（L2 组件复用），样式只允许用 Tailwind 原子类 + `@innate/ui` token，不写全局 CSS。
4. 在 webshell 的 registry 消费位接入（若 T09 生成脚本未就绪，先手写一行 import 到聚合占位文件——文件名就用未来的 `modules.gen.ts`，路径与命名即约定）。
5. feature flag：`site-features.ts` 增加 `metricsDemo: true` 默认开。
6. 记录 friction：开发过程中每处"需要改 shell 手写代码才能接入"的点都记进本任务文档的"发现的接缝问题"小节，作为 T09 脚本的需求输入。

## Verify 点

- [ ] 全新 clone 后 `pnpm install && pnpm --filter webshell dev`，导航出现 "Metrics Demo"，进入后列表/详情/图表正常；
- [ ] 翻 `metricsDemo: false`：sidebar/header/首页 tile 三处同时消失，零 JSX 改动；直达 `/metrics-demo` 仍渲染（flag 只控导航）；
- [ ] 接入 diff 审查：shell 侧改动 ≤ 2 处且均为"聚合文件/flag 文件"（若超出，说明契约设计有漏，回填 T03）；
- [ ] `pnpm -r build` 全仓仍绿（workspace 增加 `domains/*` 未破坏既有包）。

## 执行记录（2026-09-16）

已落地 `domains/showcase-demo`（@innate/domain-showcase-demo）：
- 素材按定案取自 web-showcase 体系：views 渲染 `@innate/scene-catalog`（baseSceneSamples 7 场景）+ `@innate/scene-mocks`（payments 表格）
- `webDomain = createWebDomain('showcase-demo').addRoute('app', …).addCapability('nav'/'homeTile')`；详情路由参数经 `Route.useParams()` 注入框架无关 view（TanStack 路由组件不接收 props，此为接线关键）
- pnpm-workspace 增加 `domains/*`；flag `showcase-demo: true` 默认开
- 接入 diff 审查：shell 侧仅 modules.gen.ts（脚本生成）+ 依赖声明 + flag 声明，符合"≤2 处手改"约定（实际 0 处手改聚合文件）
- 发现的接缝问题：①路由参数需静态 useParams 钩子接线 ②views 不能用框架 Link（改原生 <a>），均已回写进任务文档结论与 webshell README
- 验证：E2E 导航 → 列表 → 详情（Kenneth Thompson 支付行可见）；flag 联动单测（registry 纯函数）
