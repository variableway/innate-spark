# Top 10 AI Skill Marketplace GitHub 仓库调研

> 调研时间：2026-08-27。星数通过 GitHub REST API 当日实测（`api.github.com/repos/...`），安装方式取自各仓库 README 原文。

## 概述

自 Anthropic 于 2025 年 10 月提出 Agent Skills（一个含 YAML frontmatter 的 `SKILL.md` + 指令/脚本/资源的文件夹）并在 2025 年 12 月将其作为开放标准发布后，GitHub 上迅速形成了一个 "skill 集合 / 市场 / 索引" 生态。这类仓库大致分四种形态：

1. **官方/大厂 skill 集合**：anthropics/skills、vercel-labs/agent-skills，skill 本身是内容主体；
2. **awesome 类策展索引**：ComposioHQ/awesome-claude-skills、VoltAgent/awesome-agent-skills、travisvn/awesome-claude-skills，仓库本身主要是目录，指向散落各处的 skill；
3. **插件市场（plugin marketplace）**：wshobson/agents、alirezarezvani/claude-skills、obra/superpowers，按 Claude Code 的 `/plugin marketplace` 协议组织；
4. **安装工具/注册表（CLI + registry）**：vercel-labs/skills（`npx skills`，skills.sh 背后的仓库）、davila7/claude-code-templates（aitmpl.com 背后的 CLI）。

Skills 格式是跨工具的开放标准，Claude Code、Codex、Cursor、Gemini CLI、OpenCode、Windsurf、GitHub Copilot、Kimi Code 等均能消费 `SKILL.md`，因此绝大多数仓库的接入方式本质上是三选一：`/plugin marketplace add`（Claude Code 系）、`npx skills add <owner/repo>`（Vercel skills CLI 系，支持 70+ agent）、或手动把 skill 文件夹复制到对应 agent 的 skills 目录。

## 主要实现/榜单

按 GitHub 星数（2026-08-27 实测）降序：

