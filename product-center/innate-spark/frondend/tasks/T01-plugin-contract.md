# T01 — 插件契约包

- **阶段**：P0　**前置**：无　**产物**：`packages/plugin-contract` → `@innate/plugin-contract`
- **对应目标**：[G3](../overview.md#g3-domain-按同一套-tanstack-契约开发)、[G6](../overview.md#g6-插件契约可被机器校验)

---

## 目的

定义 **shell 与 domain 之间的唯一接口**：插件元数据（manifest）、路由与能力的声明方式（builder）、以及收集时的校验规则（断言）。

这是全局前置任务——T03（shell 组装）、T05（domain 编写）、T09（机器校验）都直接消费本包的导出。契约一旦稳定，domain 就能脱离 shell 独立开发与 typecheck。

---

## Context

### 现状

`innate-fe-base` **完全没有任何插件契约**：全仓 grep `micro-frontend|remoteEntry|PluginFrame|plugin-registry` 命中 0。历史上存在过的 Desktop plugin 实现（`packages/desktop-shell`、`src/plugins.ts`）**已迁出本仓**，`docs/achieve/desktop-shell.md` 自述"命令、包名和路径不能直接用于当前 fe-base"，**不可作为施工依据**。

因此本任务需要新建，而不是改造。

### 可直接借鉴的两份参考实现

**参考 1（组装机制）：cyacle 的 typed builder**

[domain/base/src/web/src/routes/domain/builder.ts](file:///Users/patrick/workspace/cycle-all/cyacle/domain/base/src/web/src/routes/domain/builder.ts)：

```ts
export type WebDomainRouteFactory = (parentRoute: AnyRoute) => AnyRoute

export interface WebDomainRouteRegistration<
  TOutlet extends WebDomainOutlet = WebDomainOutlet,
  TFactory extends WebDomainRouteFactory = WebDomainRouteFactory,
> {
  readonly factory: TFactory
  readonly outlet: TOutlet
}

export interface WebDomain<
  TId extends string = string,
  TRoutes extends WebDomainRoutes = WebDomainRoutes,
  TCapabilities extends object = Record<string, unknown>,
> {
  readonly capabilities: TCapabilities
  readonly id: TId
  readonly routes: TRoutes
}

export function createWebDomain<const TId extends string>(id: TId): WebDomainBuilder<TId, readonly [], {}>
```

两个必须照搬的设计点：

1. **factory 的入参刻意收敛为 `AnyRoute`** —— 这是跨 package 的 ABI 边界。domain 在自己仓库里编译时不需要知道宿主的具体路由类型，避免类型循环与耦合。
2. **builder 不可变** —— 每次 `addRoute` / `addCapability` 返回新对象（`[...routes, {...}]` / `{...capabilities, [k]: v}`），不是原地 mutate。
3. `addCapability(key, undefined)` **直接抛 `TypeError`**（cyacle 原文：`Web domain capability "<key>" cannot be undefined`）。

**参考 2（manifest 设计）：innate-wip 的 SitePlugin**

[apps/web/lib/plugins/types.ts](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/lib/plugins/types.ts)：

```ts
export type PluginLoadMode = "route" | "iframe"

export interface PluginNavItem { id: string; label: string; href: string; icon?: string; order?: number }

export interface SitePlugin {
  id: string
  name: string
  description?: string
  enabled: boolean
  loadMode: PluginLoadMode
  /** For loadMode === "iframe" */
  iframeSrc?: string
  nav: { sectionLabel: string; sectionIcon?: string; items: PluginNavItem[] }
  homeTile?: { title: string; description: string; href: string }
}
```

以及 [registry.ts](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/lib/plugins/registry.ts) 的三个查询函数：`getEnabledPlugins()` / `getPluginById(id)` / `getEnabledHomeTiles()`。

### 约束

- 本包必须**零运行时依赖、零 React 依赖** —— 因为要在"另外的目录里"被 domain 单独消费（[G3](../overview.md#g3-domain-按同一套-tanstack-契约开发)）。
- 唯一允许的可选依赖是 `@tanstack/react-router` 的**类型**（`AnyRoute`）。若希望连它也不依赖，可把 `AnyRoute` 换成本包内定义的最小结构接口——但会损失与 TanStack 的类型兼容性，**建议保留类型级依赖**（`peerDependencies` + `devDependencies`）。
- 现有包的 exports 风格统一是**源码直出**（`exports: { ".": "./src/index.ts" }`，无 `build` 脚本），见 [packages/ui/package.json](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/packages/ui/package.json)。本包沿用。

---

## 实现方式

### 1. 建立包骨架

```
packages/plugin-contract/
├── package.json        # name: @innate/plugin-contract, private, exports → ./src/index.ts
├── tsconfig.json       # extends @innate/tsconfig/base.json
├── vitest.config.ts
└── src/
    ├── index.ts        # barrel
    ├── plugin.ts       # PluginManifest / PluginNavItem / PluginLoadMode / SitePlugin
    ├── registry.ts     # PluginsRegistry 容器 + getEnabledPlugins/getPluginById/getEnabledHomeTiles
    ├── domain.ts       # createWebDomain / WebDomain / WebDomainBuilder
    ├── outlet.ts       # WebDomainOutlet / outlet id 契约
    ├── collect.ts      # collectWebDomains + 四项断言
    └── types.ts        # 公共辅助类型
```

### 2. manifest 类型（合并两参考的字段）

```ts
export type PluginLoadMode = "route" | "iframe"

export interface PluginNavItem { id: string; label: string; href: string; icon?: string; order?: number }

export interface PluginManifest {
  id: string
  name: string
  description?: string
  /** 是否在 shell 导航中出现。由 feature flag 或 config 驱动 */
  enabled: boolean
  loadMode: PluginLoadMode
  /** loadMode === "iframe" 时必填；宿主渲染 <iframe src> 用 */
  iframeSrc?: string
  nav: { sectionLabel: string; sectionIcon?: string; items: PluginNavItem[] }
  homeTile?: { title: string; description: string; href: string }
}
```

> 与 innate-wip 的 `SitePlugin` **字段完全对齐**，只改名（`SitePlugin` → `PluginManifest`），以便它的实现可以零成本迁入。

### 3. builder 与 outlet

```ts
export type WebDomainOutlet = "root" | "app" | "admin"

export type WebDomainRouteFactory = (parentRoute: AnyRoute) => AnyRoute

export interface WebDomain<TId extends string = string, TRoutes = readonly unknown[], TCapabilities = object> {
  readonly id: TId
  readonly routes: TRoutes
  readonly capabilities: TCapabilities
}

export function createWebDomain<const TId extends string>(
  id: TId,
): WebDomainBuilder<TId, readonly [], {}>
// .addRoute<TOutlet, TFactory>(outlet, factory)
// .addCapability<const TKey, TValue>(key, value)   // value 为 undefined → 抛 TypeError
```

- `addRoute` 追加到 `routes`，保持类型级累积（用 `const` 泛型参数 + 元组类型）。
- `addCapability` 合并到 `capabilities`，`undefined` 抛错。
- 两者都返回新 builder，原对象不变。

### 4. 收集函数与四项断言

```ts
export interface CollectOptions {
  domains: readonly WebDomain[]
  outlets: Record<WebDomainOutlet, AnyRoute>
}

export function collectWebDomains(options: CollectOptions): {
  routes: Record<WebDomainOutlet, AnyRoute[]>
  capabilities<TKey extends string>(key: TKey): unknown[]
  capabilityEntries<TKey extends string>(key: TKey): { domainId: string; capability: unknown }[]
}
```

四项断言（逐条照搬 cyacle `collect.ts`）：

| 断言 | 违反时的行为 |
|------|--------------|
| `assertUniqueDomainIds` | 重复 id → 抛 `Duplicate web domain: <id>` |
| `assertExactOutlets` | 缺失或多出 outlet → 抛错 |
| `assertKnownDomainOutlets` | domain 声明了未注册的 outlet → 抛错 |
| `assertEnabledDomainOutlets` | outlet 被禁用（传 `null`）却仍被 domain 使用 → 抛错 |

### 5. 注册表容器

```ts
export interface PluginsRegistry { readonly plugins: readonly PluginManifest[] }

export function createPluginsRegistry(plugins: readonly PluginManifest[]): PluginsRegistry
export function getEnabledPlugins(registry: PluginsRegistry): PluginManifest[]
export function getPluginById(registry: PluginsRegistry, id: string): PluginManifest | undefined
export function getEnabledHomeTiles(registry: PluginsRegistry): NonNullable<PluginManifest["homeTile"]>[]
```

> 与 innate-wip 的差别：innate-wip 的 `plugins` 是模块级单例，这里改为**显式传 registry 的纯函数**，便于测试与多实例。

### 6. 包配置要点

```jsonc
// packages/plugin-contract/package.json
{
  "name": "@innate/plugin-contract",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "peerDependencies": { "@tanstack/react-router": ">=1" },
  "peerDependenciesMeta": { "@tanstack/react-router": { "optional": true } },
  "devDependencies": { "@innate/tsconfig": "workspace:*", "typescript": "^7", "vitest": "^4" },
  "scripts": { "typecheck": "tsc --noEmit", "test": "vitest run", "lint": "oxlint ." }
}
```

---

## Verify

```bash
# 1. 类型与测试
pnpm --filter @innate/plugin-contract typecheck
pnpm --filter @innate/plugin-contract test

# 2. 无框架运行时依赖（契约包必须可被纯 TS 环境消费）
grep -rE "from ['\"]react['\"]" packages/plugin-contract/src   # 期望：无输出
# 仅允许类型级 import type { AnyRoute } from '@tanstack/react-router'
grep -rn "@tanstack/react-router" packages/plugin-contract/src # 期望：只出现 "import type"
```

**必须覆盖的单测用例**：

| # | 用例 | 期望 |
|---|------|------|
| 1 | `createWebDomain('a').addRoute('app', f)` 后原 builder 的 `routes` 仍为空 | 不可变性 |
| 2 | `addCapability('nav', undefined)` | 抛 `TypeError`，消息含 capability 名 |
| 3 | 两个 domain 使用同一 id | `collectWebDomains` 抛 `Duplicate web domain: <id>` |
| 4 | domain 使用 `outlets` 中不存在的 outlet id | 抛错 |
| 5 | outlets 中有 key 但传 `null` 且被 domain 使用 | 抛错 |
| 6 | `getEnabledPlugins` 过滤 `enabled: false` | 结果不含该插件 |
| 7 | `getEnabledHomeTiles` 忽略无 `homeTile` 的插件 | 长度与 tile 数一致 |
| 8 | 带 `order` 的 nav item 排序 | 与声明顺序一致且按 order 升序 |

**完成标准**：8 条用例全绿；`typecheck` 通过；`grep` 检查无 React 运行时依赖；本包被 `packages/` 下其他包零引用（本任务不接线，接线在 T03/T05）。
