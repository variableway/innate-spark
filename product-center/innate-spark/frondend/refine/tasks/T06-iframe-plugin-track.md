# T06 — 轨道 B：iframe 插件协议与宿主路由

> **状态：已完成（2026-09-16）**
> 阶段：P2 · 独立任务。协议与组件可独立实现与测试（本地两个静态服务即可），webshell 的 `/plugins/$pluginId` 占位路由（T02 预留）只是最终挂载点。

## 目的

实现**轨道 B（运行期 iframe 插件）**：manifest 协议 + sandbox iframe 宿主组件 + origin 白名单校验 + 可选消息桥，使任何独立部署的 web 应用（含 Next.js app、静态导出产物）能以插件身份进入 shell 导航。这是"基础框架支持 Next.js apps"的第二半。

## Context

- 协议设计直接复用两处现成资产：
  - innate-fe-base 归档文档 `base/innate-fe-base/docs/achieve/desktop-shell.md`：manifest 协议 `innate.desktop-plugin.v1`（`runtime: static | external-url`）、信封消息 `{source, v, channel, payload, meta}`、通道分层（`shell:*` / `plugin:<id>:*`）、**origin 双侧校验、禁 `targetOrigin="*"`** 的安全模型——照此设计新协议 `innate.web-plugin.v1`；
  - innate-wip `apps/web/components/plugins/plugin-iframe-view.tsx`：`<iframe sandbox="allow-scripts allow-same-origin allow-popups allow-forms">` + loading/error/"Open in new tab" 降级 UI，可直接移植。
- 教训规避：innate-wip 的 iframe 宿主路由卡在 Next 16 static export 的 `generateStaticParams` 空数组构建报错；**TanStack SPA 参数路由无此限制**（这是选 TanStack 做 shell 的红利之一）。
- 判定规则（继承 innate-wip）：仅"真外部 / 不可信 / 独立部署"三条件全满足的应用走本轨道。

## 实现方式

1. 协议类型：`packages/web-domain` 内（或 shell 内 `src/plugins/`）扩展 `WebPluginManifest { id, name, runtime: 'iframe', iframeSrc, origins: string[], nav }`——与轨道 A 的 domain manifest 同形并列，registry 统一消费。
2. 宿主组件 `PluginIframeView`：移植 innate-wip 实现，增加 origin 白名单（`iframeSrc` 的 origin 必须在 manifest.origins 内，否则渲染错误态而非加载）。
3. 消息桥（最小版）：宿主侧 `usePluginBridge(pluginId)`——握手（plugin → shell `hello`，shell 回 `ack` 并校验 `event.origin`）、`plugin:<id>:*` 通道收发；插件侧提供一个 `<script>` 片段或 `@innate/web-domain` 内 helper 供可选接入（不接入则纯展示，无桥）。
4. 宿主路由：填充 webshell `/plugins/$pluginId` 占位——查 manifest（不存在→404 态）、渲染 PluginIframeView、nav 进 shell 导航。
5. 测试夹具：本地起两个静态服务（如 `localhost:5500` shell、`localhost:5501` 假外部插件页），manifest 指向 5501。

## Verify 点

- [ ] shell 导航出现 iframe 插件项，点击进入 `/plugins/<id>`，iframe 正常加载外部页；
- [ ] 假插件页主动 postMessage 握手，宿主在 origin 匹配时 ack、桥消息双向可收发；**伪造 origin / 未登记 origin 的消息被丢弃**（console 有 warn）；
- [ ] manifest 的 `iframeSrc` origin 不在白名单时渲染明确错误态，不发起加载；
- [ ] 外部页 404/超时时呈现降级 UI（错误态 + "Open in new tab"）；
- [ ] sandbox 属性齐全，插件页无法触碰 `top.location`（尝试时被浏览器拦截）。

## 执行记录（2026-09-16）

- 协议 `innate.web-plugin.v1` 落地 `apps/webshell/src/plugins/types.ts`：manifest 类型 + `validateIframeManifest`（含 `origins: ["self"]` 相对路径支持，服务静态导入产物）
- `PluginIframeView`：sandbox iframe（allow-scripts allow-same-origin allow-popups allow-forms）+ loading/错误/降级 UI + `usePluginBridge`：hello→ack 握手、`event.origin ∈ 白名单` 校验（含 event.source 比对）、未登记 origin 丢弃并 warn、`shell:ack` 显式单播（绝无 targetOrigin="*"）、8s 握手超时提示
- `/plugins/$pluginId` 宿主路由：未登记/禁用 → 明确错误态；TanStack SPA 参数路由无 static-export 阻塞（对照 innate-wip 教训成立）
- 验证：E2E 用本地夹具（e2e/fixtures/external-plugin，bun 静态服务 5501）完成加载+握手全链路；单测覆盖白名单全部分支（含 self/非法 URL/越权 origin）
