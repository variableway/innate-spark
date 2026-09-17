# 三项目分析与可行性结论

> 输入：innate-fe-base、innate-wip、cycle(cyacle) 三个项目的代码级调研（2026-09）。目标定义见 [overview.md](overview.md)。

## 0. 一页结论

| 用户倾向 | 结论 | 依据 |
| --- | --- | --- |
| 1. 主 web 用 TanStack | **可行，直接采纳** | cycle 全量验证了 TanStack Router code-based routes + 多 domain 组装；innate-fe-base 已有 `admin-tanstack`（TanStack Start + Vite 7 + Nitro）模板 |
| 2. domain 按 TanStack 契约开发 | **可行，借鉴 cycle 的 builder 模式** | cycle 的 `createWebDomain().addRoute(outlet, factory).addCapability()` 在编译期保类型、运行时有防呆校验，是目前三个项目里最完整的 domain 契约 |
| 3. 基础框架支持 Next.js 插入 | **可行，但必须双轨** | 构建期把 Next.js app "编进" TanStack SPA 无现实路径（框架路由模型不兼容）；采用 innate-wip 的双轨决策：内容/组件型走包消费（轨道 A），应用型走 iframe + manifest（轨道 B） |
| 4. 独立打包 + 可插回 web | **可行** | cycle 有 standalone router（domain 单仓开发时类型可用）；innate-fe-base 历史上的 `import-static-app.mjs` 验证过"远端项目 → 构建产物 → `public/plugins/<id>/`"的静态导入全流程 |
| 5. bun/ts 脚本化自动打包 | **可行，做 plot 的轻量开源版** | cycle 的 plot 证明了 manifest→codegen→组装的编排价值，但它绑私有工具链；用 bun 重写"扫描 + 生成注册表 + 编排构建"三个动作即可获得 80% 收益 |

**总体判断：方向成立。架构 = cycle 的编译期插件模型（去私有工具链）+ innate-fe-base 的包体系与模板资产 + innate-wip 的双轨接入与翻 flag 验收法。**

---

## 1. innate-fe-base：包体系与模板资产

**形态**：pnpm 单层 workspace（`apps/*` + `packages/*`），构建期 `workspace:*` 静态组装，无运行时插件机制。

- **apps**：`admin-tanstack`（TanStack Start + Vite 7，4011，Admin 首选参考）、`admin-nextjs`（Next.js 16 App Router，4012，双框架对照）、`web-showcase`（静态导出 → GitHub Pages）、`skel-lean-ui`、`admin-ui`（冻结的本地 shadcn 拷贝）、`wandesk-ui`（Desktop OS 风格 webshell 参考，React Router 7 + Vite，可选 Tauri 壳）。
- **packages**：`ui`（@innate/ui，L1 原语，Base UI 底座 + shadcn 体系，源码直出无构建）、`admin-composites`（L2）、`scene-catalog`/`scene-specs`/`scene-mocks`（L3 场景）、`agent-ui`、`skills-kit`、`tsconfig`。
- **关键历史资产**：`docs/achieve/desktop-shell.md` 记录了完整的"webshell 宿主 + iframe 插件"设计——manifest 协议 `innate.desktop-plugin.v1`（static / external-url 两种 runtime）、信封消息 + 通道分层、origin 双侧校验安全模型、配套 `import-static-app.mjs` 导入构建脚本。**该线路已整体迁出到 sibling 仓库（本机不可考），仓库内只留规范记忆**——但设计文档质量高，轨道 B 可直接复用其协议设计。
- **工程信号**：分层铁律清晰（D0→L1→L2→L3 单向）；已知问题包括 TS 版本不统一（根 ^7 vs apps ^5.7）、admin-ui 不走共享库、CI 在 pnpm-lock 被删后会失败；`bun.lock` 是一次性产物，实际包管理器是 pnpm。

**对本方向的供给**：shell 模板（admin-tanstack）、UI/场景包体系、tsconfig 预设、iframe 插件协议文档、双框架兼容先例（`admin-composites/dynamic-ssr` 同时服务 Next 与 TanStack SSR）。

