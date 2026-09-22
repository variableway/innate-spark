# shadcn-skills 调研：shadcn/ui 生态中的 AI Agent Skill

> 调研时间：2026-08-27。所有结论基于公开搜索结果，来源见文末；未能交叉验证的信息已标注「未核实」。

## 概述

shadcn/ui 官方在 2026 年已将 **Agent Skill**（遵循 [skills.sh](https://skills.sh) 开放 SKILL.md 标准的「技能包」）纳入官方分发渠道：主仓库 `shadcn-ui/ui` 内置 `skills/shadcn/SKILL.md`，官方文档站有专门的 [Skills 页面](https://ui.shadcn.com/docs/skills)。其思路是：skill 在运行时读取项目的 `components.json` 并执行 `shadcn info --json`，把框架、Tailwind 版本、别名、base library（base/radix/aria）、图标库、已安装组件等项目上下文注入 AI 助手，从而让组件安装、组合、主题定制「一次写对」。

生态分布大致分三层：

1. **官方/半官方**：shadcn/ui（React）、shadcn-svelte、shadcn-vue 三个官方仓库各自维护 skill，通过 `skills` CLI（skills.sh 的安装器）一键安装。
2. **社区高质量实现**：如 Google Labs 的 `stitch-skills/shadcn-ui`、面向 Claude Code 的 `capraidev/shadcn-claude-skill` 等，多为「文档知识包」型 skill。
3. **Skill 市场分发**：skills.sh、ClawHub（OpenClaw 生态）、LobeHub、Skillselion 等市场上存在大量第三方 shadcn 相关 skill（组件安装、Tailwind v4 迁移、主题定制等），质量参差，部分市场页带有安全扫描结论。

## 主要实现/榜单

### 1. shadcn（官方，React）

- 地址：[github.com/shadcn-ui/ui/tree/main/skills/shadcn](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md)；文档：[ui.shadcn.com/docs/skills](https://ui.shadcn.com/docs/skills)
- 功能：项目上下文注入（`shadcn info --json`）、完整 CLI 参考（`init` / `add` / `search` / `view` / `docs` / `diff` / `info` / `build`）、主题定制（CSS variables、OKLCH、dark mode，覆盖 Tailwind v3/v4）、Registry 编写指南、shadcn MCP Server 配置。检测到 `components.json` 时自动激活；强制组合规范（`FieldGroup`、`ToggleGroup`、语义色等）。
- 接入方式：`pnpm dlx skills add shadcn/ui`（npm/yarn/bun 等价命令见文档）；也可手动复制 `skills/shadcn/` 到各 agent 的 skills 目录。多个第三方目录（Awesome Skills、AI UX Playground 等）给出的 `npx skills add ... --skill shadcn` 变体与之同源。
- 适用场景：所有使用 shadcn/ui 的 React/Next.js 项目，是生态的「基准实现」。

### 2. shadcn-svelte（官方）

- 地址：[github.com/huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte)；文档：[shadcn-svelte.com/docs/skills](https://www.shadcn-svelte.com/docs/skills)
- 功能：与官方 React 版结构一致——读取 `components.json`、Svelte 版 CLI（`init`/`add`/`registry build`）、主题定制、Registry 编写；强调 Svelte 5 runes、Bits UI API、`Field.Group` 组合规范。
- 接入方式：`npx skills add huntabyte/shadcn-svelte`（pnpm/bun 等价命令见文档）。
- 热度（来自 Skillselion 目录，未与官方数据交叉验证）：约 2.5k–3.9k 次 skills.sh 安装，仓库约 9.1k stars。

### 3. shadcn-vue（官方）

- 地址：[github.com/unovue/shadcn-vue](https://github.com/unovue/shadcn-vue)；文档：[shadcn-vue.com/docs/skills](https://www.shadcn-vue.com/docs/skills)（抓取时页面返回 500，内容以搜索快照与第三方目录为准）
- 功能：管理 shadcn-vue 组件与项目——添加、搜索、修复、调试、样式与组合；基于 Reka UI + Tailwind CSS v4，同样以 `components.json` 做项目检测。
- 接入方式：`pnpm dlx skills add unovue/shadcn-vue`（官方文档快照），或 `npx skills add https://github.com/unovue/shadcn-vue --skill shadcn-vue`（Remote OpenClaw 目录）。
- 热度（Skillselion，未核实）：仓库约 10.5k stars、约 4k 次安装。

### 4. stitch-skills/shadcn-ui（Google Labs）

- 地址：[github.com/google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills)（`shadcn-ui` skill）；目录页：[explainx.ai](https://explainx.ai/skills/google-labs-code/stitch-skills/shadcn-ui)、[skills-hub.ai](https://skills-hub.ai/skills/google-labs-shadcn-ui)
- 功能：面向 shadcn/ui 的组件发现、安装、定制与最佳实践指导（知识包型，不含项目上下文注入）。
- 接入方式：`npx skills add https://github.com/google-labs-code/stitch-skills --skill shadcn-ui`；兼容 Claude Code / Cursor / Cline / Windsurf / Codex / Goose / Copilot / Zed。

### 5. shadcn-claude-skill（社区，Claude Code 专用）

- 地址：[github.com/capraidev/shadcn-claude-skill](https://github.com/capraidev/shadcn-claude-skill)，版本 2.0.0
- 功能：面向 Next.js App Router 的深度知识包，含 9 个 reference 文档（CLI/配置、组件目录、组合模式、RHF+Zod 表单、TanStack Table 数据表、Recharts 图表、Blocks、主题与暗色模式、无障碍）和 4 个完整示例 tsx。偏「教学型参考库」，不依赖 shadcn CLI 运行时注入。
- 接入方式：手动复制 `shadcn-ui/` 目录到项目 `.claude/skills/`（项目级）或 `~/.claude/skills/`（全局）。

### 6. ClawHub / OpenClaw 生态的 shadcn skill

- `shadcn-ui`（ClawHub）：安装命令 `npx clawhub@latest install shadcn-ui`（见 [Coda One 目录](https://www.codaone.ai/skills/shadcn)）；OpenClaw 网关安装到 `~/.openclaw/skills/shadcn-ui/`（[openclaw-easy.com](https://openclaw-easy.com/skills/shadcn-ui.html)）。内容为组件安装、RHF+Zod 表单、Tailwind 样式等指导。注意：ClawHub 上存在多个同名/近似的社区上传版本（如 [wpank/shadcn](https://clawhub.ai/wpank/shadcn)、[jgarrison929/shadcn-ui](https://clawhub.ai/jgarrison929/shadcn-ui)），非官方维护，安装前应看其安全扫描结论。
- `Tailwind v4 Shadcn`（[clawhub.ai/skills/tailwind-v4-shadcn](https://clawhub.ai/skills/tailwind-v4-shadcn)）：专注 Tailwind v4 + shadcn/ui 项目搭建/迁移，含现成模板；该页安全扫描结论为「内容自洽、无提权请求」，但建议核实作者来源。
- `developer-kit-shadcn-ui`（经 [useai.live](https://useai.live/sites/33789.html) 收录）：中文社区分发的网页/组件设计指引 skill，`clawhub install developer-kit-shadcn-ui`。未核实其维护者与质量。

### 7. 组合型（meta-skill）

- `no-code-frontend-builder` / `frontend-builder`（[LobeHub](https://lobehub.com/zh/skills/openclaw-skills-frontend-builder)、[ClawHub](https://clawhub.ai/h4gen/skills/frontend-builder)）：把自然语言 UI 需求转成可运行的 React `.tsx`，内部编排 `frontend-design-ultimate` + `shadcn-ui` + `react-expert` 三个上游 skill，适合非程序员出原型。依赖上述 skill 先行安装。

### 8. 其他相关

- `shadcn-vue-skilld`（[harlan-zw/vue-ecosystem-skills](https://lobehub.com/ar/skills/harlan-zw-vue-ecosystem-skills-shadcn-vue-skilld)，Vue 生态）：组件添加/定制、Vue 3 + Composition API + SSR 集成，明确覆盖「从旧版 shadcn-vue 迁移」场景。
- shadcndesign「Agent Skills」（[shadcndesign.com/agent-skills](https://www.shadcndesign.com/agent-skills)）：商业产品，10 个围绕 shadcn/ui Figma kit 的设计→代码 skill，偏付费设计工作流，非开源 SKILL.md。细节未深入核实。

## 适用场景与建议

- **React/Next.js 项目首选官方 skill**：`pnpm dlx skills add shadcn/ui` 一条命令即可，且是唯一利用 `shadcn info --json` 做项目上下文注入、并覆盖 Registry 编写与 MCP Server 的实现。配合 shadcn MCP Server 可进一步获得 registry 搜索/浏览/安装能力。
- **Svelte/Vue 项目**分别用 `huntabyte/shadcn-svelte`、`unovue/shadcn-vue` 的官方 skill，命令同构（`npx skills add <org>/<repo>`）。
- **需要「离线知识库」式深度参考**（如让 Claude Code 掌握表单/数据表/图表的完整范式）时，可叠加 `capraidev/shadcn-claude-skill` 这类文档型 skill；它与官方 skill 不冲突，但内容可能滞后于 shadcn 最新版本。
- **Tailwind v3 → v4 迁移 / 新项目脚手架**：可考虑 ClawHub 的 `Tailwind v4 Shadcn`，但 ClawHub 社区上传版本非官方维护，安装前务必阅读其安全扫描与 SKILL.md 全文。
- **给非工程师的自然语言建页面**：用 `frontend-builder` 类 meta-skill，但需同时安装其依赖的 shadcn-ui skill。
- **对本项目（AI Agents Atlas）的启示**：官方 skill 的「`components.json` 检测 → `shadcn info --json` 上下文注入 → CLI/MCP 组件发现 → 组合规范强制」四步机制，是「框架类 skill」的范本；若 Atlas 收录 skill，建议以官方三件套（react/svelte/vue）为基准条目，社区实现标注维护状态与安装量。

## 参考来源

- [Skills — shadcn/ui 官方文档](https://ui.shadcn.com/docs/skills)
- [shadcn-ui/ui 仓库 skills/shadcn/SKILL.md](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md)
- [Skills — shadcn-svelte 官方文档](https://www.shadcn-svelte.com/docs/skills)
- [Skills — shadcn-vue 官方文档](https://www.shadcn-vue.com/docs/skills)
- [shadcn-svelte — Skillselion（安装量数据）](https://skillselion.com/skills/huntabyte/shadcn-svelte)
- [Best shadcn/ui skills for AI coding (2026) — Skillselion](https://skillselion.com/design/shadcn-ui)
- [shadcn-vue — Remote OpenClaw Skills Directory](https://www.remoteopenclaw.com/skills/unovue/shadcn-vue/shadcn-vue)
- [stitch-skills/shadcn-ui — explainx.ai](https://explainx.ai/skills/google-labs-code/stitch-skills/shadcn-ui)
- [shadcn-ui — skills-hub.ai](https://skills-hub.ai/skills/google-labs-shadcn-ui)
- [capraidev/shadcn-claude-skill — GitHub README](https://github.com/capraidev/shadcn-claude-skill/blob/main/README.md)
- [Shadcn UI for Claude Code — mdskills.ai](https://www.mdskills.ai/skills/shadcn-ui)
- [Shadcn UI — Coda One（ClawHub 安装命令）](https://www.codaone.ai/skills/shadcn)
- [Shadcn Ui — OpenClaw Easy](https://openclaw-easy.com/skills/shadcn-ui.html)
- [Tailwind v4 Shadcn — ClawHub](https://clawhub.ai/skills/tailwind-v4-shadcn)
- [no-code-frontend-builder — LobeHub](https://lobehub.com/zh/skills/openclaw-skills-frontend-builder)
- [Frontend Builder — ClawHub](https://clawhub.ai/h4gen/skills/frontend-builder)
- [shadcn-vue-skilld — LobeHub](https://lobehub.com/ar/skills/harlan-zw-vue-ecosystem-skills-shadcn-vue-skilld)
- [Agent Skills — shadcndesign](https://www.shadcndesign.com/agent-skills)
- [skills.sh 安装增长分析 — skywork.ai](https://skywork.ai/skypage/en/shadcn-ai-skill-component-development/2064626818692874240)
