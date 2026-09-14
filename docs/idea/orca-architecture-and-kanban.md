# Orca 架构 / 模块 / 功能分析与 Kanban 嵌入方案

日期：2026-09-14  
对象：`references/ai-agent/orca`（上游 [stablyai/orca](https://github.com/stablyai/orca)，本机登记 path 见 `innate-works/registry.yaml` → `../workspace/references/ai-agent/orca`）  
版本线索：`package.json` → `1.4.197`，自述为 *Next-gen IDE for parallel agentic development*

## 1. 一句话定位

Orca 不是模型，也不是单独的项目管理 SaaS。它是 **Electron 桌面 IDE**：把多个 AI coding agent（Claude Code / Codex / Cursor CLI / OpenCode / …）各自放进独立 git worktree（或 folder workspace），用终端、浏览器、diff 审查、任务抽屉（GitHub / Linear / Jira）和手机伴侣统一编排。

官方文档入口：[What is Orca?](https://www.onorca.dev/docs) · 本地镜像：`docs/site/content/docs/`。

## 2. 架构分析

### 2.1 进程与部署形态

| 形态 | 路径 / 构建 | 角色 |
| --- | --- | --- |
| Desktop（主产品） | `electron-vite`：`src/main` + `src/preload` + `src/renderer` | 本地 IDE；IPC / RPC 调主进程能力 |
| CLI | `src/cli` → `orca` bin | 脚本化 worktree / browser / linear / skills |
| Relay / daemon | `src/relay`、`build:orcad` | 远程执行、agent hook、移动端/多客户端接线 |
| Web 投影 | `vite.web.config.ts`、`build:web-from-renderer` | 从 renderer 投影出的 Web 客户端 |
| Mobile | `mobile/`（独立 pnpm workspace） | iOS / Android 伴侣：监控与催促 agent |
| Cloud | `cloud/`（独立 monorepo 子树） | 云侧 apps / packages / infra |
| Native | `native/*` | computer-use、键盘布局、通知、Windows registry 等平台绑定 |

根 `pnpm-workspace.yaml` **故意不把 `mobile/` 并进根图**，避免 patch / 锁文件互相污染；桌面是单项目安装 + 少量 native workspace。

### 2.2 桌面三层（经典 Electron）

```text
┌─────────────────────────────────────────────────────────┐
│ Renderer (React + Zustand + shadcn)                     │
│  UI：sidebar / terminal / browser / task drawer / kanban│
└──────────────────────────┬──────────────────────────────┘
                           │ preload + typed RPC
┌──────────────────────────▼──────────────────────────────┐
│ Main (Node in Electron)                                 │
│  worktrees · agents · git · github/linear/jira · ssh    │
│  browser · computer-use · persistence · telemetry       │
└──────────────────────────┬──────────────────────────────┘
                           │ hooks / exec / streams
┌──────────────────────────▼──────────────────────────────┐
│ Shared contracts + Relay/hook server                    │
│  agent-status 单一真相源 · wire 兼容 · SSH 执行边界      │
└─────────────────────────────────────────────────────────┘
```

权威约束写在根 `AGENTS.md` / `docs/reference/*`：

- **Agent status**：执行主机上一个 store（hook server），sidebar / `worktree ps` / mobile / dashboard 只订阅，不各自造状态机（`docs/reference/agent-status-store.md`）。
- **SSH**：执行主机拥有执行相关一切；失联 ≠ 进程死亡；判定词只有 `live` / `unverifiable` / `exited`。
- **Remote wire**：客户端与远端版本可错配；新 opcode 要能力协商。
- **Folder workspace**：不能假设每个 workspace 都是 git worktree。

### 2.3 核心领域对象

| 对象 | 含义 |
| --- | --- |
| Repo / Project | 本地或远程仓库入口 |
| Worktree / Folder workspace | 一次任务的隔离工作区 |
| Agent session / pane | 跑在终端里的 CLI agent |
| Task source item | GitHub issue/PR、Linear issue、Jira issue |
| Hosted review | PR / MR 审查与 Actions 状态 |
| Workspace Kanban lane | **以 worktree 卡片为单元**的本机看板列（状态/分组） |
| Linear board | **以 Linear issue 为单元**的任务看板（可拖拽改 status） |

两套「看板」不要混：一个管 **本机工作区编排**，一个管 **外部项目管理系统里的 issue**。

### 2.4 数据与集成流向（任务 → agent）

```text
Linear / GitHub / Jira
        │  API token / gh
        ▼
Task drawer（list | board）── create worktree / link issue
        │
        ▼
Worktree + Agent terminal（hooks 上报 status）
        │
        ▼
Diff / hosted review / commit-push
        │
        ▼
Mobile companion / notifications（可选）
```

## 3. 模块分析

### 3.1 顶层目录

| 目录 | 职责 |
| --- | --- |
| `src/main/` | Electron 主进程：几乎所有副作用（git、agent 启动、provider 客户端、持久化） |
| `src/renderer/` | React UI、Zustand store、task/kanban 组件 |
| `src/shared/` | 跨进程类型与纯逻辑（agent detection、status、worktree 契约） |
| `src/preload/` | 安全桥 |
| `src/relay/` | hook server、agent-exec、ai-vault、远程相关 handler |
| `src/cli/` | `orca` 子命令实现 |
| `src/types/` | 共享类型入口 |
| `config/` | electron-builder、tsconfig、vitest、patches、脚本门禁 |
| `resources/` | 图标、skills 包、onboarding 素材 |
| `skills/` / `skill-guides/` / `skill-stubs/` | 捆绑 / 文档化的 agent skills |
| `docs/` | STYLEGUIDE、reference、官网 MDX |
| `tests/` | Playwright e2e、工具测试 |
| `native/` | 平台 native 模块 |
| `mobile/` / `cloud/` | 伴侣 App 与云设施（独立包图） |

### 3.2 `src/main` 按域切片（代表性）

| 模块簇 | 例子 | 作用 |
| --- | --- | --- |
| Worktree / FS | `repo-worktrees.ts`、`local-worktree-*`、`persistence-worktree-*` | 创建/扫描/删除/元数据/可见性 |
| Agents | `claude*`、`codex*`、`cursor`、`amp`、`devin`、`agent-hooks`、`agent-awake-service` | 各 vendor 启动与会话 |
| Providers | `github/`、`linear/`、`gitlab/`、`azure-devops`、`bitbucket` | Issue / PR / Project API |
| Runtime RPC | `runtime/rpc/dispatcher*.ts` | 主进程对外方法目录（有 catalog 校验） |
| Terminal / SSH | `ssh/`、terminal persistence | 远程 worktree、PTY 租约 |
| Browser / Computer | `browser/`、`computer/` | 内嵌 Chromium、Design Mode、桌面操控 |
| Automations / Artifacts | `automations/`、`artifacts/` | 工作流与产物 |
| Skills / AI vault | skills 相关、`ai-vault*` | skill 安装与检索 |

`src/main/linear/` 已是完整客户端层：issue list/filter、context（含 inline media）、relations、custom view GraphQL、credential paths 等。`src/main/github/` 另有 `project-view/`（GitHub Projects 字段与缓存），说明 **「项目管理视图」已在 GitHub 侧有一截**，Linear 侧则走 issue board + project create。

### 3.3 `src/renderer` 按域切片

| 模块簇 | 路径线索 | 作用 |
| --- | --- | --- |
| App shell | `app-shell/`、`App.tsx`、`Sidebar.tsx` | 布局与导航 |
| Terminal | `Terminal*.tsx` | 多 pane / WebGL xterm |
| Task page / Linear board | `use-task-page-linear-board.ts`、`LinearItemDrawer.tsx` | 任务抽屉 list/board、拖拽改状态 |
| Workspace Kanban | `sidebar/WorkspaceKanban*.tsx` | 本机 worktree 看板抽屉 |
| Settings / Integrations | `TaskSourceLinearSetup.tsx`、`LinearAgentSkill*` | Token、team、skill 安装 |
| Store | `store/projects`、`repos`、`github`、`folder-workspaces` | UI 状态与缓存 |
| Runtime clients | `runtime/runtime-linear-*.ts` | 渲染进程调 Linear 能力 |

### 3.4 与「项目管理 Kanban」直接相关的现成模块

| 能力 | 实现位置 | 看板单位 |
| --- | --- | --- |
| Linear issue board | `use-task-page-linear-board.ts` + Linear mutations | Issue；按 status（或 group-by）分列；拖拽 → `linearUpdateIssue` |
| Workspace Kanban | `WorkspaceKanbanDrawerView` + LaneGrid/Card | Worktree 卡片；本机状态泳道 |
| GitHub / Jira task sources | `docs/.../review/github.mdx`、`jira.mdx` | Issue/PR；与 Linear 同属 task drawer |
| GitHub project-view（主进程） | `src/main/github/project-view/` | Projects 字段/视图配置（偏 API，非完整通用 PM 产品） |
| CLI / skill | `orca linear`、`orca-linear` skill | Agent 读写 Linear |

官方说明：`docs/site/content/docs/review/linear.mdx`（list vs board、Has Workspace、从 issue 开 worktree、布局持久化、与 GitHub 共用 Issue 链接字段）。

## 4. 功能分析

按用户价值归类（细节以官网 docs 为准）：

| 能力域 | 功能要点 |
| --- | --- |
| 并行编排 | 一 prompt 多 agent；每 agent 独立 worktree；对比后合并 |
| 终端 | 多 split、WebGL、滚动恢复；agent TUI 共存 |
| 浏览器 | 内嵌 Chromium；Design Mode 点选 DOM → 进 prompt |
| 源码编辑 | Monaco、文件树、拖文件/图进 prompt；Markdown/PDF 预览 |
| Review | AI diff 批注；GitHub/GitLab hosted review；commit/push |
| 任务源 | GitHub Issues/PRs、Linear、Jira；开 worktree 预填；可选状态同步 |
| 远程 | SSH worktrees、self-hosted Orca server、Cloud VM |
| 移动 | Companion：通知完成、远程追问 |
| CLI / Skills | `orca worktree`、browser automation、computer-use、bundled skills |
| 账户 / 用量 | Claude/Codex 用量与热切换 |
| 扩展面 | Plugin marketplace、automations、ai-vault |

**对「潜入项目管理 Kanban」最有杠杆的现有功能：** Linear/GitHub task drawer 的 **board 模式**、issue↔worktree 链接、从 issue 启动 agent（带描述/评论/媒体）、Workspace Kanban 的 **本机泳道 UX**、以及 `orca linear` 给 agent 的读写面。

## 5. 若要「潜入」一个 Project Management Kanban，怎么做

先分清目标，再选路径。三种目标工作量差一个数量级。

### 5.1 目标分层

| 目标 | 含义 | 推荐路径 |
| --- | --- | --- |
| A. **用起来** | 个人/团队用 Orca 管任务，不必 fork | 配置 Linear（或 GitHub Projects + Issues）+ 用内置 board |
| B. **嵌入现有 PM** | 把公司已有看板（Linear/Jira/GitHub Projects/自建）更深嵌进 Orca | 扩展现有 task-source provider，复用 drawer / board UI |
| C. **自建 Kanban 产品** | Orca 内一等公民「项目板」，不依赖 Linear | 新 domain model + 持久化；可复用 WorkspaceKanban / Linear board 的交互壳 |

多数「潜入」需求落在 **A 或 B**。C 等于新产品线，要和 upstream 的「BYO agents + BYO task systems」定位对齐。

### 5.2 路径 A：零代码接入（优先）

1. **Settings → Integrations → Linear**：粘贴 [Linear API token](https://linear.app/settings/api)，选 team。  
2. 打开 **task drawer**，切到 Linear；布局选 **board**；按 status 分列（`use-task-page-linear-board` 在 `groupBy === none|status` 时启用拖拽改状态）。  
3. 需要时开 **Has Workspace**，只看已挂 worktree 的 issue。  
4. 从卡片 **创建 worktree** → 进 composer（SSH / folder / issue-command 同路径）→ 开 agent。  
5. 可选：按 team 打开「创建 worktree 时把 Linear 状态推到 In Progress」。  
6. Agent 侧安装 / 启用 `orca-linear` skill，用 `orca linear` 列改 issue。

对照文档：本地 `docs/site/content/docs/review/linear.mdx`。  
本机 Workspace Kanban（sidebar）同时可用来管 **进行中的 worktree 卡片**，与 Linear 板互补：外板管 backlog，内板管「正在跑的隔离工作区」。

### 5.3 路径 B：嵌入另一个 PM（或加深 Linear/GitHub）

建议 **新增或扩展 Task Source Provider**，不要平行再造一套抽屉。

**接入合同（对齐现有模式）：**

1. **Main**：`src/main/<provider>/`  
   - auth / credentials  
   - list issues（filter、分页、`Load more`）  
   - get issue context（描述、评论、附件/媒体，供 prompt）  
   - mutate status / assignee / labels（board 拖拽依赖）  
   - 可选：project/board metadata（列定义、WIP）  
2. **Shared types**：issue / project / workflow state 的规范化模型（参考 `src/shared/linear/issue-types`）。  
3. **Renderer runtime client**：类似 `runtime-linear-client.ts` / `runtime-linear-issue-mutations.ts`。  
4. **Task page**：挂进现有 task drawer 的 source 切换（文档已写「按 repo 记住上次用的 GitHub / Linear / Jira」）。  
5. **Board UI**：优先复用 Linear board 的 group/drag/drop 管线（`groupLinearIssues`、`writeLinearBoardIssueDragData`、updating set、toast）；列 key 映射到对方 workflow state。  
6. **Worktree link**：共用「Issue 字段 + provider chip / URL paste」；保存新链接替换旧 provider 链接（Linear 文档已定契约）。  
7. **CLI / skill**（可选）：`orca <provider>` + skill，方便 agent 在工作区里改板。  
8. **Wire / SSH**：列表与 mutation 若经 relay，遵守 `remote-wire-compatibility`；执行创建 worktree 仍走执行主机边界。

**若对方是 GitHub Projects：** 先盘点 `src/main/github/project-view/` 已有字段/缓存，看是补 **Projects v2 board UI**，还是把 Projects item 投影进现有 issue board。避免第三套看板组件。

**若对方是自建 REST/GraphQL 板：** 仍走 B 的 provider 合同；列模型用「workflow states + rank」即可，不必先上完整 Linear 语义。

### 5.4 路径 C：Orca 内生 Kanban（最重）

仅在「不想依赖外部 PM、又要 issue 级看板」时考虑。

建议数据模型（示意）：

```text
Board { id, name, repoId? }
Column { id, boardId, name, rank, wipLimit? }
Card { id, columnId, title, body, rank, worktreeId?, externalRef? }
```

实现策略：

1. **持久化**：跟现有 worktree/meta persistence 同主机边界；支持 folder workspace。  
2. **UI**：交互壳复用 `WorkspaceKanban*`（泳道、多选、拖拽预览）或 Linear board（issue 属性更丰富）；不要从零写第三套 dnd。  
3. **与 agent 闭环**：Card → create/link worktree → agent status 点亮卡片；完成时可自动移列。  
4. **同步出口（可选）**：Card.externalRef 指向 Linear/GitHub，双向同步做成显式 job，避免静默双写。  
5. **不要**把内生板做成第二个 agent-status store；卡片只展示订阅来的 status。

工作量：主进程 CRUD + renderer 板 + 链接 worktree + 测试/e2e；若要上 mobile，还要 relay 协议扩展。

### 5.5 推荐决策

| 你的场景 | 建议 |
| --- | --- |
| 个人 / 小团队，已用 Linear | **路径 A**，当天可用 |
| 公司板在 Jira / 自建，只要「在 Orca 里拖列 + 开 agent」 | **路径 B** provider |
| 只要看清「哪些 worktree 在跑」 | 用现成 **Workspace Kanban**，不必上 PM 产品 |
| 要做独立 PM 产品嵌进 Orca | **路径 C**，并考虑是否应做 Orca plugin / 旁路 App，而不是硬改 upstream 内核 |

**潜入时的架构红线（来自本仓 AGENTS.md 精神）：**

- 看板 UI 不拥有 agent 生死状态，只读 status store。  
- 创建/删除 worktree、跑 agent 的命令必须可在 SSH / folder workspace 下解释清楚。  
- Provider mutation 失败要可重试、可提示；拖拽中的 `updating` set 模式已有先例。  
- 新增 RPC/流帧走能力协商，避免拆掉旧 mobile/web 客户端。

## 6. 本地怎么继续读代码

```text
references/ai-agent/orca/
  README.md                          # 产品叙事
  AGENTS.md                          # 贡献与架构红线
  docs/site/content/docs/            # 用户文档 MDX
  docs/reference/                    # 实现契约
  src/main/{linear,github,gitlab}/   # 任务源
  src/renderer/.../WorkspaceKanban*  # 本机 worktree 看板
  src/renderer/.../use-task-page-linear-board.ts
  src/relay/                         # 远程与 hook
  mobile/  cloud/                    # 伴侣与云
```

跑通桌面（需按官方 install）：`pnpm install` → `pnpm dev`（见仓库 README / `docs/site/content/docs/install.mdx`）。

## 7. 结论

- **架构**：Electron 三层 + shared 契约 + relay；工作区与 agent 状态以执行主机为权威；桌面 / CLI / mobile / cloud 分仓协作。  
- **模块**：main 按 git·agent·provider·ssh·browser 切域；renderer 用 task drawer 与两套看板（workspace vs Linear）承载编排与 PM。  
- **功能**：并行 agent worktree IDE，外加审查、远程、移动与 CLI；PM 能力已通过 Linear/GitHub/Jira **嵌入**，不是空白。  
- **潜入 Kanban**：先用 Linear board + Workspace Kanban；要嵌其他系统就加 Task Source Provider 并复用 board 管线；只有要做「无外部依赖的一等公民项目板」才走内生 Board 模型。

相关官方页：`/docs/review/linear`、`/docs/review/github`、`/docs/review/jira`、`/docs/model/worktrees`、`/docs/cli/overview`。
