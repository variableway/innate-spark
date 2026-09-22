# UI-UX Audit Skill 调研

> 调研日期：2026-08-27。所有条目均来自公开搜索结果；星数以 GitHub API 当日查询值为准（附录注明）。

## 概述

**UI/UX Audit Skill（界面审查/走查类 skill）** 是一类遵循 Agent Skills（`SKILL.md`）规范的可插拔指令包，让 AI 编程助手（Claude Code、Codex CLI、Cursor、Windsurf 等）获得"资深设计师/UX 专家"的审查能力。它的本质是把设计规范、启发式评估框架和检查清单沉淀为结构化指令（有的附带可执行脚本），让 agent 对已有界面或设计产出做系统化走查并输出带优先级的问题清单。

常见的审查维度（不同实现取舍不同）：

- **可用性（Usability）**：Nielsen 十大可用性启发式原则、Don Norman 设计原则、认知走查（Cognitive Walkthrough）、表单/流程摩擦点。
- **可访问性（Accessibility）**：WCAG 2.1/2.2 A/AA/AAA 合规、对比度（4.5:1 / 3:1）、触控目标尺寸（24×24 / 44×44 px）、键盘导航、焦点可见性、`prefers-reduced-motion`、ARIA 模式、屏幕阅读器兼容。
- **视觉一致性（Visual Consistency）**：字体/字号/颜色/圆角/阴影的数量蔓延（sprawl）、8pt 间距栅格、组件一致性、设计系统/Design Token 遵循度。
- **布局与响应式**：元素错位（1–6px near-miss）、横向溢出、多端视口截图对比。
- **动效与性能**：动画只作用于 `transform`/`opacity`、缓动曲线、布局抖动（jank）。
- **整体观感（Taste）**：视觉层级、留白、CTA 显著性、"cheap-looking" 信号、空态/加载态/错误态。

实现形态上分三类：**纯指令型**（只用 LLM 推理做启发式评估，如 mastepanoski/claude-skills）、**浏览器驱动型**（注入脚本到真实页面做像素级测量 + 截图判断，如 imYChaudhary22/ui-ux-audit）、**静态代码 Lint 型**（扫描 CSS/JSX/Tailwind 配置输出定位到行的 findings，如 Aboudjem/ui-ux-suite）。

## 主要实现 / 榜单

### 1. imYChaudhary22/ui-ux-audit（浏览器驱动审查，本次调研最贴合主题）

- **地址**：https://github.com/imYChaudhary22/ui-ux-audit （GitHub API 查询：0 stars，2026-07-07 更新——新项目，热度未核实其代表性）
- **功能**：对任意 URL（线上站点或 `localhost`/`file://`）驱动真实浏览器，在桌面（1440×900）与移动（390×844）两个视口截图每个区块，并向页面注入 `audit.js` 实测：对比度（WCAG 2.2 §1.4.3）、触控目标（§2.5.8/§2.5.5）、8pt 栅格偏离、1–6px 错位、动画性能与缓动、focus/reduced-motion 缺失、横向溢出、字体颜色蔓延、图片放大模糊与缺 `alt`。截图部分再做视觉层级、CTA、一致性等"判断型"评估。输出 `🔴 Blocker / 🟠 Major / 🟡 Minor` 分级报告，每条含位置、违反的原则（带实测数值）和具体修法。阈值均标注一手出处（WCAG 2.2、NN/g、Material Design、web.dev），被验证证伪的规则刻意排除。
- **接入方式**：
  - Claude Code 插件（推荐）：`/plugin marketplace add imYChaudhary22/ui-ux-audit` 然后 `/plugin install ui-ux-audit@ui-ux-audit`，使用 `/ui-ux-audit https://yourapp.com`
  - 手动：`git clone` 后把 `skills/ui-ux-audit` 拷入 `~/.claude/skills/` 或项目 `.claude/skills/`
  - 任意 agent：`npx github:imYChaudhary22/ui-ux-audit`（拷到 skills 目录，支持 `--project` / `--dir`）
  - 无 agent 独立用：把 `audit.js` 粘贴进 Chrome DevTools Console，拿 JSON 交给任意 LLM
