# Tasks — 任务索引

> 每个任务是**独立文档**，包含 **目的 / Context / 实现方式 / Verify**，可独立开工与验收。
> 阶段划分与任务关系见 [../plan.md](../plan.md) §3、§7。

## 任务一览

| ID | 任务 | 产物 | 阶段 | 前置 |
|----|------|------|------|------|
| [T01](./T01-plugin-contract.md) | 插件契约包 | `packages/plugin-contract` → `@innate/plugin-contract` | P0 | 无 |
| [T02](./T02-generator-cli.md) | 生成器 CLI | `packages/cli` → `@innate/fe-cli`（bin `fe`） | P0 | 无 |
| [T03](./T03-shell-app.md) | 主 shell app | `apps/web`（TanStack Router + Vite） | P1 | T01 的契约类型、T02 的生成物 |
| [T04](./T04-web-shell-ui.md) | Shell UI 基座 | `packages/web-shell` → `@innate/web-shell` | P1 | 无 |
| [T05](./T05-domain-package.md) | domain 目录约定 + 示例 domain | `domain/<name>` | P1 | T01 |
| [T06](./T06-iframe-host.md) | iframe 宿主路由 + Next.js 插件接入 | shell 宿主页 + 样例 Next 应用 | P2 | T03 |
| [T07](./T07-standalone-bundle.md) | 独立打包与产物约定 | `fe build` + `dist` + manifest | P2 | T02 |
| [T08](./T08-external-dir.md) | 外部目录直连基础库 | 扩展 `use-external` + 新包 `exports` | P3 | 无 |
| [T09](./T09-verify-ci.md) | 契约机器校验与 CI 门禁 | `fe verify` + workflow | P3 | T01、T02 |
| [T10](./T10-docs-release.md) | 文档与发布流程固化 | 文档 + README 更新 | P3 | 无 |

## 通用验收门槛（每个任务都必须满足）

1. `pnpm typecheck` 在涉及范围内通过
2. 新增逻辑有对应单测或**可执行断言**（不接受"肉眼看过"）
3. 生成物与产物可重复构建（幂等）
4. 不引入未在根 `catalogs` / `overrides` 中声明的第三方版本

## 写作约定

- **目的**：为什么要做，对应 [../overview.md](../overview.md) 的哪个目标（G1–G7）
- **Context**：施工所需的全部背景——涉及的真实文件路径、可借鉴的参考实现、约束。要求"只读这一节就能开工"
- **实现方式**：具体步骤与关键接口签名
- **Verify**：可执行的验收命令与预期结果
