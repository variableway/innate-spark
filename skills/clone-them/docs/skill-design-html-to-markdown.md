# html-to-markdown Skill 设计（Task 1 实现方案草案）

日期：2026-08-20 · 依据：`research/task-1-html-to-markdown/`

## 目标

给 workbuddy 等 AI Agent 提供一个 skill：输入 URL（单个或清单）→ 本地落盘干净、LLM 友好的 Markdown，支持批量站点。

## 结构

```
skills/html-to-markdown/
├── SKILL.md              # 触发描述 + 用法（Agent 入口）
├── scripts/
│   └── web2md            # 核心 CLI：fetch → extract → convert → write
└── README.md
```

## 核心 CLI 设计

```
web2md <url>... [options]
  --out <dir>        输出目录，默认 ./collected/<domain>/
  --full-page        不做正文提取，保留整页
  --render           启用 Playwright 渲染（JS 页面）
  --stdin            从 stdin 读 HTML
```

- **语言**：核心转换用 **Go 的 html-to-markdown v2（GOHTM）**——decision-matrix.md 场景 A（本地批量收集）加权第一（Smart Escaping 最小转义、并发安全、CLI 原生批量 glob、brew 可装）。JS 渲染兜底用 Python/Node 的 Playwright + Readability。编排层语言跟随主仓库。
- **已知补偿项**（GOHTM 短板，编排层处理）：非 UTF-8 页面先转码（charset 检测）；不可信来源输出过白名单 sanitize。
- **输出**：每个页面一个 `.md`，front-matter 写入 `title / url / fetched_at`；图片链接转绝对路径。
- **批量**：接受文件形式的站点清单（每行一个 URL），逐页处理，失败记录到 `failures.log`，可重跑续传。

## SKILL.md 要点（参考 softaworks web-to-markdown 模式）

- 描述触发场景："把这个网页/这个网站保存成 markdown"、"批量收集这些链接"
- 用法示例：单页、JS 渲染页、批量清单三种
- 说明输出位置与 front-matter 结构，方便 Agent 后续引用

## 验收（对应 TASK.md 1.4 / 1.5）

1. 静态页（如博客文章）→ 干净正文 markdown，含标题/链接/表格
2. JS 渲染页（`--render`）→ 内容完整
3. 10+ URL 清单批量跑通，断点续传有效
4. 作为 skill 被 Agent 正确触发并调用

## 后续衔接

- Task 2（整站 clone / CSS theme）复用同一 Fetch/Render 层
- 飞书文档类（README 第 4 点）在编排层扩展新的 source 类型
