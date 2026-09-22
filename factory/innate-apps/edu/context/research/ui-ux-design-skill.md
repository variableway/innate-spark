# UI/UX Design Skill 调研

> 调研时间：2026-08-27 · 调研方式：WebSearch + FetchURL + GitHub API 交叉验证

## 概述

**UI/UX Design Skill（UI/UX 设计类 Agent Skill）** 是一种给 AI 编程 Agent（Claude Code、Cursor、Codex、OpenClaw 等）注入「设计师经验」的可复用能力包。其形态遵循 Anthropic 提出的开放 Agent Skills 约定：一个带 YAML frontmatter（`name` / `description`）的 `SKILL.md` 文件，加上可选的支持文件（规则文档、数据表、脚本、组件模板）。Agent 在用户提出界面设计/构建类需求时自动（或经 slash command）激活该 skill，按其中的规则生成 UI，而不是依赖模型的默认训练记忆。

这类 skill 要解决的共同问题是 **"AI slop"**——大模型生成的前端界面高度趋同（滥用 Inter/Roboto 字体、Tailwind 默认蓝、居中 Hero + 渐变按钮、lorem ipsum 占位文案）。因此几乎所有知名实现的提示词结构都包含三个要素：

1. **角色与哲学定位**：如「小型设计工作室的 design lead」「自主设计合作伙伴」；
2. **反模板化（Anti-Slop）规则**：明确告诉 AI **不该做什么**（禁用字体/颜色/布局套路）；
3. **流程与质量底线**：生成前检查清单（pre-flight）、生成后自检（self-check）、交互深度硬指标（hover/focus/空态/加载态）等。

实现路线分两类：**纯提示词型**（整个 skill 就是若干 Markdown/文本规则文件，零运行时依赖）和 **数据驱动型**（skill 内置 CSV 数据库 + 本地搜索脚本，按需检索风格、色板、字体配对）。

## 主要实现 / 榜单

### 1. frontend-design —— Anthropic 官方

- **地址**：<https://github.com/anthropics/skills/tree/main/skills/frontend-design>（SKILL.md 原文：<https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md>）
- **热度**：所属仓库 `anthropics/skills` 约 **171,914 stars / 20,440 forks**（GitHub API，2026-08-27；与仓库页面显示的 "172k Star" 一致，两处交叉验证）
- **功能**：指导生成「有独特视觉身份、不像模板默认值」的前端界面。单文件 SKILL.md，纯提示词型。
- **提示词结构特点**：
  - 角色设定为「一家以独特视觉身份著称的小型工作室的 design lead」，要求「冒一次能自圆其说的美学风险」；
  - 明确指出当前 AI 生成设计的三种默认套路（奶油色背景+衬线大标题+陶土色点缀 / 近黑背景+酸性绿或朱红点缀 / 报纸式细线分栏），要求在 brief 未限定时主动避开；
  - 两遍工作流：先 brainstorm 出紧凑的 token 系统（4–6 个命名色值、2+ 字体角色、布局概念用 ASCII 线框图推演、一个 signature 记忆点元素），再对照 brief 自我批判、确认独特性后才写代码；
  - 包含一整节界面文案写作规范（主动语态、按钮文案与结果一致、错误/空态是引导而非情绪）。
