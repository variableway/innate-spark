# Frontend Plan — 计划与任务

> 目的与目标见 [overview.md](./overview.md)；可行性论证与借鉴清单见 [analysis.md](./analysis.md)。
> 每个任务都是独立文档，包含 **目的 / Context / 实现方式 / Verify**，见 [tasks/](./tasks/)。

---

## 1. 目标架构

```
┌──────────────────────────────────────────────────────────────────────────┐
│  packages/  ── 基础库层（源码直出，零构建，被 apps 与 domain 共同依赖）      │
│                                                                          │
│  @innate/ui            55 个 shadcn primitive + 设计 token + ThemeProvider │
│  @innate/admin-composites  L2 复合组件（page-container / data-table …）    │
│  @innate/plugin-contract ★ 插件契约：manifest 类型 + createWebDomain + 断言 │
│  @innate/web-shell      ★ AppShellFrame（sidebar/topbar/nav，无业务数据）    │
│  @innate/fe-cli         ★ 生成器与打包器（bun）                            │
└──────────────────────────────────────────────────────────────────────────┘
                    ▲                                   ▲
                    │ 依赖（不含业务）                    │ 依赖（不含业务）
┌───────────────────┴──────────────┐   ┌────────────────┴─────────────────┐
│  domain/  ── 领域插件（构建期组合）  │   │  apps/  ── 可部署应用               │
│                                  │   │                                  │
│  domain/<name>/                  │   │  apps/web/          主 shell（宿主）  │
│    package.json (exports: src)   │   │    ├─ 组装 router（消费 registry）   │
│    src/web/index.ts → webDomain  │   │    ├─ 宿主路由 /plugins/$pluginId   │
│      createWebDomain(id)         │   │    └─ 只导入生成的 styles.gen.css   │
│        .addRoute(outlet, factory)│   │                                  │
│        .addCapability('nav', …)  │   │  apps/<next-app>/   Next.js 应用      │
│    src/web/pages/**              │   │    （独立 build → iframe / standalone）│
│    globals.css                   │   │                                  │
└──────────────────────────────────┘   └──────────────────────────────────┘
                    │                                   │
                    └──────────▲────────────────────────┘
                               │
                    ┌──────────┴───────────┐
                    │  scripts/ (fe CLI)    │
                    │  gen → registry +     │
                    │        modules + css  │
                    │  build → dist/        │
                    │  verify → 断言        │
                    └──────────────────────┘
```

### 借鉴映射

| 架构元素 | 借鉴自 |
|----------|--------|
| `createWebDomain` builder / outlet / capabilities | cyacle `routes/domain/*`（B1/B2/B6） |
| 收集与四项断言 | cyacle `collect.ts`（B3） |
| `createWebRouter` 组装与固定树形 | cyacle `routes/router/*`（B4/B5） |
| 生成 `modules.gen.ts` / `styles.gen.css` | cyacle `change.web.md`（B8） |
| manifest 字段与 `getEnabledPlugins()` | innate-wip `lib/plugins/*`（B13/B14/B15） |
| iframe 宿主与双轨制 | innate-wip `loadMode: iframe` + `plugin-dual-track.md`（B17/B18） |
| `@innate/ui` / ThemeProvider / token | innate-fe-base `packages/ui`（B22） |
| 外部接入（dir/git/npm） | innate-fe-base `use-external.mjs` + `dependency-modes.md`（B24） |

---

## 2. 三种接入模式（本规划的核心约定）

| | A. route 模式 | B. iframe 模式 | C. standalone 模式 |
|---|---|---|---|
| **技术栈要求** | 必须与 shell 同栈（TanStack + React） | 任意（Next.js / Vue / 静态站都行） | 任意 |
| **构建时机** | 与 shell 同一次构建 | 独立构建 | 独立构建 |
| **部署** | 随 shell 部署 | 独立部署到子路径 | 独立部署 |
| **隔离性** | 无（同 bundle、同 React 运行时） | 强（浏览器级） | 完全 |
| **能否进 shell 导航** | 能（manifest 驱动） | 能（manifest 驱动，href 指向宿主路由） | 不能 |
| **复用 shell 的 UI/token** | 能（直接 import `@innate/ui`） | 不能（需自行保证观感，可引用同一 token） | 视实现 |
| **何时用** | 内容型、需要共享设计系统、与 shell 有数据关联 | 异构技术栈、独立发布节奏、不可信代码 | 工具型、无需出现在主站导航 |
| **样例** | `domain/*` | 一个新 Next.js 小应用 | `apps/web-showcase` 等现有 app |

**选择规则**（承自 innate-wip 双轨制）：
> **承载内容 → A；工具且外部/不可信/需独立部署 → B；两者皆非 → 不做成插件（C）。**

