# 08 · UI Plugin 接入 Web / Desktop（同一套 client，不是两套应用）

工厂界面 **只能** 作为 DSH 的双面插件挂进官方（或社区）Host。  
不写独立 SPA、不写第二套 Electron/Tauri 窗口、不 `fetch('/api/run')`。

Web 和 Desktop 的差别只在 **运输**：Web 是 HTTP + `/plugins/<id>/client.js?rev=`；Desktop 是 framed IPC + `dsh-app://`。  
**Client 图是同一张。** `dsh.client.platform` 官方约定永远是 `'web'`（Desktop 复用这张图，没有合法的 `'desktop'` platform 值）。

```text
同一 bundle（dsh-factory-board 等）
        │
        ├─ Host 半  exports["."]     →  web profile 的 Node
        │                          →  desktop profile 的 Desktop Host（同一套 inject）
        └─ Client 半 exports["./client"]
                   dsh.client: { inject: ['slots','connection'], platform: 'web' }
                        │
                        ├─ dsh web     浏览器 Cordis + slots
                        └─ dsh desktop 同一 slots，connection 换成 IPC
```

装一次、挂两处：

```bash
dsh plugin --profile web add ./packages/dsh-factory-bundle
dsh plugin --profile desktop add ./packages/dsh-factory-bundle
```

CLI 与 Desktop **不共享** `node_modules`，所以是两次 `add`，不是两套代码。

---

## 1. 一个 UI 插件的合同

| 面 | 必须有 | 禁止 |
|---|---|---|
| Host | `apply(ctx)`；`inject` 列出真用的服务；用 `ctx.commands` / `ctx.sessionProjections` / `ctx.connection`（或官方 RPC）给人点的动作 | 在 Host 里 `import` React；为 Desktop 再写一个 HTTP 服务器 |
| Client | `exports["./client"]`；`dsh.client.inject` **只是清单**（不排序）；UI **只** 经 `ctx.slots.inject(name, () => ctx.slots.register(...))` | `slots.register` 进未声明的 slot；`fetch` 自研 REST；轮询 Pi；在 renderer 读 `desktopProfiles` |
| Desktop 特有 | Host 里 `ctx.get('desktopProfiles')` 探测；需要时 `ctx.inject(['desktopProfiles','desktopPnpm'], …)` | 把 Desktop 服务写进 **顶层必选** `inject`（否则 `dsh web` 装不上）；用 `process.argv` 猜是不是桌面 |

`ctx.slots.inject` 会等 slot **声明生命周期**：owner 卸载则贡献一起卸，HMR/热装才能干净。裸 `register` 在 slot 尚未声明时是硬错误。

Client 组件 props 只吃 slot 四份派生数据（owner / children / store / inject face）。`inject()` 只返回普通数据和回调，**不**返回 ReactNode、不把整个 Cordis service 丢进组件。

---

## 2. 工厂往哪挂（加页，不换壳）

不要占 `conversation.session`（那是「整页自己画会话」，空则空白）。工厂 **往已有壳加一块**，三条壳可以并存，但主看板只选一条当默认：

| 路线 | 挂哪里 | 聊天还在不在 | 何时用 |
|---|---|---|---|
| **A. 官方页签** | `conversation.view` `id: factory` | 要切走聊天才能看满页看板 | 零额外依赖；P0 默认 |
| **B. Better Sidebar** | `ctx.betterSidebar.registerTab`（右侧栏 / 底栏 dock / 可 float） | **聊天仍在中间** | 要边聊边看阶段；IDE 工作台 |
| **C. Dock / Widget** | `shell.overlay` + `composer.dock` / widget 注册表 | 聊天全开，状态条悬浮 | token、阶段灯、一键跑；不是满页看板 |

