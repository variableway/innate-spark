# Tools

本仓的工具层：登记表是数据，CLI 是操作入口。实现用 Bun，可 `bun run build:exe` 打成独立 binary（产物在 `tools/fire-skills/dist/`，已 gitignore）。

不要在这里放产品应用源码。新工具先在 `product-center/catalog.md` 加一行，再开子目录。

## 目录

```text
tools/
  README.md                 # 本页
  docs/                     # 按 use case 写的用法（带例子）
  registry/                 # 四张登记表（数据）
  fire-skills/              # skill-spark：多子命令 CLI + skill 工作区
  innate-registry-cli/      # 旧 CLI（已合并进 skill-spark registry，仅作参考）
  innate-selfhost-cli/      # 旧 CLI（已合并进 skill-spark selfhost，仅作参考）
  pre-commit.sh             # 提交前跑 skill-spark registry scan
```

用法按场景写在 [docs/](./docs/README.md)。命令字段见 [fire-skills/docs/cli/](./fire-skills/docs/cli/cli-commands.md)。

| 路径 | 作用 | 说明 |
| --- | --- | --- |
| [docs/](./docs/README.md) | Use cases | 带例子的操作说明 |
| [registry/](./registry/) | Innate 登记表 | `apps.yaml` / `plugins.yaml` / `skills.yaml` / `deploy.yaml` |
| [fire-skills/](./fire-skills/) | `skill-spark` | 多子命令 CLI：skill 管理 + `registry` 扫 git 仓/写登记表/按表 clone + `selfhost` 挂载/卸载自建 SMB（懒猫等） |
| [innate-registry-cli/](./innate-registry-cli/) | 旧 `innate-registry-cli` | 已合并进 `skill-spark registry`，仅作参考保留 |
| [innate-selfhost-cli/](./innate-selfhost-cli/) | 旧 `innate-selfhost-cli` | 已合并进 `skill-spark selfhost`，仅作参考保留 |
| [pre-commit.sh](./pre-commit.sh) | git hook | `registry scan` 后 stage `registry/apps.yaml` |

兄弟仓 `innate-works/registry.yaml`（references）仍在原处，用 `skill-spark registry scan-refs` / `clone-refs`。

## skill-spark

一个 binary、两组运维子命令。源码入口 `tools/fire-skills/packages/skill-cli/src/index.ts`。

### registry

布局写在仓库根 `.innate-registry-cli.yaml`，不写死在代码里。

```bash
SPARK="bun tools/fire-skills/packages/skill-cli/src/index.ts"

$SPARK registry scan          # → tools/registry/apps.yaml
$SPARK registry clone
$SPARK registry scan-refs     # → innate-works/registry.yaml
$SPARK registry clone-refs

cd tools/fire-skills && bun test && bun run build:exe
# 写出 tools/fire-skills/dist/skill-spark
```

命令与配置字段详见 [fire-skills/docs/cli/registry.md](./fire-skills/docs/cli/registry.md)。

提交钩子（在 hub 根目录）：

```bash
ln -sf ../../tools/pre-commit.sh .git/hooks/pre-commit
```

### selfhost

多套主机写在 [fire-skills/config.json](./fire-skills/config.json)。唯一环境变量是 `SELFHOST_CLI_PASSWORD`（仅 `via: smbfs`）。密码不要进 json。

```bash
SPARK="bun tools/fire-skills/packages/skill-cli/src/index.ts"
CFG=tools/fire-skills/config.json

# 先填 config.json 里对应 profile 的 host / user
$SPARK selfhost profiles --config "$CFG"
$SPARK selfhost open --profile lazycat --config "$CFG"
mv ~/Downloads/a.zip "$($SPARK selfhost path --profile lazycat --config "$CFG")/"
```

`open` 走访达 + 钥匙串，路径一般在 `/Volumes/<share>`。`mount --via smbfs` 挂到该 profile 的 `mountPoint`。命令与配置字段详见 [fire-skills/docs/cli/selfhost.md](./fire-skills/docs/cli/selfhost.md)。

## 约定

- 每个 CLI 自己的 README 写命令和配置字段；本页只做索引。
- `package.json` 只记脚本别名和 binary 名，不靠 `npm pack` 分发。
- 配置放文件（yaml / json），不要把项目路径写进源码。
