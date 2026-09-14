# innate-registry-cli

通用 registry CLI：扫描 git 仓、合并进 YAML、按表 clone / pull。本仓的路径写在根目录 `.innate-registry-cli.yaml`，不写在代码里。换项目时复制这份配置并改字段即可。

```text
src/
  cli.ts            # 参数与子命令
  config/           # 读配置、解析 hub / works / apps
  git/              # git 原语 + clone / pull
  scan/             # 扫描目录、merge、写回
  registry/         # YAML 登记表读写
```

| 命令 | 登记表 | 扫描目录 |
| --- | --- | --- |
| `scan` | 配置里的 `registry`（相对 hub） | 参数，或配置 `hubScanDirs` + `scanDirs` |
| `clone` | 同上 | 按条目 `path` 落到 hub / works / apps |
| `scan-refs` | 配置里的 `refsRegistry`（相对 works） | 参数，或配置 `refsScanDirs` |
| `clone-refs` | 同上 | 同上 |

## 配置与参数

向上查找 `.innate-registry-cli.yaml` 或 `registry-cli.yaml`。也可用 `--config` / `REGISTRY_CLI_CONFIG`。

| 字段 / 参数 | 作用 |
| --- | --- |
| `hubScanDirs` | **当前目录**可扫描对象：相对 hub 的目录（如 `base`），写入 hub registry |
| `worksRoot` / `--works-root` | **外部**可扫描对象根：克隆与 refs 扫描的根目录 |
| `worksName` / `--works-name` | 未给 worksRoot 时，按目录名向上找 |
| `appsRoot` / `--apps-root` | 已拆出去的 apps 树 |
| `appsPrefix` / `--apps-prefix` | YAML 里映射到 appsRoot 的路径前缀 |
| `scanDirs` | 外部可扫描对象：相对 works / apps 的目录 |
| `registry` / `--registry` | hub 侧登记表 |
| `sectionSecondOnly` / `sectionKeepPrefix` | 分组规则 |
| `defaultDescBySection` | 新条目缺 desc 时的默认值 |

`scan` 默认扫描 `hubScanDirs` + `scanDirs`。`path` 解析顺序：`appsPrefix` → `hubScanDirs` → `worksRoot`。

环境变量：`REGISTRY_CLI_HUB_ROOT`、`REGISTRY_CLI_WORKS_ROOT`、`REGISTRY_CLI_WORKS_NAME`、`REGISTRY_CLI_APPS_ROOT`。

`package.json` 只记脚本别名。打独立可执行文件：`bun run build` → `tools/bin/innate-registry-cli`。

```bash
bun tools/innate-registry-cli/src/cli.ts scan
cd tools/innate-registry-cli && bun test
```
