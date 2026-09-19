# UC-03 同步 references 清单

**情境：** `innate-works` 里的 `skills` / `base` / `projects` / `references` 增删了外部仓。这些条目写在兄弟仓根目录的 `registry.yaml`（spark-cli 那份），不是 `tools/registry/apps.yaml`。

**做法：**

```bash
$REG scan-refs
```

拉齐这些仓：

```bash
$REG clone-refs
```

**例子：** 扫完后打开 `../innate-works/registry.yaml`，应能看到按 `references/fe` 这类小节分组的 `projects:` 列表。`clone-refs` 会按每条的 `path` 在 `worksRoot` 下 clone / pull。

**不要搞混：**

| 命令 | 写哪 | 默认扫哪 |
| --- | --- | --- |
| `registry scan` / `registry clone` | `tools/registry/apps.yaml` | `scanDirs`（Innate 自己的 apps / base / skills） |
| `registry scan-refs` / `registry clone-refs` | `innate-works/registry.yaml` | `refsScanDirs` |
