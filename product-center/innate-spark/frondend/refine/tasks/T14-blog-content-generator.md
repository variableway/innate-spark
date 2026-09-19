# T14 — Blog 内容预编译生成器（content → TS 数据模块）

> **状态：计划中（未实施）**
> 阶段：P4 · 独立任务。只依赖"一份 markdown/mdx 内容目录"（夹具即可开发），是 T15 的数据前置，但无 T15 也能独立验收。

## 目的

把 innate-wip 的 writing 内容（md/mdx + frontmatter）在**构建期**编译成 webshell 可消费的
TS 数据模块：frontmatter 元数据 + TOC + 正文渲染产物（含代码高亮）。webshell 是 Vite SPA
没有 node fs，也不应在运行时编译 MDX——预编译让 domain views 保持纯渲染、框架无关，
且同一数据将来可回供 Next 侧（双消费）。

## Context

- 内容现状：`innate-wip/apps/web/content/writing/`，6 篇（5 md + 1 mdx）；frontmatter 字段
  slug/title/excerpt/date/category/tags/readingTime/author/status/type；
  innate-wip 侧由 `apps/web/lib/content/loader.ts`（node fs + react cache）读取；
- 生成器先例：T09 的 `tools/gen/registry.ts`（bun、零 npm 依赖、--check、staging 原子写）——
  本任务是其"内容编译"姊妹篇，落在同一目录 `tools/gen/`；
- 渲染取舍（决策更新 2026-09-17：iframe 备选被降级后，**内容保真度的全部压力落在本任务**）：
  统一（remark/rehype 管线，MDX 经 @mdx-js/mdx 编译为函数/HTML）+ shiki 高亮在预编译时完成；
  `demo-mdx.mdx` / `demo-charts.md` 中的 mermaid/图表不再默认降级为占位——改为按实际用量
  决定优先级（先盘点两篇富组件文章用到哪些块，mermaid 若在用则进 MVP，其余占位 + P2）；
- 备选方案（已否决，记录原因）：运行时 MDX（移植 innate-wip 的 BlogPageClient +
  next-mdx-remote 客户端编译）——会把 MDX 运行时打进 webshell bundle 且仍需解决内容
  fs 读取，预编译方案在包体与框架无关性上均优；
- 生成物：`domains/blog/src/content/blog-data.gen.ts`（gitignore + `--check` CI 拦截，
  与 modules.gen.ts 同一套约定）。

## 实现方式

1. `tools/gen/blog-content.ts`（bun）：
   - 输入 `--content <dir>`（默认指向内容源，见 T15 的三种接线模式；本地开发指向
     innate-wip 的 sibling checkout 路径）；
   - 输出 `blog-data.gen.ts`：`export const blogPosts: BlogPost[]`（slug、frontmatter、
     toc、`rendered`（HTML 字符串或预编译 MDX 组件工厂）、`readingTime`）；
   - 排序（date desc）、`status: published` 过滤（对齐 innate-wip 行为）；
   - `--check` 模式（内容或生成器变更未重新生成时 CI 失败）；
2. 类型定义放 `domains/blog/src/types.ts`（生成器 import 类型，单一事实源）；
3. bun 单测：夹具内容（含 frontmatter 缺字段、mdx、代码块）→ 快照断言生成的数据模块。

## Verify 点

- [ ] 对真实 6 篇内容跑生成器，产出稳定（同输入两次生成 diff 为空）；
- [ ] frontmatter 全字段进数据模块；TOC 与 innate-wip `extractToc` 行为一致（抽 2 篇对照）；
- [ ] 代码块高亮为预编译产物（数据模块内已是带高亮标记的 HTML）；
- [ ] `--check` 在手改生成物后非零退出；
- [ ] bun test 快照用例全绿（含畸形 frontmatter 容错）。
