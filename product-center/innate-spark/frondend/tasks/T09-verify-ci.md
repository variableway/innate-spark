# T09 — 契约机器校验与 CI 门禁

- **阶段**：P3　**前置**：T01（契约）、T02（CLI 骨架）　**产物**：`fe verify` + GitHub Actions workflow
- **对应目标**：[G6](../overview.md)（契约可被机器校验）

---

## 目的

把"约定"变成**会失败的检查**。

当前仓库的真实问题不是缺约定，而是约定只活在文档里：CI 跑 `--frozen-lockfile` 却没有对应 lockfile、README 写的端口与实际配置不符、README 说 `private: true` 而实际是 `false`（analysis §2.1，均为读代码核实）。

所以本任务的核心产出不是文档，是**非 0 退出码**。

---

## Context

### 现有 CI

[.github/workflows/ci.yml](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/.github/workflows/ci.yml)，步骤为：oxfmt → lint → typecheck → test → build。

可借鉴 [packages/skills-kit/tests/run-tests.mjs](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/packages/skills-kit/tests/run-tests.mjs)：**零依赖的 node 断言脚本**，输出人可读。`fe verify` 保持同样风格——不引入测试框架即可运行，降低"CI 挂了但本地跑不起来"的概率。

### 需要被断言的契约清单

| # | 断言 | 为什么 |
|---|---|---|
| 1 | 每个 `innatePlugin.featureFlag` 在 `site-features.ts` 有对应键；反之，`site-features.ts` 里**没有**无插件消费的死 flag | innate-wip 现存两个死 flag（`feed` / `betterstackGuides`），且 `isFeatureEnabled()` 零调用者 |
| 2 | `innatePlugin` 声明的 `entry` / `styles` 文件真实存在 | 扫描出来的条目必须能解析 |
| 3 | nav `href` 非空、以 `/` 开头、**全局不重复** | 重复 href 会导致导航指向错页 |
| 4 | shell 源码不出现 domain 主题名（`@innate/domain-*` 与主题路径硬编码） | 保证"新增 domain 零改 shell"这条承诺可验证 |
| 5 | `fe gen` 可复现：生成后 `git diff --exit-code` 为空 | 生成物提交入仓（plan D7），越界即说明手改了生成文件 |
| 6 | `loadMode: 'iframe'` 必须有 `iframeSrc`，且以 `/` 开头、以 `/` 结尾 | T06 的路径契约 |
| 7 | CI 的 install 命令与仓库实际存在的 lockfile 一致 | 当前 CI 用 `--frozen-lockfile` 但仓库只有 `bun.lock`，该步骤实际不可靠 |
| 8 | 全仓 workspace 的 `typescript` 版本声明一致 | 根 `^7.0.2` vs 全部 `apps/*`、`packages/*` 的 `^5.7.2`（已核实，6 个 app + 5 个包全为 `^5.7.2`）。版本分裂会让"本地 typecheck 绿、CI 红"随机发生，属必须机器裁决的项 |

---

## 实现方式

1. **`packages/cli/src/commands/verify.ts`**（补完 T02 留的骨架）

逐项检查、逐项输出，风格如下：

```
✔ manifest.featureFlag 与 site-features 一致 (3 plugins)
✖ nav href 重复: /cheatsheets  ← writing, reference
✖ packages/plugin-contract 未被 apps/web 依赖
```

- 任一项失败 → `process.exitCode = 1`；
- `--json` 输出机器可读结果，便于 CI 做注解；
- 单项失败**不中断**后续检查（一次跑完给出全部问题，避免反复修）。

2. **`.github/workflows/ci.yml` 增加一步**：`pnpm fe verify`，位置在 `typecheck` **之前**（失败最快、成本最低）。

3. **新增 `deploy-shell.yml`**：仅当 `fe verify` 与 `pnpm build` 均通过时，把 `apps/web` 产物发布到 Pages（history fallback 用 `404.html` 复制 `index.html`）。iframe 插件应用的部署 workflow **各自独立**，不串联（plan §6.3 的"独立发布"）。

4. **两条不修就写清的口径**（属本任务门禁范围，二选一并落到 CI 里）：

- 补 `pnpm-lock.yaml`，保留 `--frozen-lockfile`；或
- 继续使用 `bun.lock`，把 CI 的 install 命令改为与之一致。

顺带修掉根 `package.json` 的两处 filter 包名错误（已核对实际 `apps/*/package.json`）：

| 根脚本 | 现写 | 实际包名 |
|---|---|---|
| `dev:nextjs` | `@innate/admin-nextjs` | `@innate/admin-nextjs-demo` |
| `dev:tanstack` | `@innate/admin-tanstack` | `@innate/admin-tanstack-demo` |

两者都会导致脚本"退出码 0 但什么都没启动"——正是机器校验该覆盖的那类静默失败。

5. **门槛文档化**：把 [tasks/README](./README.md) 的"通用验收门槛"落成 `fe verify` 的检查项，使门槛从文字变成命令。

---

## Verify

| # | 操作 | 预期 |
|---|---|---|
| 1 | 删掉某插件 nav 的 `href` | `fe verify` 非 0 退出，指出该插件 id |
| 2 | 把两个插件 nav `href` 改成相同值 | 非 0 退出，列出冲突双方 |
| 3 | 在 `apps/web/src` 里硬编码一个 domain 名 | 非 0 退出，指出文件与行号 |
| 4 | 手工改动 `registry.gen.ts` 一行 | 非 0 退出（生成物不可复现），提示"请运行 `fe gen`" |
| 5 | 给 `site-features.ts` 加一个无插件消费的 flag | 非 0 退出（死 flag 检出） |
| 6 | 全部合法时 | 退出 0，输出 `✔` 清单 |
| 7 | `fe gen && fe verify` | 连续通过（生成物与契约自洽） |
| 8 | CI 在一个 PR 上 | 全步骤跑通；`fe verify` 失败时 job 明确失败 |
| 9 | `pnpm -r typecheck && pnpm -r test` | 全绿（既有 6 个 app 未被破坏） |

**通用门槛**（见 [README](./README.md)）全部适用。
