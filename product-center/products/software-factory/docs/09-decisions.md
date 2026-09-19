# 09 · 架构决策记录

## ADR-001 产品就是 DSH 组合，不自研应用入口

**决定：** 只通过 `dsh --profile` 启动；本厂是 bundle + plugins。  
**理由：** 官方拒绝旁路入口；everything-is-a-plugin 的组合单位是 patch 行。  
**后果：** 跟 DSH preview 破坏性变更；用 `--dump-config` 验收挂载。

## ADR-002 工厂只依赖 AgentFactory 缝，不依赖具体 loop

**决定：** 所有创建/恢复走 `ctx.agents.create` / `resume`。禁止 import `dsh-agent-loop`，禁止 factory spawn 外部 runtime。  
**理由：** `setFactory` 把循环换成可替换提供者；消费者不依赖具体包，换 Runtime 才不必改工厂。  
**后果：** 声明式 `config.agents` 少用。默认仍装官方 loop。

## ADR-003 换 Runtime 走 L1 → L2 → L3，禁止 L4 sidecar

**决定：** 模型不行先换 `ctx.llm`；子任务不行加 `ctx.subagents` provider；主循环不行再写 AgentFactory 适配器并 patch 替换 loop 行。  
**理由：** 同一进程只能一个 factory；子代理缝才允许多家并存。Sidecar 会逼整棵产品重做。  
**后果：** `dsh-agent-loop-pi` 是可选适配器包，不是工厂核心。详见 `docs/04-runtime-split.md`。

## ADR-004 工作区文件 + Session log 为事实源

**决定：** 不把独立 Postgres 当需求库。投影用 `sessionProjections` + scanner。  
**后果：** `factory-run` JSON 只是导出。

## ADR-005 确定性执行是 tools/commands/jobs 插件

**决定：** catalog/go test/cover/pgembed 注册在已有缝上，经 sandbox spawn。  
**理由：** 换 sandbox 后端时消费者不动。  
**后果：** 没有「runner 微服务」。

## ADR-006 Skel 冻结是 `tools/pre-execute`

**决定：** 只在工具瀑布拦，不靠第二套 beforeToolCall。  
**理由：** 只有一条执行管道。  
**后果：** Path B 解冻 = disable/换 preset，不是改 Pi 钩子。

## ADR-011 热加载分层，不承诺「plugin add 零重启」

**决定：** 开发用官方 `cordis-plugin-hmr`（本地源码 + `cordis.patch.yml`）。分发安装默认重启一次 `dsh web`；若要 GUI 热装，可选叠社区 installer/reloader，失败必须能回退到重启。禁止热换 `AgentFactory`、Desktop Host、以及不走 `ctx.effect` 的插件。  
**理由：** 官方 HMR 排除 `node_modules`；bundle 层启动冻结。社区热装是改正在跑的 Loader 树，手改 patch 会丢热挂行。  
**后果：** `dsh --dump-config` 仍是验收；client 半刷新页面。详见 `docs/11-existing-github-matches.md` §18。

## ADR-012 UI 只经双面插件接入 Web/Desktop（官方槽 / Better Sidebar / Widget）

**决定：** 工厂只交付一块看板组件。默认挂官方 `conversation.view`；若 profile 有 `ctx.betterSidebar` 则再 `registerTab`（右侧/底栏 dock，可 float）；费用与阶段灯可注册进 widget rail / `shell.overlay`。Web 与 Desktop 共用 `./client`。禁止独立 SPA、禁止自绘系统 Dock、禁止顶层必选 inject Desktop 或 `betterSidebar`（没有则降级路线 A）。  
**理由：** 聊天应保持中间；better-sidebar 已是生态工作台（`registerTab` 与内置 tab 对等）。Widget 解决「不切页也要看见状态」。  
**后果：** bundle 可选 peer `dsh-better-sidebar`。点按钮仍只走 `connection` → `ctx.commands`。详见 `docs/08-ui-surfaces.md`。
