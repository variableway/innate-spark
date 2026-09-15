# UC-05 提交前自动扫一遍

**情境：** 不想每次手跑 `scan`。commit hub 时希望 `tools/registry/apps.yaml` 已经和磁盘对齐并被 stage。

**做法：** 在 hub 根目录安装钩子（只需一次）：

```bash
ln -sf ../../tools/pre-commit.sh .git/hooks/pre-commit
```

之后正常提交即可：

```bash
git add tools/innate-registry-cli
git commit -m "Update registry CLI"
```

**例子输出：**

```text
[pre-commit] scanning hub base/ + innate-apps/ + skills/ -> tools/registry/apps.yaml
==> works /Users/you/innate/innate-works
...
[pre-commit] tools/registry/apps.yaml updated and staged
```

若表没有变化：

```text
[pre-commit] tools/registry/apps.yaml is up to date
```

**结果：** 钩子优先跑 `tools/bin/innate-registry-cli`，没有 binary 就 `bun tools/innate-registry-cli/src/cli.ts scan`。本机要有 Bun，或先按 [UC-09](./uc-09-build-binary.md) 打好包。
