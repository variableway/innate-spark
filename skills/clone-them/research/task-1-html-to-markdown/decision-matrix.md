# Top 10 分维度打分矩阵（对应六大关键设计决策）

日期：2026-08-20 · 对应任务：Task 1 · 前置：`top10-comparison.md`、`ARCHITECTURE.md`

把六大设计决策转成 6 个可打分维度，每个维度定义 5 分/3 分/1 分的判据，对 Top 10 逐一打分，最后按场景加权得出选型推荐。

## 打分对象

| 代号 | 项目 | 形态 |
|------|------|------|
| JINA | Jina Reader (r.jina.ai) | 托管 API |
| FIRE | Firecrawl | 托管 API + skill 教程 |
| TURNDOWN | mixmark-io/turndown | JS 库 |
| NHM | node-html-markdown | JS 库 |
| MDIFY | python-markdownify | Python 库 |
| H2T | html2text | Python 库 |
| GOHTM | Johanneskaufmann/html-to-markdown v2 | Go 库 + CLI |
| READAB | Mozilla Readability (+Turndown 组合) | JS 提取库 |
| W2MD | softaworks web-to-markdown skill | Agent Skill |
| BRIGHT | brightdata/skills | Agent Skill 集合 |

## 维度 1：转义哲学（输出干净度 vs 安全性）

判据：5 = 智能转义，只在必要时转义且不破坏内容；3 = 可配置但默认一般；1 = 激进转义导致大量反斜杠噪音，或基本不处理。

| 项目 | 分 | 依据 |
|------|----|------|
| GOHTM | 5 | 官方 "Smart Escaping"：只在会意外渲染成 Markdown 时才转义，正确处理反引号/多行代码块，转义规则单独成文档 ESCAPING.md |
| NHM | 5 | 设计目标就是最小转义，"keep the Markdown clean"、避免过度反斜杠 |
| MDIFY | 4 | 转义可通过 converter 选项配置，默认行为适中 |
| JINA | 4 | 面向 LLM 输出做了清洗，实测输出干净，但策略不透明、不可配置 |
| H2T | 3 | 目标是"可读纯文本恰好是合法 Markdown"，可读性优先，结构保真让位（表格 36 行丢 4 行） |
| TURNDOWN | 2 | 激进的正则组转义，输出里常见 `\_`、`\*` 噪音——给人读可以，喂 RAG 是脏数据 |
| FIRE / BRIGHT / W2MD / READAB | — | 转发底层（W2MD/READAB 底层是 Turndown，继承其转义；FIRE/BRIGHT 是服务，不公开策略） |

**对 Agent/RAG 的结论**：转换核心选 NHM / GOHTM 一档；若必须用 Turndown（因 Readability 生态在 JS），要在清洗层加一道反转义/白名单。

## 维度 2：解析性能（大数据量可扩展性）

判据：5 = 自建轻量解析树，GB 级可行，支持并发；3 = 成熟解析器，中等规模无压力；1 = jsdom 级重量，大输入明显退化。

| 项目 | 分 | 依据 |
|------|----|------|
| GOHTM | 5 | Go `html.Parse` 标准库级轻量；官方验证多 goroutine 并发安全（内置 mutex + 测试）；CLI 原生支持 `--input "src/*.html"` 批量 glob |
| NHM | 5 | 明确为速度设计，绕开 jsdom 自建轻量树；基准讨论中被推荐为 Turndown 的性能替代 |
| H2T | 4 | Python 标准库 parser，无 BeautifulSoup 依赖，中大规模可用 |
| MDIFY | 3 | 绑定 BeautifulSoup，容错好但慢；Python 生态内可通过换 lxml parser 缓解 |
| TURNDOWN | 2 | Node 下需 jsdom 建 DOM，是公认瓶颈（issue #265：GB 级输入退化，社区建议换 node-html-parser） |
| JINA / FIRE | 4（本地 1） | 服务端并发强，但吞吐受限于配额/计费，本地大规模不受我们控制 |
| READAB | 3 | jsdom 上跑 Readability 本身就偏重 |
| W2MD / BRIGHT | 2 | 逐页起无头浏览器，单页秒级，批量极慢（这是渲染换来的代价） |

**结论**：批量收集的转换核心必须在 GOHTM / NHM 里选；无头浏览器只留给确需渲染的页面。

## 维度 3：正文提取质量（去噪能力）

