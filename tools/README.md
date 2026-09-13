# Tools

本仓的工具层：登记表是数据，CLI 是操作入口。实现用 Bun，可 `bun run build` 打成独立 binary（产物在 `bin/`，已 gitignore）。

不要在这里放产品应用源码。新工具先在 `product-center/catalog.md` 加一行，再开子目录。

## 目录

```text
tools/
  README.md                 # 本页
  docs/                     # 按 use case 写的用法（带例子）
  registry/                 # 四张登记表（数据）
  innate-registry-cli/      # 扫仓 / 合并 YAML / clone
  innate-selfhost-cli/      # macOS 挂自建 SMB
  pre-commit.sh             # 提交前跑 registry scan
  bin/                      # compile 产物（不入库）
```

用法按场景写在 [docs/](./docs/README.md)。命令字段见各 CLI 自己的 README。

| 路径 | 作用 | 说明 |
| --- | --- | --- |
| [docs/](./docs/README.md) | Use cases | 带例子的操作说明 |
| [registry/](./registry/) | Innate 登记表 | `apps.yaml` / `plugins.yaml` / `skills.yaml` / `deploy.yaml` |
| [innate-registry-cli/](./innate-registry-cli/) | `innate-registry-cli` | 扫 git 仓、写登记表、按表 clone |
| [innate-selfhost-cli/](./innate-selfhost-cli/) | `innate-selfhost-cli` | 挂载 / 卸载自建 SMB（懒猫等） |
| [pre-commit.sh](./pre-commit.sh) | git hook | `scan` 后 stage `registry/apps.yaml` |

兄弟仓 `innate-works/registry.yaml`（references）仍在原处，用 `innate-registry-cli scan-refs` / `clone-refs`。

## innate-registry-cli

布局写在仓库根 `.innate-registry-cli.yaml`，不写死在代码里。

```bash
bun tools/innate-registry-cli/src/cli.ts scan          # → tools/registry/apps.yaml
bun tools/innate-registry-cli/src/cli.ts clone
bun tools/innate-registry-cli/src/cli.ts scan-refs     # → innate-works/registry.yaml
bun tools/innate-registry-cli/src/cli.ts clone-refs

cd tools/innate-registry-cli && bun test && bun run build
# 写出 tools/bin/innate-registry-cli
```

提交钩子（在 hub 根目录）：

```bash
ln -sf ../../tools/pre-commit.sh .git/hooks/pre-commit
```

## innate-selfhost-cli

多套主机写在 [innate-selfhost-cli/config.json](./innate-selfhost-cli/config.json)。唯一环境变量是 `SELFHOST_CLI_PASSWORD`（仅 `via: smbfs`）。密码不要进 json。

```bash
# 先填 config.json 里对应 profile 的 host / user
bun tools/innate-selfhost-cli/src/cli.ts profiles
bun tools/innate-selfhost-cli/src/cli.ts open --profile lazycat
mv ~/Downloads/a.zip "$(bun tools/innate-selfhost-cli/src/cli.ts path --profile lazycat)/"

cd tools/innate-selfhost-cli && bun test && bun run build
# 写出 tools/bin/innate-selfhost-cli
```

`open` 走访达 + 钥匙串，路径一般在 `/Volumes/<share>`。`mount --via smbfs` 挂到该 profile 的 `mountPoint`。

## 约定

- 每个 CLI 自己的 README 写命令和配置字段；本页只做索引。
- `package.json` 只记脚本别名和 binary 名，不靠 `npm pack` 分发。
- 配置放文件（yaml / json），不要把项目路径写进源码。
