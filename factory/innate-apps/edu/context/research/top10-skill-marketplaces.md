# Top 10 AI Skill Marketplace（AI Agent Skill 市场/平台网站）调研

> 调研时间：2026-08-27。所有数据均来自公开搜索结果，关键数字尽量交叉验证；不同来源口径不一致处已标注。注意「Skill 市场」当前分两类：**SKILL.md 格式的 Agent Skills 市场**（Anthropic 2025 年底提出的开放标准）和 **MCP Server 目录/注册中心**（Model Context Protocol 服务市场），两者都是「给 Agent 装能力」的分发渠道，本榜单混合收录并分别标注。

## 概述

自 Anthropic 发布 Agent Skills（SKILL.md）开放标准以来，Agent 技能分发渠道在 2026 年快速膨胀：Vercel 推出 skills.sh 并配套 `npx skills` CLI，OpenClaw 生态的 ClawHub 注册技能超 2 万，LobeHub / SkillsMP / agentskill.sh 等聚合站通过爬取 GitHub 把目录规模做到 10 万~80 万级。MCP 一侧，官方注册中心（Official MCP Registry）已收录 2 万+ 服务器，Smithery、MCP.so、PulseMCP 是三大社区目录。普遍隐忧是安全：据 [Agensi 引用的审计数据](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026)，对 skills.sh、ClawHub、GitHub、Tessl 上 22,511 个 skill 的审计发现 140,963 个问题（平均每个 skill 6.3 个），Snyk 的 ToxicSkills 研究称 36% 受测 skill 存在 prompt injection——安装第三方 skill 前务必自行审计。

## 榜单汇总表

| # | 名称 | 网址 | 类型 | 规模（数量级） | 安装方式 |
|---|------|------|------|----------------|----------|
| 1 | Skills.sh | https://skills.sh | SKILL.md 市场 + CLI（Vercel） | 87,000+ 已追踪 skill | `npx skills add <owner/repo>` |
| 2 | ClawHub | https://www.clawhub.ai | SKILL.md 注册中心（OpenClaw 生态） | 20,000+ skill | `npx clawhub@latest install <name>` |
| 3 | LobeHub Skills | https://lobehub.com/skills | SKILL.md 聚合市场 | 169,000+ skill | `npx -y @lobehub/market-cli skills install <name> --agent claude-code` |
| 4 | SkillsMP | https://skillsmp.com | SKILL.md 聚合搜索（爬取 GitHub） | 425,000 ~ 800,000+ skill | 网站浏览 + 下载 ZIP / 复制安装命令 |
| 5 | agentskill.sh | https://agentskill.sh | SKILL.md 市场（多 Agent 适配） | 110,000+ skill | Claude Code `/plugin marketplace add` 或复制命令 |
| 6 | Anthropic 官方 skills | https://github.com/anthropics/skills | 官方参考仓库（SKILL.md 标准源头） | ~20 个精选 skill | Claude Code `/plugin marketplace add anthropics/skills` |
| 7 | Smithery | https://smithery.ai | MCP Server 注册中心 + 托管 | 8,000+ server | `npx @smithery/cli install <pkg> --client claude` |
| 8 | Official MCP Registry | https://registry.modelcontextprotocol.io | MCP 官方注册中心（元数据上游） | 21,700+ server | REST API 只读查询；发布用 `mcp-publisher` CLI |
| 9 | MCP.so | https://mcp.so | MCP 社区目录 | 14,000 ~ 17,000 server | 网站浏览，复制各 client 的安装配置 |
| 10 | PulseMCP | https://www.pulsemcp.com | MCP 目录 + 新闻/API | 6,000+ server（2025-09 口径） | 网站浏览，复制安装配置；另有 PulseMCP API |

## 逐条说明

### 1. Skills.sh —— Vercel 系的 Skill 包管理器

