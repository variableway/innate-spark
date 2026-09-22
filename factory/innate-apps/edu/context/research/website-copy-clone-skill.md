# Website Copy Clone Skill 调研

> 调研日期：2026-08-27。星数、市场数据均为当日抓取快照（GitHub API / 各市场页面），可能随时间变化。

## 概述

**Website Copy Clone Skill（网站复制克隆类 skill）** 是一类遵循 Agent Skills 开放规范（`SKILL.md` + `references/` + `scripts/` 目录结构，可被 Claude Code、Codex、Cursor、Gemini CLI、opencode 等读取）的工作流技能包。它解决的问题是：给 AI coding agent 一个网站 URL（或截图），让 agent 自动化完成「侦察 → 提取 → 重建 → 校验」的全流程，把目标网站复刻成可运行的前端代码（通常是 Next.js / React + Tailwind），而不是让模型凭截图"看图猜样式"。

这类 skill 的核心方法论在各实现中高度一致：

- **以线上页面为 ground truth**：通过浏览器自动化（Playwright MCP、Chrome DevTools MCP、Firecrawl MCP、ego-browser 等）抓取真实 DOM、`getComputedStyle()` 计算样式、字体、动画 keyframes、资源文件，而不是从截图目测。
- **分阶段流水线**：典型为侦察（截图 + 设计 token 提取 + 交互扫描）→ 基础设施（字体/颜色/全局 CSS/资源下载）→ 组件规格文件 → 并行构建（worktree + sub-agent）→ 组装与视觉 diff QA。
- **强调行为复刻**：不只克隆静态外观，还要识别交互模型（scroll-driven vs click-driven）、hover 状态、滚动动画、平滑滚动库（Lenis 等）。
- **内置合规与安全警示**：主流实现都明确声明不得用于钓鱼/仿冒，提醒字体与素材的版权风险；部分实现（如 clone-ui）内置了针对抓取内容的 prompt injection 防护规则。

适用边界：只克隆**前端表现层**（视觉 + 交互），不克隆后端、数据库、鉴权等真实业务逻辑。

## 主要实现/榜单

### 1. JCodesMore/ai-website-cloner-template —— 目前最流行

- 地址：https://github.com/JCodesMore/ai-website-cloner-template
- 热度：⭐ 33,211 / fork 4,847（GitHub API，2026-08-27 快照），MIT，官方 GitHub Template 仓库
- 功能：GitHub 模板仓库，内置 `/clone-website` skill + Next.js 16 (App Router) + React 19 + shadcn/ui + Tailwind v4 脚手架。五阶段流水线：Reconnaissance → Foundation → Component Specs（`docs/research/components/` 规格文件，含精确计算样式）→ Parallel Build（git worktree 中每 section 一个 builder agent）→ Assembly & QA（视觉 diff）。支持一次传多个 URL 并行克隆。官方宣称 13 个 agent 平台可用（Claude Code、Codex、Cursor、Gemini CLI、Copilot、Cline、Windsurf、Kiro 等），最佳搭配为 Claude Code + Opus 5。`AGENTS.md` 为单一事实源，sync 脚本生成各平台副本。
- 接入方式：
  1. GitHub 页面点 **Use this template** 创建自己的仓库（官方明确要求不要直接 clone 模板做项目）
  2. `git clone https://github.com/YOUR-USERNAME/YOUR-NEW-REPOSITORY.git && cd YOUR-NEW-REPOSITORY`
  3. `npm install`（需 Node.js 24+）
  4. 启动 agent，如 `claude --chrome`
  5. 运行 `/clone-website <target-url1> [<target-url2> ...]`
- 局限：绑定其内置的 Next.js + shadcn 脚手架；克隆的是前端表现层，无后端；README 明确禁止钓鱼、冒充他人设计、违反目标站 ToS。

### 2. clone-website（julianromli）—— Firecrawl MCP 路线，市场分发最广

- 地址：
  - GitHub 仓库（ai-skills 集合之一）：https://github.com/julianromli/ai-skills （集合整体 ⭐ 183，2026-08-27 快照）
  - Smithery 页面：https://smithery.ai/skills/julianromli/clone-website
  - LobeHub 页面：https://lobehub.com/skills/julianromli-ai-skills-clone-website
  - MCPMarket 页面：https://mcpmarket.com/tools/skills/website-clone-replicate