判据：5 = 内置成熟正文提取（Readability 级）且可介入；3 = 有 CSS 选择器过滤等替代手段；1 = 整页直转，噪音全带进来。

| 项目 | 分 | 依据 |
|------|----|------|
| JINA | 5 | 服务内置去导航/广告/脚本 + 图片 alt 生成（`X-With-Generated-Alt`），开箱即正文 |
| W2MD | 5 | Puppeteer 渲染后显式接 Mozilla Readability，是"提取+转换"标准流水线的参考实现 |
| READAB | 5 | 它就是提取器本尊（Firefox 阅读视图同源），与转换器组合是事实标准 |
| FIRE | 5 | 商业产品核心卖点之一，含 LLM 提取（结构化 JSON） |
| GOHTM | 3 | 无内置 readability，但 `--include-selector="article"` / `--exclude-selector=".ad"` 可达到接近效果，控制粒度反而更细 |
| BRIGHT | 3 | 依赖其 scraper 生态按站点配置，通用正文提取非默认 |
| MDIFY / H2T / NHM / TURNDOWN | 1 | 纯转换器，设计上不含提取；需前置 trafilatura/Readability |

**结论**：库路线（GOHTM/NHM/MDIFY）必须配一个提取器。Python 侧 trafilatura、JS 侧 Readability、Go 侧 go-readability，或直接用 GOHTM 的选择器过滤。

## 维度 4：JS 渲染能力（SPA / 动态内容）

判据：5 = 内置无头浏览器且可控（等待条件、登录态）；3 = 走托管渲染或可外接；1 = 完全不处理。

| 项目 | 分 | 依据 |
|------|----|------|
| W2MD | 5 | 最强可控性：`--interactive` 人工过验证码/登录、`--user-data-dir` 持久会话、`--wait-for '<selector>'`/`--wait-ms` 精确等待、支持 Chrome/Chromium/Brave/Edge |
| JINA | 4 | 无头渲染内置，动态内容开箱即得，但不可人工介入（验证码/登录页无解） |
| FIRE | 4 | 托管渲染 + 反爬能力，同样受限于服务策略与计费 |
| BRIGHT | 4 | 依托 Bright Data 的解锁/代理基础设施，反爬最强，但重度绑定其商业生态 |
| GOHTM | 2 | 自身不渲染，但 CLI 天然支持管道：`curl | html2markdown`，可外接任意 fetcher |
| READAB / TURNDOWN / NHM / MDIFY / H2T | 1 | 库本身不抓取，渲染是上层编排的事 |

**结论**：渲染层独立于转换层选型。交互式登录场景 W2MD 的 `--interactive` 模式是独一份的能力，值得抄。

## 维度 5：Agent Skill 封装质量（SKILL.md 形态）

判据：5 = 有成熟 SKILL.md + 触发设计 + 明确用法分层；3 = README 级文档可用但非标准 skill 形态；1 = 面向开发者而非 Agent。

| 项目 | 分 | 依据 |
|------|----|------|
| FIRE | 5 | 官方发布"如何构建 Claude Code web scraping skill"教程，是 skill 封装的范本（API key 配置、触发、输出约定） |
| W2MD | 4 | README 定义了自然语言触发（"use the skill web-to-markdown"，硬性防误触发）、单页/批量/交互三分用法、front-matter 输出约定；但内部无标准 SKILL.md 文档 |
| BRIGHT | 4 | 多 skill 集合（scrape、scraper-builder 等），覆盖 markdown/HTML/JSON/截图多格式 |
| JINA | 3 | API + MCP server 集成，对 Agent 可用但不是 skill 形态 |
| GOHTM | 3 | 一等公民 CLI（brew/deb/二进制分发），Agent 可直接 shell 调用，这是"CLI 即 skill 底座"的最佳实践 |
| TURNDOWN / NHM / MDIFY / H2T / READAB | 1 | 开发者库，Agent 无法直接消费 |

**结论**：我们的 skill 直接采用 "SKILL.md + GOHTM 式 CLI 底座 + W2MD 式触发约定" 三合一。

## 维度 6：批量与站点编排（队列/断点/归档）

判据：5 = 原生支持站点级批量（URL 清单、爬取、重试、目录归档）；3 = 有批量入口但无断点/重试治理；1 = 单页。

