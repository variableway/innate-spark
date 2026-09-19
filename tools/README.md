# Tools

本仓的工具层：登记表是数据，CLI 是操作入口。实现用 Bun，可 `bun run build:exe` 打成独立 binary（产物在 `tools/innate-spark-cli/dist/`，已 gitignore）。

不要在这里放产品应用源码。新工具先在 `product-center/catalog.md` 加一行，再开子目录。

## 目录

```text
tools/
  README.md                 # 本页
  docs/                     # 按 use case 写的用法（带例子）
  registry/                 # 四张登记表（数据）
  innate-spark-cli/         # skill-spark：多子命令 CLI + skill 工作区
  pre-commit.sh             # 提交前跑 skill-spark registry scan
```

用法按场景写在 [docs/](./docs/README.md)。命令字段见 [innate-spark-cli/docs/cli/](./innate-spark-cli/docs/cli/cli-commands.md)。

| 路径 | 作用 | 说明 |
| --- | --- | --- |
| [docs/](./docs/README.md) | Use cases | 带例子的操作说明 |
| [registry/](./registry/) | Innate 登记表 | `apps.yaml` / `plugins.yaml` / `skills.yaml` / `deploy.yaml` |
| [innate-spark-cli/](./innate-spark-cli/) | `skill-spark` | 多子命令 CLI：skill 管理 + `registry` 扫 git 仓/写登记表/按表 clone + `selfhost` 挂载/卸载自建 SMB（懒猫等） |
| [pre-commit.sh](./pre-commit.sh) | git hook | `registry scan` 后 stage `registry/apps.yaml` |

兄弟仓 `innate-works/registry.yaml`（references）仍在原处，用 `skill-spark registry scan-refs` / `clone-refs`。

## skill-spark

一个 binary、两组运维子命令。源码入口 `tools/innate-spark-cli/packages/skill-cli/src/index.ts`。

### registry

布局写在仓库根 `.innate-registry-cli.yaml`，不写死在代码里。

```bash
SPARK="bun tools/innate-spark-cli/packages/skill-cli/src/index.ts"

$SPARK registry scan          # → tools/registry/apps.yaml
$SPARK registry clone
$SPARK registry scan-refs     # → innate-works/registry.yaml
$SPARK registry clone-refs

cd tools/innate-spark-cli && bun test && bun run build:exe
# 写出 tools/innate-spark-cli/dist/skill-spark
```

命令与配置字段详见 [innate-spark-cli/docs/cli/registry.md](./innate-spark-cli/docs/cli/registry.md)。

提交钩子（在 hub 根目录）：

```bash
ln -sf ../../tools/pre-commit.sh .git/hooks/pre-commit
```

### selfhost

多套主机写在 [innate-spark-cli/config.json](./innate-spark-cli/config.json)。唯一环境变量是 `SELFHOST_CLI_PASSWORD`（仅 `via: smbfs`）。密码不要进 json。

```bash
SPARK="bun tools/innate-spark-cli/packages/skill-cli/src/index.ts"
CFG=tools/innate-spark-cli/config.json

# 先填 config.json 里对应 profile 的 host / user
$SPARK selfhost profiles --config "$CFG"
$SPARK selfhost open --profile lazycat --config "$CFG"
mv ~/Downloads/a.zip "$($SPARK selfhost path --profile lazycat --config "$CFG")/"
```

`open` 走访达 + 钥匙串，路径一般在 `/Volumes/<share>`。`mount --via smbfs` 挂到该 profile 的 `mountPoint`。命令与配置字段详见 [innate-spark-cli/docs/cli/selfhost.md](./innate-spark-cli/docs/cli/selfhost.md)。

## 约定

- CLI 的命令和配置字段写在自己的 `docs/` 里；本页只做索引。
- `package.json` 只记脚本别名和 binary 名，不靠 `npm pack` 分发。
- 配置放文件（yaml / json），不要把项目路径写进源码。
