# Personal Workspace

个人工作站的 **文档与产品内容 index**：放文档、记录、ideas、计划。本仓库是 hub，不在这里做产品 / 基础设施 / 采集器的实现；实现放到独立子目录或独立仓库（spoke），需要时再用 Cursor multi-root 拼起来。

结构与用法的分析（2026-09-12）：

- [可行性](docs/idea/workspace-index-feasibility.md)
- [文档结构](docs/idea/document-architecture.md)
- [与 Cursor Project 结合](docs/idea/cursor-project-integration.md)
- [本批 idea 索引](docs/idea/README.md)

## Domains

1. **Infra** — Self Host Infra
2. **Product Center** — Product / Dev / QA：基础库与 Skills
   - Pre-Product, Brainstorm, Analysis
   - Design
   - Product Development / Iteration Phase
   - Dev Toolings
   - Product Tools
   - Products
3. **Marketing** — Marketing Skills and Tools
   - Content: Social Media Operations
     - Ideas
     - Content
     - Tools
4. **Feeds** — Information Gathers
5. **Teaching**
   - Tutorials: Learning By Practices
   - Different Tutorials from Kids to Adult

## Base

- [base/innate-backend](base/innate-backend/) — Go 后端基座：`innate-go` CLI、meta / Vine REST 样例、backend-go 与 npm-registry skills（2026-09 自 `innate-workspace` 迁入）；用法见 [base/innate-backend/docs/](base/innate-backend/docs/)

## Tools

索引见 [tools/README.md](tools/README.md)。

- [tools/registry](tools/registry/) — Innate 项目登记表（apps / plugins / skills / deploy）
- [tools/innate-registry-cli](tools/innate-registry-cli/) — `innate-registry-cli`（Bun，`bun run build` 打成 binary）
- [tools/innate-selfhost-cli](tools/innate-selfhost-cli/) — `innate-selfhost-cli`（macOS 挂载自建 SMB / 懒猫网盘）