| # | 仓库 | 星数（约） | 形态 | 定位 |
|---|------|-----------|------|------|
| 1 | [obra/superpowers](https://github.com/obra/superpowers) | 278k | 插件市场 + 方法论 | TDD/调试/协作等"开发方法论"skills 框架 |
| 2 | [anthropics/skills](https://github.com/anthropics/skills) | 172k | 官方集合 | Anthropic 官方 Agent Skills（docx/pdf/pptx/xlsx 等） |
| 3 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 73k | awesome 索引 + 自研 skills | Claude Skills 策展清单（含 Composio 集成 skills） |
| 4 | [wshobson/agents](https://github.com/wshobson/agents) | 39k | 多 harness 插件市场 | 93 插件 / 181 skills / 202 agents / 105 commands |
| 5 | [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 33k | awesome 索引 | 1497+ skills，收录各官方团队（Anthropic/Vercel/Stripe/Cloudflare 等）出品 |
| 6 | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 31k | 官方集合 | Vercel 官方 skills 集合（web-design-guidelines 等） |
| 7 | [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) | 30k | CLI + 网站市场 | aitmpl.com 背后的 CLI，含 agents/commands/skills/MCPs/hooks |
| 8 | [vercel-labs/skills](https://github.com/vercel-labs/skills) | 30k | CLI + 注册表 | `npx skills` 安装工具，skills.sh 背后的仓库 |
| 9 | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) | 25k | 插件市场 + 集合 | 388 skills / 118 agents / 150 commands，覆盖 13 种 coding agent |
| 10 | [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | 15k | awesome 索引 | 较早的 Claude Skills 策展清单（偏 Claude Code 工作流） |

### 1. obra/superpowers

- **地址**：https://github.com/obra/superpowers（配套市场仓库 [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace)）
- **星数**：~278,260（2026-08-27 GitHub API）
- **定位**：Jesse Vincent 出品的"agentic skills 框架 + 软件开发方法论"。核心库包含 20+ 实战 skills（TDD、调试、协作模式），并附带 `/brainstorm`、`/write-plan`、`/execute-plan` 等命令和 skills 搜索工具。是"skills 作为方法论载体"这一流派的代表作。
- **接入方式**：
  - Claude Code 官方市场：`/plugin install superpowers@claude-plugins-official`
  - 自建市场：`/plugin marketplace add obra/superpowers-marketplace`，然后 `/plugin install superpowers@superpowers-marketplace`
  - Codex / OpenCode 需手动 clone 安装（README 有说明）；Cursor 走其内置插件市场。

### 2. anthropics/skills

- **地址**：https://github.com/anthropics/skills
- **星数**：~171,914（2026-08-27 GitHub API；第三方观测站 GitMeter 2026-04 记录为 ~120k，Ry Walker Research 2026-06 记录为 ~149k，增长曲线一致）
- **定位**：Anthropic 官方 Agent Skills 仓库，Skills 开放标准的参考实现。包含文档处理 skills（docx/pdf/pptx/xlsx）、示例 skills（canvas-design、mcp-builder、webapp-testing、skill-creator 等）。也是事实上的格式规范来源。
- **接入方式**（README 原文）：
  - Claude Code：`/plugin marketplace add anthropics/skills`，然后 `/plugin install document-skills@anthropic-agent-skills` 或 `example-skills@anthropic-agent-skills`
  - Claude.ai：付费计划内置，可在设置中上传自定义 skill
  - Claude API：通过 Skills API 使用预置或自定义 skills
  - 其他 agent（Codex/Cursor/Kimi Code 等）：`npx skills add anthropics/skills` 或手动复制 `skills/` 下目录到对应 skills 目录。

### 3. ComposioHQ/awesome-claude-skills

- **地址**：https://github.com/ComposioHQ/awesome-claude-skills
- **星数**：~73,392（2026-08-27 GitHub API）
- **定位**：最早的 Claude Skills awesome 清单之一，按文档处理、开发、数据、安全、Composio 应用自动化等分类，仓库本身也直接托管了一批自研 skill 文件夹（如 zoom-automation）。README 对"Skills vs MCP vs Tools"的分层解释写得很好。
- **接入方式**：作为索引本身无需安装；安装其中的 skill：
  - Claude Code：`mkdir -p ~/.claude/skills && cp -r <skill-dir> ~/.claude/skills/`（README 写的是 `~/.config/claude-code/skills/`，两种路径依版本而定）
  - 通用：`npx skills add https://github.com/ComposioHQ/awesome-claude-skills` 或指向其中某个子目录。

### 4. wshobson/agents

- **地址**：https://github.com/wshobson/agents
- **星数**：~39,173（2026-08-27 GitHub API）
- **定位**：多 harness 插件市场，"单一 Markdown 源、多端消费"。93 个插件 / 181 skills / 202 agents / 105 commands，原生支持 Claude Code，并转换输出到 Codex CLI、Cursor、OpenCode、Antigravity CLI、GitHub Copilot。按语言/域组织（python-development 等）。
- **接入方式**（README 原文）：
  - Claude Code：`/plugin marketplace add wshobson/agents`，然后 `/plugin install python-development`（或其余 92 个插件之一）
  - Codex：`npx codex-marketplace add wshobson/agents`；Cursor：添加市场后 `/plugin install <name>`
  - OpenCode / Antigravity：clone 后 `make generate HARNESS=antigravity && make install-antigravity` / `make install-opencode`

### 5. VoltAgent/awesome-agent-skills

- **地址**：https://github.com/VoltAgent/awesome-agent-skills
- **星数**：~32,783（2026-08-27 GitHub API）
- **定位**：强调"人工精选、非 AI 批量生成"的 1497+ skills 索引，收录 Anthropic、Vercel、Stripe、Cloudflare、Netlify、Trail of Bits、Sentry、Figma、Hugging Face 等官方团队出品的 skills 及社区作品。明确兼容 Claude Code、Codex、Antigravity、Gemini CLI、Cursor、Copilot、OpenCode、Windsurf 等。
- **接入方式**：仓库本身是目录，条目附带官方浏览站（officialskills.sh）链接；安装单个 skill 通常用 `npx skills add <owner/repo>`（Vercel skills CLI），或按 README 中的 agent 路径表手动复制到各 agent 的 skills 目录。

### 6. vercel-labs/agent-skills

- **地址**：https://github.com/vercel-labs/agent-skills
- **星数**：~30,513（2026-08-27 GitHub API）
- **定位**：Vercel 官方 skills 集合，最出名的是 `web-design-guidelines`（前端设计规范 skill）。是 `npx skills add` 文档中的标准示例仓库。
- **接入方式**：
  - `npx skills add vercel-labs/agent-skills`（支持 70+ agent，含 Claude Code、Codex、Cursor、OpenCode 等）
  - 只装单个：`npx skills add https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines`
  - 免安装试用：`npx skills use vercel-labs/agent-skills@web-design-guidelines | claude`

### 7. davila7/claude-code-templates

- **地址**：https://github.com/davila7/claude-code-templates（网站 https://aitmpl.com）
- **星数**：~30,416（2026-08-27 GitHub API）
- **定位**：Claude Code 组件市场 CLI，覆盖 agents、commands、skills、settings、hooks、MCPs 六类组件，配交互式网站 aitmpl.com 浏览安装。Skills 是其中一类（PDF 处理、Excel 自动化、Web 数据抓取等）。
- **接入方式**（README 原文，主要面向 Claude Code）：
  ```bash
  npx claude-code-templates@latest                    # 交互式浏览安装
  npx claude-code-templates@latest --skill web-data/search --yes   # 装指定 skill
  npx claude-code-templates@latest --agent development-tools/code-reviewer --yes
  ```

### 8. vercel-labs/skills

- **地址**：https://github.com/vercel-labs/skills（对应网站 https://skills.sh，npm 包名 `skills`）
- **星数**：~29,746（2026-08-27 GitHub API）
- **定位**：注意——它不是 skill 集合，而是"开放 agent skills 生态的 CLI/注册表"，skills.sh 浏览站背后的仓库。支持 OpenCode、Claude Code、Codex、Cursor 等 77 个 agent。它让"任何 GitHub 仓库即市场"：只要仓库里有 `SKILL.md`，就能被安装。支持私有仓库（走本机 git/gh 凭证）。
- **接入方式**（作为工具安装任意 skill）：
  ```bash
  npx skills add <owner>/<repo>                       # 安装整个仓库的 skills
  npx skills add <owner>/<repo> --skill <name>        # 只装指定 skill
  npx skills add <owner>/<repo> -g -a claude-code     # 全局安装到指定 agent
  npx skills add <owner>/<repo> --list                # 先列出可用 skills
  ```

### 9. alirezarezvani/claude-skills

- **地址**：https://github.com/alirezarezvani/claude-skills
- **星数**：~25,050（2026-08-27 GitHub API）
- **定位**：自称"最全面的开源 Claude Code skills & 插件库"：388 skills / 118 agents / 150 commands / 706 个纯 stdlib Python 工具脚本，覆盖工程、营销（含 AEO）、合规、C-level 顾问（CFO/CMO/CISO 等 persona）、学术研究等。官方声称兼容 13 种 coding agent（Claude Code、Codex、Gemini CLI、Cursor、OpenClaw、Hermes Agent、Mistral Vibe、Aider、Windsurf、Kilo Code、OpenCode、Augment、Antigravity）。
- **接入方式**（README 原文）：
  - Claude Code：`/plugin marketplace add alirezarezvani/claude-skills`，然后按域 `/plugin install engineering-skills@claude-code-skills`、`marketing-skills@claude-code-skills` 等，或装单个 skill
  - Codex：`npx agent-skills-cli add alirezarezvani/claude-skills --agent codex`（或 clone + `./scripts/codex-install.sh`）
  - Gemini CLI：clone + `./scripts/gemini-install.sh`；其余工具走 `scripts/convert.sh` 转换。

### 10. travisvn/awesome-claude-skills

- **地址**：https://github.com/travisvn/awesome-claude-skills
- **星数**：~14,840（2026-08-27 GitHub API）
- **定位**：较早（2025-10 起）的 Claude Skills 策展清单，偏 Claude Code 工作流，含 FAQ（progressive disclosure 的 token 开销、Skills vs Subagents vs MCP 的选用）、官方资源链接和散点社区 skill 列表。
- **接入方式**：索引类仓库，条目是外部链接；README 给出的通用安装方式是 `/plugin marketplace add anthropics/skills` 或 `/plugin add /path/to/skill-directory`，社区单点 skill 一般 clone 后复制到 `~/.claude/skills/` 或用 `npx skills add`。

### 荣誉提名（未进 Top 10，但值得跟踪）

- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)（~53k）：星数高于榜内多数仓库，但它是 Claude Code 全品类资源清单（skills 只是其中一节），故不计入。
- [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents)（~148k）："AI 营销机构" agents 集合，是 agents 而非 skills，不计入。
- [openclaw/clawhub](https://github.com/openclaw/clawhub)（~9.4k）：OpenClaw 生态的 Skill + Plugin 注册表（`clawhub install <owner>/<repo>`）。
- [iflytek/skillhub](https://github.com/iflytek/skillhub)（~4.9k）：科大讯飞出的企业级自托管 skill registry（RBAC、审计、Docker/K8s 部署），代表"私有化市场"方向。
- 纯网站型市场（非 GitHub 仓库主体，未计入）：[skills.sh](https://skills.sh)（vercel-labs/skills 的前端）、[SkillHub](https://skills.palebluedot.live)（`npx skillhub install`，索引 17 万+ 含 SKILL.md 的 GitHub 仓库）、[SkillsMP](https://skillsmp.com)、[mcpservers.org/agent-skills](https://mcpservers.org/agent-skills)。

## 适用场景与建议

对「AI Agents Atlas」项目的启示：

- **想做内容源（Atlas 收录 skill）**：优先爬/索引 #2 anthropics/skills（官方基准）、#5 VoltAgent/awesome-agent-skills（最大的精选索引，1497+）、#3/#10 两个 awesome 清单，再辅以 skills.sh / SkillHub 这类已做聚合的注册表做交叉补全。
- **想做安装链路**：不要重复造轮子，`npx skills add <owner/repo>`（#8）已经是事实标准的跨 agent 安装器，支持 77 种 agent 且处理私有仓库鉴权；Claude Code 场景再叠加 `/plugin marketplace add` 协议（#1/#4/#9 都用它）。Kimi Code 兼容 SKILL.md 标准，安装方式是把 skill 目录放入用户级（如 `~/.agents/skills/`）或项目级 skills 目录；也可直接复用 `npx skills add`（其 agent 列表是否已含 Kimi Code **未核实**，需实测 `npx skills add --help` 的 supported agents）。
- **想做差异化**：星数分布显示头部已被"官方集合 + 安装 CLI + 大索引"占满；空位在 **企业私有 registry**（iflytek/skillhub 方向）、**安全扫描/信任评分**（SkillHub、installagentskills.com 在做）、**质量策展**（VoltAgent 主打"非 AI 批量生成"正是对 SkillsMP 类 21k 聚合站质量问题的回应）。
- **风险提示**：skill 本质是可执行指令 + 脚本，安装第三方 skill 前应审查 `scripts/` 内容；alirezarezvani/claude-skills 这类"大而全"库被部分社区质疑为批量生成，质量需抽样验证（此评价未充分核实，仅供参考）。

## 参考来源

星数统一来自 GitHub REST API（2026-08-27 当日查询 `api.github.com/repos/<owner>/<repo>`）。其余来源：

- [anthropics/skills README（安装方式）](https://github.com/anthropics/skills)
- [GitMeter 对 anthropics/skills 的星数记录](https://gitmeter.com/projects/cmo51850i000h04jr95o86c2t)
- [Ry Walker Research: Anthropic Skills](https://rywalker.com/research/anthropic-skills)
- [anthropics/skills 中文解析（王宇博客）](https://void.redx.space/blog/anthropics-skills-guide)
- [obra/superpowers README](https://github.com/obra/superpowers) / [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace)
- [Kyle Pericak: Exploring Claude Plugin obra/superpowers](https://kyle.pericak.com/exploring-claude-plugin-obra-superpowers.html)
- [wshobson/agents README（多 harness 安装）](https://github.com/wshobson/agents)
- [VoltAgent/awesome-agent-skills README](https://github.com/VoltAgent/awesome-agent-skills)
- [ComposioHQ/awesome-claude-skills README](https://github.com/ComposioHQ/awesome-claude-skills)
- [travisvn/awesome-claude-skills README](https://github.com/travisvn/awesome-claude-skills)
- [vercel-labs/skills README（npx skills 用法）](https://github.com/vercel-labs/skills)
- [npm: skills 包](https://www.npmjs.com/package/skills)
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- [davila7/claude-code-templates README](https://github.com/davila7/claude-code-templates)
- [alirezarezvani/claude-skills README](https://github.com/alirezarezvani/claude-skills)
- [openclaw/clawhub](https://github.com/openclaw/clawhub)
- [iflytek/skillhub](https://github.com/iflytek/skillhub)
- [SkillHub 市场网站](https://skills.palebluedot.live/en/about) / [SkillHub 数据来源说明](https://skills.airano.ir/en/attribution)
- [SkillsMP 介绍（NavTools AI）](https://navtools.ai/tool/skillsmp)
- [Chris Ayers: Agent Skills, Plugins and Marketplace 完整指南](https://chris-ayers.com/posts/agent-skills-plugins-marketplace/)