- 功能：把目标 URL 转换为生产级 Next.js 16 + TypeScript 代码，三阶段工作流：Scrape（Firecrawl MCP，crawl 兜底）→ Analysis（组件拆解、design tokens、图片清单、提议的文件结构，需用户确认）→ Code Generation（按序输出 `app/globals.css`、`app/layout.tsx`、`components/landing/[Section].tsx` 等）。SKILL.md 内含完整的 `getComputedStyle()` 提取脚本、150 行复杂度预算规则、交互模型识别、"不要做什么"的失败教训清单。
- 接入方式：skill 为纯文件包，复制 `skills/clone-website/` 到 agent 的 skills 目录（如 `~/.claude/skills/`），或通过 Smithery / LobeHub 页面按提示安装；运行依赖 Firecrawl MCP + 任一浏览器 MCP（优先 Chrome MCP）。
- 局限：依赖 Firecrawl（需 API key，付费服务）；产出固定为 Next.js 16 栈；LobeHub 上有 agent 评价指出其引用了部分不存在的 assets/references 文件，跨 agent 可用性一般（单条评价，供参考）。

### 3. clone-any-website（braxtonROSE4）—— 自带评分基准的硬核实现

- 地址：https://github.com/braxtonROSE4/clone-any-website （⭐ 32 / fork 4，2026-08-27 快照，较新，创建于 2026-08）
- 功能：核心理念是「把线上站点当作可查询的 ground truth，而不是一张用眼睛估的图」，并且**用可评分的 benchmark 证明保真度**而非空口宣称。六阶段工作流（静态捕获 → 动效逆向 → 按站点类型选择重建路由 → 八维度评分验证 → 整站模式 → 发布合规检查）。评分脚本 `scripts/run_eval.sh` 对原站与克隆跑同一探针，按几何、排版、颜色、资源、字体、动画、mock 内容、视觉相似度八个维度打分，总分低于 90 或任一维度不达标即视为未完成。宣称在 arc.net、town.com、wisprflow.ai、landonorris.com 上实战验证（作者自述，未独立核实）。
- 接入方式：

  ```bash
  curl -fsSL https://raw.githubusercontent.com/braxtonROSE4/clone-any-website/main/install.sh | sh
  ```

  安装到 `~/.agents/skills/clone-website` 并 symlink 到 `~/.claude/skills/`、`~/.codex/skills/`；或手动 `git clone` 到对应 agent 的 skills 目录（目录名必须为 `clone-website`）。
- 局限：**运行时强绑定 ego lite browser（`ego-browser` CLI，仅 macOS）**，明确拒绝替换为 Playwright 或普通 headless Chrome——这是最明显的平台局限；评分视觉维度还需 Pillow。

### 4. website-cloner（neversight）—— Claude Code 多 sub-agent 编排

- 地址：https://lobehub.com/skills/neversight-skills_feed-website-cloner （LobeHub 评分 4.0/4 条评价）
- 功能：一个 `/clone-website <url>` slash command 编排 4 个专职 sub-agent：`website-screenshotter`（截图基线）、`website-extractor`（下载资源、提取颜色/排版/间距/动画）、`website-cloner`（生成 React + Tailwind + motion 单组件，自动检测框架，支持 Next.js / TanStack Start / Vite）、`website-qa-reviewer`（像素级对比，按 Critical/Major/Minor 分级，循环最多 5 轮直到 PERFECT）。任务产物放在 `.tasks/clone-{domain}/`。
- 接入方式：在 Claude Code 中 `/agents` 创建 4 个 sub-agent + 把 `assets/clone-website.md` 复制到 `.claude/commands/` + 配置 Playwright MCP（`npx -y @anthropic-ai/mcp-playwright`）。也可通过 LobeHub 的 agent-prompt 安装指引接入。
- 局限：设置步骤明显偏 Claude Code（`/agents`、`.claude/commands`、`~/.claude.json`），LobeHub 上有 Codex 用户评价其"在 Codex 上不可直接使用"；产出是单文件大组件，工程结构由注释分隔。

### 5. perfect-web-clone-skill（ericshang98）

- 地址：https://github.com/ericshang98/perfect-web-clone-skill （⭐ 177 / fork 16，MIT，2026-08-27 快照）
- 功能：自述为 "Pixel-perfect webpage cloning playbook. Paste a URL, get a measured Vite + React replica."——粘贴 URL 产出可度量的 Vite + React 复刻，面向 Claude Code。详细工作流未逐行核实（未抓取完整 SKILL.md），星数与描述来自 GitHub API/页面。
- 接入方式：git clone 到 skills 目录使用（具体命令未核实）。

