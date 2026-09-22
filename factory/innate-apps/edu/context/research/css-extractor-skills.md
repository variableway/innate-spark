# CSS Extractor Skills 调研（CSS / 样式提取类 AI Agent Skill）

> 调研时间：2026-08-27。星数等数据来自 GitHub API 当日查询，可能与页面显示略有出入。

## 概述

**CSS Extractor Skills** 是一类面向 AI Coding Agent（Claude Code、Codex、Cursor、OpenClaw 等）的技能包（SKILL.md 形式）或配套 CLI / MCP server，核心能力是：**给定一个真实网站的 URL，用无头浏览器（Playwright / Puppeteer / chrome-devtools-mcp）或爬虫（Firecrawl）加载页面，读取 computed style / CSSOM / CSS 变量，提取出颜色、字体、间距、圆角、阴影、断点、组件状态等，归纳为结构化的 design tokens 与风格指南文档**。

典型用途：

- 从任意公开网站反向提取 design tokens（W3C DTCG JSON、CSS custom properties、Tailwind v4 `@theme`、shadcn/ui theme、Figma variables）
- 生成 `DESIGN.md` / `style-guide.md` 供 AI agent 在新项目中复刻视觉语言
- 迁移旧项目样式（Tailwind v3 → v4、WordPress theme.json → Tailwind）
- WCAG 对比度审计、多页一致性检查、克隆站与原站 fidelity 打分
- 从 Storybook 实例提取组件 HTML / 样式 / 主题（MCP 形态）

这类工具在 2026 年上半年随 Anthropic Agent Skills 规范和 Vercel skills.sh 生态普及而大量出现，分发渠道主要是：GitHub + `npx skills add`（skills.sh 生态）、ClawHub（OpenClaw 生态）、smithery、npm（CLI / MCP server）。

## 主要实现/榜单

### 1. designlang（原 design-extract）— 功能最全的开源提取器

- 地址：<https://github.com/Manavarya09/design-extract>（GitHub，约 3.8k stars，MIT）、官网 <https://designlang.app/>、npm 包 `designlang`
- 功能：无头浏览器爬取任意 URL，一条命令输出 17+ 文件：W3C DTCG tokens（primitive / semantic / composite 三层）、Tailwind config、shadcn/ui theme、Figma variables、motion tokens、iOS SwiftUI / Android Compose / Flutter / WordPress 多端 emitter；还支持 4 断点响应式行为、hover/focus/active 状态、WCAG 对比度评分、多页一致性、drift 检查、visual diff、`fidelity` 子命令给克隆站打分；内置 MCP server 供 Claude Code / Cursor / Windsurf 调用
- 接入方式：
  - CLI：`npx designlang https://stripe.com`
  - Agent skill（skills.sh 生态，支持 Cursor / Codex 等 40+ agent）：`npx skills add Manavarya09/design-extract`
  - MCP server：README 声明支持 Claude Code / Cursor / Windsurf（具体配置见其文档）
- 适用场景：需要完整设计系统产物（多端 token、审计、对比打分）的重度场景

### 2. style-extractor（Lucent-Snow）— 中文社区热门，重证据链

- 地址：<https://github.com/Lucent-Snow/style-extractor>（GitHub，约 440 stars）
- 功能：给 AI agent 用的 skill。让 agent 打开真实网页 → 截图、抓 computed style、下载 CSS/JS → 有动效时补运行时证据 → 输出 `style-guide.md`、`motion-guide.md`、`evidence-manifest.md`（证据清单）。强调「提取风格而非复刻产品」「输出必须带证据链」，静态风格与动效分层交付
- 接入方式：克隆仓库放入 skills 目录（如 `~/.codex/skills/public/style-extractor/`），依赖 Node.js、Chrome Stable 和 `chrome-devtools-mcp`（必须）；在 Codex / Claude Code 里直接说「帮我提取这个网页的风格：<URL>」
- 适用场景：Codex / Claude Code 用户想把参考站的视觉语言沉淀为可复用文档，尤其关注动效证据时

### 3. extract-design-system（arvindrk）— skills.sh 生态的标准形态

- 地址：<https://github.com/arvindrk/extract-design-system>（GitHub，约 189 stars）、skills.sh 页面 <https://skills.sh/arvindrk/extract-design-system/extract-design-system>
- 功能：从公开网站反向提取 colors / typography / spacing / border radius / shadows，聚类去重后输出 W3C 兼容的 `design-system/tokens.json` 和 `tokens.css`（CSS custom properties），同时保留 `.extract-design-system/raw.json` / `normalized.json` 中间产物
- 接入方式：`npx skills add arvindrk/extract-design-system`（skills CLI），然后在 Claude / Cursor / Codex 里说「Extract the design system from <URL>」；也提供 standalone CLI（npm 包 `extract-design-system`）
- 适用场景：想要最贴近 Anthropic Agent Skills 规范、产物轻量（只要 tokens 起步文件）的场景

