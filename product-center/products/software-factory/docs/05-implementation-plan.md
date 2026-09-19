# 05 · 实现计划

原则：每一期都能 `dsh plugin add` + `--dump-config` 看见新行，并且 `dsh web` 能点到。先插件，后业务。不先做独立 CLI 工厂。

```text
W1     P0  第一个 Cordis 插件 + dump-config
W2     P1  factory bundle：双面看板只读扫描
W3–W4  P2  presets + skill-filesystem 挂现有 SKILL.md
W5–W6  P3  runners 作为 tools/commands/jobs
W7–W8  P4  skel-guard + gate commands + goals
W9     P5  同一 bundle 进 desktop profile
W10    P6  pgembed job + Handoff command
W11–12 钉 DSH 版本、修 preview 破坏、打磨 Material Path A
```

`llm-pi-ai` 第一期只做 profile 配置，不写 adapter。`dsh-subagent-pi` 放 v2，除非 in-process 子代理被证明不够。

---

## P0 · Hello plugin

- 一个 `apply(ctx)`，`inject: ['fs']` 或 settings 卡片，证明能进 web profile。
- `dsh plugin --profile web add ./packages/dsh-factory-hello`
- `--dump-config` 能 grep 到 `# ==` 层注释。
- `factory-artifact-lib` 单测：扫描现有 material 目录。

完成：新插件出现在组合树里，不是出现在自研 HTTP 服务里。

## P1 · Bundle + 双面看板

- `dsh-factory-bundle` 的 `cordis.patch.yml` insert board 行。
- Client slots：只读阶段卡（scanner 结果）。
- 不 create agent。

完成：`dsh web` 能看见 S1–S10 文件是否存在。

## P2 · Presets + Skills

- 安装 preset 根到 `ctx.agentPresets.roots`。
- `factory-s3-us` 等最小 preset：skill-filesystem `customSkillDirs`。
- command `/run-stage S3` → `ctx.agents.create({ preset })`。
- 已有 US 默认不覆盖（command 旗标 `force`）。

完成：fixture 仓能生成 US 骨架；主仓 skip。

## P3 · Runners 插件

- `run_catalog` / `run_go_test` / `run_cover`：tools + commands + jobs。
- argv 经 `ctx.sandbox.confine`。
- board iframe 现有 `index.html` / `go-cover.html`。

完成：人 command 跑绿 materialtypes，看板出三层报告。

## P4 · Guard 与门禁

- `tools/pre-execute` 拦 `*.skel`。
- commands：freeze / ack / sign。
- 失败摘要 `agent.inject()` 后再开 s8 preset。
- 阶段进度 `ctx.goals`；投影 fold session 事件。

完成：改红一条用例 → repair preset 只动测试文件 → 再绿；skel 无法写入。

## P5 · Desktop

- `dsh plugin --profile desktop add` 同一 bundle（按当时 CLI）。
- 确认 client platform；报告走 Host 资源通道。

## P6 · SQL 与签收

- pgembed 作为 job；失败 skip + howToStart。
- `/sign-handoff` 写工作区 `handoff.json`（文件仍是事实源）。

## v2

- Path B 写 skel preset + freeze。
- `dsh-subagent-pi`（L2）与 `dsh-agent-loop-pi`（L3 AgentFactory）。
- workflowEngine 脚本编排 Path A。
- 多域 pack。
- 原生覆盖 Conversation 节点替代 iframe。
