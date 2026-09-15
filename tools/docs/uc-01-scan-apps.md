# UC-01 同步 Innate 项目清单

**情境：** 你在 `innate-apps` / `innate-works/base` / `innate-works/skills` 里新 clone 或挪了一个 git 仓，希望 `tools/registry/apps.yaml` 跟磁盘一致，同时保留手工字段（`kind` / `template` / `deploy` / `publishes`）。

**前置：** 仓库根有 `.innate-registry-cli.yaml`（本仓已有）。在 hub 根目录执行。

**做法：**

```bash
bun tools/innate-registry-cli/src/cli.ts scan
```

**例子输出（节选）：**

```text
==> works /Users/you/innate/innate-works
==> apps  /Users/you/innate/innate-apps
==> file  /Users/you/innate/workspace/tools/registry/apps.yaml

[innate-apps] found 2 repos (depth=3):
    innate-apps/innate-chaos  ->  https://github.com/variableway/innate-chaos.git

[added] 1:
    innate-apps/innate-chaos  ->  https://github.com/variableway/innate-chaos.git

==> Wrote /Users/you/innate/workspace/tools/registry/apps.yaml, total 28 projects (...)
```

**结果：** `tools/registry/apps.yaml` 被重写。旧条目的 `kind: app` 等还在。默认扫 `hubScanDirs`（`base`）+ `scanDirs`（`innate-apps`、`skills`）。hub `base/` 细节见 [UC-11](./uc-11-update-hub-base.md)。

只扫一层目录时：

```bash
bun tools/innate-registry-cli/src/cli.ts scan innate-apps --depth 1
```