### 6. clone-ui（santowilem）—— 多输入源 + 安全导向

- 地址：https://github.com/santowilem/skills/blob/main/skills/clone-ui/SKILL.md
- 功能：特点是**多输入源分层保真**：Tier A（浏览器 MCP + DOM + 计算样式，可达 pixel-perfect）/ Tier B（静态 WebFetch + 用户截图）/ Tier C（仅用户提供素材）/ Tier D（纯记忆，明确拒绝并提示用户）。七阶段流程 + 五道门禁验证（sanity → computed-style parity → 逐 section 视觉 diff → 对抗性 sub-agent 复审 → drift 报告 + lessons 追加）。维护 per-workspace `.clone-ui/lessons.md` 让同一目标的克隆逐轮变准。安全设计突出：抓取内容一律视为不可信 DATA、内置 prompt injection 模式检测硬门禁、默认剥离 `<script>`、不克隆登录后页面（除非用户明确选择并了解风险）、不静默修改用户 MCP/配置文件。
- 接入方式：纯文件包，复制 skill 目录到 agent skills 目录；强烈建议配合 chrome-devtools-mcp（README 提供手动粘贴的 JSON 配置片段，刻意不提供自动安装脚本）。
- 局限：输出形态灵活（适配用户现有技术栈），但 Tier D（无截图无 URL）场景明确只能产出"粗略草图"；chrome-devtools-mcp 单浏览器实例导致并行 sub-agent 会抢 tab，需隔离 context 或串行执行。

### 7. Mood-Global-Services/How-to-Clone-Website---Claude-Skills

- 地址：https://github.com/Mood-Global-Services/How-to-Clone-Website---Claude-Skills （⭐ 92 / fork 28，TypeScript，2026-08-27 快照）
- 功能：可复用的网站逆向 + 像素级重建模板，面向 Claude Code，提供 `/clone-website` 命令。细节未深入核实，作为同类模板的存在证据列出。

### 相邻的 SaaS 产品（非 skill，供对比）

这些不是 Agent Skill，而是直接面向用户的"URL → 代码"产品，可作为 skill 方案的竞品/替代参考：

- **CopyWeb**（https://copyweb.net/）：URL / 截图 / Figma / 文本提示 → React、Next.js、Vue、Tailwind、HTML，免费起步。
- **UXMagic AI Website Cloner**（https://uxmagic.ai/clone-any-website）：URL → 可编辑的 Figma 设计稿（保留设计系统/样式/布局）。
- **Alloy Website Cloner**（https://alloy.app/website-cloner）：粘贴 URL 或用浏览器扩展做 pixel-perfect 捕获，再用 AI 对话修改。
- **Same.new（SameNew）**：旧金山团队开发的 AI 开发平台，支持一键克隆网站 UI 并迭代交付（信息来自第三方介绍文章 https://www.xueqiuai.com/en/1329-html ，官网细节**未核实**）。

### 关于各市场的检索结论

- **skills.sh**：搜索页为前端渲染，本次未能直接列出 clone 类 skill 的榜单（未核实具体收录情况）；但 skills.sh 的 `npx skills add <owner/repo>` 是上述 GitHub skill 的通用安装通道，vercel-labs/skills 仓库（https://github.com/vercel-labs/skills）是其 CLI 实现。
- **ClawHub**：本次检索未找到 ClawHub 上专门的 website clone 类 skill 条目（**未核实是否收录**，可能因搜索词或市场收录范围所限）。ClawHub 的通用安装方式为 `npx clawhub@latest install <skill-name>` 或 `clawhub install <name>`（来源：https://clawlearnhub.com/day/5 、https://advenboost.com/openclaw-clawhub/）。
- **Smithery**：确认收录 julianromli/clone-website（见上文链接）。
- **LobeHub Skills**：确认收录 julianromli/clone-website 与 neversight/website-cloner（见上文链接）。
- **其他镜像市场**：explainx.ai、skills.palebluedot.live（SkillHub）、agentarea.ai、mcpmarket.com 均有 julianromli/clone-website 的镜像条目。

## 适用场景与建议

**适用场景**

