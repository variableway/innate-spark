# T01 — innate-fe-base 地基最小修复

> 阶段：P0 · 独立任务（无前置，不阻塞于其他任务）
> **状态：已完成（2026-09-16）**，执行记录见文末。

## 目的

清偿 innate-fe-base 中会直接干扰后续开发的工程债务，使仓库回到"`pnpm -r build && pnpm -r test` 全绿、CI 可跑"的基线。本任务是纯修复，不引入任何新架构。

## Context

调研（见 [../analysis.md](../analysis.md#1-innate-fe-base包体系与模板资产)）确认的现状债务：

1. **TS 版本分裂**：根 devDependencies `typescript ^7.0.2`，各 apps 一律 `^5.7.2`（innate-fe-base `docs/achieve/suggestion/02-repo-suggestions.md` P0-3 已点名）。
2. **CI 与 lockfile 矛盾**：`5a47d5a "remove lock file"` 删除了 pnpm-lock.yaml，但 `.github/workflows/ci.yml` 仍用 `pnpm install --frozen-lockfile`，跑必失败；同时仓库残留一次性生成的 `bun.lock`。
3. **双份 overrides**：根 `package.json` 与 `pnpm-workspace.yaml` 重复维护同一份 overrides，需同步两处。
4. **文档与代码漂移**：`docs/project-overview.md` / `AGENTS.md` 宣称 admin 系已迁出 `../innate-desktop`，但代码仍在仓库且本机无该 sibling 目录。

## 实现方式

1. 统一 TypeScript：全部 workspace 收敛到 apps 当前实际版本（`^5.7.x`），root 对齐；一次 `pnpm -r exec tsc --noEmit` 验证。
2. 恢复 lockfile：`pnpm install` 重新生成 pnpm-lock.yaml 并提交；删除 `bun.lock`（确认为一次性产物）；CI 保持 `--frozen-lockfile` 不变。
3. overrides 单一化：保留 `pnpm-workspace.yaml` 一份，根 package.json 中移除重复段（pnpm 9+ 读取 workspace 文件的 overrides）。
4. 文档对齐：修正 `docs/project-overview.md` 与 `AGENTS.md` 中与磁盘不符的迁出口径，或在明显位置标注"已回退"。

不改动：admin-ui 冻结包、组件上收类建议（P1/P2 级，见 suggestion 文档）——那些与插件化主线无关。

## Verify 点

- [x] `pnpm -r --parallel build` 成功；
- [x] `pnpm -r exec tsc --noEmit` 无版本冲突报错（`pnpm typecheck` 全绿，14 项目）；
- [x] `pnpm install --frozen-lockfile` 在干净 clone 模拟下成功（CI 本地 act 或直接观察 CI 运行绿）；
- [x] 仓库内只剩一种 lockfile（pnpm-lock.yaml）；
- [x] `git grep -n "innate-desktop"` 的命中处均与磁盘现状一致。

## 执行记录（2026-09-16）

按计划完成 4 项修复，另发现并修复 3 个被坏 CI 掩盖的存量问题：

**计划内**：
1. TS 统一 `^5.7.2`（解析到 5.9.3），root 的 `@types/react{,-dom}` 对齐 overrides 钉版 19.2.17/19.2.3；
2. 恢复 pnpm-lock.yaml、删除 bun.lock，同时删除 package.json 里诱发 bun 安装的 npm 式 `workspaces` 字段；
3. overrides 收敛到 pnpm-workspace.yaml 单一来源；
4. 文档对齐：AGENTS.md / README.md / docs/project-overview.md 的"已迁出 ../innate-desktop"口径改为"在本仓库维护 / desktop 线已退役归档"；技能源头（packages/skills-kit/skills/，5 个 SKILL + 2 个 wiring reference）同步修正后经 `pnpm skills:sync` 重新生成三个安装点副本。

**计划外（被 CI 失效掩盖的存量破损，不修则 build/lint 挂）**：
5. `apps/admin-tanstack` 构建必挂：tsconfig 的 react→@types/react 锚定（141c442，typecheck 用途）被 `vite-tsconfig-paths` 带入构建期解析，rollup 去 bundle `jsx-runtime.d.ts`。修法：移除该 app tsconfig 的 react 锚定（admin-ui 无锚定且全绿为证；锚定保留在 packages/tsconfig 预设中供包使用）；
6. lint 三处错：skel-lean-ui 两处正则→`startsWith/endsWith`；admin-nextjs theme-toggle 的 mounted 模式改写为语义等价的 `useSyncExternalStore`；
7. `pnpm format:check` 从不生效的问题：oxfmt 默认不读 `.oxfmtignore`（需 `--ignore-path`），scripts 已接上；oxfmt 由 `pnpm dlx`（最新版漂移）改为 devDeps 钉版 `^0.68.0`；`.oxfmtignore` 增加 skills-archive（模板占位 .tsx 不是合法 TSX，被 oxfmt 解析报错）。

**验证结果**：typecheck / build / lint / test / frozen-lockfile 五门全绿；单一 lockfile；`git grep innate-desktop` 仅存归档语境命中。

**遗留（超出 T01 范围，未处理）**：全仓 611 个文件不符合当前 oxfmt 风格（历史漂移；CI 只检查变更文件，不阻塞）；`apps/admin-ui/src/routeTree.gen.ts` 随构建再生成有版本漂移（生成文件，属正常）。