## 2. innate-wip：构建期插件注册表 + 双轨决策

**形态**：独立仓库（物理嵌于 hub 的 `innate-apps/content/` 下），pnpm workspace；`apps/web` = Next.js 16 静态导出内容站。

- **插件机制（已落地一半）**：`lib/plugins/types.ts` 定义 `SitePlugin { id, name, enabled, loadMode: "route"|"iframe", nav, homeTile }`；`registry.ts` 手写注册（making/cheatsheets/awesome 三个，当前 flag 全 false）；消费链覆盖 sidebar/header/首页 bento 三处，翻一个 flag 三处联动。
- **双轨设计（`docs/solution/plugin-dual-track.md`）**：轨道 A "package-as-plugin"——插件 = workspace 包，宿主路由一行式 re-export，SEO 友好；轨道 B iframe——"真外部 / 不可信 / 独立部署"三条件全满足才用。**决策规则：承载内容 → A；工具且外部 → B。**
- **MFE 否决结论（`docs/solution/micro-frontend-research.md`）**：single-spa / MF 2.0 / qiankun / wujie / micro-app / Garfish / Piral 全部否决，理由是静态导出与运行时编排冲突、单人单仓无多团队诉求。
- **已知阻塞**：iframe 宿主路由 `/plugins/[pluginId]` 未实现——Next 16 static export 下 `generateStaticParams` 空数组会构建报错；核心三主题（writing/collections/feed）尚未迁入 registry；存在 stale 根脚本（`run:project`、`sync:*`）。
- **与基础库关系**：`packages/ui` 是 innate-fe-base 同名包的**逐字节快照复制**（vendored copy），独立成仓时带走；规划未来走私有 npm。
- **CI/CD**：GitHub Pages + Cloudflare Pages 双目标，cron 每 2 小时数据回流，构建期把 `data/` 变更 commit 回仓库。

**对本方向的供给**：双轨决策规则、翻 flag 验收法、静态导出约束清单、MFE 否决论证（本方向直接继承，不再重复调研）、双部署 workflow 模板。

## 3. cycle (cyacle)：编译期插件体系（最完整，但绑私有工具链）

**形态**：薄壳仓库 + 十几个独立 domain 仓库；壳内 `app.yaml`（manifest：LOCAL/REMOTE domain 清单）+ `plot.yaml`（工具链版本）。私有工具 `plot app apply` 在本地克隆/编译/合成出一个临时 monorepo 再构建。

- **前端栈**：React 19 SPA + **TanStack Router（code-based typed routes）** + TanStack Query + Vite 8 + Tailwind 4 + Base UI/shadcn（base-nova 风格）。
- **插件协议（核心可借鉴）**：
  - 每个 domain web 包导出 `webDomain = createWebDomain('<id>').addRoute('<outlet>', factory).addCapability(key, value)`——不可变链式 builder，`const` 泛型保留 path/params 字面量类型；
  - 宿主 `createWebRouter({ domains, rootOutlets: { app: AppLayout, admin: AdminAppLayout } })`——**布局实例由宿主注入，插件只声明挂到哪个 outlet**；
  - `collect.ts` 做运行时防呆：重复 id / 未知 outlet / 禁用 outlet 被使用直接 throw；
  - capability 显式协商（nav、permissionCodes 等），宿主不猜插件；
  - 每 domain 保留 `standalone-router`（`createStandaloneWebDomainRouter`），单仓开发时 `<Link>`/`navigate` 类型可用且不被 app 导入。
