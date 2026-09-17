# UC-06 访达挂上懒猫盘

**情境：** Mac 上要把懒猫（或任意 SMB）当成本地盘，用 `mv` / `cp` 传文件。不想在命令行里写密码，希望钥匙串记住。

**先读 [UC-10](./uc-10-lazycat-where-to-look.md)：** `host` / `share` / `user` 从懒猫网盘 **我的 → 网络服务 → SMB** 抄；懒猫的 `share` 通常是**用户名**。挂上后用 `path` / `status` 或访达侧边栏进盘。

**前置：** 编辑 [fire-skills/config.json](../fire-skills/config.json)，至少填好默认 profile 的 `host`、`user` 和 `share`：

```json
{
  "default": "lazycat",
  "profiles": {
    "lazycat": {
      "host": "192.168.1.5",
      "share": "admin",
      "user": "admin",
      "mountPoint": "~/Desktop/lazycat_disk",
      "via": "open"
    }
  }
}
```

`host` 也可以是公网域名（例如 `xxx.heiyu.space`）。不要把密码写进 json。

**做法：**

```bash
$HOST profiles
$HOST open --profile lazycat
```

访达会弹出密码框。勾选「在钥匙串中记住」。挂上后：

```bash
$HOST status --profile lazycat
$HOST path --profile lazycat
# 通常打印 /Volumes/share

mv ~/Downloads/my_file.zip "$($HOST path --profile lazycat)/"
mv ~/Documents/my_folder "$($HOST path --profile lazycat)/"
```

路径或文件名有空格时加引号：

```bash
mv "/Users/you/Desktop/My Photo.jpg" "$($HOST path)/"
```

不用时：

```bash
$HOST umount --profile lazycat
```

**结果：** 盘出现在 `/Volumes/<share 最后一段>`。`via: open` 不走 `mount_smbfs`，也不需要环境变量。
