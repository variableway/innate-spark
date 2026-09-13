# 文档结构方案

日期：2026-09-12  
配套：[可行性分析](./workspace-index-feasibility.md) · [Cursor 结合](./cursor-project-integration.md)

## 1. 设计原则

1. **域比编号稳。** 顶层按工作类型分，不按 `1. 2. 6. 7.` 分。数字留给文件内部的阅读顺序。
2. **一篇文档一个职责。** idea、分析、设计、规格、日志分开；用链接串，不把五种文体写进一个长文件。
3. **先 inbox，再入域。** 来不及分类的进 `docs/inbox/`，定期清空。已能判断归属的，不要再进 `docs/idea`。
4. **每个目录都能单独打开。** 任意文件夹应有一份短 README：这里是什么、怎么命名、相关链接。这是给人和给 Agent 的同一份地图。
5. **实现永远是指针，不是子树。** 产品目录里放 `links.md`，不放源码。
6. **元数据少而稳定。** 只用一套 frontmatter，方便以后检索和晋升，不要上重型知识库引擎。

## 2. 推荐顶层树

```text
workspace/                          # 本 Cursor Project（hub）
├── README.md                       # 域地图 + 怎么用这个站
├── AGENTS.md                       # 给 Agent 的短合同（一页内）
├── .cursor/
│   ├── rules/                      # 按目录 glob 的规则
│   └── skills/                     # 本站工作流（捕捉 / 晋升 / 周回顾）
├── docs/
│   ├── inbox/                      # 未分类捕捉
│   ├── idea/                       # 跨域、未分域的分析（本批文档在此）
│   ├── decisions/                  # 已拍板的架构决策（ADR）
│   └── journal/                    # 可选：日报 / 周报，不按产品拆
├── infra/
│   ├── README.md
│   ├── idea/
│   ├── runbooks/
│   └── inventory.md                # 机器、服务、域名清单
├── product-center/
│   ├── README.md
│   ├── catalog.md                  # 唯一产品清单
│   ├── libs/                       # 公共库的规格与笔记（实现另仓）
│   ├── skills/                     # 产品/研发技能的说明（Cursor skill 本体可链到 .cursor/skills）
│   ├── toolings/                   # 开发工具、产品工具的规格
│   └── products/
│       └── <product-slug>/
│           ├── README.md
│           ├── links.md            # 实现仓路径 / remote / workspace
│           ├── idea/
│           ├── analysis/
│           ├── design/
│           ├── spec/
│           └── log/                # 迭代记录，不是 git log
├── marketing/
│   ├── README.md
│   ├── ideas/
│   ├── content/
│   └── tools/
├── feeds/
│   ├── README.md
│   ├── sources.md
│   └── notes/
└── teaching/
    ├── README.md
    ├── kids/
    ├── adult/
    └── tutorials/
```

空仓阶段不必一次建完。**先建会立刻用到的一层**：`docs/inbox`、`docs/idea`、`docs/decisions`、`product-center/catalog.md`，以及你正在动手的那个域。其余目录在第一次落入文件时再建，并同时写该目录 README。

## 3. 和 README 清单的对应

| README 条目 | 落点 |
| --- | --- |
| Infra: Self Host Infra | `infra/` |
| Pre-Product, Brainstorm, Analysis | `product-center/products/<p>/idea`、`analysis`；尚无产品则 `docs/idea` |
| Design | `product-center/products/<p>/design` |
| Product Development / Iteration | `spec/` + `log/` + `links.md`；代码在 spoke |
| Dev Toolings / Product Tools | `product-center/toolings/` |
| Products | `product-center/products/` + `catalog.md` |
| Dev base Libs and Skills | `product-center/libs/`、`product-center/skills/` |
| Marketing / Content / Ideas / Tools | `marketing/` 下对应子目录 |
| Feeds | `feeds/` |
| Teaching / Tutorials | `teaching/` |

「Product Center」在 README 里既是阶段（brainstorm → 上线）也是对象（libs、tools、products）。目录上拆开：**阶段是产品子树内部的文件夹，对象是 `product-center` 下的并列目录。** 不要用阶段当顶层，否则同一个产品的材料会散落。

## 4. 单篇文档的最小合同

所有正式笔记建议用同一套 YAML（inbox 里的一句话草稿可以没有）：

```yaml
---
title: 短标题
slug: kebab-case-id
status: inbox | brewing | decided | active | parked | archived
domain: infra | product | marketing | feeds | teaching | meta
product: foo          # 没有就省略
created: 2026-09-12
updated: 2026-09-12
related: []           # 仓库内相对路径
---
```

**status 只表示文档自身，不表示产品是否上线。** 产品状态只写在 `catalog.md`。

