# 02 · 模块 = 插件包（按 seam 拆）

不要按「前端/后端/Pi adapter」拆。按 **Cordis 包的可变原因** 拆：定义、提供者、消费者、bundle 层、preset、无 bundle 的纯库。

## 1. 仓库布局

```text
software-factory-project/
  packages/
    factory-artifact-lib/     # 无 dsh.bundle：scanner + JSON Schema（被插件 import）
    dsh-factory-skel-guard/   # 插件：tools/pre-execute 拦 *.skel
    dsh-factory-runners/      # 插件：catalog/validate/go-test/cover/pgembed
                              #   Provider: subprocess+sandbox
                              #   Consumers: ctx.tools + ctx.commands + ctx.jobs
    dsh-factory-gates/        # 插件：commands freeze/ack/sign；goals 挂钩
    dsh-factory-board/        # 双面插件：host 投影 + client slots
    dsh-factory-bundle/       # 唯一 bundle：cordis.patch.yml 插入以上行
    dsh-subagent-pi/          # L2：ctx.subagents provider，name=pi
    dsh-agent-loop-pi/        # L3：AgentFactory，替换官方 loop 行
                              # Desktop Host 不是本厂包：官方 Electron apps/desktop
                              # 或社区 Tauri/Electron 壳；见 docs/11 第 11–12 节
  presets/
    factory-s3-us/
    factory-s5-backend/
    factory-s7-cases/
    factory-s8-repair/
    factory-operator/         # 人对话、只读 + commands
  skills/                     # 现有 SKILL.md，给 skill-filesystem
  packs/material/             # 工作区路径配置（给 runners/gates 的 config）
```

`dsh-factory-bundle` 的 patch **只 insert 行**，尽量不 override `dsh-base` 的 llm/tools，除非要收紧 sandbox。用户可用 profile 的 `cordis.patch.yml` 再整行覆盖我们的 config。

## 2. 每个插件的 inject 与产出

### `factory-artifact-lib`

不是插件。Scanner、schema、维度词典。单测不启动 dsh。

### `dsh-factory-skel-guard`

```
inject: ['tools']
apply: ctx.on('tools/pre-execute', ...)  读 pack 的 frozen 标记与 glob
```

Path B 解冻 = command 改 config / 暂时 disable 这一行（后来的 patch 设 `disabled: true`），不要在 prompt 里「请勿修改」。

### `dsh-factory-runners`

```
inject: ['tools', 'commands', 'jobs', 'sandbox', 'subprocess', 'fs']
```

每个 runner 三件套：执行函数、tool schema、command。模型「声称测试已过」不算数：command/tool 的返回值来自进程退出码和报告路径。

跑测挂 `ctx.jobs`，以便 Desktop 可取消、`tool-jobs` 可列。

### `dsh-factory-gates`

```
inject: ['commands', 'goals', 'agents', 'agentPresets']
```

- `/factory-status` `/freeze-skel` `/ack-review` `/run-stage <id>` `/sign-handoff`
- `run-stage` 内部 `ctx.agents.create({ preset })`，不 new 自己的 loop
- 阶段目标写入 `ctx.goals`

### `dsh-factory-board`

双面：

- host：`inject: ['sessionProjections', 'fs', …]`，注册 projection unit
- client：`dsh.client.inject: ['slots', 'connection']`；**可选** client `inject: ['betterSidebar']`（没有则只挂 `conversation.view`）
- 看板组件同一份：官方页签 **或** `registerTab` **或** widget 卡片

Conversation 里的 workflow 节点继续用官方 `dsh-client-ui-workflow-run`。不要自绘 Better Sidebar / 系统 Dock。

### `dsh-subagent-pi`（可选，第二期也可）

```
inject: ['subagents', 'credentials']
```

实现 `ctx.subagents` 的 named provider `pi`。Workflow 脚本 `agent()` 时可指定该 provider。会话、工具政策、父 cwd 仍走 subagent 缝，**不要**在 factory 里 `child_process.spawn('pi')`。

第一期可以不做：编码走默认 in-process 子代理 + `agent-loop` + `llm-pi-ai` 即够。

## 3. Preset（阶段工人）

每个阶段一个目录，内含 `preset.yml` + `agent.cordis.yml`：

| Preset | 多挂 | 少挂 |
|---|---|---|
| `factory-operator` | commands、只读 fs、skill factory-operator | 不挂写工具也可 |
| `factory-s3-us` | skill `prd-to-user-story`、write glob US | 不挂 go test |
| `factory-s5-backend` | skill `user-story-on-frozen-skel` | skel-guard 生效 |
| `factory-s7-cases` | skill `api-test-case-generator` | |
| `factory-s8-repair` | 测试失败摘要 inject、write glob `*_test.go` | deny skel、deny 外域 |

服务行必须包在 `isolate: true` 的 group 里。只消费 host 能力的 tool 行（bash、jobs）保持不 isolate，与官方 `standard` preset 相同。

Skill 行挂在 preset 里：registry 在 host，preset 只往**自己的 layer** 注册 `skill-filesystem` 的 `customSkillDirs`。

## 4. 依赖方向

```text
bundle patch
  → 插件 apply(ctx)
      → inject 已有 @deepseek-ai 服务
      → import factory-artifact-lib   （无 ctx）
skills / presets  → 无代码依赖
```

工厂插件 **禁止** import `@deepseek-ai/dsh-agent-loop`。创建 agent 只走 `ctx.agents`。这样 L3 换循环时本包不用改。

`dsh-subagent-pi`（L2）与未来的 `dsh-agent-loop-pi`（L3 AgentFactory 适配器）都是可选包，不是看板/门禁的依赖。

## 5. Domain pack

仍是 YAML 配置，作为 **插件 config** 注入（patch 的 `config.pack` 或 `!!js` 读路径），不是新 runtime。新域 = 新 config + 新 skill 根，不改 seam。
