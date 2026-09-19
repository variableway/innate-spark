# UC-02 按清单拉齐仓库

**情境：** 换了机器，或只 clone 了 hub。`apps.yaml` 里已经有条目，磁盘上还没有对应目录。你希望按表把仓拉下来；已有的仓做 `git fetch` + fast-forward。

**前置：** `.innate-registry-cli.yaml` 里的 `worksRoot` / `appsRoot` 指向真实落点（本仓默认 `../innate-works` 与 `../innate-apps`）。

**做法：**

```bash
$REG clone
```

**例子输出（节选）：**

```text
==> Registry: apps.yaml
==> Found the following projects:
    innate-feeds -> https://github.com/variableway/innate-feeds.git  (innate-apps/content/innate-feeds)
    innate-wip -> https://github.com/variableway/innate-wip.git  (innate-apps/content/innate-wip)

[CLONE] https://github.com/variableway/innate-feeds.git -> innate-apps/content/innate-feeds
[OK]    innate-apps/content/innate-wip is up to date

==> Done: cloned 1, updated 0, skipped/up-to-date 1, failed 0
```

**结果：** `innate-apps/...` 前缀落到 `appsRoot`；`skills/` 落到 `worksRoot`；`base/` 落到 **hub**（`hubScanDirs`）。工作区脏或无法快进时会跳过并打印警告，不会强推。只更新 base 见 [UC-11](./uc-11-update-hub-base.md)。

指定另一份表：

```bash
$REG clone --registry /tmp/apps.yaml
```