命名：`YYYY-MM-DD-short-slug.md` 用于有时间意义的捕捉（idea、journal）；稳定规格用 `overview.md` / `scope.md` 这种不会因改名而断链的名字。

长度：能在一次聊天里 `@` 进去而不撑爆上下文。经验上单篇正文先压在约 200 行内；更长的拆「概述 + 附录」，概述里链附录。

## 5. 晋升路径（idea → 可开发）

```text
docs/inbox/                  随手一句
    │  能判断域
    ▼
docs/idea/  或  <domain>/idea/   跨域分析 / 单域想法
    │  值得做成产品或基础设施变更
    ▼
product-center/products/<p>/analysis/
    │  方案收敛
    ▼
design/ → spec/
    │  决定开写
    ▼
links.md 填实现位置，并另开 Cursor Project
    │  之后
    ▼
log/ 记迭代；spec 只改「当前为真」的部分
```

晋升时做三件事即可，不必上工作流引擎：

1. 改 `status`（brewing → decided / active）。
2. 文件挪到目标目录（或在目标目录写新文，原文顶上加「已晋升到 …」并 `archived`）。
3. 若是新产品，先在 `catalog.md` 加一行，再建模目录。

`docs/decisions/` 只收 **跨产品、难撤销** 的决定（例如「实现永不进 hub」「产品清单只在 catalog」）。单产品的选择放在该产品 `analysis/` 或 `spec/`。

## 6. catalog 与 links 的写法

`product-center/catalog.md` 保持一张表，作为唯一清单：

```markdown
| slug | 名称 | 阶段 | 文档 | 实现 |
| --- | --- | --- | --- | --- |
| foo | Foo | spec | ./products/foo/ | 见 links.md |
```

阶段建议：`idea` → `design` → `spec` → `building` → `live` → `paused` → `retired`。

`products/foo/links.md`：

```markdown
# Foo · 实现指针

- 本机: /Users/patrick/innate/products/foo
- git: <remote-or-local>
- Cursor Project: 打开实现仓；需要对照规格时再把本目录加进 multi-root
- 当前规格: ./spec/overview.md
```

Agent 和你都只通过这张表跳转，避免在十篇分析里复制粘贴绝对路径。

## 7. 各域内部怎么长

**infra：** `inventory.md` 是资产表；`runbooks/` 是操作手册；变更想法先过 `idea/`，拍板进 `docs/decisions` 或 infra 自己的 ADR。不要在此放密钥，只放「密钥在哪类地方」。

**product-center：** 公共 libs / skills / toolings 各有自己的短 README + 指向实现仓的 `links.md`。Skills 有两层：这里是 **产品技能说明**（给人看的目录）；Cursor 可执行的 `SKILL.md` 放 `.cursor/skills/` 或用户级 `~/.cursor/skills/`，两边互相链接，避免复制两份长文。

**marketing：** `ideas/` 选题；`content/` 成稿（按渠道或按战役子目录）；`tools/` 流程与账号策略（仍不含密码）。成稿可以是 Markdown；设计稿用链接指向外部文件，大图不要进 git。

**feeds：** `sources.md` 列出源和频率；`notes/` 放消化后的笔记。原始抓取、音频、视频在仓外。若以后做采集器，那是一个 product spoke，不是 feeds 目录里的脚本堆。

**teaching：** 按受众（`kids` / `adult`）或按课程（`tutorials/<course>`）二选一作为主轴，另一个做索引。推荐 **课程为主轴**，README 里再用受众标签过滤，否则同一门课会拆散。可运行的练习工程是 spoke。

## 8. 不建议的结构

- **按日期当顶层**（`2026/09/...`）：个人工作站要按工作类型找回东西，时间放到文件名或 journal。
- **按工具当顶层**（`notion/`、`obsidian/`、`cursor/`）：工具是通道，不是域。
- **在 hub 里建 `src/`、`apps/`、`services/`：** 这是边界腐烂的开始。
- **每个想法一个 git 子模块：** 管理成本高于收益。
- **深度超过四层还继续叠阶段文件夹：** `products/foo/development/iteration/v2/notes/week3` 这类路径人和 Agent 都懒得走。三到四层够了。

## 9. 落地顺序

1. 保持 `docs/idea` 为本批分析的家（已在做）。
2. 写根 README：声明本仓是 hub，并链到三篇分析；域清单用名称而非乱序数字。
3. 加 `product-center/catalog.md`（哪怕只有表头）。
4. 加 `docs/inbox/`，开始往里扔未分类条目。
5. 第一个真实产品出现时，按第 2 节建 `products/<slug>/`，同时开 spoke 目录，并写 `links.md`。
6. 根 `AGENTS.md` 与 `.cursor/rules` 按 [Cursor 结合](./cursor-project-integration.md) 补上，避免 Agent 在 hub 里「顺便实现」。
