# T15 — domains/blog 插件（主线：Blog 成为 shell 一等公民，无双层壳）

> **状态：计划中（未实施）——P4 主线入口**
> 阶段：P4 · 前置：T14 的数据生成器。完全套用 T04（showcase-demo）已验证的模板。
> 决策（2026-09-17）：用户明确不要 iframe 的双层导航 → 本任务是 Blog 接入的**唯一主线**，
> T13（chromeless iframe）降为备选。

## 目的

Blog 以 **domain 插件**形态进 webshell：`/blog` 列表 + `/blog/$slug` 详情、导航项、
首页 tile、feature flag——与 iframe 方案（T13）并存，由 flag 决定用哪个（或都要）。

## Context

- 模板：`domains/showcase-demo`（webDomain 契约、views 框架无关、路由参数经
  `Route.useParams()` 接线——T04 踩过的坑已记录）；
- 数据：T14 的 `blog-data.gen.ts`（构建期生成，运行时纯渲染）；
- **内容源接线（关键决策，不复制内容）**，按 innate-fe-base `docs/dependency-modes.md` 的模式分阶段：
  1. 短期（本任务默认）：`file:` 本地目录引用——开发机上有 innate-wip sibling checkout，
     生成器 `--content` 直指其 `apps/web/content/writing`（`use-external.mjs` 的 dir 模式心智）；
  2. 中期：git 子目录依赖 `github:variableway/innate-wip#apps/web/content`（pnpm 支持
     `#subdir=`），CI 无需 sibling checkout 也可复现（需 innate-wip repo 可访问）；
  3. 长期：innate-wip 侧把 writing 内容发布为内容包（其自身 plugin-mode 规划的
     package-as-plugin 先例 = betterstack-guides T03），双端消费同一包；
- 功能取舍：MVP = 列表（标题/日期/分类/tags/摘要）+ 详情（TOC、正文、高亮）；
  mermaid/图表、RSS、站内搜索不做（RSS 归 innate-wip 自己）。

## 实现方式

1. `domains/blog/`（包 `@innate/domain-blog`）：
   - `src/web-domain.tsx`：`createWebDomain('blog').addRoute('app', …)`——index 列表路由 +
     `$slug` 详情路由（useParams 接线）；`addCapability('nav', …)` + `addCapability('homeTile', …)`；
   - `src/views/`：BlogListView / BlogPostView（框架无关，渲染 blog-data.gen 数据；
     正文 HTML 经 `dangerouslySetInnerHTML` 注入——内容由自有仓库产出，信任边界内）；
   - `prebuild` / `gen:content` 脚本挂 T14 生成器（`pnpm build` 自足）；
2. webshell 侧：依赖声明 + `site-features.ts` 增 `blog`（与 T13 的 iframe `blog` 二选一时
   改 flag：`blog: false` + `blog-frame: true` 之类——若并存则用不同 id）；
3. `bun tools/gen/registry.ts` 重跑（模块聚合自动纳入）；
4. E2E 增用例：`/blog` 渲染 6 篇列表 → 点进任一详情 → TOC/正文可见 → flag 关闭三处联动。

## Verify 点

- [ ] 导航出现 Blog（domain 版），列表 6 篇、排序 date desc、详情 TOC 与正文渲染正确；
- [ ] 接入 diff 审查：shell 侧仅依赖声明 + flag（聚合文件由脚本生成）；
- [ ] 翻 flag 三处联动（复用 T11 的断言模式）+ E2E 绿；
- [ ] `pnpm -r build` 全仓绿（含 admin-nextjs 双消费不破坏，若其也接入 views）；
- [ ] 内容源为本地 file: 引用时，改动一篇 innate-wip 文章 → 重跑生成器 + build → webshell 内容更新（同源验证）。
