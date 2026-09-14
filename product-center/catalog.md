# Product catalog

本表是产品清单的**唯一真相源**。新增或更名产品先改这里，再建模 `products/<slug>/`。

阶段：`idea` → `design` → `spec` → `building` → `live` → `paused` → `retired`

实现不在本仓库。文档列指向本仓路径；实现列写「见 `links.md`」或尚未开仓。

| slug | 名称 | 阶段 | 文档 | 实现 |
| --- | --- | --- | --- | --- |
| registry-cli | innate-registry-cli | building | [../tools/innate-registry-cli/](../tools/innate-registry-cli/) | 本仓 `tools/innate-registry-cli`（Bun，可 compile 成 binary） |
| selfhost-cli | innate-selfhost-cli | building | [../tools/innate-selfhost-cli/](../tools/innate-selfhost-cli/) | 本仓 `tools/innate-selfhost-cli`（macOS 自建 SMB 挂载） |
| innate-backend | innate-backend | building | [../base/innate-backend/](../base/innate-backend/) | 本仓 `base/innate-backend`（Go 后端基座：innate-go CLI + backend-go / npm-registry skills；2026-09 自 `innate-workspace` 迁入） |