- **接入方式**：把 `SKILL.md` 放入 `~/.claude/skills/frontend-design/`（用户级）或项目的 `.claude/skills/` 目录；社区镜像（如 [Collective Brain](https://collectivebrain.de/en/skills/anthropic-frontend-design/)）给出一条命令安装：`mkdir -p ~/.claude/skills/anthropic-frontend-design && curl -fsSL <SKILL.md URL> -o ...`。
- **适用场景**：用 Claude Code 做营销页、落地页、产品界面等「需要设计品味」的一次性视觉创作；轻量、单文件，适合作为自定义 skill 的起点。

### 2. UI UX Pro Max Skill（nextlevelbuilder/ui-ux-pro-max-skill）—— 社区最热门

- **地址**：<https://github.com/nextlevelbuilder/ui-ux-pro-max-skill> · 官网 <https://ui-ux-pro-max-skill.com/>
- **热度**：约 **121,507 stars / 13,033 forks**（GitHub API，2026-08-27；创建于 2025-11-30，MIT 协议。星数未找到第二个独立来源确认，仅此一口径，谨慎采信）
- **功能**：**数据驱动型**的代表。v2.0 核心是 Design System Generator——内置推理引擎，根据产品类型自动生成完整设计系统（页面结构 Pattern + 风格 Style + 色板 + 字体配对 + 效果 + 行业反模式 + 交付前检查清单）。数据规模：79 个可检索 UI 风格（50 个 active）、192 个色板、74 组字体配对、25 种图表类型、22 个技术栈指南（React/Vue/Svelte/SwiftUI/Flutter/桌面端 WPF/JavaFX 等）、119 条 UX 准则、192 条行业推理规则（SaaS/金融/医疗/电商等）。数据存于 CSV，靠本地 Python 脚本（BM25 排序）检索，**不联网、零外部依赖**（仅需 Python 3 标准库）。另有付费 Premium 版（品牌识别、Logo 设计等），开源版为 Basic。
- **提示词结构特点**：与 Anthropic 的「散文式哲学引导」相反，它是「规则库 + 检索脚本」——SKILL.md 指示 Agent **必须先运行本地 `search.py` 脚本**拿到设计系统输出，再据此写代码，禁止凭模型内部知识直接生成 HTML/CSS。
- **接入方式**（三种，来自官方 README）：
  ```bash
  # Claude Code Marketplace
  /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
  /plugin install ui-ux-pro-max@ui-ux-pro-max-skill

  # CLI（推荐，支持 20+ 平台：cursor/windsurf/copilot/codex/trae/openclaw 等）
  npm install -g ui-ux-pro-max-cli
  uipro init --ai claude          # 或 npx ui-ux-pro-max-cli init --ai claude
  uipro init --ai claude --global # 全局安装到 ~/.claude/skills/
  ```
- **适用场景**：跨技术栈、跨行业的**工程化 UI 生成**（仪表盘、管理后台、移动端 App），以及团队希望固化「设计系统即数据」的工作流。ClawHub 上也有社区移植版（[heyanming/ui-ux-for-openclaw](https://clawhub.ai/heyanming/ui-ux-for-openclaw)）。

### 3. ui-ux-design（sapsapshen/ui-ux-design，改编自 OpenCoworkAI/open-codesign）

- **地址**：<https://github.com/sapsapshen/ui-ux-design>
- **热度**：0 stars（GitHub API，2026-08-27）——**小众社区项目，注意甄别**
- **功能**：纯提示词型但结构最重。核心能力：
  - **10 层规则文件体系**（`prompts/` 下 10 个 `.v1.txt`：identity / workflow / output-rules / design-methodology / anti-slop / artifact-types / pre-flight / craft-directives / safety / chart-rendering）；
  - **8 种设计工件类型**（落地页、案例研究、仪表盘、定价页、幻灯片、邮件、单页简报、报告），每种有最少区块数和结构要求；
  - **12 个 JSX 设计参考模块**（`design-skills/`：dashboard、landing-page、glassmorphism、chat-ui、data-table 等）；
  - Anti-Slop 规则最具体：拉黑 Inter/Roboto/Arial 等字体、强制 oklch 色彩空间、禁 Tailwind 默认蓝 `#3b82f6`、禁纯黑文字、禁 lorem ipsum、数字不得整百整千；
  - 交互深度硬指标：≥3 个状态切换、≥1 个命名 CSS 动画、`:focus-visible` 必做、空/加载/错误态至少覆盖一种；
  - 交付物为标准化 ZIP（`index.html` + `styles/main.css` + `scripts/main.js`，无外部图片）。
- **接入方式**（README 给出）：
  ```bash
  git clone https://github.com/sapsapshen/ui-ux-design.git
  mkdir -p ~/.claude/skills
  cp -r ui-ux-design ~/.claude/skills/ui-ux-design
  ```
  另提供 Cursor（`.cursorrules`）、Windsurf（`.windsurfrules`）等粘贴式接入。
  ⚠️ **未核实**：README 中提到的「WorkBuddy 平台原生支持」及 `echo '@skill ui-ux-design' >> CLAUDE.md` 的引用语法未找到第三方来源佐证；README 内部安装命令的目录名前后不一致（`open-codesign` vs `ui-ux-design`），实际使用前建议以仓库当前文件为准。
- **适用场景**：想要一套**可直接 fork 修改的完整设计规范手册**的团队；其「分层 prompt 文件 + 版本后缀（.v1）」的组织方式对自建 skill 有参考价值。

### 4. 分发平台：skills.sh 与 ClawHub

- **skills.sh**（<https://skills.sh/>）：**Vercel Labs 维护的开放 Agent Skills 目录**（多来源交叉确认：[daily.dev](https://daily.dev/posts/cqvmcxcfw)、[rajeevpentyala.com](https://rajeevpentyala.com/2026/06/16/discover-and-install-agent-skills-with-skills-sh/)）。提供搜索、按安装量排序的榜单（All Time / Trending / Hot），统一安装命令：
  ```bash
  npx skills add <owner/repo>
  ```
  支持 Claude Code、Cursor、Codex、GitHub Copilot、Windsurf、Gemini CLI、Cline、Zed 等。上述 skill 均可通过它检索安装（如 `npx skills add nextlevelbuilder/ui-ux-pro-max-skill`）。
- **ClawHub**（<https://clawhub.ai/>）：OpenClaw 生态的 skill 注册中心，安装命令形如 `npx clawhub@latest install <skill-name>`。存在一个名为 `ui-ux-design` 的条目（"Modern UI/UX design principles, patterns, and best practices for web and mobile app"，[openclawskills.wiki 镜像页](https://openclawskills.wiki/skill/ui-ux-design)）——该页面为第三方镜像站，**未直接核实 clawhub.ai 原始页面**，作者与质量未知。

### 5. 其他值得知道的同类 skill（简列）

- **qrucio/anthropic-frontend-design**（[openclaw/skills 仓库](https://github.com/openclaw/skills/blob/main/skills/qrucio/anthropic-frontend-design/SKILL.md)）：社区改良版，自称「融合 UI/UX Pro Max 的设计智能与 Anthropic 的反 slop 哲学」——两条主流路线的合流样本。
- **ui-ux-design-pro**（[MCPMarket 收录](https://mcpmarket.com/tools/skills/ui-ux-design-pro)）：偏信息架构、视觉层级、交互模式的「产品设计师」角色 skill。⚠️ MCPMarket 为聚合站，skill 原始仓库未核实。
- **Penpot UI/UX Design**（[MCPMarket 收录](https://mcpmarket.com/tools/skills/penpot-ui-ux-design)）：结合 Penpot MCP server，让 Agent 直接在开源设计工具 Penpot 里以编程方式创建界面/组件库——代表「skill + MCP 工具」的组合形态。⚠️ 同上，原始仓库未核实。
- **wondelai/ux-heuristics**（[AwesomeSkills 收录](https://www.awesomeskills.dev/es/skill/skills-ux-heuristics)）：聚焦 Nielsen 启发式评估的可用性审计 skill，代表「UX 评审」而非「UI 生成」方向。
- 榜单类文章：Snyk《[Top 8 Claude Skills for UI/UX Engineers](https://snyk.io/articles/top-claude-skills-ui-ux-engineers/)》（2026-03）可作横向参考。

## 适用场景与建议

- **一次性视觉创作**（落地页、营销页、作品集）：选 **Anthropic frontend-design**——单文件、哲学引导式，产出风格最不易撞脸，也方便改写为自有 skill。
- **工程化、多栈、多行业 UI 生成**（仪表盘、后台、移动端、需要设计系统沉淀）：选 **UI UX Pro Max**——数据驱动 + 检索脚本，覆盖面最广，安装渠道最成熟（Marketplace/CLI/skills.sh 三条路）；但注意其星数口径单一、且含 Premium 付费导流。
- **团队设计规范固化**：参考 **sapsapshen/ui-ux-design** 的「分层 prompt 文件 + 版本化」结构自建内部 skill，比直接采用该仓库更稳妥（其自身热度与文档严谨度有限）。
- **安全提示**：skill 本质是把第三方提示词/脚本注入 Agent 上下文。安装前应审查 `SKILL.md` 及附带脚本（skills.sh 页面提供风险标注）；对要求「必须先执行本地脚本」的 skill（如 UI UX Pro Max 的 `search.py`）尤其要确认脚本无网络行为。
- **对 Atlas 项目的启示**：UI/UX skill 的两种范式——「纯提示词规则书」与「数据 + 检索脚本」——可作为 skill 分类维度；其统一的 `SKILL.md` + YAML frontmatter 约定、以及 `npx skills add` / `/plugin install` 两类安装路径，是 Atlas 收录 skill 元数据时的关键字段。

## 参考来源

1. [anthropics/skills · GitHub](https://github.com/anthropics/skills)（官方 skills 仓库，星数经 GitHub API 复核）
2. [frontend-design/SKILL.md 原文](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)
3. [nextlevelbuilder/ui-ux-pro-max-skill · GitHub](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)（README、安装命令、功能矩阵）
4. [UI UX Pro Max Skill 官网](https://ui-ux-pro-max-skill.com/)
5. [sapsapshen/ui-ux-design · GitHub](https://github.com/sapsapshen/ui-ux-design)
6. [skills.sh](https://skills.sh/) · [daily.dev 介绍](https://daily.dev/posts/cqvmcxcfw) · [rajeevpentyala.com 介绍](https://rajeevpentyala.com/2026/06/16/discover-and-install-agent-skills-with-skills-sh/)
7. [ClawHub: heyanming/ui-ux-for-openclaw](https://clawhub.ai/heyanming/ui-ux-for-openclaw) · [openclawskills.wiki: ui-ux-design](https://openclawskills.wiki/skill/ui-ux-design)
8. [openclaw/skills: qrucio/anthropic-frontend-design](https://github.com/openclaw/skills/blob/main/skills/qrucio/anthropic-frontend-design/SKILL.md)
9. [Collective Brain: Anthropic Frontend Design 安装指南](https://collectivebrain.de/en/skills/anthropic-frontend-design/)
10. [Snyk: Top 8 Claude Skills for UI/UX Engineers](https://snyk.io/articles/top-claude-skills-ui-ux-engineers/)
11. [MCPMarket: UI/UX Design Pro](https://mcpmarket.com/tools/skills/ui-ux-design-pro) · [Penpot UI/UX Design](https://mcpmarket.com/tools/skills/penpot-ui-ux-design)
12. [AwesomeSkills: wondelai/ux-heuristics](https://www.awesomeskills.dev/es/skill/skills-ux-heuristics)
13. GitHub REST API：`api.github.com/repos/anthropics/skills`、`api.github.com/repos/nextlevelbuilder/ui-ux-pro-max-skill`、`api.github.com/repos/sapsapshen/ui-ux-design`（星数/协议核实，2026-08-27）
