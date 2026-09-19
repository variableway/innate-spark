# 11 · 规划插件 × 现有 GitHub 仓库（每项 5 选）

匹配原则：

1. **能直接 `dsh plugin add` 的**优先（官方 in-tree 或社区 `dsh-plugin`）。
2. 没有现成 DSH 插件时，给 **同缝合同** 的官方包（要自己写薄适配）或 **同职责** 的 Skill/SDD 仓库（当内容，不当 Host）。
3. 「可选项」≠ 推荐安装进生产。社区插件未审计；preview 下兼容性以 `--dump-config` 为准。
4. 官方包路径一律在 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 `packages/` 下，下面用「in-tree」表示。

## 立刻能对上的短名单

| 规划包 | 最接近的现成物 | 缺口 |
|---|---|---|
| bundle / hello | [zoahdev/dsh-plugin-template](https://github.com/zoahdev/dsh-plugin-template) | 要改名为 factory |
| skel-guard | [lonelymoon87/dsh-guardian](https://github.com/lonelymoon87/dsh-guardian) | 规则要改成 `*.skel` 冻结 glob |
| runners | [suimi8/dsh-test-runner](https://github.com/suimi8/dsh-test-runner) | 没有 Go / Ginkgo / cover / pgembed |
| gates | 官方 `packages/goal/*` + [titanwings/dsh-plannotator](https://github.com/titanwings/dsh-plannotator) | 没有 freeze/sign/run-stage |
| board | [Ericwong5021/dsh-kanban](https://github.com/Ericwong5021/dsh-kanban) 或 [alpacachen/dsh-kanban](https://github.com/alpacachen/dsh-kanban) | 列应对 S0–S10，数据应走 projection |
| skills | 本仓 `.cursor/skills/*` | 只要挂 `skill-filesystem` |
| L1 | in-tree `packages/llm/llm-pi-ai` | **不用自写** |
| L2 | in-tree `subagent-codex` / `subagent-acp` | **没有**现成 `dsh-subagent-pi` |
| L3 | in-tree `packages/core/agent` + Pi `packages/agent` | **没有**现成 AgentFactory 适配器 |
| Desktop Electron | 官方 `apps/desktop` + [IriskaDev/dsh-desktop](https://github.com/IriskaDev/dsh-desktop) | 社区多数走 `127.0.0.1`，与规划「无 loopback」冲突 |
| Desktop Tauri | [s3yf1337/dsh-desktop](https://github.com/s3yf1337/dsh-desktop) / [zneoxlab/deepseek-harness-app](https://github.com/zneoxlab/deepseek-harness-app) | **没有**官方 Tauri；多数仍是 loopback 壳 |
| 多 LLM Provider | in-tree `llm-pi-ai` + [Luck9Star/dsh-gateway-provider](https://github.com/Luck9Star/dsh-gateway-provider) | 订阅/OAuth 另装，不替换 `ctx.llm` |
| Harness Router | [tianji-qingtian/dsh-model-router](https://github.com/tianji-qingtian/dsh-model-router) / [green-dalii/dsh-shift-router](https://github.com/green-dalii/dsh-shift-router) | 叠在 adapter 上，不要第二套 loop |
| Git Worktree | [KHG420/git-worktree](https://github.com/KHG420/git-worktree) / [CSY656/dsh-worktree](https://github.com/CSY656/dsh-worktree) | 子代理隔离；不要工厂自己 `git worktree` |
| Markdown Editor | [linhx1999/dsh-writing-pad](https://github.com/linhx1999/dsh-writing-pad) / [yangshen830-eng/dsh-editor](https://github.com/yangshen830-eng/dsh-editor) | 审 US/PRD；草稿默认不写盘 |
| Canvas | [GHJIVHIDD/dsh-plugin-canvas](https://github.com/GHJIVHIDD/dsh-plugin-canvas) / [jiuyuechuwuhao/dsh-canvas-preview](https://github.com/jiuyuechuwuhao/dsh-canvas-preview) | 报告/HTML 预览；沙箱 iframe |
| Better Sidebar / Dock | [omdsh-dev/dsh-better-sidebar](https://github.com/omdsh-dev/dsh-better-sidebar) `registerTab` | 聊天留中间；工厂是侧栏 Tab |
| Widget | [Physicolor/dsh-widgets](https://github.com/Physicolor/dsh-widgets) / [liuliuhuhushui/dsh-quota-float](https://github.com/liuliuhuhushui/dsh-quota-float) | 悬浮状态，不是满页看板 |
| Skill 管理 | [cheshireez/dsh-skill-hub](https://github.com/cheshireez/dsh-skill-hub) | 官方只有 `ctx.skills` 发现，没有完整 GUI |
| Skill 评测 | [BiBoyang/dsh-eval-harness](https://github.com/BiBoyang/dsh-eval-harness) / [boomzikazita/dsh-skill-authoring](https://github.com/boomzikazita/dsh-skill-authoring) | 静态审计 ≠ 行为回归 |
| Memory | [PerryLink/dsh-memento](https://github.com/PerryLink/dsh-memento) / [omdsh-dev/dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) | **官方没有 `ctx.memory`** |
| Agent Loop | in-tree `packages/core/agent-loop` | 换 loop 走 L3，不要第二套循环 |
| Human-in-the-loop | 官方 `ask_user_question` + `ctx.approval`；社区 gatedflow / human-task | 门禁用 commands，不要另做 loop |
| 热加载 | 官方 HMR 只管源码/patch；新装 bundle 用 [kun2-5code/dsh-plugin-installer](https://github.com/kun2-5code/dsh-plugin-installer) | 官方 loop / `setFactory` / Desktop 不要热换 |

索引：[dsh.pub/en/plugins](https://dsh.pub/en/plugins/)、[dshfind.com](https://dshfind.com/en/plugins/zoahdev/dsh-plugin-template)、GitHub topic `dsh-plugin`。索引 ≠ 可装、≠ 安全。

---

## 1. `dsh-factory-bundle` / hello 插件骨架

规划：带 `dsh.bundle.patch` 的可安装层。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/bundle/*` | 官方 `dsh-base` / `dsh-web-app` 就是 bundle 范本 | 叠在后面，不要 fork |
| 2 | [zoahdev/dsh-plugin-template](https://github.com/zoahdev/dsh-plugin-template) | hello `apply` + `ctx.tools.register` + dump-config / web smoke CI | **P0 直接 fork** |
| 3 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `docs/user/develop/basic` hello-plugin | 官方教程：本地 `--patch` 再打成 bundle | 学 patch 语义 |
| 4 | [lxzy-7/dsh-plugin-guard](https://github.com/lxzy-7/dsh-plugin-guard) | 安装后 snapshot / 启动失败回滚 / quarantine | 护本厂 bundle 发布 |
| 5 | [zoahdev/dsh-plugin-doctor](https://github.com/zoahdev/dsh-plugin-doctor) | manifest / patch / pack / 新鲜 profile 安装 / `--dump-config` | 发 factory bundle 的 CI 门；清单见 [sandbaseai/deepseek-harness-handbook](https://github.com/sandbaseai/deepseek-harness-handbook) |

---

## 2. `dsh-factory-skel-guard`（`tools/pre-execute`）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [lonelymoon87/dsh-guardian](https://github.com/lonelymoon87/dsh-guardian) | **现成** `tools/pre-execute`：deny/ask、写路径、SQL；`post-execute` 脱敏 | 最近的可装插件；skel glob 可当自定义规则 |
| 2 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/sandbox/*`、`guard` | 官方 sandbox-policy / guard 缝 | 冻结应叠在政策上，不替代 sandbox |
| 3 | [chancelu/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness/discussions/365) 讨论中的 failure-modes | `tools/post-execute` + `agent/turn-stopping`：未跑测试就声称完成 | 修测试循环的「不许假绿」 |
| 4 | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) `packages/coding-agent/examples/extensions/protected-paths.ts` | Pi：拦 `.env` / `.git` 写入 | L2/L3 适配器里复用思路，**不要**当 DSH 插件装 |
| 5 | [gotgenes/pi-permission-system](https://github.com/gotgenes/pi-permission-system) | Pi 权限扩展（npm `@gotgenes/pi-permission-system`） | 仅 L3 映射进 `ctx.tools` 时参考 |

---

## 3. `dsh-factory-runners`（catalog / go test / cover / jobs）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [suimi8/dsh-test-runner](https://github.com/suimi8/dsh-test-runner) | **现成** `test_run` 工具：结构化失败摘要、超时、跟 bash 同一 sandboxPolicy | 最近的 runners 雏形；缺 Go/Ginkgo，可 fork 加 `go test` |
| 2 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/jobs/*`、`tool-bash` | `ctx.jobs` + subprocess + sandbox 官方消费者 | 本厂 runner 应登记 job，可取消 |
| 3 | [onsi/ginkgo](https://github.com/onsi/ginkgo) | 当前 materialtypes 执行器 | 被 runner **调用**，不是 DSH 插件 |
| 4 | [golang/tools](https://github.com/golang/tools) `cmd/cover` | `go tool cover`；本厂已有自定义 HTML | 覆盖采集子进程 |
| 5 | [fergusstrange/embedded-postgres](https://github.com/fergusstrange/embedded-postgres) | pgembed V16 | SQL job，不是插件 |

---

## 4. `dsh-factory-gates`（commands / goals / freeze / sign）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/goal/*`、`dsh-tool-goal`、`dsh-goal-round-driver` | 官方 `ctx.goals` + 模型工具 + 同会话续跑 | **阶段目标直接用**，不要自建状态机 |
| 2 | [KarlOfLaw/dsh-goal-mode-enhance](https://github.com/KarlOfLaw/dsh-goal-mode-enhance) | 把 `/goal` 做成 Web 可视/可点 | 门禁 UI 可叠；逻辑仍官方 goal |
| 3 | [fff122/dsh-task-checklist](https://github.com/fff122/dsh-task-checklist) | 本地 `.dsh/task-checklist/tasks.json`，agent 勾选 | 轻量 ack 清单，不是 G1–G4 |
| 4 | [titanwings/dsh-plannotator](https://github.com/titanwings/dsh-plannotator) | Plan Review 批注回灌 Session | 人审 US/backend 的交互样板 |
| 5 | [Optim-Agent/dsh-plans](https://github.com/Optim-Agent/dsh-plans) | preset：人审 Markdown 计划后才 `ctx.goals` 执行 | 接近 freeze→run-stage；官方 `/plan` 仍在 in-tree `packages/plan/plan-mode` |

---

## 5. `dsh-factory-board`（双面 slots / 看板）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [Ericwong5021/dsh-kanban](https://github.com/Ericwong5021/dsh-kanban) | **纯 client 半**：sidebar slot、Inbox/Ready/Running/Blocked/Done，不换 Host | 阶段看板最接近；列应对 S0–S10 而不是泛会话 |
| 2 | [FuncWei/dsh-kanban](https://github.com/FuncWei/dsh-kanban) | Hermes 看板 + `dsh --profile headless` 派工 | 有 sidecar（偏 L4），只借鉴 dispatch，不要照搬 Python 旁路 |
| 3 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/client/*`、`dsh-client-ui-workflow-run` | 官方 workflow Chat 节点、slots | 轨迹不要重画 |
| 4 | [alpacachen/dsh-kanban](https://github.com/alpacachen/dsh-kanban) | 人机同一块板 + `kanban_*` 工具，workspace 级 | 列可自定义，比纯会话看板更接近阶段卡 |
| 5 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/session/session-projection` | `ctx.sessionProjections` | 看板数据应从 log fold，不要只靠 localStorage（Ericwong 看板的弱点） |

其它同职责：[isolat-3k/dsh-kanban](https://github.com/isolat-3k/dsh-kanban)（派发子代理，注意是否绕过 factory gate）、[thomasvvugt/dsh-kanban-flow](https://github.com/thomasvvugt/dsh-kanban-flow)（人/代理列约束）。

---

## 6. Presets + Skills（阶段工人内容）

这里多数不是 Cordis 插件，而是 **SKILL.md / 流程**，挂 `skill-filesystem`。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/skill/skill-filesystem`、`apps/cli/config/agent-presets` | 官方发现根 + `standard` preset（isolate 范本） | **直接用**；本厂 skill 放 `customSkillDirs` |
| 2 | 本仓 `.cursor/skills/*`（`prd-schema` / `prd-to-user-story` / `user-story-on-frozen-skel` / `api-test-*`） | 已写好的 Yorun 流程 | **第一期内容源**，挂 `customSkillDirs` |
| 3 | [github/spec-kit](https://github.com/github/spec-kit) | specify → plan → tasks → implement；可装成 agent skills | 补「通用 SDD」，**不能**替代 Vine/Skel 不变量 |
| 4 | [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 变更 delta spec、人同意再写代码 | 接近 G2 冻结前的协议层 |
| 5 | [gotalab/cc-sdd](https://github.com/gotalab/cc-sdd) | requirements → design → tasks → 每任务子代理 + 对抗评审 | 接近 S8 repair；输出是 skills 不是 DSH preset |

其它同职责备选（超出 5 个）：[rashee1997/prd-pipeline](https://github.com/rashee1997/prd-pipeline)、[microsoft/agentic-sdlc-starter](https://github.com/microsoft/agentic-sdlc-starter)、[bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)。

---

## 7. L1 · `ctx.llm` 适配器

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/llm/llm-deepseek` | 官方 DeepSeek 适配器 | 默认 |
| 2 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/llm/llm-pi-ai` | **已有** `@mariozechner/pi-ai` 桥 | **L1 首选，不用自写** |
| 3 | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) / [earendil-works/pi](https://github.com/earendil-works/pi) `packages/ai` | pi-ai 源码 | 修适配器时对照，不直接当 DSH 插件 |
| 4 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/llm/llm-retry` | 重试缝 | 叠在 adapter 上 |
| 5 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/llm/llm` | `ctx.llm` 定义 | 再写新厂牌只 register adapter |

---

## 8. L2 · `dsh-subagent-pi`（`ctx.subagents`）

官方已经有多家 provider，**Pi 这一家还没有**，应对标下面 in-tree 包来写。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/subagent/subagent-codex` | Codex `app-server --stdio`，结果走 `dsh-subagent` 合同 | **写 pi provider 的模板** |
| 2 | 同上 `packages/subagent/subagent-claude-code` | Claude Code 运输 | 第二份运输范本 |
| 3 | 同上 `packages/subagent/subagent-acp` | 任意 ACP 子进程 | Pi 若走 ACP，可能 **零自研运输** |
| 4 | 同上 `packages/subagent/subagent-dsh-sdk` | 子 DSH SDK 运行时 | 对照「同族子 harness」 |
| 5 | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) `packages/coding-agent` | `pi --mode rpc` / SDK | provider 内部依赖；工厂核心不 import |

ACP 侧可替换运输（仍算 L2，走 `subagent-acp`）：[sst/opencode](https://github.com/sst/opencode)、[block/goose](https://github.com/block/goose)、[zed-industries/agent-client-protocol](https://github.com/zed-industries/agent-client-protocol)。

---

## 9. L3 · `dsh-agent-loop-pi`（AgentFactory）

**没有**现成「Pi 实现了 `ctx.agents.setFactory`」的仓库。选项是合同源 + 可被包进适配器的循环。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/core/agent` + `packages/core/agent-loop` | `AgentFactory`、`setFactory` 互斥、create/resume | **SPI 正文**；新 loop 只实现它 |
| 2 | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) `packages/agent`（pi-agent-core） | Pi 的 Agent 循环 | 适配器内部驱动 |
| 3 | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) `packages/coding-agent` | 带工具的编码循环、RPC | 适配器必须把工具 **映射回** `ctx.tools` |
| 4 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/subagent/subagent-spawn-in-process` | 子代理仍 `ctx.agents.create()` | 证明换 factory 后 in-process 子代理跟着走 |
| 5 | [openai/codex](https://github.com/openai/codex) 或 [anthropics/claude-code](https://github.com/anthropics/claude-code) | 另一种完整循环 | 更应走 L2 运输，不当第二套 factory；除非写 Codex AgentFactory（工作量同 Pi） |

---

## 10. `factory-artifact-lib`（Schema / 扫描，无 `dsh.bundle`）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | 本仓 `yorun-qa/schemas` | requirement / contract / test-case / case-list | **直接引用** |
| 2 | [ajv-validator/ajv](https://github.com/ajv-validator/ajv) | JSON Schema 校验（TS） | scanner/validate |
| 3 | [python-jsonschema/jsonschema](https://github.com/python-jsonschema/jsonschema) | 现有 `tools/validate.py` | 继续给 Python runner |
| 4 | [github/spec-kit](https://github.com/github/spec-kit) | 通用 spec 产物布局 | 不要替换 Yorun ID 规则 |
| 5 | [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 规格 delta | Review 层可借鉴 |

---

## 11. Desktop Electron（官方路径；`dsh --profile desktop`）

规划：同一 factory bundle 进 `$DSH_HOME/profiles/desktop`；无 loopback；client 走 framed IPC / `dsh-app://`。工厂 **不** 再写一套 Electron 应用，只要求双面插件声明 `platform` 覆盖 web+desktop。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `apps/desktop` | 官方 Electron：保留 `desktop` profile、bundled Node/pnpm、framed pipe、`dsh-app://`、不听 TCP | **合同正文**；工厂只 `plugin add` 进这个 profile |
| 2 | [IriskaDev/dsh-desktop](https://github.com/IriskaDev/dsh-desktop) | **现成 bundle 插件**：`dsh --profile desktop` 关掉 `node:http`，用 `dsh-desktop://` + fd-3 IPC 开 Electron 窗 | 最接近规划的社区插件；学「禁 loopback」怎么写 |
| 3 | [Cyenoch/deepseek-harness](https://github.com/Cyenoch/deepseek-harness) | Cordis Host 嵌进 Electron main，`dsh://app`，无子进程、无本地 HTTP | 对照官方「单进程 Host」；是 fork/壳，不是 `dsh plugin add` |
| 4 | [liguobao/dsh-desktop](https://github.com/liguobao/dsh-desktop) | 双面 `@dsh-desktop/integration`，启动时 `--patch` 注入，不改用户 `cordis.patch.yml` | 学 desktop adapter 怎么当插件挂；仍可能 spawn `dsh web` |
| 5 | [dataelement/dsh-desktop](https://github.com/dataelement/dsh-desktop) | Electron 监督 Harness 子进程 + 随机 loopback + hardened BrowserWindow | 产品壳范本；**违反**规划无 loopback，只借鉴生命周期，不当 Host |

其它 loopback 壳（同样不当工厂 Host）：[Julian-cloud-max/dsh-desktop](https://github.com/Julian-cloud-max/dsh-desktop)、[salathleizhang/deepseek-harness-desktop](https://github.com/salathleizhang/deepseek-harness-desktop)。

---

## 12. Desktop Tauri（社区壳；官方无 Tauri 包）

官方 Desktop 是 Electron。Tauri 只能当 **可选 Host 替换**（换壳、不换 factory 插件树）。选的时候看两件事：有没有 `dsh-plugin` / `dsh.client` 半；是否还在 `127.0.0.1` 上开 `dsh web`。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [s3yf1337/dsh-desktop](https://github.com/s3yf1337/dsh-desktop) | **profile + `dsh-desktop-shell` 插件**：base + web-app + 插件 spawn Tauri；托盘 / 通知 / 原生对话框；client 读 sessions | 最像「Desktop 也是插件」；WebView 仍吃 loopback URL |
| 2 | [zneoxlab/deepseek-harness-app](https://github.com/zneoxlab/deepseek-harness-app) | 独立 `dsh-app` profile + `dsh-app-bridge` 插件（`oh-dsh`）；不改用户 `web` profile；设置页注入 Desktop section | 学「专用 desktop profile、不污染 web」 |
| 3 | [hyperion2144/dsh-desktop-tauriapp](https://github.com/hyperion2144/dsh-desktop-tauriapp) | 启动时 `--patch` 注入双面插件，client 只加拖拽区/状态条，不禁 stock ui-layout | 学 chrome 注入；明确不写 profile bundles |
| 4 | [dsh-tauri-desk/deepseek-harness-desktop](https://github.com/dsh-tauri-desk/deepseek-harness-desktop) | 发行包内置 `DSH Tauri` / `DSH Tauri UI` / Worktree 插件；零 Node 安装 | 看「壳自带一组 desktop 插件」怎么拆；发行版会绑死 dsh 版本 |
| 5 | [zoomc/dshpilot](https://github.com/zoomc/dshpilot) | 自称 `dsh-plugin` + `dsh-client`，上游 submodule 隔离；托盘 / 内置 Node / Remote PWA | 学宿主边界；Remote PWA 超出本厂范围，不要当第二套 Runtime |

其它：[nekocode/dsh-desktop](https://github.com/nekocode/dsh-desktop)（裁剪官方 UI 插件进 Tauri，不是 plugin add）、[chokwinlee/deepseek-harness-desktop](https://github.com/chokwinlee/deepseek-harness-desktop)（macOS Tauri / Windows Electron 混装）。

**和工厂的关系：** board / gates 的 `./client` 必须能在 WebView 里跑（`dsh.client.platform` 含 `desktop` 或同时支持 web）。换 Tauri 壳时仍 `plugin --profile desktop add` 同一 bundle；禁止工厂再 `spawn('tauri')` 或自己听端口。

---

## 13. 多 LLM Model Provider（`ctx.llm` 适配器）

规划 L1 已经用官方 `llm-pi-ai`：一个插件实例里 `providers:` 字典就是多厂牌。下面是「再加一条路由」的社区包，**不要**再写第二套 `ctx.llm`。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/llm/llm-pi-ai` | 官方：openai / anthropic / gemini / deepseek / 任意 OpenAI-compatible gateway 都是 config | **默认多厂牌**；阶段 preset 只改 `provider`+`model` |
| 2 | [Luck9Star/dsh-gateway-provider](https://github.com/Luck9Star/dsh-gateway-provider) | newapi / LiteLLM / Higress：拉网关目录，按模型走 OpenAI/Anthropic/Gemini 原生协议 | 公司网关一条装上 |
| 3 | [GodD6366/dsh-sub2api](https://github.com/GodD6366/dsh-sub2api) | 一个 base URL 拆成 openai/claude/grok/gemini 四条 `llm-pi-ai` 路由 | 订阅盘网关；仍写回 pi-ai，不自写协议 |
| 4 | [DaoCaoRenH/dsh-openai-responses-bridge](https://github.com/DaoCaoRenH/dsh-openai-responses-bridge) | 第三方 Responses API + 原生 Gemini；独立 settings 段 | 补官方 catalog 没有的厂牌 |
| 5 | [V1ki/dsh-plugin-subscriptions](https://github.com/V1ki/dsh-plugin-subscriptions) | ChatGPT/Claude/Grok **订阅 OAuth**，无 API Key | 个人席位；凭证走 `~/.dsh/plugins/…`，审计后再装 |

其它单厂牌：[NOirBRight/dsh-llm-ollama](https://github.com/NOirBRight/dsh-llm-ollama)、[PerryLink/dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)、[NOirBRight/dsh-llm-grok](https://github.com/NOirBRight/dsh-llm-grok)。官方还有 `packages/llm/llm-deepseek`。

---

## 14. Agent Harness Router（按任务选模型 / 故障降级）

不是换 Agent Runtime。是在已有 `ctx.llm` 上做 **turn 级选路**。工厂阶段（S3 便宜、S5/S8 强模型）优先用 **preset 钉死 model**；Router 只处理「同一会话里简单题走 flash」。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [tianji-qingtian/dsh-model-router](https://github.com/tianji-qingtian/dsh-model-router) | flash 直答简单题、失败降级、会话 token/成本面板、`/router` | 成本优化 overlay |
| 2 | [green-dalii/dsh-shift-router](https://github.com/green-dalii/dsh-shift-router) | Fast/Smart 两档 + LLM Judge + fallback 链；Pi `pi-shift-router` 的 DSH 版 | 编排复杂任务时 Smart 派 Fast 子代理 |
| 3 | [autorouter0-ai/dsh-llm-autorouter](https://github.com/autorouter0-ai/dsh-llm-autorouter) | 把外部 AutoRouter 网关注册成一条 `ctx.llm` provider | 路由发生在网关，Harness 只看见一个厂 |
| 4 | [Luck9Star/dsh-gateway-provider](https://github.com/Luck9Star/dsh-gateway-provider) | 网关侧协议选择（responses → anthropic → openai → gemini） | 和 §13 同一包；偏运输不偏「简单/复杂」 |
| 5 | [PerryLink/dsh-local-ai](https://github.com/PerryLink/dsh-local-ai) | 按 `purpose`/关键词把 compaction 等打到本地 Ollama，失败回云 | 标题/压缩用小模型 |

Pi 侧对照（不当 DSH 插件装）：[green-dalii/pi-shift-router](https://github.com/green-dalii/pi-shift-router)。**不要**把 Router 做成第二套 AgentFactory。

---

## 15. Git Worktree

规划里并行阶段 / 子代理修测试应对隔离工作树，cwd 仍走 `ctx.agents.create({ meta.cwd })`，不在工厂里直接 `git worktree add`。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [KHG420/git-worktree](https://github.com/KHG420/git-worktree) | 会话绑定独立 worktree+分支；侧栏树；`git_worktree_*` / `git_session_binding` | 一人多会话并行最接近 |
| 2 | [CSY656/dsh-worktree](https://github.com/CSY656/dsh-worktree) | `ctx.worktree` 服务：子代理各一棵树，干净自动删、脏的留下评审 | 对 S8 repair 子代理；可能要等上游 `cwd` 缝 |
| 3 | [FlashingChen/dsh-worktree](https://github.com/FlashingChen/dsh-worktree) | Codex 风格永久 worktree：`worktree_create/list/remove`、`/.dsh-worktrees/` | 阶段产物要跨重启留下时 |
| 4 | [alpacachen/dsh-worktree](https://github.com/alpacachen/dsh-worktree) | New Session「Create worktree」→ 注册 DSH Workspace | UI 最轻；路径 `project.worktrees/<task>/` |
| 5 | [dsh-tauri-desk/deepseek-harness-desktop](https://github.com/dsh-tauri-desk/deepseek-harness-desktop) 内置 DSH Tauri Worktree | 桌面壳自带的会话隔离 worktree | 只在用那个 Tauri 壳时；工厂不要绑死 |

其它：[JFWaskin/dsh-git-nexus](https://github.com/JFWaskin/dsh-git-nexus)（SCM/PR 面板，不是 worktree）。

---

## 16. Markdown Editor / Preview

US / backend-on-skel / 用例说明都是 Markdown。编辑器是 **审稿面**，不要替代 `skill-filesystem` 写文件。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [linhx1999/dsh-writing-pad](https://github.com/linhx1999/dsh-writing-pad) | 会话右侧写作板：编辑/预览、`write_full_draft` / `rewrite_selected_text`、Diff 接受 | 人改 US 草稿；**默认不写工作区** |
| 2 | [yangshen830-eng/dsh-editor](https://github.com/yangshen830-eng/dsh-editor) | Monaco + 文件树 + ripgrep + Markdown 三视图（源/预览/分屏）+ mermaid/KaTeX | 对着真实 `.md` 改；有 Git diff |
| 3 | [LeslieWylie/dsh-md-preview](https://github.com/LeslieWylie/dsh-md-preview) | `md_html_render` 工具 + Web「MD」抽屉；headless 也能用 | 报告 HTML 化；可导出独立页 |
| 4 | [GitHubJiKe/dsh-markdown-preview](https://github.com/GitHubJiKe/dsh-markdown-preview) | 接管产物文件点击：对话内渲染 MD/图/文本 | 跑测产出的 `*.md` 报告 |
| 5 | [nirvanaslash/dsh-artifact-preview](https://github.com/nirvanaslash/dsh-artifact-preview) | Codex 风格分屏：MD / code / CSV / JSON / HTML | 多类型产物；含 HTML iframe |

---

## 17. Canvas（HTML / 原型 / 报告预览）

工厂已有 BDD HTML、go-cover.html。Canvas 插件把这些 **渲在会话旁**，不要再开浏览器标签。覆盖页第一期仍可 iframe 已生成 HTML。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [GHJIVHIDD/dsh-plugin-canvas](https://github.com/GHJIVHIDD/dsh-plugin-canvas) | 「画布」页签 + `canvas_preview`（render/annotate/clear）；沙箱 iframe；隐私打码 | 模型把报告 HTML 推上画布并标注 |
| 2 | [jiuyuechuwuhao/dsh-canvas-preview](https://github.com/jiuyuechuwuhao/dsh-canvas-preview) | 对标 Gemini Canvas：扫工作区 HTML、实时预览、PNG/JPG/SVG 导出 | 人看 cover/report；导出截图 |
| 3 | [Jinsong-Zhou/dsh-html-canvas](https://github.com/Jinsong-Zhou/dsh-html-canvas) | 聊天旁 click-to-edit 渲染页，不改源码即可改文案 | 前端原型评审，不是代码覆盖 |
| 4 | [lehhair/dsh-html-artifact](https://github.com/lehhair/dsh-html-artifact) | `artifact` 工具 create/patch/read；增量 patch，预览原地更新 | 模型迭代 HTML 报告时省 token |
| 5 | [nirvanaslash/dsh-artifact-preview](https://github.com/nirvanaslash/dsh-artifact-preview) | 产物行 + HTML/localhost iframe | 轻量 Canvas；和 §16 共用 |

本仓 Cursor Canvas（`.canvas.tsx`）**不是** DSH 插件，不能 `plugin add`。

---

## 18. `plugin add` 热加载（Install 后要不要重启）

**可以，但分层。** 官方默认：**改 `cordis.patch.yml` / 本地源码能热替换；`dsh plugin add` 写进 `node_modules` 的包被 HMR 故意忽略**，通常要重启一次 `dsh web`。`web` profile 开了 live patch reload；`headless` / `sdk` / `acp` 启动后冻死，不能热装。

| 层 | 官方行为 | 热加载？ |
|---|---|---|
| 本地 `--patch` / 教程插件源码 | `@deepseek-ai/cordis-plugin-hmr` 卸旧 `apply`、装新 `apply` | 是（开发） |
| profile `cordis.patch.yml` 改 config / `disabled` | Loader 按 `id` diff，unload/load | 是（`web`） |
| `dsh plugin add` 新 bundle（`dsh.profile.bundles`） | **bundle 层启动时冻住**；只改 `package.json` 不够 | **默认否** |
| 已装插件升级（lockfile 变、代码变） | HMR 排除 `node_modules` | **默认否** |
| `cordis_define` + `cordis_run` | 进程内存动态包 | 是，但 **不持久、不是 install** |
| 浏览器 `./client` | URL 带 `?rev=` | 热装 Host 后仍要 **刷新页面** |
| Desktop / AgentFactory / 提供 `ctx.*` 的服务行 | 官方标 `[service]` / `[official]` | **不要热换** |

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `cordis-plugin-hmr` + 教程 [Composition and HMR](https://deepseek-harness.github.io/deepseek-harness/en/develop/cordis-tutorial/06-composition-and-hmr) | 官方热替换管道：效果全走 `ctx` 才能干净卸载 | 工厂 **开发** 用本地 path + HMR；不要指望它吃 npm 安装包 |
| 2 | 官方 `dsh-tool-cordis`（`cordis_define` / `cordis_run`） | 会话内即时挂上，Creator mode | 试 hello；**重启即没**；不能当 factory bundle |
| 3 | [kun2-5code/dsh-plugin-installer](https://github.com/kun2-5code/dsh-plugin-installer) | GUI 安装；pnpm add 后 **改正在跑的 root-include patch 列表**，Loader 事务挂上；失败回退「需重启」 | **最接近「install 热生效」**；手改 `cordis.patch.yml` 会丢掉热挂行直到重启 |
| 4 | [deepforce/dsh-plugin-reloader](https://github.com/deepforce/dsh-plugin-reloader) | 复用官方 HMR，拿掉对 `node_modules` 的排除；`/reload`；依赖树变则 exit `42` 交给 supervisor | **已装插件升级**；自己不能热换自己；首次装 reloader 仍要重启一次 |
| 5 | [stuarthu/dsh-hot-reload](https://github.com/stuarthu/dsh-hot-reload) | 盯 `pnpm-lock.yaml`，版本变则原地 swap，失败回滚旧版；`dsh.hotReload: false` 可退出 | 同上，偏升级不偏「全新一行」 |

工厂建议：开发期 factory 插件用 **file: 本地包 + 官方 HMR**（改 `apply` 即热）。给别人 `plugin add` 时：**第一次装 bundle 接受重启**（或叠 installer）；之后迭代叠 reloader。`dsh-factory-gates` 里若有 `setFactory` / 独占服务，在 `package.json` 写 `"dsh": { "hotReload": false }`。Client 半热装后提示刷新，不要假装 SPA 已换。

---

## 19. Better Sidebar / Dock / Widget（聊天旁边的工作台）

工厂看板 **不要** 自己实现右侧栏框架。叠现成壳，只 `registerTab` 或注册一颗 widget。

### Better Sidebar（右侧 + 底栏 dock + 可拖出 float）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [omdsh-dev/dsh-better-sidebar](https://github.com/omdsh-dev/dsh-better-sidebar) | **工作台本身**：`ctx.betterSidebar.registerTab` / `registerFileViewer`；右栏+底栏；tab 可拆分、拖到会话区变悬浮窗 | **B 路线框架**；工厂是其中一个 tab。GitHub topic `dsh-better-sidebar` |
| 2 | [Lenonss/DSH_VsCodeMode](https://github.com/Lenonss/DSH_VsCodeMode) | 有 better-sidebar 时编辑器进右侧 Tab；没有则回退中央页签 | 学「peer 可选、双挂载」 |
| 3 | [Hoemr/dsh-quicklook](https://github.com/Hoemr/dsh-quicklook) | 无 sidebar 则什么都不做；有则 Space 大预览 | 学热插拔 peer |
| 4 | [yangshen830-eng/dsh-editor](https://github.com/yangshen830-eng/dsh-editor) | 中央「文件」页签（不依赖 sidebar） | 无 B 时的编辑降级 |
| 5 | [better-er/dsh-classic-coding](https://github.com/better-er/dsh-classic-coding) | `sidebar.footer.action` + `shell.overlay`，无构建 | 最简侧滑编辑，不装整套工作台 |

接入：[external-plugin-guide](https://github.com/omdsh-dev/dsh-better-sidebar/blob/HEAD/docs/external-plugin-guide.md)。与 `dsh-web-ui` aionui-panel **互斥**。Desktop：`dsh plugin --profile desktop add dsh-better-sidebar` 再 add factory。

### Dock / Widget App（悬浮条，不是系统 Dock）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [Physicolor/dsh-widgets](https://github.com/Physicolor/dsh-widgets) | 右侧 widget 轨道、声明式 `WIDGETS` 注册表、`shell.overlay`；与 better-sidebar 共享 `--dsh-sidebar-width` | **C 路线框架**；工厂加一颗「阶段」卡片 |
| 2 | [liuliuhuhushui/dsh-quota-float](https://github.com/liuliuhuhushui/dsh-quota-float) | 可拖动浮卡、跟当前会话模型走、零构建 | 费用/额度灯；学 overlay |
| 3 | 官方 `shell.overlay` + `conversation.composer.dock` + `conversation.session.header.utilities` | 无第三方壳也能挂胶囊/底栏 | P0 最小 C |
| 4 | better-sidebar **自由窗口**（把 tab 拖进会话区） | 官方工作台自带 float/dock | 满页看板用 B 的 float，不必再写 Widget App |
| 5 | [CCCq-C/dsh-api-cost](https://github.com/CCCq-C/dsh-api-cost) | composer.dock 上的 session cost chip | 会话 token 条，可与 widgets 并存 |

不要做独立 macOS/Windows Widget 扩展或系统 Dock 应用——那是第二套 Host。

---

## 20. Skill 管理 / Skill 评测

官方：**有缝、没有完整管理台、没有评测包。**  
`packages/skill/{skill,skill-filesystem,tool-skill,skill-badge}` 提供 `ctx.skills` 注册表、本地 `SKILL.md` 发现（可热捡）、模型侧 `skill` 工具。Preset 的 `customSkillDirs` 就是工厂挂现有 SKILL 的方式。启用/市场/评测要叠社区插件。

### Skill 管理（5）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [cheshireez/dsh-skill-hub](https://github.com/cheshireez/dsh-skill-hub) | Settings→技能：浏览 `ctx.skills`、启停（改名 SKILL.md 不删）、正文/诊断、市场导入、脚手架 | **最完整管理台** |
| 2 | [my-dsh-plugin/dsh-skill-manager](https://github.com/my-dsh-plugin/dsh-skill-manager) | 从 GitHub 安装/更新/卸载到 `skills/`；分组展示；可选读 `.claude/skills` | 装技能；写盘后官方 filesystem 热捡，**不必重启** |
| 3 | [QQ-M/dsh-skill-market](https://github.com/QQ-M/dsh-skill-market) | 设置页搜 GitHub `dsh-skill`、一键装进 `~/.dsh/skills` | 只要市场、不要启停 |
| 4 | [JimmyJin2006/dsh-skill-manager](https://github.com/JimmyJin2006/dsh-skill-manager) | 只读目录 + 调用徽章（Model+user / User-only / Model-only） | 看工厂 preset 到底挂了哪些 |
| 5 | 官方 `dsh-skill-filesystem` | `customSkillDirs` / 用户 / 项目 / bundled 根；watch | **工厂 P2 直接用**；管理 GUI 可选叠 hub |

### Skill 评测（5）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [boomzikazita/dsh-skill-authoring](https://github.com/boomzikazita/dsh-skill-authoring) | `skill_scaffold` / `skill_audit`：9 项结构门禁；写 `SKILL.md` 时 `pre-execute` 警告 | **静态质量**（frontmatter/边界/示例），不是跑通流水线 |
| 2 | [BiBoyang/dsh-eval-harness](https://github.com/BiBoyang/dsh-eval-harness) | 自称插件/**skill** 回归：yaml 用例 → headless agent → session trace 断言 → `eval_gate` vs baseline | **行为评测**；评 `prd-to-user-story` 是否真写出 US |
| 3 | [hccccc01333/dsh-eval](https://github.com/hccccc01333/dsh-eval) | `dsh eval run`：headless 编排、token/延迟/成本、LLM judge、A/B、keyless replay | 平台级 eval；可挂独立 `eval` profile |
| 4 | [aryswisnu/dsh-eval-regression](https://github.com/aryswisnu/dsh-eval-regression) | `evaluate_golden_output`：必含/禁含片段，不调模型 | 黄金片段门；CI 确定性 |
| 5 | [dongsheng123132/dsh-benchmark](https://github.com/dongsheng123132/dsh-benchmark) | 命令/JSONL 确定性证据，不是 LLM 质量 | 评 runners 本身，不是评 SKILL 文案 |

通用 SKILL.md 工具（非 DSH 插件）：[LiqunChen0606/skillforge](https://github.com/LiqunChen0606/skillforge)。工厂第一期：**filesystem + 本仓 skills**；hub 给人管；eval-harness 放到 skill 改完要回归时。

---

## 21. Memory（跨会话记忆）

官方 **没有** `ctx.memory`。Session log 只是本会话轨迹；长期记忆全是社区插件自带仓库。rc.6 立场接近「memory = 外挂」。[dsh-memento](https://github.com/PerryLink/dsh-memento) 在推社区协议 `dsh-memory-protocol/v1` 当未来官方缝。

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [PerryLink/dsh-memento](https://github.com/PerryLink/dsh-memento) | 自造 `ctx.memory`：SQLite、写入审批闸、审计、`memory` 工具、冻结快照进 system prompt、Web 面板 | **最接近「官方缝」**；零网络。工厂若要记域约定，优先叠这个 |
| 2 | [omdsh-dev/dsh-mnemon](https://github.com/omdsh-dev/dsh-mnemon) | 三层：Runtime / Project Documents / Memory Spaces；可插 Mnemon、Mem0、OpenViking 等 9 家；Sidebar UI | 工作台记忆；headless 要 **再 add 一次** |
| 3 | [menotbobbybrown/dsh-plugin-memory](https://github.com/menotbobbybrown/dsh-plugin-memory) | 知识图谱 + 情节回忆 + `memory_remember` / `memory_recall` | 轻量长期事实 |
| 4 | [seriousz158/dsh-memory](https://github.com/seriousz158/dsh-memory) | Git 仓库当记忆；设置页开关/清空；idle 同步 | 记忆可 diff/commit |
| 5 | Mem0 原生插件草案 [mem0ai/mem0#7027](https://github.com/mem0ai/mem0/pull/7027)；memento 已有 `mem0` adapter | 云端语义记忆 | 不要和 memento/mnemon **各写一套** 同时注入 prompt |

工厂第一期：**不必装**。流水线事实源仍是工作区文件 + session log（ADR-004）。要跨会话记住「Material 冻结规则」再叠 **一个** memory 插件；禁止再自研 `ctx.factoryMemory`。

---

## 22. Agent Loop / Human-in-the-loop

**Loop 和 HITL 不是一类插件。**  
Loop = 谁驱动 `ctx.agents.create` 之后的回合。HITL = 回合里 **await 人**，循环本身不变：工具 promise 回来再当普通 tool result。

### Loop（换循环，不是 HITL）

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) `packages/core/agent` + `agent-loop` | 官方 AgentFactory；`setFactory` 互斥 | **默认 loop**；工厂只 `ctx.agents.create` |
| 2 | 官方 `packages/core/goal` + round-driver | 同会话目标续跑 | 阶段目标，不是换 loop |
| 3 | 官方 `packages/plan/plan-mode` | `/plan`，`exit_plan_mode` 走 `ask_user_question` + `intent: plan-review` | 写代码前的人审 |
| 4 | L3：自写 `dsh-agent-loop-pi`（尚无现成包） | 见 [04](04-runtime-split.md) | 循环不好再换 |
| 5 | 官方 `subagent-spawn-in-process` | 子代理仍 `ctx.agents.create()` | 换 factory 后跟着走 |

不要为 HITL 再 fork 一套 loop。

### Human-in-the-loop（官方缝 + 社区壳）

官方已经有两条缝，**web profile 默认就有**：

| 缝 | 包 | 干什么 |
|---|---|---|
| 问人选择题 | `dsh-user-questions` + `dsh-tool-ask-user` → `ask_user_question` | 暂停工具直到 UI 答完 |
| 允不允许这一下 | `dsh-user-approval` → `ctx.approval.request` | `allowed-once` / fail-closed；`tools/pre-execute` 的 `ask` 走这里 |
| 工厂门禁 | 本厂 `ctx.commands` freeze/ack/sign | **人点按钮，不走模型回合**（ADR-005/006） |

社区插件（叠在官方缝上，不要替换）：

| # | 仓库 | 匹配点 | 用法 |
|---|---|---|---|
| 1 | [TtTRz/dsh-gatedflow](https://github.com/TtTRz/dsh-gatedflow) | 门是控制流：interrupt 步骤等人点 Approve；模型 **没有** 批准通道 | 复杂「必须审」工作流；和 factory gates 职责重叠，慎叠两套 |
| 2 | [ywgATustcbbs/dsh-human-task](https://github.com/ywgATustcbbs/dsh-human-task) | `ctx.humanTasks` + `human_task` 工具 + overlay 对话框 | 让人去点 UI/看屏幕；根仓可能不是可 `plugin add` 的单包，装前看 README |
| 3 | [guo-ziao/dsh-interrupt-button](https://github.com/guo-ziao/dsh-interrupt-button) | 强暂停：`agent.cancel` + steer 让模型总结再问新需求 | 长跑打断，不是门禁 |
| 4 | [titanwings/dsh-plannotator](https://github.com/titanwings/dsh-plannotator) | Plan Review 批注回灌 | 官方 plan-mode 的 UI 增强 |
| 5 | [Optim-Agent/dsh-plans](https://github.com/Optim-Agent/dsh-plans) | 人审 Markdown 计划后才 goal 执行 | 接近 freeze→run-stage |

子代理 **不能** `ask_user_question`（`DELEGATED_CALLER`）：HITL 必须在 runtime root。Headless 没有 UI provider 时 approval fail-closed。

工厂：G1–G4 继续用 **commands**；模型缺信息用官方 `ask_user_question`；危险工具靠 `pre-execute` → `approval`。不要再写 `dsh-factory-hitl-loop`。

---

## 怎么用这张表（避免装一堆无关插件）

| 规划包 | 建议立刻试装 / fork | 只读官方 | 不要当 Host |
|---|---|---|---|
| bundle/hello | zoahdev/dsh-plugin-template | bundle/* | handbook 当清单；doctor 当 CI |
| skel-guard | lonelymoon87/dsh-guardian | sandbox/guard | Pi protected-paths |
| runners | suimi8/dsh-test-runner + 加 Go | jobs、tool-bash | ginkgo 本身 |
| gates | 官方 goal + plannotator | plan-mode | task-checklist 当唯一门禁 |
| board | Ericwong5021/dsh-kanban 或 alpacachen/dsh-kanban | session-projection | FuncWei sidecar 派工 |
| skills | 本仓 skills + 官方 filesystem | standard preset | spec-kit 当 Vine 预言 |
| L1 | **llm-pi-ai in-tree** | llm-deepseek | — |
| L2 | 照 subagent-codex 写 pi | subagent-acp | 工厂 spawn pi |
| L3 | 尚无现成包，以 agent + pi-agent-core 写适配器 | setFactory 合同 | 双 loop |
| Desktop Electron | IriskaDev/dsh-desktop 对照官方 `apps/desktop` | `dsh-app://` / framed IPC | dataelement 等 loopback 壳 |
| Desktop Tauri | s3yf1337 或 zneoxlab 的 bridge 插件 | 无官方 Tauri | 把 Tauri 当第二套 Agent Runtime |
| 多 LLM | **llm-pi-ai 配 providers 字典** | llm-deepseek | 每个厂牌自写一套 loop |
| Router | dsh-model-router 或 shift-router | preset 钉 model | Router 当 AgentFactory |
| Worktree | KHG420 或 CSY656 | agents.create cwd | 工厂 shell 出 git worktree |
| Markdown | writing-pad 审稿 / editor 改文件 | — | 草稿静默覆盖 US |
| Canvas | dsh-plugin-canvas 或 canvas-preview | 官方 slots | 覆盖 Cursor Canvas 当 Host |
| 热加载 | 开发用官方 HMR；分发用 installer + reloader | patch.yml live reload | 热换 AgentFactory / Desktop Host |
| Better Sidebar | 工厂 `registerTab`；框架用 omdsh-dev/dsh-better-sidebar | 官方 conversation.view 降级 | 自绘第二套 IDE 壳 |
| Widget / Dock | dsh-widgets 或 overlay 浮卡 | composer.dock | 系统 Dock / 独立 Widget App |
| Skill 管理 | skill-hub（可选） | 官方 skill-filesystem | 自写第二套 skills 注册表 |
| Skill 评测 | skill-authoring 静态门；eval-harness 行为回归 | — | 用评测包替代 go test |
| Memory | 可选叠 memento **或** mnemon 其中一个 | Session log | 自研第二套 memory 缝 |
| Loop | 官方 agent-loop | ctx.agents | 为 HITL 再写一套循环 |
| HITL | 官方 ask_user + approval；门禁用 commands | plan-mode | gatedflow 再加一套工厂门禁 |

社区索引：[dsh.pub/en/plugins](https://dsh.pub/en/plugins/)（声明：索引 ≠ 可装、≠ 安全）。GitHub topic：`dsh-plugin`。
