# 07 · 数据模型

## 1. 两层事实，都不要自建库当主存

| 层 | 存什么 | 谁写 |
|---|---|---|
| 工作区文件 | PRD / US / skel / 测试 / reports | Agent 工具与 runners |
| DSH Session log | 模型可见的一切 + 本厂 durable 事件 | agent-loop / 本厂插件 append |

看板状态用 `ctx.sessionProjections` **fold** 日志，加上 scanner 扫文件。`factory-run.schema.json` 是投影/导出形状，不是第二套会话。

扩展 Session 事件时遵守：新模型可见输入必须新事件类型。工厂特有建议（实现期对照官方 SessionEventMap）：

- `factory/stage` — 进入/离开阶段（command 写入）
- `factory/gate` — freeze / ack / sign
- `factory/runner` — job 起止与退出码（无模型）

不要把 Pi JSONL 当产品轨迹。

## 2. workspace.yaml

仍作为 **插件 config**（pack）。字段同前：roots、frozen_skel、cover filter。

## 3. 已有 QA schema

requirement / interface-contract / test-case / run-result / case-list 继续用。追溯链不变。报告三层不变（US / Method / Go cover）。

## 4. Git

默认不自动 commit。sign command 可提示人提交。密钥只在 `ctx.credentials`。
