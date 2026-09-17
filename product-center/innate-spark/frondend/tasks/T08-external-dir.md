# T08 — 外部目录直连基础库

- **阶段**：P3　**前置**：无　**产物**：扩展 `scripts/use-external.mjs` + 补齐基础包 `exports`
- **对应目标**：[G1](../overview.md)（可在另外目录中直接使用这些基础库）

---

## 目的

落实 G1 的后半句：让一个**不在本 monorepo 里**的目录，能像 workspace 内一样

```ts
import { Button } from '@innate/ui'
```

并 `tsc --noEmit` 通过，而**不必先把项目搬进 `apps/`**。

这条路是"先小规模试水"的入口：新想法可以开在任意目录，验证有效再决定是否纳入 monorepo。

---

## Context

### 已有基础（方向相反）

`innate-fe-base` 已经有一份 [docs/dependency-modes.md](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/docs/dependency-modes.md)，记录了四种接入模式：

| 模式 | 用途 |
|---|---|
| workspace | monorepo 内 |
| `file:` 目录 | 本地未发布包 |
| git 子目录 | 跨机 / CI |
| 私有 npm | 稳定分发 |

并配有一键脚本 [scripts/use-external.mjs](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/scripts/use-external.mjs)。

但它当前解决的是**把外部包接进来**（外部依赖 → base）。本任务要补的是**把 base 的包送出去**（base 包 → 外部目录）。这两个方向的配置约束并不对称：前者 base 是消费者，不必操心 React 副本；后者 base 是提供方，React 单副本必须由外部项目保证。

### 两个必须先承认的既有问题（否则会踩）

- **R3**：innate-wip 里存在一份 `@innate/ui` 的**副本**。两份 UI 会随时间漂移，这正是本任务要避免的形态。
- **R1**：多个 React 副本会导致 hooks 报错与类型冲突——cyacle 已经真实撞过。

### 口径漂移（需在文档里对齐）

`packages/ui/README.md` 写 `private: true`，而实际 `package.json` 是 `false`（analysis §2.1）。走私有 npm 分发前必须先把口径定死并保持一致。

---

## 实现方式

1. **扩展 `use-external.mjs`**，新增子命令（不改动既有行为）：

```
node scripts/use-external.mjs --emit <target-dir>
```

作用：在目标目录生成

- `INNATE-FE-EXTERNAL.md`：该目录的接入说明（含下节命令与注意事项）
- `tsconfig.paths.json`：`@innate/*` → base 内对应 `src/index.ts` 的 paths 映射，供外部 `tsconfig.json` 直接 `extends`

2. **三种接入方式的取舍**（文档中写清各自约束）

| 方式 | 适用 | 关键约束 |
|---|---|---|
| `pnpm add "file:/abs/path/innate-fe-base/packages/ui"`（**推荐**） | 本地试水 | 路径为绝对路径；改动源码即时生效 |
| git 子目录依赖 | 跨机 / CI | 需固定 commit，不可用浮动分支 |
| 私有 npm | 稳定分发 | 需先统一 `private` 口径并确定发布流程 |

3. **base 侧补齐 `exports`**（**只加 exports，不改任何实现**）

- `packages/ui`：暴露 `./globals.css`、`./themes/*`
- `packages/plugin-contract` / `packages/web-shell`：暴露 `./globals.css`（如确有）

4. **React 单副本保障**：`--emit` 生成的说明里**内联**可复制的最小配置，不写"参见某文档"：

```ts
// vite.config.ts
resolve: { dedupe: ['react', 'react-dom'] }
```

```jsonc
// package.json
"pnpm": { "overrides": { "@types/react": "19.2.17", "@types/react-dom": "19.2.3" } }
```

5. **文档合并**：把四种模式 + 本任务的"正向送出"合并进 `docs/dependency-modes.md`，删掉只讲"接进来"的单一叙述，并明确写一句：

> 同一份 `@innate/ui` 只允许存在一处副本；需要跨仓共存时用依赖引用，不得拷贝源码。

---

## Verify

| # | 命令 / 操作 | 预期 |
|---|---|---|
| 1 | 新建 `/tmp/fe-external-probe/`，按 `--emit` 生成的说明配置 | 配置过程**只读说明文档**即可完成 |
| 2 | `pnpm i` 后 `tsc --noEmit` | 通过，能解析 `@innate/ui` 的类型 |
| 3 | `pnpm ls react -r`（探针目录内） | 只有**一个** react 版本 |
| 4 | 在探针目录内改一处 `@innate/ui` 源码 | 探针项目热更新可见（证明是引用而非拷贝） |
| 5 | `node scripts/use-external.mjs --help` | 列出新子命令 |
| 6 | 既有用法（不传 `--emit`） | 行为与改动前完全一致 |
| 7 | `pnpm -r typecheck`（base 内） | 全绿，未破坏既有 |
| 8 | 文档中的每条命令 | 在本机**实际执行过**，不接受未验证的示例 |

**通用门槛**（见 [README](./README.md)）另需满足版本声明一项。
