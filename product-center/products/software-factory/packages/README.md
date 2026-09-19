# packages

实现期每个 **有 `dsh` 字段的目录** 才是用户能 `dsh plugin add` 的包。没有该字段的是库。

```text
packages/
  factory-artifact-lib/       # 无 dsh.bundle
  dsh-factory-hello/          # P0 最小插件
  dsh-factory-skel-guard/
  dsh-factory-runners/
  dsh-factory-gates/
  dsh-factory-board/          # 双面：. 与 ./client
  dsh-factory-bundle/         # dsh.bundle.patch 插入以上行
  dsh-subagent-pi/            # L2：ctx.subagents provider
  dsh-agent-loop-pi/          # L3 可选：实现 AgentFactory，patch 替换官方 loop
```

Bundle 的 `cordis.patch.yml` 只 `insert` 自己的 id。不要 deep-merge 幻想：后层覆盖必须重写整份 config。

插件 import 只用 `@deepseek-ai/cordis` 与 `@deepseek-ai/schemastery`（或 DSH 文档当时的 scope），不要裸 `cordis`。
