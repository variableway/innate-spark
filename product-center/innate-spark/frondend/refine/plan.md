# 开发 / 测试 / 部署计划

> 目标见 [overview.md](overview.md)，可行性依据见 [analysis.md](analysis.md)。所有实现代码落在 innate-fe-base（或其派生的卫星仓），本目录只维护计划。

## 阶段划分

> **状态（2026-09-16）：P0–P3 全部任务（T01–T12）已完成并全量回归通过**
> （typecheck / build / lint / test / gen --check / verify-flags / frozen-lockfile / E2E 4 用例）。
> 各任务执行记录见对应任务文档文末。真实远端部署（T12 的 Pages/Cloudflare 推送）待下次 push 验证。

```
P0 地基修复        → P1 骨架与契约        → P2 双轨接入          → P3 自动化与交付
(清偿 base 债务)    (webshell + domain 契约) (Next 包消费 + iframe)  (gen 脚本 + 编排 CLI + CI/CD)
✅ 完成             ✅ 完成                 ✅ 完成                 ✅ 完成（远端部署待 push）
```

每个阶段内的任务相互独立（见 [tasks/](tasks/)），可并行或乱序执行；阶段只是建议的推进节奏。

### P0 — 地基修复（innate-fe-base 现状债务，阻塞项）

| 任务 | 一句话 |
| --- | --- |
| [T01 基础库最小修复](tasks/T01-base-hygiene.md) | 统一 TS 版本、恢复 lockfile 使 CI 可跑、清 stale 口径 |

### P1 — 骨架与契约（方向主体）

| 任务 | 一句话 |
| --- | --- |
| [T02 webshell 骨架](tasks/T02-webshell-skeleton.md) | 基于 admin-tanstack 抽最小 TanStack 壳，含 outlet 挂载点与导航消费 |
| [T03 domain 插件契约包](tasks/T03-domain-contract.md) | `@innate/web-domain`：createWebDomain builder + collect 防呆 + standalone router |
| [T04 示例 domain 插件](tasks/T04-demo-domain.md) | 用真实场景做一个 domain，验证"目录进 → 导航出 → flag 关"全链路 |

### P2 — 双轨接入（Next.js 插入）

| 任务 | 一句话 |
| --- | --- |
| [T05 轨道 A：包消费验证](tasks/T05-nextjs-package-plugin.md) | 同一 domain 组件包被 TanStack shell 与 admin-nextjs 双消费 |
| [T06 轨道 B：iframe 插件协议](tasks/T06-iframe-plugin-track.md) | manifest + sandbox iframe + origin 校验 + `/plugins/$pluginId` 宿主路由 |

### P3 — 自动化与交付

| 任务 | 一句话 |
| --- | --- |
| [T07 domain 独立打包](tasks/T07-standalone-build.md) | standalone router → vite build → 单 domain 静态 dist，可静态预览 |
| [T08 静态插件导入](tasks/T08-static-plugin-import.md) | dist → `public/plugins/<id>/`（staging + 原子替换 + 逃逸校验） |
| [T09 注册表生成脚本](tasks/T09-gen-registry-script.md) | bun 扫描 domain 目录生成 `modules.gen.ts` / `styles.gen.css` |
| [T10 构建编排 CLI](tasks/T10-build-orchestrator.md) | 一条命令 scan → gen → build → 组装部署目录 |
| [T11 测试体系](tasks/T11-test-harness.md) | vitest 单测 + 翻 flag 验收 + playwright 冒烟 |
| [T12 部署管线](tasks/T12-deploy-pipeline.md) | Pages / Cloudflare 双目标 workflow |

### P4 — 内容插件扩展：innate-wip Blog 接入（计划中，未实施）

> 决策（2026-09-17）：不要 iframe 双层壳 → **主线 = T14 → T15（domain 原生渲染，webshell 壳唯一）**；
> T13 降为备选（仅当富组件保真度短期追不上时，以 innate-wip embed 模式 + iframe 过渡）。