- **接缝设计**：`plot` 生成两个聚合文件 `vineModules.gen.ts`（import 所有 `webDomain`）+ `vineStyles.gen.css`（base→domain→app 固定顺序聚合），gitignore + 禁改约定，宿主手写代码不被模板覆盖。
- **依赖治理**：pnpm catalog 统一版本、feature domain 用 peerDependencies、vite `dedupe: ['react','react-dom']` 保单例、最小 tsconfig paths 只映射 `@types/react` 解决 React 19 双类型。
- **构建部署**：`plot app apply` → vite build → dist 拷入 Go server → `go:embed` → 单二进制 + Docker 镜像。
- **局限**：plot/skelc/vine/vine-hub 全部闭源私有，离开无法组装；无运行时动态性；全量单 bundle；样式隔离弱（仅 import 顺序 + `isolation: isolate`）；类型体操成本高；`.cache` 虚拟 workspace 对 IDE 不透明。

**对本方向的供给**：domain 契约的完整参考实现（builder/collect/reparent/outlets/standalone）、生成聚合文件的接缝模式、依赖治理清单。**不带走**：私有工具链、Go/vine 后端耦合。

## 4. 横向对比

| 维度 | innate-fe-base | innate-wip | cycle |
| --- | --- | --- | --- |
| 仓库形态 | 单仓 workspace | 独立仓 + vendored ui 包 | 薄壳仓 + 多 domain 仓 + codegen 合成 |
| 主框架 | TanStack Start / Next 双轨模板 | Next.js 16 静态导出 | React SPA + TanStack Router |
| 插件范式 | 无（历史 iframe 壳已迁出） | 构建期 registry + feature flags | 编译期 codegen + typed builder |
| 插件接缝 | —（曾是 `src/plugins.ts` + `public/plugins/`） | 手写 `registry.ts` | 生成 `vineModules.gen.ts` / `vineStyles.gen.css` |
| 运行时隔离 | 曾有 iframe + origin 校验协议 | iframe 组件有、宿主路由缺 | 无（同 bundle） |
| 类型安全 | workspace 源码直出 | 同左 | outlet/路由全程保类型（最强） |
| UI 库 | @innate/ui（源头） | @innate/ui（快照副本） | Base UI + shadcn base-nova（独立同源） |
| 自动化 | node/bash 脚本 | GitHub Actions 双部署 | plot 私有编排 + Go 单镜像 |
| 主要短板 | 无插件机制、TS 版本分裂、文档与代码漂移 | 插件化半成品、静态导出限制 | 私有工具链锁定、无动态性 |

**三者关系**：innate-fe-base 是"包的源头 + 模板母体"；innate-wip 是从它复制 ui 包独立成仓的消费方（快照漂移风险）；cycle 是外部独立演化的同类实践，与两者零代码关联，但架构上恰好是本方向要造的东西的最完整参照。

## 5. 可行性详论

### 5.1 TanStack 主 webshell

- cycle 证明了 TanStack Router 承载 26+ domain 组装的工程可行性（含类型、防呆、样式聚合）；
- innate-fe-base 的 `admin-tanstack` 提供了现成的 TanStack Start + Vite 7 + Tailwind 4 + @innate/ui 起点，`apps/web-showcase` 提供了静态导出与 Pages 部署先例；
- 风险：TanStack Start 的 Nitro SSR 与静态导出的组合需要一次性验证（admin-tanstack 当前是 SSR 模式）；若走纯 SPA（cycle 模式）则更简单，SSR 可作为后续增量。

### 5.2 domain 插件契约（TanStack）

- 直接采纳 cycle 的四件套：`createWebDomain` builder、outlets 常量、collect + 防呆校验、standalone router；
- 差异化决策：cycle 的 `webModules` 聚合由私有 plot 生成，我们改用 **bun 脚本扫描约定目录生成 `modules.gen.ts`**（同样的 gitignore + 禁改约定）；
- domain 目录位置：先在 innate-fe-base 内 `domains/`（workspace 外挂目录或独立 workspace 组），跑通后再考虑独立仓库 + gitUrl 清单（cycle 的 REMOTE 模式，用 bun 脚本做 clone/link，替代 plot）。

### 5.3 Next.js 插入（双轨）