- **适用场景**：上线前/后的整站走查、响应式与可访问性硬伤排查、给"vibe coding"产出做验收。MIT 协议。

### 2. mastepanoski/claude-skills（框架化 UX 评估套件，纯指令型）

- **地址**：https://github.com/mastepanoski/claude-skills （GitHub API 查询：48 stars）；已索引到 skills.sh
- **功能**：UX/UI 评估套件含 6 个 skill——`ux-audit-rethink`（IxDF 框架：7 UX 因子 + 5 可用性特征 + 5 交互维度）、`nielsen-heuristics-audit`（Nielsen 10 启发式，0–4 严重度）、`wcag-accessibility-audit`（WCAG 2.1/2.2 POUR + A/AA/AAA）、`don-norman-principles-audit`（7 原则）、`cognitive-walkthrough`（新手任务走查）、`ui-design-review`（10 维度视觉审查）。另有 AI 治理类（ISO 42001、NIST AI RMF、OWASP LLM Top 10、GDPR 等）不在本主题范围。
- **接入方式**：`npx skills add mastepanoski/claude-skills --skill wcag-accessibility-audit`（`--list` 查看全部，不带 `--skill` 安装全部）；支持 Claude Code、Codex CLI 及任何 Agent Skills 兼容 agent。
- **适用场景**：需要方法论严谨、可引用框架名输出报告的 UX 评审（如给客户/团队出 audit report）；输入可以是 URL、截图或组件代码。MIT 协议。

### 3. plugin87/ux-ui-agent-skills（设计体系全栈工具包，含 a11y-audit / design-review）

- **地址**：https://github.com/plugin87/ux-ui-agent-skills （GitHub API 查询：782 stars）；skills.sh 上有 `a11y-audit` 条目页
- **功能**：不止是审查 skill——DTCG 设计令牌生成、50 个组件规范、17 个可运行 `/skill`、138 个品牌设计系统库。审查相关：`/a11y-audit`（WCAG 2.2 AA/AAA，P0/P1/P2 分级）、`/design-review`（6 维度加权打分：视觉层级 20%、可用性 20%、一致性 20%、可访问性 20%、响应式 10%、性能 10%，findings 分 Critical/Major/Minor/Enhancement）、`/redesign`（审查先行的存量 UI 改造）、`/critique`（对抗式设计批评 subagent，截图 1280+390 双主题并逐一点击控件后才给结论）。附带 37 项客观 gate（真实 headless-Chrome 对比度测量、axe-core、焦点陷阱、RTL、键盘可操作性等）。
- **接入方式**：`npx ux-ui-agent-skills init`（整套装入当前项目）或 `npx ux-ui-agent-skills add tokens taste design-systems`（按区域安装）；`git clone` 后拷贝亦可。
- **适用场景**：需要在"设计→代码→审查→CI gate"全链路内嵌 UX 纪律的团队；体量较大，只想做轻量走查会显得重。MIT 协议。

### 4. Aboudjem/ui-ux-suite（设计 Lint 型，定位到代码行）

- **地址**：https://github.com/Aboudjem/ui-ux-suite （GitHub API 查询：6 stars，2026-05-30 更新）
- **功能**：自称 "ESLint for design"——零依赖设计 linter，审计 CSS、JSX、HTML、Tailwind 配置，按 12 个维度、24 条有名 UX 定律（带一手文献引用）评分；支持 WCAG + APCA + OKLCH 色彩。输出"哪一行、实测错误值、具体修法"，而非泛泛建议。多语言 README（含简体中文）。
- **接入方式**：克隆仓库作为 Claude Code skill 使用（具体安装命令未在搜索摘要中核实，建议查阅仓库 README）。
- **适用场景**：把设计审查前移到代码阶段、接入 CI 做设计回归检查。

### 5. uxuiprinciples/agent-skills（学术化 UX 原则库，API 增强）

