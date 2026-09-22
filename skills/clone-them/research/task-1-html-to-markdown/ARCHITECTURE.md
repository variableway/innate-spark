# HTML→Markdown 通用实现架构（Task 1 调研提炼）

日期：2026-08-20

## 通用四段流水线

所有被调研的实现（无论库、API 还是 Agent Skill）都可以归约为同一条流水线：

```
URL/HTML → [Fetch/Render] → [Extract 正文提取] → [Convert 树遍历转换] → [Clean/落盘 清洗归档]
```

各层可选实现：

| 层 | 职责 | 可选方案 | 关键决策 |
|----|------|----------|----------|
| Fetch/Render | 拿到最终 HTML | 原生 HTTP / Playwright 无头浏览器 / 托管 API（Jina、Firecrawl） | 是否需要 JS 渲染；反爬与限速 |
| Extract | 去掉导航/广告/脚本，保留正文 | Mozilla Readability / trafilatura / 自写启发式 | 忠实整页 vs 只要正文 |
| Convert | HTML 树 → Markdown | Turndown / node-html-markdown / markdownify / html2text / Go html-to-markdown | 解析基座、规则扩展模型、转义策略、表格/GFM 支持 |
| Clean | LLM 友好化与归档 | 图片 alt 补全、链接相对→绝对、front-matter 元数据、按站点目录归档 | 输出给谁看（人 / LLM / RAG） |

## 关键设计决策（从 Top 10 提炼）

1. **转义哲学二选一**：激进转义（Turndown，绝不产出意外 Markdown）vs 最小转义（node-html-markdown，输出干净可读）。给 Agent/RAG 用建议最小转义 + 白名单清洗。
2. **性能瓶颈在解析不在转换**：大数据量时选轻量解析器（node-html-markdown 自建树、Go 库），避免 jsdom。
3. **正文提取是质量分水岭**：直接整页转换会把导航/页脚全部带进 Markdown；"Readability + 转换器" 组合是事实标准。
4. **JS 渲染页必须走无头浏览器**：所有成熟 Skill（web2md、Firecrawl、Jina）都内置 Playwright/Puppeteer 或托管渲染。
5. **Skill = 薄封装层**：SKILL.md（触发描述 + 用法）+ 底层 CLI/API。Skill 本身不实现转换算法，只做编排（批量 URL、站点清单、归档路径规则）。
6. **批量与站点克隆是编排问题**：URL 队列 → 逐页流水线 → 按域名/路径写本地目录；失败重试与断点续传在编排层做。

## 对 clone-them 的直接启示

我们的 skill 应分层：核心 CLI（fetch→extract→convert→write，可单测）+ SKILL.md 编排层（站点清单、批量、目录归档）。核心转换不自研，站在 Turndown/markdownify 之上；自研价值在编排、批量、归档与后续（Task 2+ 的整站 clone / CSS theme / 飞书文档采集）。
