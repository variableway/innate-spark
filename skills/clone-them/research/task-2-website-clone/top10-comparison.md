# Website Clone Top 10 工具 / SKILL 调研对比

日期：2026-08-20 · 对应任务：Task 2

与 HTML→Markdown 不同，website clone 领域存在**两条根本不同的路线**，先分路线再排名：

- **镜像路线（Mirror/Archive）**：忠实下载字节级副本（HTML/资产/链接改写），目标是离线可浏览、可归档。不重写代码。
- **重建路线（Rebuild）**：用 AI agent 观察页面并重建为干净的 HTML/CSS/组件代码，目标是可编辑、可二次开发。不是字节级副本。

## 入选清单（Top 10）

### 镜像路线

| # | 名称 | 形态 | 一句话定位 |
|---|------|------|-----------|
| 1 | [goclone](https://github.com/goclone-dev/goclone)（Go，2.2k★） | CLI | Go 协程驱动的现代整站克隆器，秒级下载整站资产 |
| 2 | [HTTrack](https://www.httrack.com/page/1/en/index.html) | CLI（经典） | 老牌离线镜像工具，递归抓取 + 自动改写本地链接 |
| 3 | `wget --mirror` | CLI（系统自带） | 递归镜像的事实标准，可脚本化，配置繁琐 |
| 4 | [SingleFile](https://github.com/gildas-lormeau/SingleFile) | 浏览器扩展 | 捕获**渲染后**页面，全部媒体 Base64 内联进单个 HTML；动态页可用 |
| 5 | [monolith](https://github.com/Y2Z/monolith) | CLI（Rust） | 无浏览器，把 CSS/图片/JS 内联成单 HTML 文件；不支持 JS 渲染页 |
| 6 | [ArchiveBox](https://archivebox.io/) | 自托管服务 | 归档平台：URL 清单 → 渲染 HTML/截图/PDF/WARC/正文多格式，带 Web UI |

### 重建路线

| # | 名称 | 形态 | 一句话定位 |
|---|------|------|-----------|
| 7 | [UHolli/ai-website-cloner](https://github.com/UHolli/ai-website-cloner)（147★） | Agent Skill | 给 AI coding agent 一个 URL，重建为干净 HTML/CSS；支持 Claude Code/Codex/ChatGPT |
| 8 | [SkyNotSilent/true-web-clone](https://github.com/topics/ai-website-cloner) | Agent Skill | "源码优先"本地克隆：下载真实资产/动画运行时/WebGL 资源 + Playwright 视觉验证 |
| 9 | [veyralabsgroup/webcloner](https://github.com/veyralabsgroup/webcloner) | Claude Code Skill | 6 阶段视觉克隆流程：侦察 → 截图 QA |
| 10 | [Firecrawl](https://www.firecrawl.dev/blog/claude-code-skill)（crawl 模式） | 托管 API | 整站 crawl 为 markdown/HTML/结构化数据，商业化编排最完善 |

候补：X-SLAYER/Website-Cloner（358★，HTTrack 式）、[PKHarsimran/website-downloader](https://github.com/PKHarsimran/website-downloader)（178★）、maornissan/webcloner-js（代理认证 + 隐身）、bahaeddinmselmi/siteforge（Chrome 扩展，确定性视觉重建、无 AI）、Webrecorder/Browsertrix（WARC 高保真存档，专业档案级）。

## 实现方式分析

### 镜像路线的四个关键机制

1. **递归发现**：解析 HTML 中的链接/资产引用（`<a>/<link>/<script>/<img>/CSS 内 url()`），BFS/DFS 爬取，按域过滤防止爬飞。
2. **链接改写**：把页面内绝对/相对 URL 改写为本地路径，镜像才能离线自洽浏览——这是 HTTrack/wget/goclone 的核心价值。
3. **渲染捕获 vs 静态抓取**：monolith/HTTrack/wget 不跑 JS（SPA 拿到空壳）；SingleFile/ArchiveBox 走浏览器拿渲染后 DOM（[SingleFile 作者自述对比](https://news.ycombinator.com/item?id=39811468)）。
4. **归档格式**：进阶玩家输出 WARC（ArchiveBox/Browsertrix），是图书馆级标准，普通文件树则是"可读但非标准"的归档。

### 重建路线的实现模式（AI agent skill）

以 ai-website-cloner / true-web-clone / webcloner 为代表的通用流程：

```
URL → 抓取源码+资产清单 →（截图/渲染观察视觉）→ LLM 生成 HTML/CSS/组件
   → 下载真实资产（图片/字体/动画运行时）→ Playwright 截图对比验证 → 迭代修正
```

关键差异点：
- **是否下载真实资产**：差的实现只截图贴图糊一个壳；true-web-clone 强调"源码优先"下载真实文件
- **验证闭环**：重建是否可信取决于截图 diff 验证（webcloner 的 6 阶段、true-web-clone 的 Playwright 验证）
- **代码形态**：输出单 HTML（JCodesMore 模板）vs Next.js 组件（Medium 教程路线）vs 可运行项目（siteforge 扩展）

### 已知坑（来自社区）

- HTTrack 在复杂现代站点上有明显 bug、漏 CSS/JS（[Reddit DataHoarder](https://www.reddit.com/r/DataHoarder/comments/10yjkgm/alternative_to_httrack_website_copier_as_of_2023/)）
- 所有静态镜像工具对 SPA 无效；SPA 只能走渲染捕获（SingleFile/ArchiveBox）或托管服务
- AI 重建永远不是像素级副本，是"可编辑的近似"——要副本选镜像，要改代码选重建

## 对 clone-them 的启示

1. **两条路线我们都要，但分层实现**：README 说"clone website 或获取 css theme"——镜像满足"收集保存"，重建满足"学习复刻"。
2. **镜像底座选 goclone（Go）**：与 Task 1 的 GOHTM 同语言生态、现代维护、协程并发批量强；wget 做兜底。SPA 站点用 Playwright 渲染捕获（ArchiveBox 模式）。
3. **验证环节直接复用 Task 1 的 markdown 验证思想**：镜像验证 = 资产完整率 + 链接本地可达率；重建验证 = Playwright 截图 diff（true-web-clone 模式）。
4. **CSS theme 获取（子任务 2.4）落在镜像路线**：整站镜像后从 CSS 文件提取主题变量（CSS custom properties、字体、配色 token），比重建路线保真得多。
5. **法律/伦理边界**：克隆仅用于本地备份、学习与授权场景；绕过付费墙/复制版权设计用于再发布不在本项目范围。

## 参考来源

- [alloy.app：4 种克隆方法对比](https://alloy.app/library/how-to-clone-a-website)
- [ArchiveBox Web Archiving Community wiki](https://github.com/ArchiveBox/ArchiveBox/wiki/Web-Archiving-Community)
- [JCodesMore/ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)
- [ai-website-cloner topic](https://github.com/topics/ai-website-cloner) · [website-cloner topic](https://github.com/topics/website-cloner)
- [AI agent 克隆 Cal.com 实战（DEV.to）](https://dev.to/vadim7j7/i-built-a-website-cloner-with-ai-agents-and-its-kinda-scary-good-gb9)
- [一小时克隆任意网站为 Next.js（Medium）](https://medium.com/@maxgreen007007/build-an-ai-agent-that-clones-any-website-in-under-an-hour-1b35adfdbead)
