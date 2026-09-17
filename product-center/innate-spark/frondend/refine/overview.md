# Frontend 插件化方向 — 目的与目标

> 上游输入：[frontend-overview.md](../frontend-overview.md)。本文是该方向的正式目标定义；分析过程见 [analysis.md](analysis.md)，执行计划见 [plan.md](plan.md)，任务明细见 [tasks/](tasks/)。

## 背景

当前前端资产分三处：

- [innate-fe-base](../../../../base/innate-fe-base)：基础库 monorepo（`@innate/ui` shadcn 组件体系 + admin 模板 + 场景包），**构建期静态组装，无运行时插件机制**。
- [innate-wip](../../../../innate-apps/content/innate-wip)：内容站（Next.js 静态导出），落地了**构建期插件注册表**（manifest + feature flags + route/iframe 双模式），并完成了微前端否决性调研。
- [cycle / cyacle](file:///Users/patrick/workspace/cycle-all/cyacle)：多 domain 应用，落地了**manifest + codegen + typed domain builder** 的编译期插件体系（TanStack Router + outlet 挂载 + capability 协商）。

三者各自验证了插件化的不同切面，但没有任何一个同时满足"TanStack 为主 + domain 插件 + Next.js 可插 + 全脚本化打包"这组目标。

## 目标

1. **主 web 用 TanStack 做基础框架**：以 TanStack Start/Router 为 webshell 宿主（innate-fe-base 的 `admin-tanstack` 为起点参考，cycle 的组装方式为架构参考）。
2. **domain 按 TanStack 契约开发**：domain 是独立目录/仓库的插件单元，导出 typed 的路由工厂与能力声明（借鉴 cycle 的 `webDomain` builder），可挂载进 webshell 的 outlet。
3. **基础框架支持 Next.js apps 插入**：Next.js 项目按双轨接入——
   - 轨道 A（构建期，内容/组件型）：domain 包同时可被 TanStack shell 与 Next.js app 以 workspace 包方式消费；
   - 轨道 B（运行期，应用型）：独立部署的 Next.js/任意 web 应用以 iframe + manifest 协议插入 shell。
4. **独立打包**：domain 与非 web 的 apps 均可独立产出可部署产物；domain 产物经配置后也能以静态插件形式进 web 项目（`public/plugins/<id>/`）。
5. **打包全脚本化**：扫描 → 生成注册表 → 构建 → 组装部署目录，全流程由脚本驱动；脚本基于 bun/ts 实现，落在 innate-fe-base（`tools/` 或根 `scripts/`），不引入私有工具链。

## 非目标（显式排除）

- **不引入微前端框架**（single-spa / Module Federation / qiankun / wujie 等）——与静态导出冲突、单人单仓无多团队诉求，innate-wip 的 [micro-frontend-research.md](../../../../innate-apps/content/innate-wip/docs/solution/micro-frontend-research.md) 已给出否决结论，本方向继承该结论。
- **不做运行时远程动态加载插件**——插件增删发生在构建期（codegen + 重新构建），运行时唯一的"外挂"形态是 iframe。
- **不在 hub 仓（innate-spark）写实现代码**——所有实现落在 innate-fe-base 或对应卫星仓，本目录只放目的/分析/计划/任务文档。

## 名词约定

| 名词 | 含义 |
| --- | --- |
| webshell / host | 插件宿主应用：TanStack 壳，提供布局、导航、outlet 挂载点与插件注册表 |
| domain 插件 | 独立目录（或仓库）的前端插件单元，导出 `webDomain`（路由工厂 + capabilities），构建期编入 shell |
| apps 独立项目 | 可独立打包部署的完整应用；web 应用可经轨道 B 插回 shell，非 web 项目独立交付 |
| 轨道 A / 轨道 B | Next.js 接入的两条路径：构建期包消费 / 运行期 iframe |
| 注册表生成 | 由 bun 脚本扫描 domain 目录产出的聚合文件（`modules.gen.ts` / `styles.gen.css`），gitignore、禁手改 |

## 验收口径（方向级）

- 新增一个 domain 插件 = 新建目录 + 跑一次生成脚本 + 构建，不改 shell 手写代码。
- shell 内可通过 feature flag 开关任一 domain（导航/首页/路由三处联动，参考 innate-wip 的翻 flag 验收法）。
- 一个 Next.js app 可以：独立部署运行，且以 iframe 方式出现在 shell 导航中；其共享组件包与 shell 无重复维护。
- 一条 CLI 命令在干净目录产出完整部署产物（shell + 全部启用的 domain 插件）。
