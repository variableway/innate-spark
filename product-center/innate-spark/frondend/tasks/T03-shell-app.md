# T03 — 主 shell app

- **阶段**：P1　**前置**：T01 的契约类型、T02 的生成物　**产物**：`apps/web`（TanStack Router + Vite SPA）
- **对应目标**：[G2](../overview.md)、[G4](../overview.md)

---

## 目的

提供一个**可部署的宿主应用**，它是整套插件体系唯一的运行时载体：读取 T02 生成的注册表，把 T01 收集出的 domain 路由挂到 outlet 上，渲染 T04 的 shell 外观。

**shell 自身不含任何业务页面**——只提供品牌位、导航容器与 outlet 挂载点，业务全部来自 `domain/`。

为什么不改造现有 `admin-tanstack`：现有 6 个 app 是场景演示应用（route 下全是 `scene-*` 与演示数据），把插件宿主塞进其中一个会让"宿主"与"演示"互相污染，也会让 T09 的回归门禁失去干净基准（analysis §8 R7）。

---

## Context

### 三个既有参考

1. **壳骨架（照抄配置）**：[admin-tanstack/vite.config.ts](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/apps/admin-tanstack/vite.config.ts) —— 仓库里唯一已跑通的 TanStack Router + Vite app，`resolve.dedupe` 与 `tsconfigPaths` 的写法直接复用。
2. **组装方式（照抄结构）**：[cyacle/app/src/web/src/router.ts](file:///Users/patrick/workspace/cycle-all/cyacle/app/src/web/src/router.ts)：

```ts
const rootRoute = createRootRoute({ notFoundComponent: AppNotFoundPage })
const webRouter = createWebRouter({
  rootRoute,
  domains: standardDomains,
  rootOutlets: {
    app: createRoute({ getParentRoute: () => rootRoute, id: 'app', component: AppLayout }),
    admin: createRoute({ getParentRoute: () => rootRoute, id: 'admin', component: AdminAppLayout }),
  },
  routes: ({ app, admin }) => { /* 宿主自有页面 */ },
})
export const { outlets, webDomains, routeTree, router } = webRouter
```

3. **生成物形态**：T02 产出的 `src/registry.gen.ts` 与 `src/styles.gen.css`。

### 关键约束

- **两个生成物不要混淆**：`routeTree.gen.ts` 由 `@tanstack/router-plugin` 生成（TanStack 官方机制）；`registry.gen.ts` 由 `fe gen` 生成（本方案机制）。前者是壳内路由树的类型注册点，后者是插件清单。
- **路由树类型注册点唯一**：`declare module '@tanstack/react-router'` 的 `FileRoutesByPath` / `Register` 只在 shell 内出现，domain 不参与。
- **shell 源码不得出现任何 domain 主题名**——T09 会以非 0 退出码断言这一点。
- outlet id 固定为 `root` / `app` / `admin`，属 T01 契约的一部分，shell 只提供挂载点、不新增 id。
- 依赖方向单向：`apps/web` → `packages/*` + `domain/*`，**不允许** `packages/*` 反向依赖 `apps/*`。

### 目标目录

```
apps/web/
├── package.json            # name: @innate/web
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx            # createRouter + RouterProvider
    ├── router.tsx          # 组装：rootRoute + outlets + collectWebDomains
    ├── resolve-enabled.ts  # featureFlag → enabled 补齐
    ├── site-features.ts    # feature flag 唯一来源
    ├── registry.gen.ts     # ← fe gen 生成（T02）
    ├── styles.gen.css      # ← fe gen 生成（T02）
    └── pages/
        ├── not-found.tsx
        ├── home.tsx                  # 消费 getEnabledHomeTiles()
        └── plugins.$pluginId.tsx     # T06 落地，本任务只留占位
```

---

## 实现方式

1. **`package.json`**：依赖 `@innate/plugin-contract`、`@innate/web-shell`、`@tanstack/react-router`、`@tanstack/react-router-devtools`、`react`、`react-dom`；第三方版本一律用根 `catalog:` 引用，不写死版本号。

2. **`vite.config.ts`**：

```ts
export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), tailwindcss(), viteReact()],
  resolve: { dedupe: ['react', 'react-dom'] },
  base: process.env.WEB_BASE ?? '/',
  // tsconfigPaths: true 与 admin-tanstack 保持一致
})
```

3. **`router.tsx`**：唯一组装点。

```ts
import { webModules } from './registry.gen'
import { collectWebDomains } from '@innate/plugin-contract'

const rootRoute = createRootRoute({ notFoundComponent: NotFoundPage })
const { routes, outlets } = collectWebDomains(webModules, {
  app: createRoute({ getParentRoute: () => rootRoute, id: 'app', component: AppLayout }),
  admin: createRoute({ getParentRoute: () => rootRoute, id: 'admin', component: AdminLayout }),
})
```

`routes` 是 `root` 级宿主自有页面（home / not-found / plugins 宿主页）。组装结果整体交给 T01 的 `createWebRouter` 等价实现（或直接 `createRouter({ routeTree })`），并导出 `router`。

4. **feature flag 解析**：`registry.gen.ts` 只携带静态结构与 `featureFlag` **名**（domain 包不该知道主站的开关状态）；`resolve-enabled.ts` 用 `site-features.ts` 补齐 T01 `PluginManifest` 要求的 `enabled` 字段：

```ts
export function resolveEnabled(manifests: readonly GeneratedManifest[]): PluginManifest[] {
  return manifests.map((m) => ({ ...m, enabled: siteFeatures[m.featureFlag] ?? false }))
}
```

消费侧仍统一走 T01 的 `getEnabledPlugins` / `getEnabledHomeTiles`，因此契约不变、只在生成物与契约之间加一层解析。

5. **样式**：`main.tsx` 只 import `./styles.gen.css`。**不手写**任何 domain css 的 import——这是"新增 domain 零改 shell"的关键。

6. **最低可验证形态**：`registry.gen.ts` 的 `webModules` 为空数组时，shell 必须能启动并渲染空导航、显示 not-found 而非白屏。

---

## Verify

| # | 命令 / 操作 | 预期 |
|---|---|---|
| 1 | `pnpm --filter @innate/web dev` | 服务启动，首页可访问，控制台无 error |
| 2 | 空 `webModules` 时访问 `/` | 渲染空导航 + 首页占位，不白屏、不抛错 |
| 3 | 新增任意 domain → `fe gen` → `git status apps/web` | 仅 `registry.gen.ts` / `styles.gen.css` 两个文件变化，**其余 shell 源码零改动** |
| 4 | `pnpm --filter @innate/web typecheck` | 通过 |
| 5 | `pnpm --filter @innate/web build` | 产出 `dist/`，`dist/index.html` 存在且资源引用为相对/base 前缀路径 |
| 6 | `grep -rnE "@innate/domain-" apps/web/src --include='*.ts*' \| grep -v '\.gen\.'` | 无输出（shell 无硬编码 domain 名，证明 #3） |
| 7 | 静态服务器起 `dist/` 后直接访问深层路径 | 回落到 `index.html`（history fallback 配置生效，见 plan §6.1） |

**通用门槛**（见 [README](./README.md)）另需满足 typecheck / 幂等 / 版本声明三项。
