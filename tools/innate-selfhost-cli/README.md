# innate-selfhost-cli

把自建 SMB 网盘接到 macOS 命令行。多套主机写在一份 `config.json` 里；**唯一环境变量**是 `SELFHOST_CLI_PASSWORD`（仅 `via: smbfs` 需要）。密码不要写进 json。

```text
src/
  cli.ts
  config/     # 读 config.json、选 profile
  smb/        # URL 与 mount_smbfs / open / umount
config.json   # profiles
```

| 命令 | 作用 |
| --- | --- |
| `profiles` | 列出 json 里的配置 |
| `open` | `open smb://user@host/share`，访达弹密码，可写入钥匙串 |
| `mount` | `via: open` 时同上；`via: smbfs` 时跑 `mount_smbfs` |
| `umount` / `status` / `path` | 卸载、是否已挂上、给 `cp`/`mv` 用的路径 |

字段从哪抄、挂上后盘在哪：见 [docs/uc-10](../docs/uc-10-lazycat-where-to-look.md)。

```bash
# 先按 UC-10 填 config.json（懒猫的 share 一般是用户名）
bun tools/innate-selfhost-cli/src/cli.ts profiles
bun tools/innate-selfhost-cli/src/cli.ts open --profile lazycat
mv ~/Downloads/a.zip "$(bun tools/innate-selfhost-cli/src/cli.ts path --profile lazycat)/"

SELFHOST_CLI_PASSWORD='…' bun tools/innate-selfhost-cli/src/cli.ts mount --profile lazycat
```
