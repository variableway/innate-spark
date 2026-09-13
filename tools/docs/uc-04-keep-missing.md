# UC-04 目录没了但先留着条目

**情境：** 某个仓从磁盘删了或还没迁到新路径。默认 `scan` 会把 YAML 里对应行删掉。你想先对一下差异，条目先留着。

**做法：**

```bash
bun tools/innate-registry-cli/src/cli.ts scan --keep-missing
```

**例子输出（节选）：**

```text
[kept] 3 directories no longer exist:
    innate-apps/content/innate-feeds
    innate-apps/tooling/spark-cli
    skills/wip-skills/HTMLSlide
```

**结果：** 磁盘上还在的仓会新增或更新路径；消失的行仍留在 `apps.yaml`。确认可以删时再跑不带 `--keep-missing` 的 `scan`。

`--regenerate` 会丢掉全部手工字段，只在要整表重建时用：

```bash
bun tools/innate-registry-cli/src/cli.ts scan --regenerate
```