- **地址**：https://github.com/uxuiprinciples/agent-skills （GitHub API 查询：13 stars）
- **功能**：5 个 `SKILL.md`：`uxui-evaluator`（168 条研究支撑的 UX/UI 原则评估）、`interface-auditor`（UX smell 反模式检测）、`ai-interface-reviewer`（AI/LLM 界面专项 44 条原则）、`flow-checker`（流程前后检查清单，需付费 API）、`vibe-coding-advisor`（生成组件前注入 UX 上下文）。无 API key 时纯 LLM 推理；配置 `UXUI_API_KEY` 后返回原则编号、2,098+ 学术引用、严重度和修复配方（API 从 $19/年，价格信息以官网为准、未二次核实）。
- **接入方式**：`curl -O https://raw.githubusercontent.com/uxuiprinciples/agent-skills/main/uxui-evaluator/SKILL.md` 拷入项目；兼容 Cursor、Windsurf、Claude Code 等。
- **适用场景**：需要每条 finding 有学术引用背书的正式 UX 评审；AI 产品界面专项审查。

### 6. ClawHub（OpenClaw 生态）上的 UI/UX skill

- **UI/UX Pro Max（ClawHub 版）**：https://clawhub.ai/xobi667/ui-ux-pro-max/security/openclaw —— 安装 `npx clawhub@latest install ui-ux-pro-max`（ClawHub 通用安装命令，见 [firecrawl.dev 的 OpenClaw skills 指南](https://www.firecrawl.dev/blog/openclaw-skills)）。注意 ClawHub 自带安全审计页提示其 `--persist`/`--output-dir` 命令需人工复核；另有安全研究论文指出 ClawHub 上存在过恶意 skill（[arXiv:2606.21071](https://arxiv.org/pdf/2606.21071)），安装前应看安全扫描页。
- **ui-ux-design**：https://openclawskills.wiki/skill/ui-ux-design —— `npx clawhub@latest install ui-ux-design`，通用设计原则参考型 skill，非严格意义上的 audit。
- ClawHub 生态索引可参考 [VoltAgent/awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)（GitHub API 查询：52,200 stars，5400+ skills 分类整理）。
- **适用场景**：使用 OpenClaw agent 框架时；Claude Code/Cursor 用户优先走 skills.sh / GitHub 生态。

### 7. 相关但定位不同的：nextlevelbuilder/ui-ux-pro-max-skill

