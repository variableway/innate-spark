# T05 — domain 目录约定 + 首个示例 domain

- **阶段**：P1　**前置**：T01（契约类型）　**产物**：`domain/<name>` 目录约定 + `domain/writing`
- **对应目标**：[G1](../overview.md)（在 domain 里开发）、[G3](../overview.md)（同一套 TanStack 契约）

---

## 目的

把"新增一个领域"的成本压到 **建目录 + 装包 + 跑一次 `fe gen`**，并用一个真实场景验证全链路：**目录进 → 导航出 → 开关关**。

本任务同时定下 `domain/` 的**目录约定**——这份约定一旦稳定，就是后来者唯一需要读的东西。

---

## Context

### 两份可借鉴的既有约定

1. **cyacle 的 domain 是包**：[domain/base/src/web](file:///Users/patrick/workspace/cycle-all/cyacle/domain/base/src/web) —— 独立 package、导出 `webDomain`、并且**自带 standalone 自检 router**（B6），domain 可以在没有宿主的情况下 typecheck。本任务沿用这个形态。

2. **innate-wip 的主题约定是"改一处注册表"**：[plugin-mode/spec.md](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/task/project/plugin-mode/spec.md) 定义 `app/<theme>/` + `lib/<theme>/` + `components/<theme>/` + **一条 registry 条目**。本任务把它升级为：**包边界 + `innatePlugin` 声明**（T02 定义的 package.json 字段），用扫描替代"人工改注册表"——这是 G1 与现状的关键差别。

### 为什么首个 domain 选 `writing` 而不是 hello-world

- innate-wip 里已有 `cheatsheets` 一类内容型页面可搬，是**真实内容**而非占位；
- 内容型正好落在 plan §2 的选择规则的 "A. route 模式"上，能顺带验证"内容 → route 模式"这条判断；
- 它天然需要动态路由（`/writing/$slug`），能验证 path 参数的类型链路。

### 硬约束

- domain **不得** import shell 的 `router.tsx` / `routeTree.gen.ts` / 任何 `apps/*`；
- domain 的 `addRoute` 收到的是宿主注入的 outlet 路由，类型为 T01 契约里的 `AnyRoute`（跨包 ABI 边界，见 T01 Context）；
- domain 不得读写 `site-features`（那是主站的事）；
- 样式必须走自己的 `globals.css`，由 `fe gen` 汇总进 `styles.gen.css`。

---

## 实现方式

1. **目录**

```
domain/writing/
├── package.json
├── tsconfig.json
└── src/web/
    ├── index.ts          # 导出 webDomain
    ├── pages/
    │   ├── index.tsx     # /writing
    │   └── $slug.tsx     # /writing/$slug
    ├── globals.css       # 只写本 domain 需要的样式，base 样式由 ui 提供
    └── self-check.tsx    # standalone router，仅用于类型自检与 T07 独立打包入口
```

2. **`package.json`**（`innatePlugin` 字段是 T02 的扫描契约）

```jsonc
{
  "name": "@innate/domain-writing",
  "private": true,
  "exports": {
    ".": "./src/web/index.ts",
    "./globals.css": "./src/web/globals.css"
  },
  "innatePlugin": {
    "id": "writing",
    "kind": "domain",
    "loadMode": "route",
    "entry": "./src/web/index.ts",
    "styles": "./src/web/globals.css",
    "featureFlag": "writing"
  }
}
```

**注意 `exports` 直出 TS 源码、无 `build` script**——与 base 现状一致（plan D3），消费者负责编译。

**前置动作**：`domain/` 不在现有 workspace glob 内，根 `pnpm-workspace.yaml` 必须加上 `domain/*`，否则 `workspace:*` 无法解析、`fe gen` 扫到的条目也装不进 `apps/web`。这是本任务唯一需要改根配置的地方，加完后不再有第二处。

3. **`index.ts`**（builder 用法）

```ts
import { createWebDomain } from '@innate/plugin-contract'
import { createRoute } from '@tanstack/react-router'

export const webDomain = createWebDomain('writing')
  .addRoute('app', (parent) =>
    createRoute({ getParentRoute: () => parent, path: '/writing', component: WritingIndex }))
  .addRoute('app', (parent) =>
    createRoute({ getParentRoute: () => parent, path: '/writing/$slug', component: ArticlePage }))
  .addCapability('nav', {
    sectionLabel: 'Writing',
    sectionIcon: 'pen-line',
    items: [{ id: 'articles', label: 'Articles', href: '/writing', order: 1 }],
  })
  .addCapability('homeTile', {
    title: 'Writing',
    description: 'Long-form notes and articles',
    href: '/writing',
  })
```

`$slug` 页用 `Route.useParams()` 取参，验证参数类型是从**自己声明的 path 字面量**推导出来的，而不是从宿主。

4. **自检（不依赖 shell）**：`self-check.tsx` 用 `createRootRoute()` + `createRouter()` 自建一棵最小树，仅让 `tsc --noEmit` 能校验 `Link to` / params / search 的字面量合法。这个入口同时是 T07 独立打包的构建入口，因此必须**零宿主依赖**。

5. **删除路径同样要验证**：删掉 `domain/writing/` 目录再跑 `fe gen`，两个聚合文件应干净回到基线（生成器以本次扫描结果为准，不做增量记忆）。

---

## Verify

| # | 命令 / 操作 | 预期 |
|---|---|---|
| 1 | 新增 `domain/writing` 后**只运行 `fe gen`** | `git status apps/web` 源码无改动；`registry.gen.ts` / `styles.gen.css` 出现 writing 条目 |
| 2 | 启动 shell 访问 `/writing` 与 `/writing/foo` | 两页均渲染；侧栏出现 Writing 分组 |
| 3 | 将 `site-features.writing` 置 `false` 后再访问 `/writing` | 导航与首页 tile **消失**，但直接访问 URL **仍能渲染**（"保留路由、仅隐藏导航"是 innate-wip 已定约定） |
| 4 | `pnpm --filter @innate/domain-writing typecheck` | 通过，且**未安装/未引用 shell 包**（不依赖宿主） |
| 5 | 连续两次 `fe gen` | `git diff` 为空（幂等） |
| 6 | 删除 `domain/writing/` 再 `fe gen` | 两个聚合文件回到新增前的内容 |
| 7 | `grep -rn "apps/web\|routeTree.gen" domain/writing/src` | 无输出（无宿主耦合） |
| 8 | `grep -rn "site-features" domain/writing/src` | 无输出（domain 不感知主站开关） |

**通用门槛**（见 [README](./README.md)）全部适用。