**推荐组合：** A 作无 sidebar 时的降级页；有 [dsh-better-sidebar](https://github.com/omdsh-dev/dsh-better-sidebar) 时同一 `./client` 再 `registerTab({ id: 'factory:board' })`；阶段进度 / 费用用 C 的一颗 widget，不要再做第三套看板。

B 的合同（peer，不是 Host）：

```ts
export const inject = ['betterSidebar'] // 仅 client；没有该服务则整包不激活或走路线 A
export function apply(ctx) {
  ctx.effect(() => ctx.betterSidebar.registerTab({
    id: 'factory:board',
    title: () => '工厂',
    order: 20,
    component: ({ scope }) => <FactoryBoard sessionId={scope.sessionId} />,
  }))
}
```

必须 `ctx.effect` 包住，否则 HMR/禁用会残留 `"already registered"`。没有 better-sidebar 时 **不要** 把 `betterSidebar` 写成 Host 半必选 inject。可与 `dsh-web-ui` 的 aionui-panel **互斥**（sidebar 自己会不挂）。

C：不要自绘 macOS Dock。用官方 `shell.overlay` 或叠 [Physicolor/dsh-widgets](https://github.com/Physicolor/dsh-widgets) 的声明式 `WIDGETS` 注册表；和 better-sidebar 已约定共享 `--dsh-sidebar-width`。

现成对照：[docs/11-existing-github-matches.md](11-existing-github-matches.md) §19。

| 表面 | Slot（以当时 `dsh-client-ui-slots` 为准） | 工厂用途 |
|---|---|---|
| 会话页签环 | `conversation.view` | **主入口**：`id: 'factory'`，「工厂」页 = 阶段看板 + 审稿 + 报告 iframe |
| 设置 | `settings.section` | pack 路径、冻结策略、是否热装 |
| 侧栏脚 | `sidebar.footer.action` | 打开工厂页 / 状态点 |
| 会话顶栏 | `conversation.session.header.actions` 或 `.utilities` | 「跑阶段」「打开工作区」 |
| 输入条 | `conversation.composer.dock` / `conversation.input.left` | token 条、Router 开关（可叠社区插件，不必本厂重复） |
| Chat 节点 | `conversation.chat.node` / `tool.call.toolview` | **不要重画**；workflow 继续用官方 `dsh-client-ui-workflow-run` |
| 工作区菜单 | 公开 slot 若已有则用；没有则只走 header 按钮 | 打开文件夹走官方 `workspaces.openPath` / `host.openPath` |

空态：`--dump-config` 没有 factory 层 → 不注册这些 slot，不要画假看板。

---

## 3. 人点按钮怎么走到 Agent（Web / Desktop 同一条）

```text
Client 按钮
  → inject() 里的 callback
  → ctx.connection 调 Host 已注册的 command / RPC
  → Host ctx.commands.register('run-stage') 等
  → ctx.agents.create({ preset, meta.cwd })
  → session log
  → sessionProjections
  → Client 订 session/event 或 projection 刷新
```

Desktop 没有 loopback：报告 HTML 由 **Host 提供静态/协议资源**（`dsh-app://` 或 connection 拉字节），Client iframe 不要 `file://`。

覆盖率页、Canvas、Markdown 预览都是 **别的 UI 插件** 往同一套 slots 再插一条；工厂看板只链到已生成文件路径。

---

## 4. Web vs Desktop 检查清单

| 项 | Web | Desktop |
|---|---|---|
| Profile | `web`（`dsh-base` + `dsh-web-app` + factory） | 保留 `desktop` + **同一 factory bundle** |
| Client 包 | 同一 `./client` | 同一 `./client` |
| 运输 | HTTP + WS | framed pipe + `dsh-app://`，无 TCP |
| 插件安装 | `dsh plugin --profile web add` | 官方壳用捆绑 pnpm / `desktopPnpm`；社区壳仍可能 loopback（规划不选它们当 Host） |
| 热加载 | patch.yml live；`node_modules` 默认要重启，见 [11 §18](11-existing-github-matches.md) | 更冷；不要热换 Host |
| 调本机应用 | Host `openPath` / 社区 open-in-x（应用在 **跑 dsh 的那台机器**） | 同一 Host API；渲染进程无 shell |

Headless：**不加载 client 半**。Host 命令和 runners 仍在。

---

## 5. 和现成 UI 插件怎么叠（不互相替换 Host）

工厂只做 **一块看板组件**。壳从 A/B/C 选，不要 fork 别人的工作台：

- B 框架：[omdsh-dev/dsh-better-sidebar](https://github.com/omdsh-dev/dsh-better-sidebar)（`registerTab` / `registerFileViewer` / 底栏 dock / 拖出 float）
- C 轨道：[Physicolor/dsh-widgets](https://github.com/Physicolor/dsh-widgets)；浮卡：[liuliuhuhushui/dsh-quota-float](https://github.com/liuliuhuhushui/dsh-quota-float)
- 看板范本：Ericwong / alpacachen `dsh-kanban`（列改成 S0–S10）
- 最简编辑：`better-er/dsh-classic-coding`（无 sidebar 时 overlay）或 VsCodeMode（有 sidebar 时当 tab）
- 本机应用 / token / Canvas：见 [11](11-existing-github-matches.md)

冲突：不要和 aionui-panel 同时当右栏；不要抢同一个 `conversation.view` **id**；不要 monkey-patch `workspaces.openPath`。

---

## 6. P0 验收

1. `dsh plugin --profile web add` 后 `--dump-config` 有 factory client 行。
2. `dsh web`：无 better-sidebar 时会话出现「工厂」页签；有 better-sidebar 时右侧（或底栏）出现工厂 Tab，中间聊天仍在。
3. 同一 tarball `add` 进 desktop profile；窗口里同一 UI，无 `127.0.0.1` 依赖。
4. 卸插件 / disable 行后页签与 sidebar tab 都消失（`ctx.effect` unwind）。
