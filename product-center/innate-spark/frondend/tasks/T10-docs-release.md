# T10 — 文档与发布流程固化

- **阶段**：P3　**前置**：无　**产物**：`innate-fe-base` 内文档 + README 更新
- **对应目标**：[G6](../overview.md)（文档侧收口）、[G7](../overview.md)（复用优先）

---

## 目的

让后来者（包括未来的自己）**不必读本规划目录**就能正确使用这套体系。

验收判据只有一条：**一个新人只看 `innate-fe-base` 的 README 与 `docs/`，就能完成"新建一个 domain 并让它出现在主站"**，中途不需要查源码。

---

## Context

### 文档分层（遵守现有约定，不新造目录）

base 的 `AGENTS.md` 已定义分层：D0 顶层 README → L1 包 README → L2 应用内文档 → L3 场景规格。本任务的产出按此落位。

### 两类文档不要互相复制

| | 位置 | 性质 |
|---|---|---|
| 方向文档 | `innate-spark/.../frondend/`（本目录） | 为什么做、怎么取舍、论证 |
| 操作文档 | `innate-fe-base/docs/` 与各 README | 怎么做、命令是什么 |

本任务只写**操作文档**。方向文档的内容不搬过去，只留一行指向。

### 必须顺手修的四处漂移（均为读代码核实，非推测）

| 位置 | 问题 |
|---|---|
| `apps/wandesk-ui/README.md` | 写"默认 Vite 端口见 `ui/vite.config.ts`（5173）"，实际 `apps/wandesk-ui/ui/vite.config.ts` 是 `port: 4010` |
| `packages/ui/README.md` | 写 `private: true`，实际 `package.json` 是 `false` |
| `docs/achieve/desktop-shell.md` | 描述已迁出本仓的代码，自述"命令与路径不能直接用于当前 fe-base" |
| 根 `package.json` 的 `dev:nextjs` / `dev:tanstack` | filter 名与实际包名不符 |

这些不是"顺手美化"——它们会直接误导第一个照着做的人，属于本任务的验收项。

### 已知需要写进文档的限制

- Next.js 静态导出 + 动态路由 `generateParams` 返回空会导致构建失败（innate-wip 实际踩过）→ iframe 模式的 Next 应用**优先使用静态路由**。
- 不可信内容 iframe 只用 `allow-scripts`；此时插件内无法使用 `localStorage`，需要持久化走 `postMessage` 交宿主代管。

---

## 实现方式

1. **新增 `innate-fe-base/docs/plugin-mode.md`**（操作文档主入口），内容：

- **三种接入模式与选择规则**（一句话版）：
  > 承载内容 → route 模式；工具且外部 / 不可信 / 需独立部署 → iframe 模式；两者皆非 → 不做成插件。
- **如何新增一个 domain**：完整目录树、三个必填文件（`package.json` 的 `innatePlugin` 字段 / `src/web/index.ts` / `globals.css`）、以及"改完只跑 `fe gen`"。
- **如何接入一个 Next.js 应用**：`next.config.js` 片段（`output: 'export'` / `distDir` / `basePath` / `assetPrefix` / `trailingSlash` / `images.unoptimized`）+ 部署子路径约定 + sandbox 取舍。
- **如何独立打包**：`fe build` 三种 target 的用法与产物结构。
- **常见错误表**：导航不出现 / 样式丢失 / iframe 白屏 / React 双副本 hooks 报错 —— 每条给**症状 → 原因 → 处置**。

2. **`README.md` 的 app 选择表**补两行：主 shell（`apps/web`）的定位；以及"**何时该建 domain 而不是建 app**"的判别句。

3. **修正上述四处漂移**；`docs/achieve/desktop-shell.md` 顶部加一句醒目标注：

> 历史文档：所述命令、包名与路径已不适用于当前 `innate-fe-base`。

4. **发布流程**（并入 `plugin-mode.md` 的"发布"节或独立 `RELEASE.md`）：

```
fe gen → fe verify → pnpm typecheck && pnpm lint && pnpm test → fe build → 部署
```

要点：shell 与各 iframe 插件**分别部署、版本互不感知**；破坏性变更靠 URL 与接口约定隔离。

5. **每条命令必须标注执行位置**（仓库根 / 某 app 目录）。现有文档大量失效正是因为缺这一句。

---

## Verify

| # | 操作 | 预期 |
|---|---|---|
| 1 | 从零走一遍"新建 domain → 出现在主站"，**只允许使用文档中出现的命令** | 全程成功；任一环节需查源码即为不通过 |
| 2 | 从零走一遍"接入一个 Next 应用（iframe 模式）" | 全程成功 |
| 3 | `grep -n "5173" apps/wandesk-ui/README.md` | 无输出 |
| 4 | `packages/ui/README.md` 的 `private` 描述 | 与 `packages/ui/package.json` 一致 |
| 5 | 逐条执行文档中出现的命令 | 均在本机实际执行过且结果符合描述 |
| 6 | `grep -rn "desktop-shell" docs/ README.md` | 若有引用，均带"历史文档"标注 |
| 7 | `pnpm -r typecheck` | 通过（文档改动不应影响代码；若改了脚本则一并验证） |

**不要求**：为本任务新增自动化测试（文档类任务的验收集就是上面的手工走查）。
