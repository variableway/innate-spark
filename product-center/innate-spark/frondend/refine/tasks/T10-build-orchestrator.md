# T10 — 构建编排 CLI（fe-plugin-cli）

> **状态：已完成（2026-09-16）**
> 阶段：P3 · 独立任务。编排的是"已有构建脚本的组合"，各子命令可独立调用；没有 T07/T09 时 `build` 子命令退化为只构建 shell，依然可用。

## 目的

交付 overview 目标 5：**一条命令完成整个打包过程**。在 innate-fe-base 落一个 bun 实现的编排 CLI（`tools/fe-plugin-cli/`），把 scan → gen → build（shell + 各 domain standalone）→ 静态插件导入 → 组装部署目录串起来，产物可重复、可校验。

## Context

- 参照：cycle 的 `.ci/cyacle/build`（`plot app apply` → pnpm build → dist 拷贝 → embed → 镜像）证明了"编排即交付物"的价值；我们去掉 Go/镜像层，终点是**一个静态部署目录**。
- 组成件全部来自前序任务的可独立调用产物：T09 的 scan/gen、T07 的 `build:standalone`、T08 的 import-static、以及各 app 自身的 `pnpm build`。本任务的核心价值是**编排与失败处理**，不是重新实现构建。
- hub 仓约束：CLI 代码放 innate-fe-base（不是 innate-spark hub 仓）；命名避免与 hub 的 `innate-registry-cli` 混淆。

## 实现方式

1. `bun tools/fe-plugin-cli/src/cli.ts <sub>`，子命令：
   - `scan`：列出将参与构建的 domain / static 插件 / 外部 iframe manifest（只读报告）；
   - `gen`：调 T09 生成逻辑（代码复用，非 shell 调 shell）；
   - `build [--with-standalone]`：依次构建 webshell（SPA 静态产物）；`--with-standalone` 时对每个启用 domain 跑 `build:standalone`；
   - `import <id> --from <dir>`：复用 T08；
   - `assemble`：产出 `deploy/` 目录——shell dist 为根 + `plugins/<id>/`（static 产物，若选内置）+ `manifest.json`（构建清单：插件列表、版本/commit、生成时间）；
   - `all`：scan → gen → build → assemble 的一键别名。
2. 失败语义：任一步非零退出立即中止并输出"哪一步、哪个插件、日志路径"；`--continue-on-error` 供本地调试。
3. 可重复性：`assemble` 前记录 `git rev-parse HEAD` + 各 domain 版本进 `manifest.json`；同 HEAD 重跑产物字节一致（vite hash 稳定性检查）。
4. dry-run：`--dry-run` 打印将执行的步骤序列不执行。

## Verify 点

- [ ] 干净 clone（或干净 worktree）上 `bun tools/fe-plugin-cli/src/cli.ts all` 一条命令产出完整 `deploy/`，静态服务器打开 shell 可用、全部启用插件可达；
- [ ] `manifest.json` 内容与实际参与构建的插件一致，含 commit 信息；
- [ ] 人为让一个 domain 构建失败：默认中止且错误定位到该 domain；`--continue-on-error` 下其余产物完整并在报告中标记失败项；
- [ ] `scan`/`gen` 单独可跑，`--dry-run` 输出与实际执行序列一致；
- [ ] 同一 HEAD 两次 `all` 的 `deploy/` 递归 diff 为空（或差异仅在 manifest 时间戳）。

## 执行记录（2026-09-16）

- `tools/fe-plugin-cli/src/cli.ts`（bun）：scan / gen（复用 T09，代码级复用非 shell 调用）/ build（--with-standalone）/ import（复用 T08）/ assemble（--bundle-domains）/ all
- 失败语义：默认非零即中止并指出步骤与插件；`--continue-on-error` 跳过继续；`--dry-run` 打印步骤序列（已实测与真实执行一致）
- 可重复性：assemble 写 manifest.json（git HEAD + 插件清单 + 时间戳）；`deploy/` gitignore
- 实测：`all --with-standalone` 干净跑通 gen → build(shell 6.9s) → build:standalone(5.6s) → assemble，deploy/ 含 manifest.json（git 27c53038）
