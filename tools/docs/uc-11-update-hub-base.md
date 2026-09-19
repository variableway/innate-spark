# UC-11 更新 hub 的 base 两个仓

**情境：** 本仓 `base/innate-backend` 与 `base/innate-fe-base` 是 git submodule（远程分别是 `variableway/innate-backend`、`variableway/innate-fe-templates`）。换机后目录是空的，或要拉最新 main。

**为什么不能直接 `clone`：** 默认 `.innate-registry-cli.yaml` 的 `worksRoot` 是 `../innate-works`。`path: base/...` 会落到兄弟仓，而不是本 hub 的 `base/`。hub base 单独记在 `tools/registry/base.yaml`。

**前置：** 在 hub 根目录；已能访问上述两个 GitHub 仓（`innate-backend` / `innate-fe-templates` 为 private）。

## 用 skill-spark registry（推荐）

```bash
REG="bun tools/innate-spark-cli/packages/skill-cli/src/index.ts registry"

# 按表 clone / fast-forward pull → 本仓 base/
$REG clone --works-root . --registry tools/registry/base.yaml

# 磁盘上的 hub base 有增删时，回写 base.yaml（保留 kind / publishes）
$REG scan base --works-root . --registry tools/registry/base.yaml --depth 1
```

**例子输出（节选）：**

```text
==> Registry: base.yaml
==> Found the following projects:
    innate-backend -> https://github.com/variableway/innate-backend.git  (base/innate-backend)
    innate-fe-base -> https://github.com/variableway/innate-fe-templates.git  (base/innate-fe-base)

[OK]    base/innate-backend is up to date
[PULL]  base/innate-fe-base abc1234 -> def5678

==> Done: cloned 0, updated 1, skipped/up-to-date 1, failed 0
```

工作区脏或无法快进时会跳过并打印警告，不会强推。

## 首次检出（submodule 还没落地）

若 `base/` 下仍是空目录、且 git 里已有 submodule 映射：

```bash
git submodule update --init --recursive base/innate-backend base/innate-fe-base
```

之后日常更新仍用上面的 `clone --works-root . --registry tools/registry/base.yaml`。

## 和 apps.yaml 的分工

| 表 | 落点 | 命令要点 |
| --- | --- | --- |
| `tools/registry/apps.yaml` | `innate-apps/` + `innate-works/skills/` 等 | 默认 `registry scan` / `registry clone`（`worksRoot=../innate-works`） |
| `tools/registry/base.yaml` | **本仓** `base/` | 必须加 `--works-root .` |
