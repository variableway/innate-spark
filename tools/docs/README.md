# Tools · Use cases

用场景说明当前工具怎么用。命令字段和配置项仍以各 CLI 自己的 README 为准。

默认在 **hub 根目录**（本仓库）执行。`REG` / `HOST` 只是下面的缩写：

```bash
REG="bun tools/innate-registry-cli/src/cli.ts"
HOST="bun tools/innate-selfhost-cli/src/cli.ts"
```

已打过 binary 时，把前面换成 `tools/bin/innate-registry-cli` 或 `tools/bin/innate-selfhost-cli`。

| Use case | 工具 | 情境 |
| --- | --- | --- |
| [UC-01 同步 Innate 项目清单](./uc-01-scan-apps.md) | registry-cli | 磁盘上的仓变了，要更新 `apps.yaml` |
| [UC-02 按清单拉齐仓库](./uc-02-clone-apps.md) | registry-cli | 新机器或同事机按表 clone / pull |
| [UC-03 同步 references](./uc-03-scan-refs.md) | registry-cli | 扫 `innate-works` 里的 skills / references |
| [UC-04 目录没了但先留着条目](./uc-04-keep-missing.md) | registry-cli | 仓搬走了，暂时不要从 YAML 删掉 |
| [UC-05 提交前自动扫一遍](./uc-05-pre-commit.md) | pre-commit | 每次 commit 带上最新 `apps.yaml` |
| [UC-06 访达挂上懒猫盘](./uc-06-selfhost-open.md) | selfhost-cli | 用钥匙串挂 SMB，再 `mv` 文件上去 |
| [UC-10 懒猫盘查什么、挂上后怎么进](./uc-10-lazycat-where-to-look.md) | selfhost-cli | 字段在懒猫哪一页抄；Mac 上盘在哪 |
| [UC-07 终端直接 mount_smbfs](./uc-07-selfhost-smbfs.md) | selfhost-cli | 不弹窗，挂到桌面文件夹 |
| [UC-08 多套自建盘](./uc-08-selfhost-profiles.md) | selfhost-cli | 家宽 NAS 和懒猫各一份 profile |
| [UC-09 打成本机命令](./uc-09-build-binary.md) | 两条 CLI | compile 成 `tools/bin/` 里的可执行文件 |
