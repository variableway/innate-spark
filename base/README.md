# base/

Hub 内的共享基座（git submodule）。`hubScanDirs: [base]` 让 registry 的 `path: base/...` 落在本仓。

| 目录 | 远程 | 说明 |
| --- | --- | --- |
| [`innate-backend/`](./innate-backend/) | [variableway/innate-backend](https://github.com/variableway/innate-backend) | Go 后端基座 |
| [`innate-fe-base/`](./innate-fe-base/) | [variableway/innate-fe-templates](https://github.com/variableway/innate-fe-templates) | 前端基座 monorepo |

## 更新

```bash
# 全部（含 base）
bun tools/innate-registry-cli/src/cli.ts clone

# 只更新 base
bun tools/innate-registry-cli/src/cli.ts clone --registry tools/registry/base.yaml
```

完整说明：[UC-11](../tools/docs/uc-11-update-hub-base.md)。

首次空目录：

```bash
git submodule update --init --recursive base/innate-backend base/innate-fe-base
# HTTPS 失败时改用 SSH：
# git clone git@github.com:variableway/innate-backend.git base/innate-backend
# git clone git@github.com:variableway/innate-fe-templates.git base/innate-fe-base
```
