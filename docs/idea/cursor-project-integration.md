# 与 Cursor Project 结合

日期：2026-09-12  
配套：[可行性](./workspace-index-feasibility.md) · [文档结构](./document-architecture.md)  
参照：Cursor 文档 [Rules](https://cursor.com/docs/rules.md)、[Skills](https://cursor.com/docs/skills.md)、[Ignore file](https://cursor.com/docs/reference/ignore-file)

## 1. 先对齐名词

| 说法 | 在这里的意思 |
| --- | --- |
| Cursor Project | 你用 Cursor **打开的那个根目录**（本仓库或某个实现仓）。索引、Rules、项目级 Skills 都相对这个根 |
| User Rules / User Skills | 机器级，对所有 Project 生效。适合「中文回复、提交前扫密钥」，不适合「本仓禁止写实现」 |
| Project Rules（`.cursor/rules/*.mdc`） | 跟仓库走，可按 glob / 描述按需加载 |
| `AGENTS.md` | 纯 Markdown 的 Agent 说明书。根文件偏 Always；子目录文件按设计只作用于该子树 |
| Skill | 教 Agent **怎么做一类任务**（捕捉 idea、晋升规格）。目录里有 `SKILL.md` |
| Multi-root workspace | `.code-workspace` 里挂多个根。适合「对照规格改代码」的几天，不适合当默认日常 |

本仓库打开后，它就是 **文档 hub 的 Cursor Project**。某个产品的实现目录再单独开一个 Project。两件事不要默认合成一个根。

## 2. 推荐的日常用法

**想、记、排计划：** 只打开 `~/innate/workspace`。用 `@Folder` 指出域（例如 `@product-center/products/foo`），用 `@` 单篇规格，而不是每次 `@Codebase` 扫全站。

**写代码：** 只打开实现仓。把要遵守的规格用 `@` 从 hub **复制路径进来**，或把该产品文档目录加为第二个根（见第 6 节）。不要为了改 50 行 Go 而让 Agent 看见全部营销稿和教程。

**跨域检索：** 仍回 hub。catalog 和各域 README 是入口；Agent 应先读地图再下场。

聊天里点名文件，比依赖隐式检索更稳。文档仓尤其如此：文件短、同义词多，「Foo 的规格」可能命中三篇旧分析。

## 3. 本 Project 里应放什么 Cursor 配置

```text
workspace/
├── AGENTS.md
├── .cursorignore
├── .cursorindexingignore          # 需要时再加
├── .cursor/
│   ├── rules/
│   │   ├── hub.mdc                # always: 这是文档仓
│   │   ├── idea-capture.mdc       # globs: docs/idea/**, docs/inbox/**
│   │   ├── product-docs.mdc       # globs: product-center/**
│   │   └── marketing-docs.mdc     # globs: marketing/**
│   └── skills/
│       ├── capture-idea/SKILL.md
│       ├── promote-doc/SKILL.md
│       └── weekly-review/SKILL.md
```

### 3.1 `AGENTS.md`：只写合同，不写百科

根文件建议只保留这类句子（落地时再写成正式文件）：

- 本仓库是个人工作站的文档与产品 index，不在这里实现产品、基础设施代码或采集器。
- 先读根 README 和 `product-center/catalog.md`，再改任何域下的文件。
- 新想法默认进 `docs/inbox/`；能分域则进对应 `idea/`。跨域分析进 `docs/idea/`。
- 实现位置只写在各产品 `links.md`。需要写代码时，提示用户打开或挂上实现仓。
- 新增产品先改 catalog，再建模目录。
- 不要在每个子目录复制一份 AGENTS.md。

子目录 **默认不要** 再放 `AGENTS.md`。域差异用带 `globs` 的 `.mdc`。原因：根 `AGENTS.md` 在 multi-root 时可能泄漏到旁边的实现仓；嵌套 `AGENTS.md` 在部分版本会按 Always 加载过多。短根合同 + 按需 rules 最稳。

### 3.2 Rules：四种挂载，对上四种内容

按 [Rules 文档](https://cursor.com/docs/rules.md) 的行为来选：

| 类型 | frontmatter | 用在本仓 |
| --- | --- | --- |
| Always | `alwaysApply: true` | 仅 `hub.mdc`：禁止在此写实现、catalog 为产品清单真相源 |
| 按文件 | `globs:` + `alwaysApply: false` | idea / product / marketing / teaching 的文体和命名 |
| 按需 | 只有 `description` | 「晋升一篇 idea」「做周回顾」——更长的流程也可做成 Skill |
| 手动 | 无 description、无 globs | 很少用的模板，聊天里 `@rule-name` |

单条规则保持短、可执行、带正反例。风格指南不要整本贴进 Always。需要引用模板时用 `@path/to/template.md`，避免规则和模板各改各的。

### 3.3 Skills：把重复劳动做成动作

Rules 回答「在这里是什么世界」；Skills 回答「做这件事时按哪几步」。本 hub 值得做的只有几件：

| Skill | 触发 | 结果 |
| --- | --- | --- |
| capture-idea | 「记一个想法」「丢进 inbox」 | 在 `docs/inbox/` 或正确域的 `idea/` 落一篇带 frontmatter 的短文 |
| promote-doc | 「晋升这条」「可以进 spec 了」 | 挪文件或改 status、更新 catalog、写「已晋升」脚注 |
| weekly-review | 「本周回顾」 | 扫 inbox、过期 brewing、列出该归档或该开实现仓的条目 |

Skill 放 `.cursor/skills/<name>/SKILL.md`。步骤写在 Skill 里，规范写在 Rule 里，不要两处各写一长篇。用户级已有的 `local-workflow` / `git-workflow` 留给 **实现仓**；在 hub 里调用它们会诱使 Agent 在文档仓提交「实现」。

以后某个产品的实现仓可以有自己的 `.cursor/skills/`（测试、发布）。两边不要同名，避免 multi-root 时抢触发。

## 4. 索引：让 Agent 看见该看见的

Cursor 会索引当前 Project。文档仓通常文件少，默认即可。需要主动挡的是以后才会出现的噪声：

| 文件 | 作用 | 本仓用法 |
| --- | --- | --- |
| `.gitignore` | git 不跟踪 | 本地草稿、`.DS_Store`、导出的 PDF |
| `.cursorignore` | Agent / Tab / `@` 都看不见 | 密钥、下载的原始数据包、误放进来的 `node_modules` |
| `.cursorindexingignore` | 不进语义索引，但仍可手动 `@` | 大量历史成稿、扫描件、已归档战役的附件 |

官方说明：`.cursorignore` 挡的是编辑器侧 AI 访问；**Agent 用的终端和 MCP 仍可能读到磁盘上的文件**。密钥仍然不要进仓。

Feeds 若只存笔记，不必 ignore。一旦出现 `feeds/raw/`，立刻写入 `.cursorindexingignore`。

改完 ignore 后，在 Cursor Settings → Indexing 里看 included files，必要时 Resync。不要假设保存文件后索引立刻重写完毕。

## 5. 和实现仓的三种接法

按打扰程度从低到高：

**A. 两个窗口，两个 Project（默认）**  
左边 hub 改规格，右边实现仓写代码。你把规格路径贴进实现仓的聊天，或在实现仓 Rule 里写「规格的本机路径见 …」。隔离最好，切换成本是你自己。

**B. Multi-root：hub + 一个 spoke**  
`File → Add Folder to Workspace`，存成例如 `foo-with-docs.code-workspace`。`@Codebase` 会跨两个根；`@Files` 带根名。适合规格和代码要一起改的迭代窗口。用完关掉第二个根，避免下次打开还挂着旧产品。

注意：两个根的 **根级 `AGENTS.md` 可能互相可见**。hub 侧务必保持「我们是文档仓」这种对实现无害的句子；实现仓的「必须用某某框架」放进带 glob 的 `.mdc`。

**C. 实现放进 hub 子目录或 submodule**  
能用一份索引扫到一切，但会把本分析要避开的问题全请回来：索引脏、Rules 串味、边界腐烂。只在「这个东西永远不会独立发布、也不需要独立 CI」时才考虑，例如一份 20 行的辅助脚本——即便如此，也更像 `toolings` 的笔记而不是应用。

## 6. 建议的 `.code-workspace` 形态

只在需要时创建，不要让它变成「打开工作站」的默认入口。示例：

```json
{
  "folders": [
    { "name": "hub", "path": "/Users/patrick/innate/workspace" },
    { "name": "foo", "path": "/Users/patrick/innate/products/foo" }
  ],
  "settings": {}
}
```

产品的 `links.md` 可以记下这个 workspace 文件的路径。Workspace 文件本身可以放在 hub 的 `product-center/products/foo/` 下，也可以放在实现仓根目录；选一处，写进 links，不要两处各一份还互相改。

## 7. 上下文怎么喂，少踩坑

1. **打开聊天先 `@` 地图：** 根 README 或域 README 或 `catalog.md`。
2. **再 `@` 目标文件夹**，不要一上来全库问答。
3. **改某一类文件时依赖 glob rules**，不要把营销语气写进 Always。
4. **User Rules 保持个人偏好**（语言、提交习惯）。项目边界只写在本仓 Project Rules。
5. **不要为每个教程、每篇成稿建 Skill。** Skill 是重复流程；单篇内容就是 Markdown。
6. **实现仓打开时，不要把整个 hub 加进 `.cursor/rules` 的 Always。** 需要哪篇规格就 `@` 哪篇。

## 8. 和你现有 Cursor 资产的关系

你机器上已有用户级 skills（git / local-workflow、Notion、Canvas 等）。分工：

| 资产 | 放哪 | 和本仓的关系 |
| --- | --- | --- |
| 用户 Rules | Cursor 设置 | 全局口吻；不描述本仓目录 |
| `~/.cursor/skills/local-workflow` 等 | 用户级 | 只在实现仓执行任务时用 |
| Notion skills | 用户级 | 可选：把已晋升的规格同步出去；本仓 Markdown 仍是原文 |
| 本仓 `.cursor/skills` | 项目级 | 只服务 index 工作流 |
| 实现仓 `.cursor` | 各 spoke | 框架、测试、部署；可链回 hub 的 `spec/` |

这样不会出现「在文档仓里跑完整开发工作流」的误触发。

## 9. 落地清单（本 Project 下一步）

这些是配置，不是产品实现，可以在本仓做：

1. 根 `AGENTS.md`：文档仓合同（短）。
2. `.cursor/rules/hub.mdc`：`alwaysApply: true`，重申边界与 catalog。
3. 按你真正开始写的域，再加对应 glob rule（不必一次加齐）。
4. 一个 `capture-idea` Skill，避免每次手写 frontmatter。
5. `.cursorignore`：至少忽略 `.env`、密钥文件名、系统垃圾文件。
6. 第一个实现仓出现时，在 `links.md` 写路径，并决定 A 还是 B 作为该产品的默认开发姿势。

文档目录怎么长，仍以 [文档结构方案](./document-architecture.md) 为准；Cursor 只负责让 Agent 遵守那份结构，而不是另搞一套平行分类。