---

## 3. 阶段划分

| 阶段 | 主题 | 交付物 | 对应任务 |
|------|------|--------|----------|
| **P0** | 契约与骨架 | 契约包可 typecheck；生成器可幂等产出聚合文件 | T01、T02 |
| **P1** | 主壳可用 | shell 起得来；开关驱动导航；一个 domain 被组装 | T03、T04、T05 |
| **P2** | 异构接入与打包 | Next.js 应用经 iframe 进入 shell；统一打包命令 | T06、T07 |
| **P3** | 工程化收口 | 外部目录直连；CI 门禁；文档固化 | T08、T09、T10 |

阶段之间存在顺序，但**每个任务内部是自包含的**：单个任务可以独立开工、独立验收，不要求其他任务先完成（除任务内显式标注的前置）。

---

## 4. 开发计划

### 4.1 关键设计决策（施工前必须锁定）

| # | 决策 | 取向 | 依据 |
|---|------|------|------|
| D1 | 主 shell 形态 | TanStack Router + **Vite（SPA）** | analysis §5.1 |
| D2 | 插件组装时机 | **构建期**，不引入 runtime 编排 | ADR（analysis §7） |
| D3 | domain 消费方式 | workspace 包，**源码直出**（`exports: ./src/index.ts`） | 与 base 现状一致，零构建 |
| D4 | Next.js 集成方式 | **iframe / standalone**，不做 route 模式 | analysis §5.3 |
| D5 | 第三方版本治理 | pnpm `catalogs` + 根 `overrides` 钉住 React 相关 | 防 React 多副本（R1） |
| D6 | 包命名 | `@innate/plugin-contract` / `@innate/web-shell` / `@innate/fe-cli` | 与现有 `@innate/*` 一致 |
| D7 | 生成文件位置与命名 | `apps/web/src/registry.gen.ts`、`apps/web/src/styles.gen.css`，带 `DO NOT EDIT` 头，**提交入仓** | cyacle 生成物 gitignore，但其 CI 每次生成；本规划选择提交以避免"必须先跑工具才能 typecheck"（analysis §2.3 缺口 1） |

### 4.2 任务清单

| ID | 任务 | 产物 | 阶段 | 文档 |
|----|------|------|------|------|
| T01 | 插件契约包 | `packages/plugin-contract` | P0 | [T01](./tasks/T01-plugin-contract.md) |
| T02 | 生成器 CLI（gen/build/verify 骨架） | `packages/cli`（`fe` bin） | P0 | [T02](./tasks/T02-generator-cli.md) |
| T03 | 主 shell app（TanStack + 注册表驱动） | `apps/web` | P1 | [T03](./tasks/T03-shell-app.md) |
| T04 | Shell UI 基座（AppShellFrame） | `packages/web-shell` | P1 | [T04](./tasks/T04-web-shell-ui.md) |
| T05 | domain 目录约定 + 首个示例 domain | `domain/<name>` | P1 | [T05](./tasks/T05-domain-package.md) |
| T06 | iframe 宿主路由 + Next.js 插件接入 | hell 宿主页 + 样例 Next 应用 | P2 | [T06](./tasks/T06-iframe-host.md) |
| T07 | 独立打包与产物约定 | `fe build` / `dist` + manifest | P2 | [T07](./tasks/T07-standalone-bundle.md) |
| T08 | 外部目录直连基础库 | 扩展 `use-external` + 新包 exports | P3 | [T08](./tasks/T08-external-dir.md) |
| T09 | 契约机器校验与 CI 门禁 | `fe verify` + workflow | P3 | [T09](./tasks/T09-verify-ci.md) |
| T10 | 文档与发布流程固化 | 文档 + README 更新 | P3 | [T10](./tasks/T10-docs-release.md) |

---

## 5. 测试计划

### 5.1 分层测试策略

| 层 | 测什么 | 手段 | 归属任务 |
|----|--------|------|----------|
| **契约单元测试** | builder 不可变性、`capability` 为 `undefined` 抛错、四项收集断言、nav 排序 | vitest（纯 TS，无 React） | T01 |
| **生成器测试** | 幂等性（跑两次 diff 为 0）、`DO NOT EDIT` 头、缺 manifest 时报错信息 | vitest / bun test + 临时目录 | T02 |
| **Shell 单元测试** | `nav-utils` 的 active 匹配（最长前缀）、breadcrumbs 派生、分组折叠状态 | vitest + jsdom | T04 |
| **domain 自检** | domain 在**不依赖 shell** 的独立 TS program 内通过 path/params/search 类型校验 | `tsc --noEmit` + standalone router | T01、T05 |
| **契约机器校验** | ① manifest 的 `enabled` 与 feature flag 一致 ② nav href 非空且不重复 ③ shell 源码无主题路径硬编码 ④ 生成文件可复现 | `fe verify`（脚本断言，非肉眼） | T09 |
| **集成冒烟** | shell 起得来、翻转开关导航变化、深链刷新可用、iframe 插件可加载 | 手工 + 可选 Playwright | T03、T06 |
| **回归** | 现有 6 个 app 不被破坏（typecheck / build 仍通过） | 复用现有 CI 步骤 | T09 |

