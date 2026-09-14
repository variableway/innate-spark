# Idea: 个人工作站作为文档与产品 Index 中心

本目录放「尚未落地、需要先想清楚」的跨域分析。想清楚并决定采用后，再晋升到对应业务目录（见 [文档结构方案](./document-architecture.md)）。

| 文档 | 问题 |
| --- | --- |
| [可行性分析](./workspace-index-feasibility.md) | 用本仓库当文档 / ideas / 计划的 index，实现放到别的子目录或独立仓库，是否可行、风险在哪 |
| [文档结构方案](./document-architecture.md) | 目录怎么分层、一篇文档怎么写、idea 如何晋升 |
| [与 Cursor Project 结合](./cursor-project-integration.md) | 如何当一个 Cursor Project 用，rules / skills / 多仓库怎么配 |
| [Orca 架构与 Kanban 嵌入](./orca-architecture-and-kanban.md) | `references/ai-agent/orca` 架构 / 模块 / 功能，以及如何潜入项目管理看板 |

**结论先行：** 可行，而且比「文档 + 全部实现塞进同一个大仓库」更适合 Cursor。本仓库应保持 **hub（索引与知识）**，实现仓库做 **spoke（各自独立的 Cursor Project）**。需要同时改文档和代码时，用 multi-root workspace 临时把两边挂在一起。

来源：根目录 [README.md](../../README.md)（2026-09-12）。