- 网址：https://skills.sh
- 定位/特色：Vercel（vercel-labs）推出的「Agent Skills 版 npm」，2026 年 1 月上线后迅速成为最显眼的 skill 分发枢纽。自我定位为「The Open Agent Skills Ecosystem」，提供公开 leaderboard、安装量追踪、跨 40+ 种 Agent（Claude Code、Cursor、Codex、Copilot、OpenCode 等）的统一安装协议。社区驱动、无正式审核，质量参差（[KDnuggets](https://www.kdnuggets.com/top-5-agent-skill-marketplaces-for-building-powerful-ai-agents)、[Agensi 对比文](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026)）。
- 规模：上线以来累计追踪 87,000+ 个独立 skill（KDnuggets 2026-04 数据）；Agensi 文章口径为「约 2,000 个上架」，两者统计口径不同（追踪 vs 上架），数量级以万计。
- 接入方式：统一 CLI，自动检测本机已装的 agent 并写入对应 skills 目录：
  ```bash
  # 安装某个 GitHub 仓库中的 skill（对所有检测到的 agent 生效）
  npx skills add <owner/repo>
  # 指定仓库内某个 skill
  npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
  # 全局安装 / 指定 agent（如 claude-code）
  npx skills add <owner/repo> -g -a claude-code
  ```
  另有 VS Code 系编辑器扩展「[Skills.sh — Agent Skills Manager](https://marketplace.visualstudio.com/items?itemName=AbelMak.skills-sh)」，支持在 IDE 侧边栏浏览/安装。

### 2. ClawHub —— OpenClaw 生态的官方 Skill 注册中心

- 网址：https://www.clawhub.ai （CLI 默认 registry，可用 `CLAWHUB_REGISTRY` 环境变量覆盖）
- 定位/特色：随 OpenClaw 于 2025 年底上线，类似 npm 的社区驱动市场：发布、搜索、版本管理、下载统计、社区评分，上架前经 VirusTotal 扫描；listing 元数据丰富（使用量、安装量、安全扫描结果、许可证、运行时要求）（[KDnuggets](https://www.kdnuggets.com/top-5-agent-skill-marketplaces-for-building-powerful-ai-agents)、[digitalapplied 开发者指南](https://www.digitalapplied.com/blog/clawhub-skills-marketplace-developer-guide-2026)）。
- 规模：20,000+ 注册 skill，200+ 话题标签。
- 接入方式：
  ```bash
  # 搜索 / 检查 / 安装
  npx clawhub@latest search <关键词>
  npx clawhub@latest inspect <name> --json   # 先看安全扫描与元数据
  npx clawhub@latest install <name>          # 例：npx clawhub@latest install sonoscli
  # 发布需先认证
  clawhub login && clawhub whoami
  ```
  注意：部分 ClawHub 管理操作依赖 `openclaw-agent` 本地组件（[lobehub 上的 clawhub skill 说明](https://lobehub.com/zh/skills/openclaw-skills-clawwhub)）。在 Claude Code / Kimi Code 等 agent 中，也可通过 `npx skills add agentskillexchange/skills --skill clawhub-skill-discovery-publishing` 安装「ClawHub 发现与发布」skill 后由 agent 代为操作。

### 3. LobeHub Skills —— 最产品化的聚合市场

- 网址：https://lobehub.com/skills
- 定位/特色：LobeHub（原 LobeChat 生态）旗下的 skill 市场，UI 打磨最好，支持多语言、版本历史、相关推荐，并与 LobeHub 的 MCP Server 目录、Agent 体系打通。内容是聚合（scraped）为主、辅以质量检查与社区反馈（[KDnuggets](https://www.kdnuggets.com/top-5-agent-skill-marketplaces-for-building-powerful-ai-agents)）。
- 规模：169,739 个索引 skill（KDnuggets 2026-04；[Agensi 文章](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026)口径 169,000+，可交叉印证）。
- 接入方式：
  ```bash
  # CLI 安装到指定 agent（支持 claude-code 等）
  npx -y @lobehub/market-cli skills install <skill-name> --agent claude-code
  ```
  也支持「把安装提示词直接发给 agent」的 agent-native 安装方式（每个 skill 页面提供 Agent prompt，如 `Curl https://lobehub.com/skills/<id>/skill.md, then follow the instructions ...`），对 Kimi Code / Claude Code 这类对话式 agent 友好。

### 4. SkillsMP —— 最大的爬取型搜索层

- 网址：https://skillsmp.com
- 定位/特色：从公开 GitHub 仓库聚合 SKILL.md skill 的搜索发现层，基于开放 SKILL.md 标准，提供 AI 语义搜索、分类、一键安装命令，支持 npx / bunx / pnpm 等 runner，覆盖 Claude Code、Codex CLI、ChatGPT 等工具。只收录 ≥2 star 的仓库作为最低质量门槛，其余需自行审计（[KDnuggets](https://www.kdnuggets.com/top-5-agent-skill-marketplaces-for-building-powerful-ai-agents)、[Agensi](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026)）。
- 规模：官网口径 425,000+（KDnuggets 2026-04）；Agensi 2026-08 口径 800,000+。数字膨胀快但含大量弃置/重复仓库，参考价值有限。
- 接入方式：**无官方 CLI/自动安装器**。网站浏览 → 复制给出的安装命令，或直接下载 skill 的 ZIP 包解压到 agent 的 skills 目录。

### 5. agentskill.sh —— 多 Agent 适配的实用市场

- 网址：https://agentskill.sh
- 定位/特色：主打「快速发现 + 快速安装」，宣称支持 110,000+ skill、20+ AI 工具（Claude Code、Cursor、Copilot、Windsurf、Zed 等）；listing 带安全评分与审计细节，是少数在聚合站里做安全信号展示的（[KDnuggets](https://www.kdnuggets.com/top-5-agent-skill-marketplaces-for-building-powerful-ai-agents)）。
- 规模：110,000+ skill。
- 接入方式（Claude Code plugin 协议）：
  ```
  /plugin marketplace add https://agentskill.sh/marketplace.json
  /plugin install learn@agentskill-sh
  ```
  其余 agent 走网页复制安装命令。

### 6. Anthropic 官方 skills（anthropics/skills）—— 标准源头

- 网址：https://github.com/anthropics/skills
- 定位/特色：Anthropic 官方维护的 Agent Skills 公开仓库，SKILL.md 规范的「参考实现」：含文档处理四件套（docx / pdf / pptx / xlsx）、创意设计、开发技术、企业沟通等示例，以及 `spec/`（Agent Skills 规范）、`template/`（skill 模板）和 `skill-creator` 元技能。免费、MIT 许可、每个 skill 经 Anthropic 内部审核（[Agensi](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026)、[GitHub 仓库镜像说明](https://gitee.com/anthropics_lgc/skills)）。
- 规模：约 20 个精选 skill；GitHub 星数约 16.7 万（[LimeDock](https://www.limedock.com/directories/anthropics-skills) 数据，单一来源、未二次核实）。
- 接入方式（Claude Code 原生）：
  ```
  /plugin marketplace add anthropics/skills
  /plugin install document-skills@anthropic-agent-skills   # 文档技能包
  /plugin install example-skills@anthropic-agent-skills    # 示例技能包
  ```
  其他兼容 SKILL.md 的 agent（含 Kimi Code、Cursor 等）可直接 clone 仓库、把对应 skill 文件夹拷入本 agent 的 skills 目录。

### 7. Smithery —— MCP 界的「Docker Hub」

- 网址：https://smithery.ai （registry API: registry.smithery.ai）
- 定位/特色：MCP Server 注册中心 + 统一网关 + 托管平台：除搜索/发布外，还提供连接生命周期管理、OAuth、凭证托管、scoped token、远程托管，被多篇对比文称为「最接近 Docker Hub 的 MCP 平台」（[TrueFoundry](https://www.truefoundry.com/blog/best-mcp-registries)、[QVeris](https://qveris.ai/guides/mcp-registry-comparison/)）。
- 规模：8,018 个 server（[agenteconomy.to 2026-08-15 全量爬取](https://agenteconomy.to/stats/how-many-mcp-servers-are-there)）；TrueFoundry 称 7,000+，量级吻合。
- 接入方式（CLI 支持 `--client claude` / cursor / windsurf 等）：
  ```bash
  # 免安装直接运行
  npx @smithery/cli install <server-name> --client claude
  # 或全局安装（需 Node.js 20+）
  npm install -g @smithery/cli@latest
  ```
  对不直接支持的 agent，可用其托管远程 endpoint 手动写入各 agent 的 MCP 配置 JSON。其 CLI 现也支持 skill：`npx skills add smithery/cli`（[@smithery/cli npm 页](https://www.npmjs.com/package/@smithery/cli)）。

### 8. Official MCP Registry —— 官方元数据上游

- 网址：https://registry.modelcontextprotocol.io （文档：https://modelcontextprotocol.io/registry/faq ）
- 定位/特色：MCP 项目官方的社区共治注册中心，2025 年 9 月 preview 上线。只做标准化的 server 元数据（`server.json`、命名空间所有权验证、只读 REST API），**不托管包、不做私仓、不承诺安全扫描**，定位为下游聚合器（Smithery、PulseMCP、Glama 等）的上游事实源（[OpenHelm](https://openhelm.ai/blog/mcp-registry-directory-guide)、[QVeris](https://qveris.ai/guides/mcp-registry-comparison/)）。
- 规模：21,718 个 server（agenteconomy.to 2026-08-15，全量 registry walk）。
- 接入方式：
  - 消费侧：REST API `GET https://registry.modelcontextprotocol.io/v0/servers` 查询，再按 manifest 里的包信息安装到 agent；多数用户实际通过下游目录（Smithery/PulseMCP）间接使用。
  - 发布侧：官方 `mcp-publisher` CLI，GitHub 设备码认证（`mcp-publisher login github`），一次发布即可被各聚合目录同步（[30DayPivot 实操指南](https://30daypivot.com/mcpserverops_spoke_listing)）。

### 9. MCP.so —— 最大的社区 MCP 目录之一

- 网址：https://mcp.so
- 定位/特色：社区驱动的 MCP Server/Client 目录，收录量大、分类浏览 + 各 client 的安装配置片段，是中文社区文章中最常被推荐的 MCP 资源站之一（[Ginger Labs 对比文](https://gingerlabs.ai/blog/find-evaluate-mcp-servers-smithery-glama-mcp-so)、[今日头条 MCP 资源站盘点](https://www.toutiao.com/w/1827445947668489/)）。
- 规模：14,456 项（[东方财富证券研报 2026-01](https://pdf.dfcfw.com/pdf/H3_AP202602051819786202_1.pdf?1770305882000.pdf)）；学术统计 16,592 项（[hou2025mcp 论文，2025-09 口径](https://xinyi-hou.github.io/files/hou2025mcp_1.pdf)）。当前实时数字未核实，量级为 1.5 万上下。
- 接入方式：无自有 CLI。在网站找到 server 后，复制其提供的安装命令/JSON 配置到 Claude Code（`claude mcp add`）、Cursor（`mcp.json`）等 client。

### 10. PulseMCP —— 目录 + 新闻 + API 的老牌站点

- 网址：https://www.pulsemcp.com
- 定位/特色：最早一批 MCP 目录，特点是「目录 + 每周生态新闻 + 商业化的 Registry API」。数据来源为人工提交 + 爬虫 + 官方 Registry 集成 + 人工策展（[PulseMCP API 页](https://www.pulsemcp.com/api)）；其对「MCP 服务器总下载量 6700 万次」等统计被行业文章广泛引用（[Nordic APIs](https://nordicapis.com/10-interesting-mcp-statistics/)）。
- 规模：6,072 个 server（hou2025mcp 论文 2025-09 口径）；当前数字未核实，预计已显著增长。
- 接入方式：网站浏览、复制安装配置到各 MCP client；另有 [PulseMCP API](https://www.pulsemcp.com/api) 和一个社区维护的 PulseMCP MCP Server（`orliesaurus/pulsemcp-server`）可让 agent 直接搜索目录。

## 其他值得关注（未进 Top 10）

- **Agensi**（https://www.agensi.io ）：付费 + 免费 SKILL.md 市场，每个 skill 上架前做 8 项安全扫描，创作者 80/20 分成，Pro 订阅（$9/月）提供全目录 MCP 在线访问。目录仅 200+，但审核最严。
- **ClaudeSkills.info**：658+ 免费 skill，含 Anthropic 官方套件，社区贡献，适合 Claude Code 新手。
- **Glama**（https://glama.ai/mcp/servers ）：MCP 目录，9,000+ server（2025-09 口径），带安全/质量检查徽章。
- **Cursor Directory**（https://cursor.directory ）：Cursor 生态的 rules/MCP 索引，多为 `.cursorrules` 而非完整 SKILL.md。
- **Claude Code plugin marketplaces**（claudemarketplaces.com 索引）：2,500+ 个 GitHub 形式的 plugin marketplace 仓库，质量跨度极大。
- **awesome-claude-code-skills**（GitHub awesome list）：零策展、量大，适合已知目标的检索。

## 适用场景与建议

- **想要「命令一行装上」的体验**：优先 Skills.sh（`npx skills add`）或 ClawHub（`npx clawhub install`），两者对 Claude Code / Cursor / Codex / Kimi Code 等 SKILL.md 兼容 agent 都有成熟 CLI 路径。
- **做大目录检索/竞品调研**：SkillsMP、LobeHub、agentskill.sh 是爬虫聚合路线，适合「找灵感」，但每个 skill 安装前必须自行审计（prompt injection 比例不低，见概述中的审计数据）。
- **要权威、要安全基线**：Anthropic 官方 `anthropics/skills` + 官方 MCP Registry 是各自标准的事实源头，适合作为自建 skill / 选型参考的基准。
- **接外部工具/数据源（而非注入流程知识）**：走 MCP 一侧——Smithery（托管 + OAuth 最省心）、MCP.so/PulseMCP（目录浏览）、官方 Registry（程序化查询）。
- **企业/团队场景**：关注有安全扫描与付费责任的 Agensi，或自建私有 registry（ClawHub 支持 `--registry` 覆盖、MCP Registry 开源可自部署）。
- **对 Kimi Code 的接入提示**：Kimi Code 原生支持 SKILL.md skills 目录与 MCP 配置，因此 Skills.sh / LobeHub 的 CLI 安装结果（写入本地 skills 目录）和 MCP 各目录给出的 JSON 配置都可直接复用；`/plugin marketplace` 命令为 Claude Code 专有。

## 参考来源

- [7 AI Agent Skills Marketplaces in 2026 (Compared) — Agensi](https://www.agensi.io/learn/best-ai-agent-skills-marketplaces-2026)
- [Top 5 Agent Skill Marketplaces for Building Powerful AI Agents — KDnuggets](https://www.kdnuggets.com/top-5-agent-skill-marketplaces-for-building-powerful-ai-agents)
- [skills.sh 官网](https://skills.sh) / [Skills.sh VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=AbelMak.skills-sh)
- [ClawHub Skills Marketplace Developer Guide 2026 — digitalapplied](https://www.digitalapplied.com/blog/clawhub-skills-marketplace-developer-guide-2026) / [lobehub: clawhub skill 说明](https://lobehub.com/zh/skills/openclaw-skills-clawwhub)
- [How many MCP servers are there? — agenteconomy.to](https://agenteconomy.to/stats/how-many-mcp-servers-are-there)
- [Best MCP Registries in 2026 — TrueFoundry](https://www.truefoundry.com/blog/best-mcp-registries)
- [MCP Registry vs Smithery vs Glama — QVeris](https://qveris.ai/guides/mcp-registry-comparison/)
- [MCP Registry & Directory Guide — OpenHelm](https://openhelm.ai/blog/mcp-registry-directory-guide)
- [How to List Your MCP Server: Official Registry, PulseMCP & Smithery — 30DayPivot](https://30daypivot.com/mcpserverops_spoke_listing)
- [anthropics/skills 仓库说明（镜像）](https://gitee.com/anthropics_lgc/skills) / [LimeDock: anthropics/skills](https://www.limedock.com/directories/anthropics-skills)
- [@smithery/cli — npm](https://www.npmjs.com/package/@smithery/cli)
- [How to Find and Evaluate MCP Servers on Smithery, Glama, and MCP.so — Ginger Labs](https://gingerlabs.ai/blog/find-evaluate-mcp-servers-smithery-glama-mcp-so)
- [MCP 资源站盘点 — 今日头条](https://www.toutiao.com/w/1827445947668489/) / [MCP 收录规模研报（东方财富 PDF）](https://pdf.dfcfw.com/pdf/H3_AP202602051819786202_1.pdf?1770305882000.pdf)
- [PulseMCP API](https://www.pulsemcp.com/api) / [10 Interesting MCP Statistics — Nordic APIs](https://nordicapis.com/10-interesting-mcp-statistics/)
- [MCP server collection 统计论文（hou2025mcp）](https://xinyi-hou.github.io/files/hou2025mcp_1.pdf)
- [Agent Skills Marketplace (Skills.sh) 安全分析 — Virtual Uncle](https://virtualuncle.com/agent-skills-marketplace-skills-sh-2026/)
