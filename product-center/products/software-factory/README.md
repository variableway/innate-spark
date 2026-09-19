# Software Factory

把 Yorun QA 流水线做成 **DeepSeek Harness 上的一组插件**，而不是「外面再套一个 Agent Runtime」。

DSH 的产品形态是：

> 每个能力都是插件：模型、工具、Skills、Session、Sandbox、存储、循环、调度、UI。  
> 运行中的 `dsh` = 按 Profile 叠起来的 Bundle patch 树。没有可打补丁的特权内核。

因此本厂的交付物只有四类：

| 交付物 | DSH 对应 |
|---|---|
| **Bundle** | `package.json` 里 `dsh.bundle.patch`，用 `dsh plugin add` 装进 profile |
| **Plugins** | `apply(ctx, config)` 或 `Service` + `inject`；可双面（host + `./client`） |
| **Agent presets** | `agent.cordis.yml`，给每个阶段一套工具/Skill/`isolate` 域 |
| **Skills** | `skill-filesystem` 的 `customSkillDirs` / `.dsh/skills`，走已有 `ctx.skills` |

**不**在 Cordis 树外拉起第二套 Agent Runtime。发现默认循环不好时，按 [docs/04-runtime-split.md](docs/04-runtime-split.md) 的 L1→L2→L3 换插件行：工厂只依赖 `ctx.agents`，不依赖 `dsh-agent-loop` 内核。

## 怎么读

| 文档 | 内容 |
|---|---|
| [docs/00-vision.md](docs/00-vision.md) | 产品是什么 |
| [docs/01-architecture.md](docs/01-architecture.md) | **以插件树为准**的组成与数据流 |
| [docs/02-modules.md](docs/02-modules.md) | 按 seam 拆的插件包 |
| [docs/03-pipeline.md](docs/03-pipeline.md) | 阶段 → preset / command / tool / goal |
| [docs/04-runtime-split.md](docs/04-runtime-split.md) | **换 Agent Runtime 而不大改结构（L1 llm / L2 subagent / L3 AgentFactory）** |
| [docs/05-implementation-plan.md](docs/05-implementation-plan.md) | 先 hello plugin，再 bundle |
| [docs/06-task-breakdown.md](docs/06-task-breakdown.md) | 任务 |
| [docs/07-data-model.md](docs/07-data-model.md) | Session 事件 + 工作区文件 |
| [docs/08-ui-surfaces.md](docs/08-ui-surfaces.md) | **UI Plugin 接入 Web/Desktop：双面 + slots，同一 client 图** |
| [docs/09-decisions.md](docs/09-decisions.md) | ADR（含对旧「Pi sidecar」方案的废弃） |
| [docs/10-risks.md](docs/10-risks.md) | 风险 |
| [docs/11-existing-github-matches.md](docs/11-existing-github-matches.md) | 每个规划插件对应的 5 个现有 GitHub 可选项（含 Desktop / 多 LLM / Router / Worktree / Markdown / Canvas） |

`dsh --profile web --dump-config` 是「当前到底装了什么」的权威视图。任何新行都应该能在这份树里被 grep 到。

## 文档同步

本目录是规格真相源。镜像在 innate-spark Product Center：`products/software-factory/`。

```bash
./scripts/sync-product-center.sh              # 推到 hub
./scripts/sync-product-center.sh --check      # 有漂移则非零退出
./scripts/sync-product-center.sh --dest PATH  # 覆盖 Product Center 根
```

不要在 hub 镜像里改 `docs/`。改完本厂文档后跑一次 sync。