- **地址**：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill （GitHub API 查询：121,507 stars——数值来自 API 当日返回，体量异常高，建议以页面实时显示为准）
- **功能**：偏"设计智能数据库"（57+ UI 风格、配色、字体搭配、UX 规范检索），是**生成侧** skill 而非 audit skill，但其 `stack/` 目录包含 Playwright + Chrome DevTools MCP 的截图-修复设计闭环，覆盖部分走查场景；[OpenAgentSkill 审计页](https://www.openagentskill.com/skills/nextlevelbuilder-ui-ux-pro-max-skill/audit)给出 Trust Score 91。
- **接入方式**：`npm install -g ui-ux-pro-max-cli` 后 `uipro init --ai claude`（支持 cursor/windsurf/copilot/codex 等）。
- **适用场景**："边生成边自查"的设计闭环；纯存量审查不是它的主场。

### 8. 其他零散实现（供扩展阅读）

- [hesreallyhim/ux-audit-fork](https://github.com/hesreallyhim/ux-audit-fork)（1 star）：12 设计原则 + 13 参考文档 + 7 组件检查清单，guide/review 双模式，支持 Claude Code、Cursor、Codex、Windsurf。为 fork 仓库，原始出处未核实。
- [Ashutos1997/claude-design-auditor-skill](https://github.com/Ashutos1997/claude-design-auditor-skill)（75 stars）：按 19 类专业设计规则审计设计稿的 Claude skill。
- [sergekostenchuk/ui-ux-agent-skill-system](https://github.com/sergekostenchuk/ui-ux-agent-skill-system)（15 stars）：厂商中立的 UI/UX skill 体系（Codex/Claude/Gemini/Qwen/Copilot/GLM/Kimi 适配器），编排器 + audit/critic 环节。
- mcpmarket.com 上还有 UX Audit Pro、UX & Accessibility Auditor（4 个并行子 agent 审查 WCAG/性能/文案）等目录条目，多为聚合页，原始仓库未逐一核实。
- 榜单参考：[Snyk - Top 8 Claude Skills for UI/UX Engineers](https://snyk.io/articles/top-claude-skills-ui-ux-engineers/)。

## 适用场景与建议

- **上线前自动走查（推荐首选）**：imYChaudhary22/ui-ux-audit。它是唯一把阈值锚定到 WCAG 2.2/NN/g/Material 一手出处、并用真实浏览器实测像素的实现，报告可直接变成修复 punch-list；支持 localhost，能接入 CI 前的开发环。
- **方法论严谨的正式 UX 评审报告**：mastepanoski/claude-skills（Nielsen/WCAG/Norman 分框架出报告，带严重度分级）；需要学术引用时用 uxuiprinciples/agent-skills。
- **代码级设计回归 / CI 门禁**：Aboudjem/ui-ux-suite（静态 lint、定位到行）或 plugin87/ux-ui-agent-skills 的 gate 体系（37 项客观检查、axe-core、headless Chrome 实测对比度）。
- **设计生成与审查一体化**：plugin87/ux-ui-agent-skills（`/redesign` = audit-first 改造）或 ui-ux-pro-max 的 stack 闭环。
- **OpenClaw 用户**：走 ClawHub `npx clawhub@latest install <skill>`，但务必先看 ClawHub 自带的安全扫描页——学术审计已报告该平台存在恶意 skill 案例。
- **通用建议**：这类 skill 分"测量型"与"判断型"两派，判断型（纯 LLM 推理）结果受模型能力影响大、可复现性弱；对 accessibility 等硬性合规维度，优先选带真实测量脚本（浏览器注入/axe-core/axe 类）的实现。安装第三方 skill 前审查其 `SKILL.md` 与脚本权限（部分实现涉及 `--persist` 写盘、系统级 setup 脚本等高风险行为）。

## 参考来源

- [imYChaudhary22/ui-ux-audit - GitHub](https://github.com/imYChaudhary22/ui-ux-audit)
- [mastepanoski/claude-skills - GitHub](https://github.com/mastepanoski/claude-skills)
- [plugin87/ux-ui-agent-skills - GitHub](https://github.com/plugin87/ux-ui-agent-skills) 及 [claudewave 上的 a11y-audit 条目](https://claudewave.com/en/skills/plugin87-ux-ui-agent-skills-a11y-audit)
- [Aboudjem/ui-ux-suite - GitHub](https://github.com/Aboudjem/ui-ux-suite)
- [uxuiprinciples/agent-skills - GitHub](https://github.com/uxuiprinciples/agent-skills)
- [nextlevelbuilder/ui-ux-pro-max-skill - GitHub](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)、[CLI 安装文档](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/cli/README.md)、[OpenAgentSkill 审计报告](https://www.openagentskill.com/skills/nextlevelbuilder-ui-ux-pro-max-skill/audit)、[掘金实测文章](https://juejin.cn/post/7592234632482422793)
- ClawHub 相关：[UI/UX Pro Max 安全审计页](https://clawhub.ai/xobi667/ui-ux-pro-max/security/openclaw)、[ui-ux-design 条目](https://openclawskills.wiki/skill/ui-ux-design)、[VoltAgent/awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)、[firecrawl.dev OpenClaw skills 指南](https://www.firecrawl.dev/blog/openclaw-skills)、[arXiv:2606.21071（skill 市场安全审计研究）](https://arxiv.org/pdf/2606.21071)
- 扩展：[hesreallyhim/ux-audit-fork](https://github.com/hesreallyhim/ux-audit-fork)、[Ashutos1997/claude-design-auditor-skill](https://github.com/Ashutos1997/claude-design-auditor-skill)、[sergekostenchuk/ui-ux-agent-skill-system](https://github.com/sergekostenchuk/ui-ux-agent-skill-system)、[Snyk Top 8 Claude Skills for UI/UX](https://snyk.io/articles/top-claude-skills-ui-ux-engineers/)、[mcpmarket UX Audit Pro](https://mcpmarket.com/tools/skills/ux-audit-pro)、[mcpmarket Design Review](https://mcpmarket.com/tools/skills/design-review)
- 星数数据来源：GitHub REST API `GET /repos/{owner}/{repo}`，查询时间 2026-08-27。
