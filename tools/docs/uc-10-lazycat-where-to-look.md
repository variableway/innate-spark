# UC-10 懒猫盘：要查什么、在哪里查、挂上后怎么进

**情境：** 第一次把懒猫网盘接到 Mac，不知道 `host` / `share` / `user` 填哪；或者已经 `open` 成功了，不知道本地路径在哪、文件落到网盘的哪一层。

分两段：**挂之前**在懒猫里抄连接信息；**挂之后**在 Mac 上确认入口。

官方说明可对照：[不登录客户端，如何用 Samba 挂载](https://lazycat.cloud/playground/guideline/627)、[网盘 SMB / 电视盒子](https://lazycat.cloud/playground/guideline/527)。

---

## 1. 挂之前：在懒猫里查四样东西

懒猫是多用户隔离的，SMB 路径一般是 **`smb://地址/用户名`**，共享名往往就是用户名，不是字面量 `share`。

在 **懒猫网盘 App**（或微服里打开的网盘）：

1. 右下角 **我的**（或点头像）
2. **设置 → 网络服务 → SMB**
3. **启动 SMB**，设好 **SMB 密码**（可以和登录密码不同，以这里显示的为准）
4. 打开 **内网服务**（局域网挂载需要；关掉的话 `mount_smbfs` / 访达会连不上）

这个页面会直接给出可抄的地址，例如：

| 界面上看到的 | 含义 | 填进 `config.json` |
| --- | --- | --- |
| `smb://192.168.1.5/admin` | 局域网 | `host`: `192.168.1.5`，`share`: `admin`，`user`: `admin` |
| `smb://file.xxx.heiyu.space/admin` | 公网域名 | `host`: `file.xxx.heiyu.space`，`share`: `admin`，`user`: `admin` |

用户名、密码以 **网络服务 → SMB** 这一页为准，不要猜。多用户时，每个子用户要进 **自己的** 网盘打开 SMB，管理员不能用自己的账号去挂别人的家目录（见[多用户数据](https://lazycat.cloud/playground/guideline/501)）。

**对照表（不知道填哪就按这张找）：**

| 你要的字段 | 去哪看 | 不要去哪猜 |
| --- | --- | --- |
| `host`（局域网） | 网盘 → 网络服务 → SMB → 开启内网后给出的 IP；或路由器后台「已连接设备」里懒猫的 IP | 不要用手机蜂窝网去挂内网 IP |
| `host`（远程） | 同一页的域名，常见 `file.<微服名>.heiyu.space`；微服名也在 App 设备信息 / 浏览器地址栏 | 不要漏掉 `file.` 前缀（有的教程写的是 `xxx.heiyu.space` 的 Web，SMB 常用 `file.` 子域） |
| `share` | SMB 地址最后一段，通常等于用户名 | 本仓 `config.json` 里预填的 `"share"` 只是占位，懒猫一般要改成用户名 |
| `user` | SMB 页上的用户名 = 微服账号 | |
| 密码 | SMB 页上你刚配置的密码；只在访达弹窗或 `SELFHOST_CLI_PASSWORD` 里用 | **不要写入** `config.json` |
| SMB 开了没 | 同一页的「SMB 服务」开关 | 开关关着时，CLI 怎么写都连不上 |

局域网优先用 IP（快）；人不在家再用 `file.xxx.heiyu.space`。两种可以做成两个 profile，见 [UC-08](./uc-08-selfhost-profiles.md)。

抄完写入 [config.json](../innate-selfhost-cli/config.json)：

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

用 CLI 核对有没有填进当前 profile（不会显示密码）：

```bash
bun tools/innate-selfhost-cli/src/cli.ts profiles
# * lazycat  admin@192.168.1.5/admin
```

---

## 2. 挂之后：在 Mac 上查「盘在哪」

先挂上（日常推荐访达，见 [UC-06](./uc-06-selfhost-open.md)）：

```bash
bun tools/innate-selfhost-cli/src/cli.ts open --profile lazycat
```

然后按下面查本地入口。

### 用本仓库 CLI（最先看）

```bash
bun tools/innate-selfhost-cli/src/cli.ts status --profile lazycat
bun tools/innate-selfhost-cli/src/cli.ts path --profile lazycat
```

| 命令 | 查什么 |
| --- | --- |
| `status` | 配置里的 `mountPoint` 和 `/Volumes/<share>` 是否已经是挂载点，`[on]` / `[off]` |
| `path` | 给 `cp` / `mv` 用的路径。`via: open` 一般是 `/Volumes/admin`（最后一段共享名）；`via: smbfs` 一般是 `~/Desktop/lazycat_disk` |

```bash
ls "$(bun tools/innate-selfhost-cli/src/cli.ts path --profile lazycat)"
mv ~/Downloads/notes.zip "$(bun tools/innate-selfhost-cli/src/cli.ts path --profile lazycat)/"
```

### 用访达

- 侧边栏 **位置**：多一个以共享名命名的磁盘（常见是用户名）
- 菜单 **前往 → 电脑**，或 **前往 → 前往文件夹**，输入 `path` 打出来的路径
- 桌面上若开了「显示已连接的服务器」，也会出现同一个盘

### 用系统命令（CLI 说 [off] 时）

```bash
mount | grep -i smbfs
ls /Volumes
```

`mount` 一行里 `on /Volumes/admin` 就是访达挂上的点；`on /Users/you/Desktop/lazycat_disk` 是 `mount_smbfs` 的点。两边可能同时存在，以 `path` 为准。

钥匙串里的密码：**钥匙串访问 → 登录 → 搜主机名或 `smb`**。改懒猫 SMB 密码后，旧条目要删掉再 `open` 一次。

---

## 3. 挂上的是哪一层目录

`smb://host/用户名` 挂上后，本地根目录 = 该用户在懒猫网盘里的家目录，不是整台机器的所有盘。子文件夹就是网盘 App 里能看到的那些。

若要进更深一层，路径接在 `path` 后面：

```bash
DEST="$(bun tools/innate-selfhost-cli/src/cli.ts path --profile lazycat)"
ls "$DEST"
mv ~/Downloads/clip.mp4 "$DEST/Movies/"
```

`Movies` 必须是网盘里已经存在的文件夹名（或先 `mkdir`）。

---

## 4. 对不上时按这个顺序查

1. `profiles`：host / user / share 是否和 SMB 页上的 `smb://…` 三段一致。
2. 懒猫网盘 → 网络服务 → SMB：服务开着、内网开着、密码是新的。
3. Mac 和懒猫同一局域网（远程则用 `file.…heiyu.space`，不要用内网 IP）。
4. `status` / `mount | grep smbfs`：到底有没有挂上，挂在 `/Volumes/…` 还是桌面文件夹。
5. 仍失败：把 SMB 页上的完整 `smb://…` 地址和 `status` 输出对照，不要只看 App 首页的 Web 域名。
