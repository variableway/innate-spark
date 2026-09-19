# T16 — Blog 内容单一源与同步自动化（收尾，可选）

> **状态：计划中（未实施）**
> 阶段：P4 · 依赖 T15 落地后的实际使用反馈（更新频率、双端体验）再决定是否投入。

## 目的

消除"内容更新需要手动重跑 webshell 构建"的摩擦，把内容源收敛为单一事实源：
innate-wip 写作发布 → webshell 自动（或一键）跟进；长期目标是 innate-wip 与 webshell
消费同一个内容包（innate-wip 自身 plugin-mode 规划的终态方向天然一致）。

## Context

- 三种同步策略随 T15 的接线模式演进：
  - `file:` 本地引用（T15 默认）：无同步问题但有 sibling checkout 依赖（干净 clone 不可复现）；
  - git 子目录依赖：内容更新需要 innate-fe-base 侧更新依赖指向（lockfile 变更）——
    加一个 workflow（repository_dispatch 触发：innate-wip push 后通知，或 weekly 定时）
    自动提"更新内容依赖 + 重建 webshell"的 PR；
  - 内容包发布：innate-wip 侧 build & publish（私有 npm / git tag），webshell 升版本即可；
- 决策输入：Blog 内容的真实更新频率（月更级别则手动/定时即可，无需 dispatch 实时性）；
- iframe 方案（T13）天然实时——若 domain 版长期低频更新，两轨并存本身就是答案。

## 实现方式（按选定策略三选一）

1. **定时重建**（最简）：deploy-webshell.yml 加 `schedule`（如每日）+ 路径触发不变；
2. **事件驱动**：innate-wip 的 deploy workflow 末尾 `repository_dispatch` 通知
   innate-fe-base 触发内容依赖更新 + 重建 PR（需 token 与跨仓权限配置）；
3. **内容包化**：innate-wip 侧新增 publish workflow（`pnpm pack` 内容包 → 私有 registry
   或 git tag），innate-fe-base 以版本号依赖——回写其 `docs/solution/innate-factory.md`
   的规划对齐。

## Verify 点

- [ ] innate-wip 发布一篇新文章 → 按所选策略在约定时限内 webshell 的 Blog 出现该文章；
- [ ] 干净 clone（无 sibling checkout、无本地残留）构建可复现（CI 绿）；
- [ ] 同步失败有明确告警（workflow 失败可见，不静默吞掉）；
- [ ] 双端（innate-wip 站点与 webshell domain）内容一致（抽样新文章对照）。
