# Frontend Analysis — 三仓库对比与可行性分析

> 目的与目标见 [overview.md](./overview.md)；结论如何落地见 [plan.md](./plan.md)。
> 调研对象：`innate-fe-base` / `innate-wip` / `cyacle`（+ `innate-desktop-codex` 作为已迁出的历史实现）
> 调研方式：只读通读源码（package.json / vite·next 配置 / 路由与注册表源码 / CI workflow / 架构文档），非文档转述。

---

## 0. 调研对象校正

原任务描述的两条路径有误，实际定位如下（以本机为准）：

| 任务描述 | 实际情况 |
|----------|----------|
| `/Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base` | ✅ 正确 |
| `/Users/patrick/workspace/variableway/innate-workspace/innate-apps/content/innate-wip` | ❌ 路径不存在。实际位于 [innate-wip](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip) |
| `/Users/patrick/workspace/cycle-all/cyacle` | ✅ 正确（但本地只 checkout 了 `app` 与 `domain/base`，其余 27 个 domain 为 REMOTE 未拉取） |

---

## 1. 三方画像

| 维度 | [innate-fe-base](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base) | [innate-wip](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip) | [cyacle](file:///Users/patrick/workspace/cycle-all/cyacle) |
|------|------|------|------|
| **定位** | 前端基础库 monorepo（共享 UI + 场景模板 + 参考 app） | 个人网站 + 项目追踪应用（含内容 CMS） | Vine 多 domain 企业应用（Go 后端 + React 前端） |
| **组织者** | 个人（`innate-templates`），pnpm 11 monorepo | 个人（`innate`），pnpm 12 monorepo | 团队（carbonnt），Vine/plot 工具链 |
| **Web 框架** | Next.js 16 ×3 + TanStack Start + Vite ×2 + Vite/React Router ×1 | Next.js 16（App Router） | TanStack Router + Vite（纯 SPA） |
| **后端** | 仅 demo（Prisma/SQLite/better-auth）；skel-lean-ui 有 4 个 API route | 无后端（纯静态生成） | Go server（vine），前端产物被 embed 进二进制 |
| **插件机制** | **无** | build-time registry（已完成约一半） | typed domain builder（已完整落地） |
| **注册源** | — | [registry.ts](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/lib/plugins/registry.ts) 手写数组 | `createWebDomain()` 调用 + plot 生成的聚合文件 |
| **生成物** | `scene-spec-contents.ts`（场景正文）、showcase registry（手写） | 无（依赖手写 registry） | `vineModules.gen.ts` / `vineStyles.gen.css`（plot 生成，gitignore） |
| **构建产物** | 各 app 独立 `next build` / `vite build` | `apps/web/dist`（static export） | `app/src/web/dist`（单 SPA）→ 拷进 Go server |
| **部署** | GitHub Pages（web-showcase）+ CI 门禁 | GitHub Pages + Cloudflare Pages（可选） | Docker 镜像（前端嵌入 server） |
| **共享 UI 来源** | `@innate/ui`（8 个 packages，**源码直出**） | 自带 `@innate/ui` **本地副本**（与 base 漂移风险） | `domain/base/src/web` + `@crew-ui/base`（源码直出） |
| **测试** | vitest（ui / agent-ui / admin-tanstack）+ typecheck + oxlint + oxfmt | typecheck（`next lint` 已废弃路径） | vitest（base 侧有 4 个路由测试）+ typecheck + oxfmt |

---

## 2. 逐仓库关键事实

### 2.1 innate-fe-base：基础库齐全，缺"组装"这一环

**已经很好的部分**

- **共享包全部源码直出、零构建**：8 个包（`ui` / `admin-composites` / `scene-catalog` / `scene-specs` / `scene-mocks` / `agent-ui` / `skills-kit` / `tsconfig`）**没有任何一个声明 `build` 脚本**，`exports` 直接指向 `./src/index.ts`。因此 `pnpm -r build` 实际只构建 app。
- **设计 token 与主题成型**：`@innate/ui` 提供 55 个 shadcn primitive + `ThemeProvider` + 4 套主题 + `globals.css` token（D0 层）。`components.json` 的 aliases 全部指向 `@innate/ui`，说明它被当作**唯一组件来源**而非可复制的模板。
- **文档分层明确**：D0（`globals.css`）→ L1（`COMPONENT_CATALOG.md`）→ L2（`admin-composites`）→ L3（场景规范），见 [README.md](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/README.md) 的"文档体系"。
- **外部接入模式已经设计过**：[dependency-modes.md](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/docs/dependency-modes.md) 定义了 4 种引用模式（workspace / `file:` 目录 / git 子目录 / 私有 npm），并有 [use-external.mjs](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/scripts/use-external.mjs) 一键脚本。**这正是 G1「在另外目录直接用这些基础库」的现成答案。**
- **CI 门禁完整**：oxfmt → typecheck → lint → test → build（[ci.yml](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/.github/workflows/ci.yml)）。

**缺口**

1. **无任何插件/注册表机制**：全仓 grep `module federation|remoteEntry|micro-frontend|PluginFrame|plugin-registry` **0 命中**（`plugin` 命中的都是 better-auth plugins、vite plugins、Tauri plugins、i18n 文案等无关语义）。
2. **历史插件实现已迁出**：`docs/achieve/desktop-shell.md` 中的 Desktop Host / plugin builder / `src/plugins.ts` / `packages/desktop-shell` 在本仓**全部不存在**（已迁至 sibling `innate-desktop-codex`）。**不能按那份文档施工。**
3. **无独立打包/发布流水线**：无 bundling（tsup/rollup/unbuild）、无 `pnpm pack`/`publish` 脚本、无 changesets。`use-external.mjs` 的 npm 模式只打印建议命令。
4. **Next.js 侧需要 `transpilePackages`**：因为包是源码直出（[admin-nextjs/next.config.js](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/apps/admin-nextjs/next.config.js) 已显式列出 4 个 `@innate/*`）。
5. **若干文档与实现漂移**：`pnpm-lock.yaml` 不存在但 CI 要求 `--frozen-lockfile`（只有 `bun.lock`）；根 scripts 里 `dev:nextjs` / `dev:tanstack` 的 filter 包名与实际 `-demo` 后缀不符；`wandesk-ui` 的 `typecheck` 是 `|| true`（恒成功）。

### 2.2 innate-wip：插件"契约"最贴需求，但只做了一半

**已经验证的部分（可以直接抄）**

- **manifest 字段设计**（[types.ts](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/lib/plugins/types.ts)）：

  ```ts
  type PluginLoadMode = "route" | "iframe"
  interface SitePlugin {
    id; name; description?; enabled; loadMode; iframeSrc?
    nav: { sectionLabel; sectionIcon?; items: { id; label; href; icon?; order? }[] }
    homeTile?: { title; description; href }
  }
  ```

  `loadMode` 已经把「同栈路由」与「独立应用 iframe」区分开——这正对应 G4 的两种模式。

- **注册表与开关**（[registry.ts](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/lib/plugins/registry.ts)）：`plugins[]` 数组 + `getEnabledPlugins()` / `getPluginById()` / `getEnabledHomeTiles()`。`enabled` 由 [site-features.ts](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/lib/site-features.ts) 的 flag 驱动 → **翻转开关即可增减模块，shell 零改动**，这正是 G2 的验收标准。
- **不引入微前端的决策已经论证过**（`docs/solution/micro-frontend-research.md`）：核心论点是"MFE 解决的是多团队/多技术栈/独立部署，本项目是单团队单仓单构建管线"，且 qiankun/single-spa/Module Federation 都是 runtime 编排，**与 static export 根本冲突**。该文档还给出了 4 条"何时重新评估"的触发条件。**本规划沿用此结论作为 ADR。**
- **双轨制**（`docs/solution/plugin-dual-track.md`）：内容型模块走 route 模式（保 SEO），工具型/不可信/独立部署走 iframe。决策规则一句话：**承载内容 → route；工具且外部/不可信/独立部署 → iframe；两者皆非 → 不做成插件。**

**缺口（且已自认）**

1. **registry 只覆盖 3 / 7 个主题**：`writing` / `collections` / `feed` 仍硬编码在 [sidebar.tsx](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/components/sidebar.tsx)、`header.tsx`、`app/page.tsx`；`task/project/plugin-mode/` 的 T01–T05 **全部是 todo**。
2. **iframe 模式实际不可用**：`loadMode` / `iframeSrc` **没有任何消费方**（纯声明式元数据）；`app/plugins/[pluginId]/page.tsx` **不存在**；`components/plugins/plugin-iframe-view.tsx` 零引用（dead code）。
3. **shell 直接依赖主题数据**：`app/layout.tsx` 直接 `getWritingMeta()` 喂搜索，违反"shell 不感知具体主题"。
4. **死 flag**：`siteFeatures.feed` 与 `siteFeatures.betterstackGuides` 无消费方；`isFeatureEnabled()` 零调用。
5. **`@innate/ui` 双副本漂移**：`innate-wip/packages/ui` 与 `innate-fe-base/packages/ui` 同名同版本（0.1.0）当前 diff 为零，但**任一侧单边改动后版本号即失效**。
6. **已知技术阻塞**：Next 16 static export 下，`app/plugins/[pluginId]/page.tsx` 的 `generateStaticParams` 返回空集会导致构建报错（PDF/T04 记录），候选解法是生成 `__none__` 空态页。
7. **sandbox 是假隔离**：`allow-scripts` 与 `allow-same-origin` 同时开启，等同于没有隔离。

### 2.3 cyacle：domain 插件契约最完整，但绑定 plot 工具链

**最有价值的部分（这是本规划的主要借鉴来源）**

- **typed builder 契约**（[builder.ts](file:///Users/patrick/workspace/cycle-all/cyacle/domain/base/src/web/src/routes/domain/builder.ts)）：

  ```ts
  export function createWebDomain<const TId extends string>(id: TId)
  //  → .addRoute(outlet, factory)   factory: (parentRoute: AnyRoute) => AnyRoute
  //  → .addCapability(key, value)    value 为 undefined 时直接抛 TypeError
  interface WebDomain { id; routes: {outlet, factory}[]; capabilities }
  ```

  两个设计点值得照搬：**① factory 入参刻意收敛为 `AnyRoute`**（跨 package ABI 稳定，domain 无需知道宿主的具体类型）；**② builder 不可变**，每次 `addRoute` 返回新对象。

- **outlet 契约**（[outlet-contract.ts](file:///Users/patrick/workspace/cycle-all/cyacle/domain/base/src/web/src/routes/domain/outlet-contract.ts) + `config/outlets.ts`）：outlet 是 **RootRoute 下的 pathless layout route 的 id**，只有 `id` 没有 `path`。内建 `root`，项目可注册 `app` / `admin`。用 `defineWebDomainRootOutletIds("app","admin")` 声明，**类型层把"domain 用到但宿主传成 null 的 outlet"变成编译期错误**。

- **收集与四项断言**（[collect.ts](file:///Users/patrick/workspace/cycle-all/cyacle/domain/base/src/web/src/routes/domain/collect.ts)）：`assertUniqueDomainIds` / `assertExactOutlets` / `assertKnownDomainOutlets` / `assertEnabledDomainOutlets`，再按 outlet 收集路由。**这套断言就是 G6「契约可机器校验」的现成实现。**

- **组装入口与树形**（[create-web-router.ts](file:///Users/patrick/workspace/cycle-all/cyacle/domain/base/src/web/src/routes/router/create-web-router.ts) + `route-tree.ts`）：`outlets = {root: rootRoute, ...rootOutlets}` → 收集 domain → 建树。最终树形为：
  `RootRoute` ← [app-owned root routes, domain root routes, 各 outlet route（children = app-owned routes + domain routes，顺序固定 app 先、domain 后）]，且 `routeTree` 不允许被覆盖。

- **类型层重绑定**（`reparent-route.ts`）：domain 各自独立编译时只知道 `AnyRoute`；宿主收集时把 path/params/search/loaderData 类型重新绑定到真实 parent。注释原文："Collection then rebinds their TanStack type tree to the app's actual outlet route so paths, params, search, loader data, and children remain precise."

- **standalone 自检 router**（`standalone-router.ts`）：domain 可以用一个自建 root router **在自己的 TS program 里校验路径/params/search**，不需要宿主。→ 这是 G3「domain 在另外目录也能 typecheck」的现成解法。

- **生成聚合文件**（`change.web.md` + `docs/generated-files-and-css.md`）：

  ```ts
  // vineModules.gen.ts
  export const webModules = [ProjectDataWebModule, UicWebModule] as const
  ```

  ```css
  /* vineStyles.gen.css —— 顺序固定：base → domains → app */
  @import "@carbonnt-cyacle/web-base/globals.css";
  @import "@carbonnt-cyacle/web-project-data/globals.css";
  @import "./globals.css";
  ```

  `main.tsx` **只 import 这一个 css**，解决"CSS 从 TS side-effect 分散导入导致覆盖顺序不稳定"的问题。→ 这是 G5「脚本化生成」的模板。

- **外部仓库虚拟化**：`pnpm-workspace.yaml` 里 `# plot:workspace-begin/end` 之间是 `.cache/web/workspace/{web,skeld}/<domain>`——plot 把 **REMOTE domain 拉到 `.cache` 下作为虚拟 workspace 包**，`app/src/web` 再以 `workspace:*` 引用。本地只保留 `domain/base`。→ 这为 G1「domain 可以在另外目录」提供了另一种实现路径。

- **领域文档树**（[web.md](file:///Users/patrick/workspace/cycle-all/cyacle/domain/base/src/web/web.md)）：`development-and-validation` / `code-boundaries-and-exports` / `routing-and-layout` / `feature-organization` / `admin-pages` / `domain-i18n` / `api-and-query-key` 等，入口只维护"阅读顺序 + 职责边界 + 职责速查表"。→ 文档组织方式值得照搬。

**缺口 / 不可直接照搬的原因**

1. **契约绑定 plot**：聚合文件由 `plot app apply` 生成且被 gitignore，**没有 plot 就跑不起来**（本机 `.cache/`、`vineModules.gen.ts`、`vineStyles.gen.css` 均不存在，`router.ts` 的 import 无法解析，typecheck/build 必然失败）。
2. **无 runtime 插件加载**：所有 domain 在构建期被 Vite 打进**同一个 bundle**，`app/src/web` 是唯一 ship module。**没有"独立打包一个 domain 再注入"的机制**，也没有任何 Next.js 集成。
3. **无 library 模式 / 多入口 / externals**：[vite.config.ts](file:///Users/patrick/workspace/cycle-all/cyacle/app/src/web/vite.config.ts) 只有 `define` / `resolve.dedupe` / 3 个插件，无 `build` 段，走默认单入口 `index.html`。
4. **前端不是独立部署单元**：CI 把 `app/src/web/dist` 拷进 Go 源码树，`go build -tags production` 把前端 embed 进 server 二进制。
5. **package 未加 scope 风险**：`pnpm-workspace.yaml` 用 `catalogs.web` 统一第三方版本（React 19 / TanStack Router 等），这是保证"单例 React"的关键，需要照搬。

---

## 3. 横向差异对比（聚焦"插件与打包"）

| 对比项 | innate-fe-base | innate-wip | cyacle | 本规划取向 |
|--------|----------------|-----------|--------|-----------|
| 插件声明方式 | 无 | 手写 `plugins[]` 数组 | `createWebDomain()` builder | **builder**（cyacle），并保留可序列化 manifest 供脚本生成 |
| 插件元数据形态 | 无 | TS 对象（含 nav/homeTile） | TS 对象（含 routes/capabilities） | **两者合并**：manifest（nav/homeTile/loadMode）+ routes/capabilities |
| 路由挂载点 | 各 app 自定 | Next 文件路由 | **outlet（root/app/admin）** | **outlet**（cyacle） |
| 能力暴露 | 无 | 无 | `capabilities` 泛型收集 | **capabilities**（cyacle），但宿主不限定业务语义 |
| 组装时机 | — | 构建期（TS import） | 构建期（TS import + 生成文件） | **构建期**，不引入 runtime 编排 |
| 聚合文件 | 部分（scene-specs codegen） | 无 | **plot 生成 modules + styles** | **脚本生成**，但不绑定 plot |
| domain 独立编译 | 不适用 | 不适用 | **standalone router 自检** | **照搬** |
| 独立部署单元 | app（6 个） | app（1 个） | 仅 Go server（前端嵌入） | **app 与 Next 插件**（G4） |
| 异构技术栈嵌入 | 无 | iframe 组件已备好但未接线 | 无 | **iframe 宿主**（G4） |
| 契约机器校验 | 无 | 规划中（refine T02 未做） | **collect 四项断言** | **照搬断言 + 加硬编码回归检查** |
| 样式顺序治理 | app 各自导入 | app 各自导入 | **styles.gen.css 统一顺序** | **照搬** |
| 第三方版本一致性 | 根 `overrides` | 根 workspace | **`catalogs.web`** | **catalogs**（更强） |

---

## 4. 结论一：三者的关系

```
                ┌──────────────────────────────────────────┐
                │  共同的架构直觉（三者独立收敛到同一结论）   │
                │  App Shell + 构建期注册 + 主题/领域插件    │
                └──────────────────────────────────────────┘
                        ▲                ▲                ▲
        ┌───────────────┘                │                └───────────────┐
        │                                │                                │
  innate-fe-base                    innate-wip                       cyacle
  ─────────────                    ──────────                       ──────
  提供【基础库层】                  提供【契约设计层】                提供【组装机制层】
  · @innate/ui 55 primitives       · SitePlugin manifest            · createWebDomain builder
  · 设计 token + ThemeProvider     · loadMode: route | iframe       · outlet 契约 + 4 项断言
  · admin-composites (L2)          · getEnabledPlugins()            · createWebRouter 组装
  · 文档分层 D0→L1→L2→L3          · 不引入 MFE 的 ADR              · standalone 自检 router
  · use-external 外部接入          · 双轨制决策规则                  · 生成 modules/styles 聚合
  · CI 门禁                       · 静态导出 + 多平台部署            · catalogs 版本单一来源
        │                                │                                │
        └────────────── 都是"局部完整、彼此不通用" ──────────────────────┘
                                       │
                                       ▼
                          本规划 = 把三层拼成一个体系
                 base 的库 + wip 的 manifest 设计 + cyacle 的组装机制
                            + 一个不绑定任何厂商工具的生成器
```

**一句话**：`innate-fe-base` 是**库**，`innate-wip` 是**契约草案**，`cyacle` 是**参考实现**。三者没有重复建设，可以互补拼接；唯一真正的冲突是 `innate-wip` 自带的那份 `@innate/ui` 副本（需要统一来源）。

---

## 5. 结论二：可行性判断（逐条回应用户的三个倾向）

### 5.1 「主要的 web 用 TanStack 做基础框架」— ✅ 可行，且有现成参考实现

- `cyacle` 已经在 TanStack Router 上验证了完整的「domain 插件 + 构建期组装」模型，包括 outlet 契约、路由树组装、类型重绑定、自检 router。**不是从零摸索。**
- `innate-fe-base` 里已有 [admin-tanstack](file:///Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base/apps/admin-tanstack)（TanStack Start + Vite + Nitro），可以直接作为 shell 的骨架起点。
- **建议选型**：shell 用 **TanStack Router + Vite（SPA）** 而不是 TanStack Start（SSR）。理由：① 与 cyacle 的模型完全一致，可直接搬代码；② 纯 SPA 没有 SSR/静态导出的动态路由约束（见 5.3）；③ 若将来需要 SSR/SEO，再上 TanStack Start，路由契约不变。
- **代价**：TanStack 生态成熟度低于 Next.js（文档、第三方集成、Agent 训练语料都更少）。这是明确接受的成本。

### 5.2 「domain 按 TanStack 这个基础来做」— ✅ 可行，直接照搬 cyacle 契约

- domain 包结构：`domain/<name>/` 内含 `package.json`（`exports: "./src/index.ts"` 源码直出）+ `src/web/`，导出一个 `webDomain`。
- **domain 不依赖 shell，只依赖 `plugin-contract` 包**（所以能在另外目录独立 typecheck，G3 达成）。这一点 cyacle 已经通过 `AnyRoute` 收敛 + standalone router 解决，照搬即可。
- **必须照搬的一条约束**：domain 不能反向依赖 base 的业务实现（cyacle 的 `change.web.md` 记录了踩坑："base 依赖 UIC 会形成领域反向依赖，导致 base 不再是稳定共享层"）。

### 5.3 「基础框架可以支持 nextjs apps plugin 进去」— ⚠️ 部分可行，需要收窄定义

这是本次分析**唯一需要修正用户预期的地方**。要区分两种"plugin 进去"：

| 方案 | 能否把 Next.js 应用放进 TanStack shell | 结论 |
|------|----------------------------------------|------|
| **route 模式**（同 bundle、构建期 import 组件） | ❌ **不可行** | Next.js 的组件依赖 RSC/服务端运行时与 Next 的 bundler 插件；把一个 Next 应用的页面作为普通 React 组件 import 进 TanStack SPA，会丢失 RSC、server actions、ISR、`next/*` 运行时。技术上不是"打包配置问题"，而是运行时模型冲突。 |
| **iframe 模式**（独立构建独立部署 + 宿主页挂 iframe） | ✅ **可行** | 这正是 `innate-wip` manifest 里 `loadMode: "iframe"` 的用途，且它已写好 `plugin-iframe-view.tsx`（含 loading / error / 新窗口逃生门）。shell 只需补一个宿主路由。 |
| **standalone 模式**（各自部署，靠链接互通） | ✅ **可行且最省事** | 现成的：`innate-fe-base` 的 6 个 app 各自 `build` 各自部署（web-showcase 走 GitHub Pages）。 |

**因此 G4 的准确表述应为**：

> - **TanStack 技术栈的应用** → route 模式（构建期组装进 shell）
> - **Next.js / 异构技术栈 / 不可信 / 需独立部署的应用** → iframe 模式
> - **不需要出现在 shell 里的** → standalone 模式

反向也成立：**如果坚持"Next.js 应用要深度集成进主 web"，那主 shell 本身就应该选 Next.js**（即走 `innate-wip` 的路线），而不是 TanStack。**两条路线不能混**——这是本规划最重要的取舍点，需要用户显式确认。

**一个额外的好处**：`innate-wip` 记录的阻塞（Next 16 static export 下 `app/plugins/[pluginId]` 空 `generateStaticParams` 构建报错）**在 TanStack Router SPA 里天然不存在**——宿主路由是客户端路由，不需要 `generateStaticParams`。选 TanStack 会顺手消掉这个已知阻塞（但要补静态托管的历史回退，见 [plan.md](./plan.md) 部署计划）。

---

## 6. 可借鉴清单（Will Borrow）

### 6.1 从 cyacle 借鉴（组装机制）

| # | 借鉴内容 | 来源文件 | 落地任务 |
|---|----------|----------|----------|
| B1 | `createWebDomain().addRoute().addCapability()` 不可变 builder + `undefined` 抛错 | `routes/domain/builder.ts` | T01 |
| B2 | outlet 契约（pathless layout route id：`root`/`app`/`admin`）+ 类型层校验 | `routes/domain/outlet-contract.ts`、`config/outlets.ts` | T01 |
| B3 | 四项收集断言（唯一 id / outlet 精确 / 已知 outlet / 启用 outlet） | `routes/domain/collect.ts` | T01、T09 |
| B4 | `createWebRouter` 组装入口 + `routeTree` 不可覆盖 | `routes/router/create-web-router.ts` | T03 |
| B5 | 固定树形顺序（app-owned 先、domain 后） | `routes/router/route-tree.ts` | T03 |
| B6 | 类型重绑定 `reparent-route.ts`（domain 只认 `AnyRoute`，宿主再绑定） | `routes/domain/reparent-route.ts` | T01、T03 |
| B7 | standalone 自检 router（domain 独立 typecheck） | `routes/router/standalone-router.ts` | T01、T05 |
| B8 | 生成 `modules.gen.ts` + `styles.gen.css`（顺序 base → domain → app，`main.tsx` 只 import 一个） | `change.web.md`、`docs/generated-files-and-css.md` | T02 |
| B9 | AppShellFrame（sidebar/topbar/breadcrumbs/nav，输入 `navConfig`，不含业务数据） | `components/common/app-shell-frame/` | T04 |
| B10 | `catalogs` 统一第三方版本（保 React 单例） | `pnpm-workspace.yaml` | T02 |
| B11 | 领域文档树：入口只写"阅读顺序 + 职责边界 + 职责速查表" | `domain/base/src/web/web.md` | T10 |
| B12 | `.cache` 虚拟 workspace 承载远端 domain（可选） | `pnpm-workspace.yaml` `# plot:workspace-begin` | T08 |

### 6.2 从 innate-wip 借鉴（契约设计）

| # | 借鉴内容 | 来源文件 | 落地任务 |
|---|----------|----------|----------|
| B13 | `SitePlugin` manifest 字段（`enabled` / `loadMode` / `nav` / `homeTile`） | `lib/plugins/types.ts` | T01 |
| B14 | `getEnabledPlugins()` / `getPluginById()` / `getEnabledHomeTiles()` | `lib/plugins/registry.ts` | T01、T03 |
| B15 | feature-flag 驱动 `enabled`（翻转开关 = 零 JSX 改动） | `lib/site-features.ts` | T03 |
| B16 | 不引入微前端框架的 ADR + 4 条重评估触发条件 | `docs/solution/micro-frontend-research.md` | 本文件 §7 |
| B17 | 双轨制决策规则（内容→route / 工具→iframe / 否则不做插件） | `docs/solution/plugin-dual-track.md` | T06 |
| B18 | iframe 宿主 UI（loading / error / 新窗口逃生门） | `components/plugins/plugin-iframe-view.tsx` | T06 |
| B19 | 主题目录约定：`app/<theme>/` + `lib/<theme>/` + `components/<theme>/` | `task/project/plugin-mode/spec.md` | T05 |
| B20 | `verify-plugins` 三层断言设计（契约一致性 / 硬编码回归 / flag 覆盖率） | `task/project/refine/tasks/T02` | T09 |
| B21 | 静态导出多平台部署（GitHub Pages / Cloudflare，含 basePath 条件化） | `.github/workflows/` | T07 |

### 6.3 从 innate-fe-base 借鉴（基础库与工程）

| # | 借鉴内容 | 来源 | 落地任务 |
|---|----------|------|----------|
| B22 | `@innate/ui` 55 primitives + `globals.css` 设计 token + ThemeProvider | `packages/ui` | T04 |
| B23 | 源码直出（零构建）的包策略 + Next 侧 `transpilePackages` | 各 `package.json` | T02、T06 |
| B24 | `use-external.mjs`（dir/git/npm 三模式）+ `dependency-modes.md` | `scripts/`、`docs/` | T08 |
| B25 | skills 同步机制（目录深拷贝 + 目标白名单 + 可选清空 + 集成测试） | `packages/skills-kit/cli/` | T02、T10 |
| B26 | CI 门禁（oxfmt → typecheck → lint → test → build）+ path 过滤部署 | `.github/workflows/ci.yml` | T09 |
| B27 | 文档分层 D0→L1→L2→L3 与"唯一真相源"原则 | `README.md`、`AGENTS.md` | T10 |

### 6.4 明确不借鉴（Won't Borrow）

| 内容 | 原因 |
|------|------|
| `docs/achieve/desktop-shell.md` 的 Desktop Host / plugin builder / `src/plugins.ts` | 已迁出本仓，文件不存在，文档自述"命令、包名和路径不能直接用于当前 fe-base" |
| 完整引入 `plot` / Vine 工具链 | 绑定 Go + 私有 git（`git.cew.io`），个人 web 项目用不上；只借鉴它的**产物形态**，不借鉴它的实现 |
| `innate-wip` 的 `packages/ui` 副本 | 与 base 双副本漂移；统一改用 `@innate/ui` 单一来源 |
| 任何 MFE 框架 | 见 §7 ADR |
| Next 16 static export + 动态空 params 的 `__none__` 兜底技巧 | 选 TanStack SPA 后不再需要该约束 |

---

## 7. ADR：不引入微前端框架（沿用 innate-wip 结论）

**决策**：插件模型 = **App Shell + 构建期 Registry + route/iframe 两种 loadMode**，不引入任何 MFE 框架。

**理由**（原文要点，已复核逻辑成立）：

1. **MFE 解决的问题不存在**：MFE 的价值是多团队、多技术栈、独立构建/独立部署；本项目是单团队、单仓、单构建管线，模块之间几乎无运行时交互。
2. **与静态托管根本冲突**：qiankun / single-spa / Module Federation 都需要 runtime 编排（动态拉 remote bundle、沙箱、运行时注册），而我们是构建期组合。
3. **就是反模式场景**：需求是"简单 + 交互少"，正是 MFE 公认不该用的场景。
4. **MFE 的思想已经用上**："App Shell + 注册点 + 插件" 本身就是 build-time composition；`loadMode: iframe` 已经覆盖"某模块真长成独立应用"的未来情形。

**重新评估的触发条件**（满足任一才重新讨论）：

1. 某个模块要**独立仓库 / 独立部署 / 独立发版**
2. 引入**第二技术栈**（Vue / Svelte）且需要深度集成（不是 iframe 能解决的那种）
3. 模块之间出现**共享运行时状态**需求，且无法放到数据层解决
4. 放弃静态托管，改为服务端托管

---

## 8. 风险与冲突清单

| # | 风险 | 影响 | 应对 |
|---|------|------|------|
| R1 | **React 类型/运行时多副本**（cyacle 已踩坑：`sharedWorkspaceLockfile: false` 下每个 web 包各自解析 `@types/react`，React 19 `ref` 类型不兼容） | typecheck 报错难以定位 | 用 `catalogs` 统一版本 + 根 `overrides` 钉住 `@types/react`；`resolve.dedupe: ['react','react-dom']` |
| R2 | **domain 源码直出导致消费方连带编译依赖源码**（cyacle 记录该问题的长期解法是"domain 输出声明产物"） | 类型污染、编译变慢 | P0 先接受（与 base 现状一致）；P2 再评估 dts 产出 |
| R3 | **`@innate/ui` 双副本漂移**（wip 副本 vs base） | 组件行为不一致 | 统一来源；`innate-wip` 改为 `file:`/workspace 引用 base |
| R4 | **TanStack 生态成熟度低于 Next.js** | 遇到问题时资料少 | 接受；核心契约（router/manifest）是自研的，风险可控 |
| R5 | **iframe 的"假隔离"**（`allow-scripts` + `allow-same-origin` 同开） | 安全隔离名不副实 | T06 明确 sandbox 策略；不可信内容不给 `allow-same-origin` |
| R6 | **SPA 静态托管的历史回退**（深链 `/plugins/xxx` 刷新 404） | 刷新丢页 | 部署计划中要求托管侧配置 SPA fallback（`404.html` → `index.html`） |
| R7 | **文档漂移**（base 已有 5 处文档与实现不符） | 误导后续施工 | T10 要求文档与代码同 PR；`fe verify` 加可执行断言代替文字承诺 |
| R8 | **范围膨胀**：三个仓库的资产都想搬 | 永远做不完 | 严格按 §3 非目标裁剪；每个任务必须有可执行的 verify |
| R9 | **Next.js 集成预期落差** | 用户以为能 route 模式集成 | 已在 §5.3 显式收窄；需用户确认取舍 |

---

## 9. 待用户确认的决策点

1. **主 shell 选 TanStack Router + Vite（SPA）还是 TanStack Start（SSR）？** → 建议 SPA，理由见 §5.1；若需要 SEO 则选 Start，但会重新引入静态导出/动态路由约束。
2. **确认 §5.3 的收窄**：接受"Next.js 应用以 iframe / standalone 方式集成，而非 route 模式"？若不接受，主 shell 应改选 Next.js（即 `innate-wip` 路线）。
3. **`innate-wip` 与 `cyacle` 的处置**：是"只搬机制不动业务"（本计划默认），还是要把 `innate-wip` 作为第一个真实 domain 迁入新体系？
4. **新包放置位置**：`plugin-contract` / `web-shell` / `fe-cli` 建在 `innate-fe-base/packages/` 下（本计划默认），还是独立新仓？