### 4. design-md-extractor（jpoindexter）— DESIGN.md 流派，CLI + GUI + MCP

- 地址：<https://github.com/jpoindexter/design-md-extractor>（GitHub，约 58 stars）
- 功能：真实浏览器加载桌面 / 平板 / 移动三端，滚动触发懒加载，读 computed style，真实触发 hover/focus 捕获交互态，证据打分后落盘：`DESIGN.md`、`evidence.json`、`tokens.css`、`tailwind-theme.js`、`design-tokens.json`（W3C DTCG）、`ai-prompt.txt`、`preview.html`、三端截图。完全本地运行，不调用 AI、不需要 API key
- 接入方式：CLI；本地 GUI；MCP server —— `npm run mcp` 或直接 `node /path/to/design-md-extractor/dist/mcp.js` 写入 MCP 配置，暴露 `extract_design` 工具
- 适用场景：偏好「DESIGN.md 作为 agent 上下文」工作流、且要求纯本地无外部依赖的团队；ClawHub 上另有社区搬运版 [design-md-extractor](https://clawhub.ai/skills/design-md-extractor) 与 [Design.md Extractor（liuwei1125）](https://clawhub.ai/liuwei1125/design-md-extractor)（Playwright + pnpm 脚本形态）

### 5. design-system-extractor-skill（david-lai-jpg）— Firecrawl 驱动的 Claude Code skill

- 地址：<https://github.com/david-lai-jpg/design-system-extractor-skill>（GitHub，1 star，新项目）
- 功能：用 Firecrawl MCP 的 `branding` format + 原始 HTML 抓取，提取颜色 / 字体 / 间距 / 阴影 / 圆角 / 断点，检测 type scale 比率与 spacing 基准单位，映射为 primitive → semantic → component 三层 token，输出 `design-system.css`、`design-system.json`（Style Dictionary / Tokens Studio 兼容）、报告 md、预览 HTML
- 接入方式：`ln -sf /path/to/repo/skill ~/.claude/skills/design-system-extractor`，需先配置 Firecrawl MCP 及 API key
- 适用场景：已有 Firecrawl 订阅、希望免本地浏览器依赖的 Claude Code 用户

### 6. design-skills（billhector）— 提取 + 审计双 skill

- 地址：<https://github.com/billhector/design-skills>（GitHub，4 star）
- 功能：两个 Claude Code skill——`design-extractor`（Firecrawl 抓 URL → `DESIGN.md` + Tailwind v4 `@theme` + WCAG 报告 + 截图）和 `design-auditor`（扫描本地项目 CSS / Tailwind config / WordPress theme.json，做 Tailwind v3→v4 迁移）。提取结果存入 `~/.claude/designs/` 库，可跨项目「Use the stripe design」复用
- 接入方式：Claude Code skills，自然语言调用（"Extract the design from stripe.com"）
- 适用场景：既要提取外部网站、又要审计 / 迁移自有项目样式的用户

### 7. mcp-design-system-extractor（freema）— Storybook 方向的 MCP server

- 地址：<https://github.com/freema/mcp-design-system-extractor>（GitHub，约 69 stars）、mcpservers.org 收录页 <https://mcpservers.org/servers/freema/mcp-design-system-extractor>
- 功能：连接 Storybook 实例，提取组件 HTML / 样式 / 元数据、组件依赖分析、主题信息（colors / spacing / typography）、外部 CSS 文件分析提取 design tokens；Puppeteer 渲染，异步任务队列
- 接入方式：`claude mcp add design-system npx mcp-design-system-extractor@latest --env STORYBOOK_URL=http://localhost:6006` 或 `npm install -g mcp-design-system-extractor`
- 适用场景：**不是抓公开网站**，而是从团队自己的 Storybook 提取组件与 token，适合设计系统治理

### 8. 生态目录中的其他条目（轻量 / 相关）

- ClawHub（OpenClaw 生态）：
  - [Frontend Design Extractor](https://clawhub.ai/skills/frontend-design-extractor)：从**前端代码库**（而非线上网站）提取 design tokens 与全局样式，生成 `ui-ux-spec/` 并可按 spec 重构目标项目（来源 [awesome-openclaw-skills](https://github.com/sundial-org/awesome-openclaw-skills)）
- smithery：
  - [clone-website（julianromli）](https://smithery.ai/skills/julianromli/clone-website)：克隆网页的 skill，含「从 computed styles 提取整页调色板写入 `globals.css`」步骤
  - [ui-analyzer（smallnest）](https://smithery.ai/skills/smallnest/ui-analyzer)：分析布局、提取 design tokens 的 UI 分析 skill
- 商业 / 在线工具（非 skill，供对照）：
  - [MYDESIGN.MD Design Token Extractor](https://www.mydesignmd.com/design-token-extractor)：在线服务，输出 `DESIGN.md` + DTCG JSON
  - [Agensi Web Design Extractor](https://www.agensi.io/skills/web-design-extractor)：skill 市场页面，介绍性内容为主，实际分发细节**未核实**
- 注：在 skills.sh 全站搜索「css-extractor / style-extractor」未见同名独立条目；该生态主要以「design system extractor / design tokens」命名。smithery 上的 [css-design-tokens](https://smithery.ai/skills/alongor666/css-design-tokens) 是 CSS 变量规范知识型 skill，非提取工具。

## 适用场景与建议

- **想要最完整产物（多端 token、审计、fidelity 打分）**：选 designlang（`npx designlang` 或 `npx skills add Manavarya09/design-extract`），社区热度最高（约 3.8k stars），但功能面大、版本迭代快，接入前建议锁定版本验证输出。
- **Codex / Claude Code 用户，重视证据链与动效**：选 Lucent-Snow/style-extractor，中文文档友好，依赖 `chrome-devtools-mcp` 操作真实浏览器。
- **只要轻量 tokens 起步文件、遵循官方 Agent Skills 规范**：选 arvindrk/extract-design-system，skills.sh 原生分发，`npx skills add` 一键安装，产物只有 `tokens.json` / `tokens.css`，侵入性最小。
- **DESIGN.md 工作流、纯本地无 API key**：选 jpoindexter/design-md-extractor（CLI / GUI / MCP 三形态）。
- **已有 Firecrawl 账号、不想装本地浏览器**：选 david-lai-jpg/design-system-extractor-skill 或 billhector/design-skills。
- **提取对象是自家 Storybook 而非公开网站**：选 freema/mcp-design-system-extractor。
- **OpenClaw 生态用户**：在 ClawHub 找 design-md-extractor / frontend-design-extractor 条目。
- 共性注意点：多数实现依赖无头浏览器（Playwright / Puppeteer / Chrome），首次运行需安装浏览器二进制；提取他人网站样式用于「参考风格」与「逐像素抄袭」之间有版权与合规边界，多数项目 README 也明确声明目标是沉淀视觉语言而非复刻。

## 参考来源

- [Manavarya09/design-extract（designlang）— GitHub](https://github.com/Manavarya09/design-extract) 及 [designlang 官网](https://designlang.app/)
- [Lucent-Snow/style-extractor — GitHub](https://github.com/Lucent-Snow/style-extractor)
- [arvindrk/extract-design-system — GitHub](https://github.com/arvindrk/extract-design-system) 及 [skills.sh 页面](https://skills.sh/arvindrk/extract-design-system/extract-design-system)
- [jpoindexter/design-md-extractor — GitHub](https://github.com/jpoindexter/design-md-extractor)
- [david-lai-jpg/design-system-extractor-skill — GitHub](https://github.com/david-lai-jpg/design-system-extractor-skill)
- [billhector/design-skills — GitHub](https://github.com/billhector/design-skills)
- [freema/mcp-design-system-extractor — GitHub](https://github.com/freema/mcp-design-system-extractor) 及 [mcpservers.org 收录页](https://mcpservers.org/servers/freema/mcp-design-system-extractor)
- [ClawHub — Design.md Extractor（liuwei1125）](https://clawhub.ai/liuwei1125/design-md-extractor)、[ClawHub — Frontend Design Extractor](https://clawhub.ai/skills/frontend-design-extractor)、[awesome-openclaw-skills](https://github.com/sundial-org/awesome-openclaw-skills)
- [smithery — clone-website](https://smithery.ai/skills/julianromli/clone-website)、[smithery — ui-analyzer](https://smithery.ai/skills/smallnest/ui-analyzer)
- [MYDESIGN.MD — Design Token Extractor](https://www.mydesignmd.com/design-token-extractor)、[Agensi — Web Design Extractor](https://www.agensi.io/skills/web-design-extractor)
- GitHub 星数 / 创建时间：GitHub REST API `repos/{owner}/{repo}`，查询于 2026-08-27
