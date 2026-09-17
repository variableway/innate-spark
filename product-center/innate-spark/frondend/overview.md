# Frontend Overview — 目的与目标

> 本目录是 Innate 前端体系的**规划与决策文档**。实现不在本仓，见 [analysis.md](./analysis.md) 的仓库定位表。
> 结构：[overview.md](./overview.md) 目的目标 · [analysis.md](./analysis.md) 分析与可行性 · [plan.md](./plan.md) 计划与任务 · [tasks/](./tasks/) 独立任务

---

## 1. 目的（Why）

当前前端资产分散在三个互不相同的体系里，各自解决了一部分问题，但没有共同契约：

| 仓库 | 现状问题 |
|------|----------|
| `innate-fe-base` | 有完整的基础库（`@innate/ui` 等）与 6 个 demo app，但**没有插件机制**：每个 app 是自己封闭的路由体系，跨 app 复用只能复制代码 |
| `innate-wip` | 已经验证了 build-time plugin registry 思路，但它是 **Next.js static export 单仓**，且自带一份 `@innate/ui` 副本（与 base 漂移），无法作为通用基座 |
| `cyacle` | 已经落地了**最完整的 domain 插件契约**（typed builder + route 收集 + 生成聚合文件），但它是 Vine/Go 体系的一部分，契约与 `plot` 工具链绑定，无法直接给普通 web 项目用 |

结果是：**每做一个新前端项目，就要重新决定一次"用哪个基座、怎么组织目录、怎么复用别人写好的页面"**。

本规划的目的一句话：

> 把"基础库（packages）→ 领域插件（domain）→ 可部署应用（apps）"这条链路固化成**一份契约 + 一个生成器 + 三套接入模式**，让新项目不再重新发明架构，让已有项目（innate-wip / cyacle 的资产）可以被搬进来而不是被重写。

---

## 2. 目标（Goals）

### G1. 目录约定统一

`innate-fe-base` 扩展为三段式，与现有 `apps/ + packages/` 兼容演进而非推倒重来：

```
innate-fe-base/
├── apps/       # 可独立部署的完整应用（含 shell web）
├── domain/     # 可被 shell 组装的领域插件（新增）
├── packages/   # 基础库：ui / composites / plugin-contract / web-shell / cli
└── scripts/    # 生成与打包脚本
```

- `apps/` 中的项目**可以独立打包、独立部署**
- `domain/` 中的项目**以插件方式被 shell 组装**，不做独立部署

### G2. 主 Web 壳采用 TanStack 路线

- 主 shell 使用 **TanStack Router（+ Vite / TanStack Start）**，作为"主要 web"的基座
- 导航、路由、首页入口**全部由 manifest 驱动**，翻转开关即可增减模块，不需要改 shell 的 JSX

### G3. domain 按同一套 TanStack 契约开发

- domain 通过 `createWebDomain(id).addRoute(outlet, factory).addCapability(key, value)` 声明自己的页面与能力
- domain 是**普通的 workspace 包**（源码直出），在另外的目录里也能开发与 typecheck，不必放进 shell 仓库

### G4. 支持"独立应用"以插件身份进入主 Web

- **route 模式**：同技术栈 domain，构建期打进 shell 同一个 bundle
- **iframe 模式**：独立构建、独立部署的应用（含 **Next.js** 应用），通过 shell 的宿主路由以 iframe 挂载
- **standalone 模式**：完全不进 shell，独立打包部署

> 明确的可行性边界：Next.js 应用**不能**以 route 模式进 TanStack SPA shell（RSC/SSR 运行时不同），只能用 iframe 模式或 standalone 模式。详见 [analysis.md §5.3](./analysis.md)。

### G5. 打包与部署脚本化

- 生成聚合文件（registry / modules / styles）、独立打包 app、打出可部署产物，全部由脚本完成
- 脚本以 **TypeScript + Bun** 实现，放在 `innate-fe-base` 内，作为 `fe` CLI 提供
- 脚本必须**幂等**：重复执行结果一致，生成文件带 `DO NOT EDIT` 头

