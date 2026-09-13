# UC-07 终端直接 mount_smbfs

**情境：** 脚本里要挂盘，不能弹访达。希望挂到自己选的文件夹（例如桌面 `lazycat_disk`），用完 `umount`。

**前置：** 该 profile 的 `via` 为 `smbfs`，并设好 `mountPoint`。密码只通过环境变量传入。

```json
"lazycat": {
  "host": "192.168.1.5",
  "share": "share",
  "user": "admin",
  "mountPoint": "~/Desktop/lazycat_disk",
  "via": "smbfs"
}
```

**做法：**

```bash
SELFHOST_CLI_PASSWORD='your-password' \
  bun tools/innate-selfhost-cli/src/cli.ts mount --profile lazycat
```

CLI 会 `mkdir -p` 挂载点，然后调用：

```text
mount_smbfs //admin@192.168.1.5/share ~/Desktop/lazycat_disk
```

（密码在 URL 里编码，不会写进 config。）

传文件：

```bash
mv ~/Downloads/my_file.zip ~/Desktop/lazycat_disk/
```

卸下：

```bash
bun tools/innate-selfhost-cli/src/cli.ts umount --profile lazycat
```

**注意：** `SELFHOST_CLI_PASSWORD` 会出现在当前 shell 环境里。一次性使用可以：

```bash
read -s SELFHOST_CLI_PASSWORD
export SELFHOST_CLI_PASSWORD
bun tools/innate-selfhost-cli/src/cli.ts mount --profile lazycat
unset SELFHOST_CLI_PASSWORD
```

更省事的日常用法见 [UC-06](./uc-06-selfhost-open.md)。