### 5.2 每个任务的验收门槛

所有任务统一要求：

1. `pnpm typecheck` 通过（涉及范围内）
2. 新增逻辑有对应单测或可执行断言（不接受"肉眼看过"）
3. 生成物/产物可重复构建（幂等）
4. 不引入未在 `catalogs` 声明的第三方版本

### 5.3 明确不做的测试

- 不做 MFE 沙箱逃逸测试（不引入 MFE）
- 不做插件市场/热加载的测试（非目标）
- 不为 demo app 写 e2e（现有仓库也无 e2e，保持一致）

---

## 6. 部署计划

### 6.1 三条部署路径

| 模式 | 产物 | 托管 | 关键配置 |
|------|------|------|----------|
| A. shell（含 route domain） | `apps/web/dist` | 静态托管（GitHub Pages / Cloudflare Pages / 任意 CDN） | ① SPA 历史回退：未匹配路径回落到 `index.html`（GitHub Pages 用 `404.html` 复制 `index.html`）② 若部署在子路径，需配 `base` |
| B. iframe 插件应用 | 各自的 `dist` | 独立部署到子路径（如 `/plugins/<id>/`） | ① 构建时 `base` 必须为**相对路径或子路径**，否则资源 404 ② 允许被宿主 iframe 嵌入（`X-Frame-Options` / CSP `frame-ancestors`） |
| C. standalone 应用 | 各自的 `dist` | 独立域名/路径 | 无特殊要求 |

### 6.2 发布流程

```
1. fe gen        # 重新生成 registry / modules / styles（幂等）
2. fe verify     # 契约断言，失败即阻断
3. pnpm typecheck && pnpm lint && pnpm test
4. fe build      # 按模式产出 dist + manifest
5. 部署          # shell 与各 iframe 应用可分别部署
```

### 6.3 iframe 插件的部署契约（必须在 T06 固化）

- 宿主侧：manifest 的 `iframeSrc` 写**绝对路径**（`/plugins/<id>/`），由宿主路由 `/plugins/$pluginId` 渲染 `<iframe>`。
- 插件侧：`vite.config` / `next.config` 的 `base` 必须与该路径一致；资源引用不得使用根绝对路径。
- 安全：不可信内容**不得**同时开启 `allow-scripts` 与 `allow-same-origin`（修正 innate-wip 的假隔离，见 R5）。
- 版本：插件与应用**独立发布**，宿主不感知插件版本；破坏性变更靠 URL 与接口约定隔离。

### 6.4 现有资产的部署不受影响

`innate-fe-base` 现有的 6 个 app 与 `innate-wip` 的 GitHub Pages / Cloudflare 部署**保持不变**，本规划只做增量。

---

## 7. 落地顺序建议

```
P0  ┌── T01 契约 ──┬── T02 生成器
    └──────────────┘        │
                            ▼
P1  T04 Shell UI ── T03 主壳 ──┬── T05 首个 domain
                               │
P2  T06 iframe 宿主 ───────────┴── T07 打包
                               │
P3  T08 外部直连 ── T09 verify+CI ── T10 文档
```

- **T01 / T02 是全局前置**（其他任务都消费契约与生成物），建议最先做。
- **T04 可与 T03 并行**（shell UI 是纯组件包，不依赖 shell app）。
- **T06 依赖 T03 的宿主路由骨架**，但 iframe 插件侧的 Next.js 应用可以独立并行开发。
- **T08 / T09 / T10 互不依赖**，可并行。

---

## 8. 与现有仓库的关系

| 仓库 | 本规划的动作 |
|------|--------------|
| `innate-fe-base` | **主战场**：新增 `packages/{plugin-contract,web-shell,cli}`、`domain/`、`apps/web`；现有 6 个 app 与 `packages/ui` 尽量不动 |
| `innate-wip` | 只搬契约与 manifest 设计；**不改其现有实现**（非目标 §5）。可选：把它的 `@innate/ui` 副本改为引用 base，消除 R3 |
| `cyacle` | 只搬组装机制（B1–B12）；**不引入 plot/Vine 工具链**（Won't Borrow） |
| `innate-desktop-codex` | 不涉及；`docs/achieve/desktop-shell.md` 为历史文档，不作为施工依据 |