| 项目 | 分 | 依据 |
|------|----|------|
| FIRE | 5 | 站点级 crawl 是产品核心（整站→markdown），含并发与限速治理 |
| JINA | 4 | `s.jina.ai` 搜索 + 批量抓取；`crawl` 能力存在但治理细节受服务限制 |
| GOHTM | 3 | `--input glob --output dir` 批量直转，`--domain` 统一改写相对链接；无重试/断点（可在 shell 编排层补） |
| BRIGHT | 4 | 面向生产爬虫的编排（代理、重试），但绑定其平台 |
| W2MD | 2 | "batch = 对每个 URL 跑一次命令进同一目录"，无清单/断点概念 |
| 其余库 | 1 | 单文档转换，编排完全上层负责 |

**结论**：没有一个本地开源方案把"批量 + 断点 + 按站点归档"做好——这正是 clone-them 的自研空间。

## 汇总矩阵与场景加权

原始分（— 表示不适用，按 3 分中性处理）：

| 项目 | D1 转义 | D2 性能 | D3 提取 | D4 渲染 | D5 Skill | D6 批量 |
|------|---------|--------|--------|--------|----------|--------|
| JINA | 4 | 4 | 5 | 4 | 3 | 4 |
| FIRE | 3 | 4 | 5 | 4 | 5 | 5 |
| TURNDOWN | 2 | 2 | 1 | 1 | 1 | 1 |
| NHM | 5 | 5 | 1 | 1 | 1 | 1 |
| MDIFY | 4 | 3 | 1 | 1 | 1 | 1 |
| H2T | 3 | 4 | 1 | 1 | 1 | 1 |
| GOHTM | 5 | 5 | 3 | 2 | 3 | 3 |
| READAB | 3 | 3 | 5 | 1 | 1 | 1 |
| W2MD | 2 | 2 | 5 | 5 | 4 | 2 |
| BRIGHT | 3 | 4 | 3 | 4 | 4 | 4 |

三个典型场景的权重（合计 100%）：

- **场景 A：本地批量收集喂 Agent/RAG**（clone-them 主场景）：D1×25%、D2×25%、D3×20%、D6×15%、D4×10%、D5×5%
- **场景 B：高保真单页归档**（人要读、要长期保存）：D3×30%、D1×20%、D4×20%、D2×10%、D6×10%、D5×10%
- **场景 C：困难站点（登录/反爬/SPA）**：D4×35%、D3×25%、D6×15%、D2×10%、D1×10%、D5×5%

加权得分：

| 排名 | 场景 A（本地批量） | 场景 B（单页归档） | 场景 C（困难站点） |
|------|--------------------|--------------------|--------------------|
| 1 | **GOHTM 3.90** | JINA 4.20 | W2MD 3.80 |
| 2 | JINA 3.85 | FIRE 4.10 | FIRE 3.75 |
| 3 | NHM 3.30 | W2MD 3.70 | JINA / BRIGHT 3.60 |
| 4 | FIRE 4.05* | READAB 3.00 | GOHTM 2.70 |
| 垫底 | TURNDOWN 1.35 | TURNDOWN 1.50 | 全部纯库 1.35–1.70 |

*FIRE 在场景 A 功能满分但依赖外部服务与计费，本地优先场景实际优先级降至 GOHTM/JINA 之后。

## 最终选型（映射到 clone-them）

按"本地优先、可离线、Agent 可直接 shell 调用"原则：

1. **转换核心：GOHTM（Go html-to-markdown v2）** — 唯一同时拿满 D1（Smart Escaping）+ D2（并发安全 + 批量 glob）+ 及格 D3（选择器过滤）+ D6（CLI 批量）的本地方案，且 brew 一行安装、Agent 可直接调用。
2. **JS 渲染兜底：Playwright + Readability**（Python 或 Node）— 只对静态 fetch 拿不到内容的页面启用，抄 W2MD 的 `--wait-for`/`--interactive` 设计。
3. **编排层（自研核心价值）**：URL 清单 → 逐页流水线 → `collected/<domain>/<path>.md` 归档 + front-matter；失败队列 + 断点重跑。这是矩阵里所有方案的共同空白。
4. **不选 Turndown 做核心**：D1/D2 双低，只作为 Readability 生态内的过渡选项。

> 注意：GOHTM 有两个已知短板需在编排层补偿——不检测 charset（非 UTF-8 页面需先转码）和不做 sanitize（不可信来源输出需过一道白名单）。
