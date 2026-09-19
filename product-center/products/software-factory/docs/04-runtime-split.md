# 04 · 换 Agent Runtime：不大改结构的条件

这是本厂最重要的可逆点：**DeepSeek Harness 的循环本身是插件**。工厂如果写对依赖，发现默认 `dsh-agent-loop` 不好，可以换成 Pi（或其它）循环，而不拆看板、门禁、preset、runners、Desktop。

官方两句话要一起读：

- 架构：loop、模型、工具、session **都可以从配置替换**。
- agent-loop 文档：它是仓库里**唯一**装了具体循环逻辑的包；其它包应依赖 `dsh-agent`（`ctx.agents` + 事件），**不要 import loop 内核**。`setFactory` **同一进程只能有一个** AgentFactory。

所以「换 Runtime」= **换那一个 factory 插件行**，不是换产品形态。

## 1. 三级替换（结构冲击从左到右变大）

```text
L1  ctx.llm 适配器          同一 loop，换模型运输
L2  ctx.subagents provider  父循环仍是 DSH，子任务换 Pi/Codex/…
L3  ctx.agents.setFactory   整个进程的驱动循环换成别家
```

| 级 | 怎么换 | 工厂代码动不动 | 什么时候用 |
|---|---|---|---|
| **L1** | profile patch 选 `llm-pi-ai` / `llm-deepseek` | **不动** | 模型不行、推理风格不行 |
| **L2** | 新增 named subagent provider；workflow/`agent()` 指定名字 | **几乎不动**（最多 config 写 provider 名） | 只觉得「写代码的子代理」不行，对话/门禁还行 |
| **L3** | `disabled` 掉 `@deepseek-ai/dsh-agent-loop` 那一行，insert 自家 `AgentFactory` 插件 | **工厂插件仍不动**，前提是它们只 `inject: ['agents']` | 主循环（turn/step、工具调度、恢复）整体不行 |

**L4（禁止）**：factory 自己 `spawn` Pi/`AgentSessionRuntime`。那是第二棵树，看板、冻结、Session、Sandbox 全要重做。这才叫大改结构。

`setFactory` 已有 factory 会抛错。L3 必须先卸掉官方 loop 行，不能两个 loop 并存。L2 可以多 provider 并存，所以是更稳的过渡。

## 2. 工厂必须守住的依赖（否则 L3 会变成大改）

工厂插件允许 `inject`：

`agents` · `tools` · `commands` · `jobs` · `skills` · `agentPresets` · `goals` · `sessions` / `sessionProjections` · `fs` · `sandbox` · `credentials` · `llm`（仅选模型时）

工厂插件 **禁止**：

- `import` `@deepseek-ai/dsh-agent-loop` 或任何 `ReactLoopAgent` 内核
- `inject: ['agentLoop']` 后调用 `ctx.agentLoop.create` 当唯一创建路径（声明式 agents 配置属于 loop 插件自己的 config，换 loop 时那份 config 会一起换）
- 认 Pi / Codex 的私有 JSONL 为产品轨迹

阶段入口统一：

```ts
await ctx.agents.create({
  sessionId,
  meta: { cwd, agentPreset: 'factory-s5-backend' },
})
```

换 L3 之后，这句话还是这句话。UI 仍订 `session/event` 与 `agent/*`。

## 3. L3 替换循环必须履行的合同（SPI）

新 Runtime 不是「能聊天就行」，必须当 DSH 的 **AgentFactory**：

1. **`create` / `resume`**  
   与 `dsh-agent` 上的 `AgentFactory` 一致：未发布前跑 `setup`，失败回滚，发布后才有 `session/created`。`resume` 从 `ctx.sessionPersistence` 重建。
2. **Session 事件**  
   驱动 turn/step；`user/message`、`assistant/message`、`tool/call`、`tool/result` 可从 log 重建。**模型可见 ⇒ 已入 log。** 否则 Trajectory、fork、投影全坏。
3. **工具只走 `ctx.tools`**  
   `tools/pre-execute` → execute → post-execute。skel 冻结、sandbox、本厂 `run_go_test` 都挂在这条瀑布上。若 Pi 只用自己的 read/edit/bash，门禁失效。
4. **活事件**  
   `agent/*`、`agent/assistant-stream`，Web/Desktop 才能跟会话。
5. **Preset / isolate**  
   组合仍由 host `agentPresets` 做；loop 只驱动已经组好的 `agent.ctx`。不要在 Pi 里再发明一套 skill 发现。
6. **一个进程一个 factory**  
   用 patch **整行替换** loop 插件的 `id`/`name`，不要试图双注册。

Pi coding-agent **不是**现成的 AgentFactory。L3 的工作量是写 `dsh-agent-loop-pi`：里面可以调 Pi 的 loop，但对外只暴露上述合同。这是一个适配器插件，不是改工厂包。

## 4. 推荐演进，而不是一步 L3

1. 先 L1：同一 loop，换 `llm-pi-ai`，看模型是否是瓶颈。  
2. 编码阶段差：L2，只把 S8 repair 的子代理指到 `pi`。看板/commands/guard 零改。  
3. 主会话也差：再做 L3 适配器，profile 换一行。  
4. 永远不要为了「试试 Pi」去拆 bundle。

验收 L3：`dsh --dump-config` 里 loop 行的 `name` 已不是 `@deepseek-ai/dsh-agent-loop`；`/run-stage S5`、冻结拦 skel、iframe 报告仍工作。

## 5. 风险（换循环仍可能痛的地方）

- Preview：`AgentFactory` / SessionEvent 可能改，适配器要跟版本。  
- 官方认为改 loop 是 1% 需求，合同面比 `ctx.llm` 宽得多。  
- Pi 的工具面（四件套）和 DSH 工具注册表不是同一套；适配器必须把 Pi 的调用 **映射进** `ctx.tools`，或让 Pi 不用自带工具、只当推理核。后者更接近 L1。  
- 声明在 loop **config.agents** 里的主 agent，换包时要在新插件的 config 里重写（整行替换语义）。工厂应少用这条，多用 `ctx.agents.create`。

只要工厂不踩「禁止」列表，**产品结构（bundle / preset / 双面 UI / runners）在 L1–L3 都保持**。变的只是 profile 里那一行驱动插件。