- **轨道 A（包消费）**：domain 包导出框架无关的 React 组件 + TanStack 路由工厂；Next.js app 以 `workspace:*` + `transpilePackages` 消费组件层（innate-wip 对 `@innate/ui` 已验证此模式），TanStack 路由工厂则只在 shell 用。innate-fe-base 的 `dynamic-ssr` 复合组件已有双框架 SSR 兼容先例。
- **轨道 B（iframe）**：复用 desktop-shell 归档设计的 manifest 协议（`loadMode: iframe | static`、信封消息、origin 校验）+ innate-wip 的 `plugin-iframe-view.tsx`（sandbox 属性、加载/失败/新开标签降级 UI）。在 TanStack shell 里实现 `/plugins/$pluginId` 宿主路由**没有** innate-wip 的 static-export `generateStaticParams` 阻塞（TanStack SPA 路由天然支持参数路由），这是选 TanStack 做 shell 的一个额外红利。
- 判定规则继承 innate-wip：内容 → A；真外部 / 不可信 / 独立部署 → B。

### 5.4 独立打包与静态插回

- domain 独立产物：standalone router + vite build → 单 domain 静态 dist（可本地起静态服务预览）；
- 插回 web：产物拷入 shell 的 `public/plugins/<id>/`（复刻 `import-static-app.mjs` 的 staging + 原子替换 + dist 逃逸校验思路，安全要求参考 `tasks/features/skill-refine/P0-03` 的治理记录）；
- 非 web 的 apps 独立项目：本来就是独立打包，无需额外机制，仅需在编排 CLI 里注册构建入口。

### 5.5 bun/ts 脚本化

- 需要的脚本动作只有三个：**scan**（扫 domain 目录 → manifest 列表）、**gen**（生成 `modules.gen.ts` / `styles.gen.css`）、**build/orchestrate**（按 manifest 顺序构建 shell 与各插件产物、组装部署目录）；
- bun 直接跑 TS、内置打包器与 watch，满足 overview 第 6 条"脚本可在 base-fe 中实现"；与仓库现有 pnpm 包管理不冲突（脚本只是编排器，不接管依赖）。

## 6. 风险与开放问题

| # | 风险 | 缓解 |
| --- | --- | --- |
| R1 | React 19 双实例/双类型问题（多包源码直出时） | 沿用 cycle 治理：tsconfig paths 钉 react 到根、vite dedupe、统一 catalog 版本 |
| R2 | 样式互相污染（无 shadow DOM/iframe） | 沿用 cycle 的 CSS 顺序契约 + `isolation: isolate`，D0 token 唯一来源保持在 `@innate/ui/globals.css` |
| R3 | `@innate/ui` 双份快照漂移（innate-wip 已复制走一份） | 短期接受；中期按 dependency-modes 的 5 种模式选私有 npm 或 git 子目录引用 |
| R4 | 类型体操复杂度（cycle 的 reparent 链很重） | 第一版允许宽松类型（`AnyRoute` 级），仅保留 outlet/id 防呆；类型收紧作为独立迭代 |
| R5 | innate-fe-base 自身债务（TS 版本分裂、CI lockfile 问题） | 在动手插件化之前先做最小修复（列入 plan P0） |
| R6 | TanStack Start SSR × 静态导出组合未验证 | shell 第一版走纯 SPA（prerender 关闭或最小化），SSR 需求出现时再评估 |
| R7 | domain 独立仓库模式（REMOTE）引入多仓协调成本 | 先仓内 `domains/` 目录跑通，独立仓作为 P3 之后的可选项 |

## 7. 结论

三个项目恰好覆盖了目标架构的三块拼图：**innate-fe-base 给"材料"（包体系 + 模板 + iframe 协议文档），innate-wip 给"决策"（双轨规则 + MFE 否决 + 验收方法），cycle 给"骨架"（typed domain 插件的完整参考实现）**。用户倾向的 TanStack 主线成立；Next.js 插入通过双轨解决；自动化用 bun 重写 plot 的编排价值而不继承其私有性。下一步按 [plan.md](plan.md) 的阶段推进，任务明细见 [tasks/](tasks/)。
