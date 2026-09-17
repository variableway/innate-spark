# T07 — 独立打包与产物约定

- **阶段**：P2　**前置**：T02（`fe build` 骨架）　**产物**：`fe build` 实现 + `dist/` 产物约定
- **对应目标**：[G4](../overview.md)（独立打包）、[G5](../overview.md)（打包全脚本化）

---

## 目的

让"独立打包"是一条命令，且产物**约定一致**：

- 无论打的是 domain 还是异构 app，产出同一套目录结构与同一份 `manifest.json`；
- 这份 manifest 是 T06 的 iframe 接入、T09 的校验、部署组装共同的输入；
- 全程脚本化（bun + TS），不引入私有工具链。

---

## Context

### 为什么必须自己实现

cyacle 的 [vite.config.ts](file:///Users/patrick/workspace/cycle-all/cyacle/app/src/web/vite.config.ts) **完全没有 build 配置**——无 library mode、无多入口、无 externals。它的 domain 独立产物依赖外部的 plot / Vine 工具链完成。

本规划明确 **Won't Borrow** 该工具链（analysis §6），所以这部分能力必须在 `fe build` 里自己实现。这也正是"打包全脚本化"这条目标的具体含义。

### 现状基线

`innate-fe-base` 现有 6 个 app 各自跑 `pnpm build`，**彼此之间没有任何产物约定**。本任务**不改动它们**，只新增约定；既有 app 的构建方式保持可用。

### 产物约定

```
dist/
├── innate-plugin.json     # 身份与接入方式（本任务定义）
├── index.html
└── assets/…
```

```json
{
  "id": "demo",
  "kind": "iframe-app",
  "loadMode": "iframe",
  "base": "/plugins/demo/",
  "entry": "index.html",
  "builtAt": "2026-09-16T04:00:00.000Z",
  "toolchain": "vite"
}
```

`builtAt` 记录构建时刻，**不参与幂等判定**；其余字段在相同输入下必须完全稳定。

---

## 实现方式

1. **命令**（补完 T02 留的 `commands/build.ts`）

```
fe build --target domain:<name> [--out dist] [--base /plugins/<id>/]
fe build --target app:<name>    [--out dist] [--base /plugins/<id>/]
fe build --target all
```

三种 target 的语义：

| target | 做法 |
|---|---|
| `domain:<name>` | 以该 domain 的 `self-check` 入口（T05）构建 SPA，**不依赖 shell** |
| `app:<name>` | 委托给该 app 自己的 `build` script（不重写其构建逻辑），随后校验产物结构并补写 manifest |
| `all` | 按 `fe gen` 的扫描顺序全量构建 |

2. **原子输出**（关键，避免半成品覆盖上一版）

```
1. 构建到 dist.tmp/
2. 校验 dist.tmp/（见 §3）
3. rm -rf dist && mv dist.tmp dist
```

任一步失败 → 删除 `dist.tmp/`，**已存在的 `dist/` 保持不动**。

3. **构建后校验**（不通过则非 0 退出）

- `index.html` 存在；
- manifest 必填字段齐全：`id` / `kind` / `loadMode` / `base` / `entry` / `toolchain`；
- manifest 的 `base` 与构建时使用的 base **一致**（不一致是最常见的白屏原因）；
- `loadMode: 'iframe'` 时 `base` 以 `/` 开头且以 `/` 结尾（T06 的路径契约）；
- 产物内**不得**出现根绝对路径引用（扫描 html/css/js 中的 `src="/` / `href="/`，允许以 `base` 开头）。

4. **幂等**：`fe build --target all` 连跑两次，除 `builtAt` 外 `diff -r` 为 0。

5. **不做的事**：不做 minify/压缩策略定制、不做 CDN 上传、不接管既有 app 的 `pnpm build` 内部实现。

---

## Verify

| # | 命令 / 操作 | 预期 |
|---|---|---|
| 1 | 干净目录下 `bun run packages/cli/src/bin.ts build --target all` | 一次成功，`dist/` 结构符合约定 |
| 2 | 连跑两次后比对 | `diff -r dist1 dist2` 仅 `builtAt` 一行不同（或无差异） |
| 3 | 手工删掉 manifest 的 `base` 字段后重跑 | 非 0 退出，错误信息**指出具体缺失字段** |
| 4 | 故意让某个 target 构建失败 | `dist/` 内容与失败前**完全一致**（原子性成立） |
| 5 | `fe build --target domain:writing` | 产物可在**不启动 shell** 的情况下独立预览 |
| 6 | `python3 -m http.server` 起 `dist/` | `index.html` 与全部资源可访问，无 404 |
| 7 | 指定 `--base /plugins/demo/` 后构建 | `index.html` 内资源引用带该前缀；用子路径静态服务器验证可加载 |
| 8 | 既有 app：`pnpm --filter @innate/admin-tanstack build` | 仍正常（本任务未破坏既有构建） |

**通用门槛**（见 [README](./README.md)）全部适用。
