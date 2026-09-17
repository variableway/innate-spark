# T06 — iframe 宿主路由 + Next.js 插件接入

- **阶段**：P2　**前置**：T03（宿主路由骨架）　**产物**：shell 宿主页 `/plugins/$pluginId` + 样例 Next.js 应用
- **对应目标**：[G4](../overview.md)（异构应用插回主站）、[G5](../overview.md)（可独立打包后插回）

---

## 目的

把"异构技术栈的应用进入主站导航"这条路走通：Next.js / Vue / 任意静态应用**独立构建、独立部署**，通过 manifest 在 shell 里获得一个入口，点击后由宿主渲染 iframe 承载。

这是 plan **D4** 决策的落地：Next.js **不走** route 模式（RSC / 服务端运行时与 TanStack SPA 单 bundle 冲突，论证见 analysis §5.3），异构接入只走 iframe（或 standalone）。

---

## Context

### 现状是一个半成品契约（必须看清再动手）

innate-wip 已经定义了 `loadMode: "iframe"` 与 `iframeSrc`（[types.ts](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/lib/plugins/types.ts)），但：

- 全仓 grep `loadMode` / `iframeSrc` **零消费者**（3 个插件全是 `route`）；
- `components/plugin-iframe-view.tsx` 是**死代码**；
- 宿主路由 `/plugins/$pluginId` **不存在**（`app/` 下无 `plugins/` 目录）。

所以这是"契约先行、实现缺失"，本任务把它补完。

### 必须修正的反例：假隔离

现有 iframe 组件写的是 `sandbox="allow-scripts allow-same-origin"`。

**两个 token 同时出现等于没有隔离**：脚本可访问 `parent.document`、可读写宿主 `localStorage`。这是 R5 记录在案的问题，本任务必须收口到显式二选一（见实现方式 §2）。

### 必须固化的部署契约（plan §6.3）

| 项 | 约定 |
|---|---|
| 宿主侧 | manifest 的 `iframeSrc` 写**绝对路径** `/plugins/<id>/` |
| 插件侧 | 构建 `base` 必须与该路径一致，资源引用不得用根绝对路径 |
| 安全 | 不可信内容**只用** `allow-scripts`；需要持久化则 `postMessage` 交给宿主代管 |
| 版本 | 宿主与插件**独立发布**，宿主不感知插件版本；破坏性变更靠 URL 与接口约定隔离 |

### 已知坑（innate-wip 踩过）

Next.js 静态导出（`output: 'export'`）+ 动态路由 `generateParams` 返回空会**构建失败**。因此样例应用只用静态路由；动态路由作为已知限制写入 T10 的文档，不在此任务硬碰。

---

## 实现方式

1. **宿主路由** `apps/web/src/pages/plugins.$pluginId.tsx`

```tsx
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/plugins/$pluginId',
  component: PluginHostPage,
  notFoundComponent: PluginNotFoundPage,
})
```

`PluginHostPage` 流程：`{ pluginId } = Route.useParams()` → `getPluginById(pluginId)` → 校验 `enabled && loadMode === 'iframe' && iframeSrc` → 渲染 `<IframePluginHost />`；**校验失败一律走 notFound**，不渲染空白 iframe、不静默。

2. **受控组件** `packages/web-shell/src/iframe-plugin-host.tsx`

```ts
interface IframePluginHostProps {
  src: string
  title: string
  sandbox?: 'strict' | 'trusted'   // 默认 'strict'
  onMessage?: (e: MessageEvent) => void
}
```

- `strict` → `sandbox="allow-scripts"`；`trusted` → `sandbox="allow-scripts allow-same-origin"`；
- `src` 用 `new URL(src, window.location.origin)` 解析：**must be same-origin 或命中显式白名单**，否则抛错（防开放重定向把 iframe 指向任意站点）；
- 监听 `message` 时校验 `event.origin`，未通过白名单的消息直接丢弃。

3. **样例应用** `apps/next-plugin-demo/`，`next.config.js` 关键项：

```js
module.exports = {
  output: 'export',
  distDir: 'dist',
  basePath: '/plugins/demo',
  assetPrefix: '/plugins/demo/',
  trailingSlash: true,          // 静态托管下避免 /plugins/demo 404
  images: { unoptimized: true }, // export 模式必须
}
```

4. **清单接入**：样例应用在自己的 `package.json` 声明（无需改 shell 任何代码）

```jsonc
{
  "name": "@innate/next-plugin-demo",
  "innatePlugin": {
    "id": "demo",
    "kind": "iframe-app",
    "loadMode": "iframe",
    "iframeSrc": "/plugins/demo/",
    "entry": "./src/web/index.ts"   // 记录资源入口（无需导出 webDomain）
  }
}
```

`fe gen` 汇总进 `registry.gen.ts`；shell 的导航与 `/plugins/$pluginId` 路由均由注册表驱动。

5. **部署组装**：样例 `dist/` 由 T07 的组装步骤拷贝到 shell 站点的 `/plugins/demo/` 子路径。本任务先手工验证一次路径假设成立。

---

## Verify

| # | 命令 / 断言 | 预期 |
|---|---|---|
| 1 | 启动 shell → 导航出现 Demo 入口 → 点击 | 进入 `/plugins/demo`，iframe 内容正常渲染 |
| 2 | 单测：`IframePluginHost` 渲染 `sandbox="strict"` | 属性值为 `allow-scripts`，**断言输出字符串不含 `allow-same-origin`** |
| 3 | 单测：`src` 传跨域地址且不在白名单 | 抛出错误，不渲染 iframe |
| 4 | 单测：路由模式插件（`loadMode: 'route'`）走 `/plugins/<其 id>` | 渲染 notFound，不抛运行时异常 |
| 5 | 手工隔离验证：样例应用内执行 `window.parent.document` | 抛安全错误（证明 strict 生效，非假隔离） |
| 6 | 直接访问 `/plugins/demo` 并刷新 | 可加载（深链可用） |
| 7 | 只启动样例应用（不启 shell） | 应用自身完整可用（独立部署形态成立） |
| 8 | `pnpm -r typecheck` | 通过，既有 app 不受影响 |

**通用门槛**（见 [README](./README.md)）全部适用。
