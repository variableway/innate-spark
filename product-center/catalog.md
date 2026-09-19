# Product catalog

本表是产品清单的**唯一真相源**。新增或更名产品先改这里，再建模 `products/<slug>/`。

阶段：`idea` → `design` → `spec` → `building` → `live` → `paused` → `retired`

实现不在本仓库。文档列指向本仓路径；实现列写「见 `links.md`」或尚未开仓。

| slug | 名称 | 阶段 | 文档 | 实现 |
| --- | --- | --- | --- | --- |
| skill-spark | skill-spark | building | [../tools/innate-spark-cli/](../tools/innate-spark-cli/) | 本仓 `tools/innate-spark-cli`（Bun 多子命令 CLI：skill 管理 + `registry` 扫仓/克隆 + `selfhost` 自建 SMB 挂载，`bun run build:exe` 打单文件 binary）。原 `innate-registry-cli` / `innate-selfhost-cli` 已合并进来 |
| innate-backend | innate-backend | building | [../base/innate-backend/](../base/innate-backend/) | 本仓 `base/innate-backend`（Go 后端基座：innate-go CLI + backend-go / npm-registry skills；2026-09 自 `innate-workspace` 迁入） |
| software-factory | Software Factory（Yorun QA / DSH 插件厂） | design | [./products/software-factory/](./products/software-factory/) | 见 [links.md](./products/software-factory/links.md) |
