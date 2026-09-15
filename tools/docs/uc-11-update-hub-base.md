# UC-11 更新 hub 的 base 两个仓

**情境：** 本仓 `base/innate-backend` 与 `base/innate-fe-base` 是 git submodule（远程分别是 `variableway/innate-backend`、`variableway/innate-fe-templates`）。换机后目录是空的，或要拉最新 main。

**落点怎么分辨：** `.innate-registry-cli.yaml` 里 `hubScanDirs: [base]` 表示 `path: base/...` 落在 **本仓**（`hubRoot`），不是 `../innate-works`。`scanDirs` 里的 `skills` / `innate-apps` 仍走 works / apps。

**前置：** 在 hub 根目录；已能访问上述两个 GitHub 仓（均为 private）。HTTPS 失败时可改用 SSH clone。

## 日常更新（推荐）

`scan` 会把 hub `base/` 写进 `apps.yaml`；随后 `clone` 按 path 更新（含 base）：

```bash
REG="bun tools/innate-registry-cli/src/cli.ts"

$REG scan          # 发现 hub base + innate-apps + skills
$REG clone         # fast-forward / 缺则 clone；base/ 落在本仓
```

**只动 base 两个仓**时用独立表：

```bash
$REG clone --registry tools/registry/base.yaml
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

```bash
git submodule update --init --recursive base/innate-backend base/innate-fe-base
```

private 仓 HTTPS 失败时：

```bash
git clone git@github.com:variableway/innate-backend.git base/innate-backend
git clone git@github.com:variableway/innate-fe-templates.git base/innate-fe-base
```

之后日常仍用上面的 `clone`。

## 两张表

| 表 | 用途 |
| --- | --- |
| `tools/registry/apps.yaml` | 默认 `scan` / `clone`：hub `base/` + apps + skills |
| `tools/registry/base.yaml` | 只更新 base；保留 `kind` / `publishes` 等手工字段 |

手工字段（`kind: base`、`publishes`）写在 `base.yaml`；若也要留在 `apps.yaml`，`scan` 后检查是否被冲掉，缺了就从 `base.yaml` 抄回（`scan` 的保留契约只保住**已有**扩展字段）。