| 任务 | 一句话 |
| --- | --- |
| [T14 内容预编译生成器](tasks/T14-blog-content-generator.md) | md/mdx → 构建期 TS 数据模块（frontmatter/TOC/高亮），内容保真度主战场 |
| [T15 domains/blog 插件](tasks/T15-blog-domain-plugin.md) | **主线**：Blog 原生进 webshell（列表 + 详情路由 + flag），内容源不复制（file: → git subdir → 内容包三段演进） |
| [T16 单一源与同步](tasks/T16-blog-content-single-source.md) | 可选收尾：定时/事件驱动重建或 innate-wip 内容包化，双端同源 |
| [T13 chromeless iframe（备选）](tasks/T13-blog-iframe-quickwin.md) | 仅当 T14 富组件覆盖不足时过渡用：innate-wip 加 embed 模式去壳后 iframe 嵌入 |

## 开发计划要点

- **位置**：webshell 与契约包先落在 innate-fe-base（`apps/webshell`、`packages/web-domain`、根 `tools/fe-plugin-cli/`），domain 示例放 `domains/<name>/`；跑通后若需要独立仓库再拆（cycle 的 REMOTE 模式，届时由 CLI 的 clone/link 子命令承接）。
- **顺序依赖的最小集**：T03（契约）是 T04/T07 的类型来源，T09（生成脚本）服务 T10；但每个任务都设计了"无前置也能独立验收"的落地方式（见各任务文档的 Context 节），不构成硬阻塞。
- **每阶段出口判据**：
  - P0：`pnpm -r build && pnpm -r test` 全绿；
  - P1：新增 demo domain 全程零 shell 手写代码改动；
  - P2：一个 Next.js app 同时具备"独立部署"与"出现在 shell 导航"两种形态；
  - P3：干净目录一条命令产出可部署产物，CI 全绿。

## 测试计划

1. **单元（vitest，随 T03/T09）**：契约 collect 的防亡断言（重复 id / 未知 outlet / 禁用 outlet 抛错）；生成脚本的快照测试（目录结构 → 生成文件内容）。
2. **集成（翻 flag 验收法，随 T04）**：翻转 domain 的 feature flag 后，sidebar / header / 首页 tile 三处联动出现/消失，零 JSX 改动；禁用后直达 URL 行为符合约定（保留路由、仅导航隐藏）。
3. **端到端（playwright，随 T11）**：shell 启动 → 导航进各 domain → iframe 轨道加载外部 app → 消息桥握手；静态导出产物在静态服务器下的冒烟。
4. **回归门槛**：轨道 A 的双消费不允许出现 React 双实例告警（`dedupe` + 类型钉死验证）。

## 部署计划

- **shell + 构建期 domain**：vite build 静态产物，部署目标 GitHub Pages（basePath 方案沿用 web-showcase）与 Cloudflare Pages（workflow 沿用 innate-wip 双部署模板，`ENABLE_CLOUDFLARE` 变量开关）。
- **轨道 B 外部 app**：独立部署（各自的 CI），shell 只存 manifest（iframe src + origin 白名单）。
- **静态插件（T08 产物）**：作为 shell 部署产物的一部分随版本发布，不单独 CDN。
- **版本策略**：`@innate/ui` 快照漂移问题在 P2 后按 dependency-modes 五模式评估（倾向 git 子目录或私有 npm），不在本计划内强行解决。

## 里程碑与范围控制

- M1（P0+P1）：TanStack shell 内可插拔第一个 domain —— 即 overview 验收口径 1、2 达成。
- M2（P2）：Next.js 双轨接入 —— 验收口径 3 达成。
- M3（P3）：一键产物 + CI/CD —— 验收口径 4 达成。
- **明确不做**：运行时远程加载、微前端框架、Go/单二进制交付、多窗口桌面壳（wandesk-ui 仅作参考不入主线）。
