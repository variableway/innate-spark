# Top 10 HTML→Markdown 工具 / SKILL 调研对比

日期：2026-08-20 · 对应任务：Task 1

## 入选清单（Top 10）

| # | 名称 | 类型 | 语言/形态 | 一句话定位 |
|---|------|------|-----------|-----------|
| 1 | [Jina Reader (r.jina.ai)](https://jina.ai/reader/) | 托管 API / 服务 | HTTP API（开源 repo [jina-ai/reader](https://github.com/jina-ai/reader)） | URL 前加 `r.jina.ai/` 即得 LLM 友好 markdown，含无头浏览器渲染、图片描述 |
| 2 | [Firecrawl](https://www.firecrawl.dev/blog/claude-code-skill) | 托管 API + Skill 教程 | API + Claude Code skill | 站点级爬取→markdown，官方出 Claude skill 构建教程 |
| 3 | [Turndown](https://github.com/mixmark-io/turndown) | 库 | JavaScript | 最经典的 DOM 规则式 HTML→MD 转换器，插件化规则 |
| 4 | [node-html-markdown](https://www.npmjs.com/package/node-html-markdown) | 库 | JavaScript | 速度优先，自建轻量解析树，克制转义，Node/浏览器通用 |
| 5 | [markdownify](https://github.com/matthewwithanm/python-markdownify) | 库 | Python | 基于 BeautifulSoup 的类式转换器，可子类化扩展，表格还原最全 |
| 6 | [html2text](https://pypi.org/project/html2text/) | 库 | Python | 老牌，"可读纯文本恰好是合法 Markdown"，flag 配置丰富 |
| 7 | [Johanneskaufmann/html-to-markdown](https://github.com/Johanneskaufmann/html-to-markdown) | 库 + CLI | Go | 整站高保真转换（[HN 讨论](https://news.ycombinator.com/item?id=42093511)），命令行可批量 |
| 8 | [Mozilla Readability](https://github.com/mozilla/readability) + Turndown 组合 | 库（提取器） | JavaScript | 先正文提取再转换，是 "web→clean markdown" 的事实标准流水线 |
| 9 | [softaworks web-to-markdown skill](https://github.com/softaworks/agent-toolkit/blob/main/skills/web-to-markdown/README.md) | Agent Skill | Claude Code skill | 用 `web2md` CLI 让 Agent 把网页（含 JS 渲染）转 markdown |
| 10 | [brightdata/skills](https://github.com/brightdata/skills) | Agent Skill 集合 | Claude Code skills | scrape 任意 URL 为 markdown/HTML/JSON/截图，含 scraper-builder |

候补：[ScrapeGraphAI Claude skill](https://docs.scrapegraphai.com/integrations/claude-code-skill)、[htmltomarkdown (Python, markdownify 现代分支)](https://www.reddit.com/r/Python/comments/1igtrtp/htmltomarkdown_12_modern_html_to_markdown/)、MarkDownload（浏览器扩展）、Reader-LM（Jina 的 0.5B/1.5B HTML→MD 专用小模型）。

## 实现方式分析

### 两条技术路线

1. **规则/树遍历路线**（Turndown、node-html-markdown、markdownify、html2text、Go 库）：解析 HTML 为树 → 遍历节点 → 按标签映射规则生成 Markdown。差异在：
   - **解析基座**：真 DOM/jsdom（Turndown）vs 自建轻量树（node-html-markdown）vs BeautifulSoup（markdownify）vs 标准库 parser（html2text）
   - **扩展模型**：插件规则（Turndown）vs 子类覆写（markdownify）vs 配置 flag（html2text）
   - **转义哲学**：Turndown 激进正则转义 vs node-html-markdown 最小转义保输出干净
   - **性能**：瓶颈通常在 DOM 解析而非转换本身（见 [Turndown issue #265](https://github.com/domchristie/turndown/issues/265)）
2. **服务/流水线路线**（Jina Reader、Firecrawl、各 Skill）：抓取（含无头浏览器渲染）→ 正文提取（Readability 类）→ 树遍历转换 → 清洗输出。重点在渲染、反爬、批量与 LLM 友好化（图片 alt、链接保留）。

### Skill 形态的共同模式

- 封装一个 CLI/API（web2md、Firecrawl API、scpr）作为底层引擎
- SKILL.md 描述触发场景（"把这个网页保存为 markdown"）与用法
- 处理 JS 渲染页普遍依赖无头浏览器（Playwright/Puppeteer）或托管服务
- 输出落盘为本地 markdown 文件，附带元数据（标题、URL、抓取时间）

## 选型建议（我们的实现）

- 单页转换核心：**Turndown 或 node-html-markdown**（JS）／ **markdownify**（Python），按 repo 主语言定
- 正文提取：**Mozilla Readability**（去广告/导航）
- JS 渲染页：Playwright 兜底
- Skill 层：参考 softaworks 的 "CLI + SKILL.md" 模式，自己封装批量站点能力

## 参考来源

- [Best HTML to Markdown Libraries Compared – Reader.dev](https://reader.dev/blog/html-to-markdown-libraries)
- [5 Best Web to Markdown Tools 2026 – Web2MD](https://web2md.org/blog/best-web-to-markdown-tools-2026)
- [HTML to Markdown for AI – Contextractor](https://www.contextractor.com/html-to-markdown/)
- [Python 库对比 – Glukhov.org](https://www.glukhov.org/documentation-tools/markdown/convert-html-to-markdown-in-python/)
- [Simon Willison 评 Jina Reader](https://simonwillison.net/2024/Jun/16/jina-ai-reader/)
- [Apify: Jina AI vs Firecrawl](https://blog.apify.com/jina-ai-vs-firecrawl/)
