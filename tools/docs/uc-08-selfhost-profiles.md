# UC-08 多套自建盘

**情境：** 家里 NAS 和懒猫不是同一台机器。希望一份 `config.json` 切换，不要靠一堆环境变量。

**做法：** 在 [config.json](../fire-skills/config.json) 里加 profile：

```json
{
  "default": "lazycat",
  "profiles": {
    "lazycat": {
      "host": "xxxx.heiyu.space",
      "share": "share",
      "user": "admin",
      "mountPoint": "~/Desktop/lazycat_disk",
      "via": "open"
    },
    "home-nas": {
      "host": "192.168.1.10",
      "share": "media",
      "user": "patrick",
      "mountPoint": "~/Desktop/nas",
      "via": "open"
    }
  }
}
```

列出并选用：

```bash
$HOST profiles
# * lazycat  admin@xxxx.heiyu.space/share
#   home-nas  patrick@192.168.1.10/media

$HOST open --profile home-nas
mv ~/Movies/clip.mp4 "$($HOST path --profile home-nas)/"
```

不写 `--profile` 时用 json 里的 `"default"`。

换一份不在默认位置的配置（例如本机私有副本，仍不要提交密码）：

```bash
$SPARK selfhost open --config ~/selfhost.config.json --profile home-nas
```