### G6. 插件契约可被机器校验

- 提供 `verify` 能力，断言：manifest 与 feature flag 一致、nav href 唯一非空、shell 中无主题路径硬编码、生成文件可复现
- 挂进 CI，避免"注册表靠人肉维护"的漂移

### G7. 复用而不是重写

三个仓库中已经验证过的机制**直接借鉴**（清单见 [analysis.md §6](./analysis.md)）：

- 来自 `cyacle`：typed domain builder、outlet 契约、路由收集与校验、生成聚合文件、CSS 顺序约定、standalone 自检 router
- 来自 `innate-wip`：`SitePlugin` manifest 字段、`getEnabledPlugins()` 注册表、**不引入微前端框架**的决策、iframe 逃生舱、双轨制（内容→route / 工具→iframe）
- 来自 `innate-fe-base`：`@innate/ui` 设计 token 与主题、monorepo 与文档分层（D0→L1→L2→L3）、skills 同步与 `use-external.mjs` 外部接入脚本、CI 门禁

---

## 3. 非目标（Non-Goals）

明确不做，避免范围膨胀：

1. **不引入微前端框架**（single-spa / qiankun / Module Federation / wujie / micro-app）——理由已在 `innate-wip/docs/solution/micro-frontend-research.md` 论证，本规划沿用该结论
2. **不做运行时插件市场**：不热加载任意第三方 JS bundle、不做远程 CDN 插件、不做 per-user 插件偏好
3. **不做运行时插件通信总线**：domain 之间的关联通过共享数据层或 URL 解决
4. **不要求 domain 独立部署**：domain 是构建期组合单元，不是部署单元
5. **不改写 `cyacle` 与 `innate-wip` 的现有实现**：只搬机制，不搬业务

---

## 4. 术语

| 术语 | 含义 |
|------|------|
| **packages** | 基础库层。组件、工具、契约类型、shell UI。被 apps 与 domain 共同依赖 |
| **domain** | 领域插件。声明自己的路由与能力（导航），由 shell 在构建期收集组装 |
| **apps** | 可独立部署的应用。既可以是 shell（宿主），也可以是独立工具（含非 web 项目） |
| **shell** | 主 Web 宿主。提供布局、导航、路由树组装、插件开关 |
| **manifest** | 插件的声明式元数据：`id / name / enabled / loadMode / nav / homeTile`（+ iframe 时的 `iframeSrc`） |
| **registry** | 所有 manifest 的集合 + 查询函数（`getEnabledPlugins` 等） |
| **outlet** | shell 中预留的挂载点（`root` / `app` / `admin`）。domain 的路由挂到 outlet 上 |
| **capability** | domain 向上层暴露的通用能力（如 `nav`、`permissionCodes`）。shell 只做泛型收集，不限定业务语义 |
| **loadMode** | 插件的加载方式：`route`（同栈构建期） / `iframe`（独立部署运行时隔离） |

---

## 5. 验收总览

| 目标 | 验收信号 |
|------|----------|
| G1 目录约定 | `apps/` `domain/` `packages/` 三段可分别 typecheck / build |
| G2 TanStack 主壳 | 翻转任一 manifest 的 `enabled`，导航与首页 tile 变化，shell 源码零改动 |
| G3 domain 契约 | 同一份 domain 包在 shell 内与独立目录下都能 typecheck |
| G4 三种模式 | route / iframe / standalone 各有一个真实样例跑通 |
| G5 脚本化 | `fe gen` 幂等；`fe build` 产出可部署产物 |
| G6 机器校验 | 故意破坏一条断言时 `fe verify` 失败，CI 拦截 |
| G7 复用 | 三个仓库的借鉴清单逐条在任务中落地或明确放弃 |

详细拆分见 [plan.md](./plan.md) 与 [tasks/](./tasks/)。
