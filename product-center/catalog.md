# Product catalog

本表是产品清单的**唯一真相源**。新增或更名产品先改这里，再建模 `products/<slug>/`。

阶段：`idea` → `design` → `spec` → `building` → `live` → `paused` → `retired`

实现不在本仓库。文档列指向本仓路径；实现列写「见 `links.md`」或尚未开仓。

| slug | 名称 | 阶段 | 文档 | 实现 |
| --- | --- | --- | --- | --- |
| registry-cli | innate-registry-cli | building | [../tools/innate-registry-cli/](../tools/innate-registry-cli/) | 本仓 `tools/innate-registry-cli`（Bun，可 compile 成 binary） |
| selfhost-cli | innate-selfhost-cli | building | [../tools/innate-selfhost-cli/](../tools/innate-selfhost-cli/) | 本仓 `tools/innate-selfhost-cli`（macOS 自建 SMB 挂载） |
| innate-backend | innate-backend | building | [../base/innate-backend/](../base/innate-backend/) | submodule `base/innate-backend`（远程 `variableway/innate-backend`；更新见 [UC-11](../tools/docs/uc-11-update-hub-base.md)） |
| innate-fe-base | innate-fe-base | building | [../base/innate-fe-base/](../base/innate-fe-base/) | submodule `base/innate-fe-base`（远程 `variableway/innate-fe-templates`；更新见 [UC-11](../tools/docs/uc-11-update-hub-base.md)） |
