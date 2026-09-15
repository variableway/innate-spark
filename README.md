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

本仓 `base/` 下两个 git submodule（`hubScanDirs` → 本仓；登记见 `apps.yaml` / `base.yaml`）。日常更新：

```bash
bun tools/innate-registry-cli/src/cli.ts clone
# 或只更新 base：
bun tools/innate-registry-cli/src/cli.ts clone --registry tools/registry/base.yaml
```

详见 [UC-11](tools/docs/uc-11-update-hub-base.md)。

- [base/innate-backend](base/innate-backend/) — Go 后端基座：`innate-go` CLI、meta / Vine REST 样例、backend-go skill（远程 `variableway/innate-backend`）
- [base/innate-fe-base](base/innate-fe-base/) — 前端基座 monorepo：`@innate/*` 包与 Admin 模板（远程 `variableway/innate-fe-templates`）

## Tools

索引见 [tools/README.md](tools/README.md)。

- [tools/registry](tools/registry/) — Innate 项目登记表（apps / plugins / skills / deploy）
- [tools/fire-skills](tools/fire-skills/) — `skill-spark`（Bun 多子命令 CLI：skill 管理 + `registry` 扫仓/克隆 + `selfhost` 自建 SMB 网盘；`bun run build:exe` 打单文件 binary）
- [tools/innate-registry-cli](tools/innate-registry-cli/) · [tools/innate-selfhost-cli](tools/innate-selfhost-cli/) — 已合并进 `skill-spark`，仅作参考保留