- 自有站点迁移：把 WordPress / Webflow / Squarespace 老站重建成现代 Next.js 代码库（JCodesMore 模板明确将此列为首要场景）。
- 源码丢失恢复：网站在线但仓库丢失/开发者离职，从线上页面找回代码。
- 学习与研究：解构生产站点的布局、动画、响应式实现。
- 设计验证与原型：快速复刻参考站的 UI 作为内部原型起点。

**选择建议**

- 要**开箱即用 + 多 agent 兼容 + 热度最高**：选 JCodesMore/ai-website-cloner-template（33k stars，模板仓库形态，13 个平台）。
- 已有自己的 Next.js 脚手架、想要**纯 skill 包 + Firecrawl 抓取**：选 julianromli/clone-website（市场覆盖最广）。
- 追求**可量化保真度**（评分 benchmark）：选 braxtonROSE4/clone-any-website，但注意 ego-browser 仅 macOS。
- 深度使用 **Claude Code 且喜欢 sub-agent 编排**：选 neversight/website-cloner。
- 输入源不确定（可能只有截图）、重视**安全与注入防护**：选 santowilem/clone-ui。
- 不想装 agent、只要结果：直接用 CopyWeb / UXMagic / Alloy 等 SaaS。

**共同局限与风险（各实现 README/SKILL.md 自述）**

1. 只克隆前端表现层；后端、鉴权、实时功能、SEO、无障碍审计普遍标注为 out of scope。
2. 版权与合规：设计、文案、图片、字体版权归原站所有者；商用字体是最现实的 DMCA 风险点（braxtonROSE4 明确要求发布前替换为开源近似字体并 gitignore 原站素材）。多个实现明确禁止钓鱼与仿冒。
3. 登录后页面不可见：隔离浏览器 profile 抓不到登录态内容，需用户手动截图（clone-ui 对此有详细分级处理）。
4. 无限循环动画需相位归一化，否则探针抖动会被误报为位置误差（braxtonROSE4 实测记录）。
5. 目标站点会"漂移"：评分只对同一天探测的原站快照有意义。
6. 抓取第三方内容存在 prompt injection 攻击面，clone-ui 是目前检索到对此防护最系统的实现；使用其他 skill 时应自行注意。

## 参考来源

1. [braxtonROSE4/clone-any-website — GitHub](https://github.com/braxtonROSE4/clone-any-website)（README 全文 + GitHub API 星数）
2. [JCodesMore/ai-website-cloner-template — GitHub](https://github.com/JCodesMore/ai-website-cloner-template)（README 全文 + GitHub API 星数 33,211）
3. [julianromli/ai-skills — GitHub](https://github.com/julianromli/ai-skills)（仓库 README + GitHub API 星数 183）
4. [clone-website — Smithery](https://smithery.ai/skills/julianromli/clone-website)
5. [clone-website — LobeHub Skills](https://lobehub.com/skills/julianromli-ai-skills-clone-website)
6. [Clone Website Skill — MCPMarket](https://mcpmarket.com/tools/skills/website-clone-replicate)
7. [website-cloner（neversight）— LobeHub Skills](https://lobehub.com/skills/neversight-skills_feed-website-cloner)
8. [santowilem/skills — clone-ui/SKILL.md](https://github.com/santowilem/skills/blob/main/skills/clone-ui/SKILL.md)
9. [ericshang98/perfect-web-clone-skill — GitHub API](https://api.github.com/repos/ericshang98/perfect-web-clone-skill)（⭐ 177，MIT）
10. [Mood-Global-Services/How-to-Clone-Website---Claude-Skills — GitHub API](https://api.github.com/repos/Mood-Global-Services/How-to-Clone-Website---Claude-Skills)（⭐ 92）
11. [vercel-labs/skills（skills.sh / npx skills CLI）— GitHub](https://github.com/vercel-labs/skills)
12. [CopyWeb — AI Website Cloner](https://copyweb.net/)
13. [UXMagic AI Website Cloner](https://uxmagic.ai/clone-any-website)
14. [Alloy Free AI Website Cloner](https://alloy.app/website-cloner)
15. [SameNew 第三方介绍 — xueqiuai.com](https://www.xueqiuai.com/en/1329-html)（细节未核实）
16. [OpenClaw ClawHub 指南 — advenboost.com](https://advenboost.com/openclaw-clawhub/)（ClawHub 安装方式）
17. [OpenClaw Learn Hub Day 5](https://clawlearnhub.com/day/5)（ClawHub 一键安装流程）
