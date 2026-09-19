# 01 · 系统架构（插件组合，不是外挂 Runtime）

上一版把 DSH 画成 Shell/Host，再在旁边画 Pi Worker。那是普通应用分层，**不是** DeepSeek Harness。

Harness 里没有「我们的后端 + 他们的壳」。运行中的产品就是 Cordis 的一张插件表：每一行有 `id` / `name` / `config` / `inject` / 可选 `isolate`。后来的 patch 按 id **整行替换** config。根 `cordis.yml` 每次启动都是空列表，真实树 100% 由 bundle → profile patch → home patch → `--patch` 叠出来。

## 1. 组合单位

```text
Profile  (web | desktop | headless | sdk)
  └── bundles[]  有序
        ├── @deepseek-ai/dsh-base          模型、工具、session、sandbox、凭证…
        ├── @deepseek-ai/dsh-web-app       仅 web：浏览器应用
        └── @yorun/dsh-factory             本厂：一行 patch 插入我们的插件
  └── profiles/<name>/cordis.patch.yml     用户覆盖（整行替换，不是 deep merge）
  └── $DSH_HOME/cordis.patch.yml
  └── --patch
```

安装方式只有官方那条：

```bash
dsh plugin --profile web add ./packages/dsh-factory
dsh --profile web --dump-config | grep factory
dsh web
```

Desktop 把**同一个 bundle** `add` 进 `$DSH_HOME/profiles/desktop`。不要为桌面再写一套进程模型。Headless/CI 把同一 bundle 加进 `headless` 或 `sdk`。

禁止：自建 `factory` 可执行文件去 `spawn` Agent。DSH 校验入口，应用只能是 `dsh --profile …`。

## 2. 一个插件是什么

两样东西，缺一不可：

1. Cordis 模块：`export function apply(ctx, config)` 或 `class extends Service`，静态 `inject`（未声明的 `ctx.*` 会被 proxy 拒绝）。
2. `package.json` 的 `dsh` 字段：`bundle.patch` 和/或 `client` + `exports["./client"]`。

没有 `dsh.plugin.json`。纯逻辑库可以不声明 `dsh.bundle`，只能被插件 import，用户 `dsh plugin add` 时不会进 layer 栈。

**Seam = 定义 + 提供者 + 消费者。** 只写一个工具函数不算完成一条能力。例如「跑 go test」：

| 角色 | 包 |
|---|---|
| 定义 | 约定结果形状（可放在 factory 的 types 插件，或复用 `ctx.jobs`） |
| 提供者 | 用 `ctx.subprocess` + `ctx.sandbox.confine` 真正执行 |
| 消费者 | `ctx.tools.register(run_go_test)` 给模型；`ctx.commands.register` 给人（无模型回合） |

换 sandbox 后端时，消费者代码不动。这才是「everything is a plugin」的结构后果。

## 3. 工厂能力挂在已有缝上

不要发明第二套 `ctx.pipeline` / `ctx.workers` 去拥有 Agent。能挂就挂：

| 工厂需求 | 挂哪里 | 说明 |
|---|---|---|
| 编码循环 | **只经 `ctx.agents`（AgentFactory 缝）** | 默认提供者是 `dsh-agent-loop`，**可整行换成别家 loop 插件**。工厂禁止 import loop 包。见 [04-runtime-split.md](04-runtime-split.md) |
| 每阶段不同工具/Skill | `ctx.agentPresets` + `agent.cordis.yml`（服务行必须 `isolate`） | S3 写 US、S5 写 backend、S8 修测试 = 三个 preset |
| 阶段目标 | `ctx.goals` | 同会话目标，活的继续激活 |
| 多阶段编排 | `ctx.workflowEngine` + `ctx.subagents` | 脚本里 `agent()`；子代理 provider 可换 |
| 后台跑测 | `ctx.jobs` | bash/测试/子代理都登记在此；`tool-jobs` 查询/杀掉 |
| 人点「冻结/签收」 | `ctx.commands` | **不走模型回合** |
| 模型调 catalog/go test | `ctx.tools` | schema 进 prompt assembly |
| 禁止写冻结 skel | `tools/pre-execute` 瀑布 | 听事件，`next()` 传递；失败则工具失败 |
| 工作区文件 | `ctx.fs` / `ctx.workspace*` | 已有 Remote；Desktop 同一套 |
| Skills | `ctx.skills` + `dsh-skill-filesystem` | preset 层 `customSkillDirs` |
| 模型 | `ctx.llm` | 默认 `llm-deepseek`；Pi 模型面是 **`llm-pi-ai` 插件** |
| 凭证 | `ctx.credentials` | 禁止第二套 API Key |
| 持久轨迹 | `ctx.sessions` + 扩展 `SessionEventMap` | 模型可见 ⇒ 必须能从 log 重建 |
| 看板投影 | `ctx.sessionProjections` | 从已提交事件 fold，不要另做数据库当主存储 |
| UI | 双面插件 `slots.inject` / `conversation.view`；Web=Desktop 同一 `./client` | 浏览器半只渲染；Desktop 换运输。见 [08-ui-surfaces.md](08-ui-surfaces.md) |
| 沙箱 | `ctx.sandbox` | go test argv 先 confine 再 spawn |

## 4. 一次「跑阶段」怎么走（仍在同一棵树上）

人点 command 或模型调 workflow，都不会离开 DSH：

```text
command 或 tool-workflow
  → ctx.agents.create({ preset: 'factory-s5-backend', meta.cwd })
      → 当前 AgentFactory（默认 agent-loop，可换成 Pi 适配器）
      → ctx.llm
      → tools/pre-execute → tools/execute
      → 结果写入 session log
  → 可选 ctx.jobs 上挂 run_go_test（无模型）
  → sessionProjections fold 出阶段状态
  → client 订 session/event 刷新看板
```

没有「Host 再 fork 一个 Pi 进程、再把 Pi JSONL 桥回 DSH」这一步。那一步破坏「模型可见即入日志」。

## 5. Web / Desktop / Headless 只是不同 profile

同一 bundle 三处挂载：

- `dsh web` = `--profile web` = base + web-app + factory
- Desktop = 保留 profile `desktop` + 同一 factory bundle；无 loopback，走 `dsh-app://`
- CI = `--profile headless` 或 `sdk` + factory；无浏览器半（client 行不激活即可）

CLI profile 与 Desktop **不共享** node_modules。产品数据（session、凭证）可共享 `$DSH_HOME`。

## 6. 两条产品路径仍在，但是 preset 图

Path A / Path B 是 **preset 与 command 的启用关系**，不是两个微服务。

- Path A：preset `factory-s5-on-frozen-skel` 的 write 策略默认 deny `*.skel`
- Path B：在人 command `freeze-skel` 之前，临时启用允许写 skel 的 preset；freeze 之后 patch/政策把该 preset 换掉

详见 [03-pipeline.md](03-pipeline.md)。
