# Markdown 内容验证方法 + 简单场景选型（Task 1 补充）

日期：2026-08-20 · 回答两个问题：① 只做"网页→markdown"怎么选；② 转出来的 markdown 怎么验证。

## 场景 1：只是把网页内容转成 markdown（简化选型）

不需要动用完整矩阵，按频次三档：

| 场景 | 推荐 | 理由 |
|------|------|------|
| 一次性、偶尔用 | `r.jina.ai/` 前缀 URL（零安装），或 Agent 内置 WebFetch | 零成本拿到正文级 markdown；softaworks README 也明确：简单非 JS 页直接用内置 WebFetch 就够 |
| 本地可重复、批量 | **GOHTM CLI**：`html2markdown --input page.html --output out.md`，配 `--include-selector="article"` 提正文、`--domain` 改写相对链接 | 场景 A 加权第一；brew 一行装；管道式 `curl \| html2markdown` 天然可编排 |
| JS 渲染页 / 需登录 | Playwright/Puppeteer + Readability + 转换器（W2MD 模式），交互登录用 `--interactive` + `--user-data-dir` | 唯一能拿到渲染后 DOM 的路 |

原则：**简单页永远不启动浏览器**——渲染路径比静态路径慢一个数量级，批量时只对静态 fetch 失败/内容缺失的页面降级启用。

## 场景 2：如何验证转换出的 markdown

没有单一银弹，业界实践是分层验证：便宜的全量自动检查 + 贵的抽样语义检查。

### 方法 1：往返正确性（Round-Trip Correctness）

HTML → MD → HTML'，对比 HTML 与 HTML'。有研究背书（[RTC，arXiv 2402.08699](https://arxiv.org/html/2402.08699v2)：往返正确性与真实质量强相关）。关键是**不要做字符串 diff，要做 DOM 级对比**：

```
解析两边 → 归一化（小写标签、排序属性、去空白文本节点）→ 逐节点对比
输出：文本重合率 + 结构差异（缺失/多出的标签）
```

注意 Pandoc 的教训（[66 特性往返测试](https://daily.dev/posts/pandoc-what-survives-a-conversion-dereuromark-mfykkxkil)）：HTML 表达 63/66 特性、往返只回来 42 个——**往返是有损的，阈值要设"文本重合率 ≥95%、结构缺失白名单化"**（如 `<div>` 被拍平是预期行为，不算失败）。

### 方法 2：文本覆盖率（防丢内容，最重要）

分别从源 HTML 和 MD 抽纯文本，算覆盖率（源文本 token 在 MD 中出现的比例）。这是对"正文被截断/表格丢行"最灵敏的检查，实现成本最低：

```python
src = normalize_text(html_to_text(html))   # 源侧
md  = normalize_text(strip_md_syntax(md))  # 产物侧
coverage = len(src ∩ md) / len(src)        # 分词后集合或 n-gram 重合
```

参考基准：html2text 36 行表格丢 4 行（~89% 覆盖）这类问题，覆盖率检查直接暴露。

### 方法 3：静态结构检查（全量、毫秒级）

- **markdownlint**：语法合法性（残缺表格、未闭合代码块）
- **链接检查**：所有 `<a>` 的 href 在 MD 中保留且绝对化（HEAD 请求抽检可达性）
- **图片检查**：img src 保留、相对路径已用 `--domain` 绝对化
- **front-matter 校验**：title/url/fetched_at 齐全

### 方法 4：抽样语义验证（LLM-as-judge）

批量场景按 1–5% 抽样，把"源 HTML 正文文本 + MD"喂给模型，按 [Web2MD 的四维评分](https://web2md.org/blog/best-web-to-markdown-tools-2026)打分：内容完整性、格式准确性、噪音去除、Markdown 合法性。

### 方法 5：视觉抽查（可选，重）

MD 渲染回 HTML 截图 vs 原页截图，Playwright 像素/布局 diff。成本高，只用于高价值页面；true-web-clone skill 已内置这种 Playwright 验证模式，可借鉴。

### 落地建议（clone-them 的验证流水线）

```
每页必跑（毫秒级）：markdownlint + 链接/图片完整性 + front-matter + 文本覆盖率 ≥95%
批量抽样（秒级）  ：1-5% LLM 四维打分，<4 分的页面进人工/视觉复核队列
失败处理          ：覆盖率 <95% → 自动降级重试（换提取器/开渲染）→ 仍失败进 failures.log
```

把验证结果写进每个文件的 front-matter（`coverage: 0.97`、`verified: lint,coverage`），Agent 后续引用时可按质量过滤。

## 参考来源

- [Round-Trip Correctness (arXiv)](https://arxiv.org/html/2402.08699v2)
- [Pandoc 66 特性往返测试](https://daily.dev/posts/pandoc-what-survives-a-conversion-dereuromark-mfykkxkil)
- [Web2MD 2026 工具评测的四维评分法](https://web2md.org/blog/best-web-to-markdown-tools-2026)
- [RTCE 往返评测框架](https://www.emergentmind.com/topics/roundtripcodeeval-rtce)
