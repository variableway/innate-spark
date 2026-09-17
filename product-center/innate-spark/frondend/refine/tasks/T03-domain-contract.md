# T03 — domain 插件契约包 `@innate/web-domain`

> **状态：已完成（2026-09-16）**
> 阶段：P1 · 独立任务。包本身独立开发与测试（自带 standalone router 消费方即测试场），不依赖 T02 的 shell 存在。

## 目的

在 innate-fe-base 新建 `packages/web-domain`，定义 domain 插件与宿主之间的**编译期类型契约**：typed builder、outlet 挂载、capability 协商、防呆校验、单仓 standalone router。这是整个插件化方向的协议核心。

## Context

- 参考实现（cycle，全部可读源码）：
  - builder：`cycle-all/cyacle/domain/base/src/web/src/routes/domain/builder.ts`（不可变链式 + `const` 泛型保留 path/params 字面量类型）；
  - collect 防呆：`cycle-all/cyacle/domain/base/src/web/src/routes/domain/collect.ts`（重复 id / 未知 outlet / 禁用 outlet 被 used 即 throw，`:131-225`）；
  - standalone：`cycle-all/cyacle/domain/base/src/web/src/routes/domain/standalone-router.ts`（domain 单仓开发时 `<Link>`/`navigate` 类型可用，不被 app 导入）；
  - 宿主组装：`createWebRouter` + `reparent-route`（类型重绑到真实 outlet）。
- 已知取舍：cycle 的类型体操很重（analysis R4）。**第一版允许宽松**：路由树类型可降级为 `AnyRoute`，但必须保住 ①outlet 字面量校验 ②nav/capability 的结构类型 ③collect 的运行时防亡。
- 依赖约束：本包 peerDependencies 仅 `@tanstack/react-router` + `react`；**不依赖任何 app，不反向依赖 `@innate/ui`**（innate-fe-base 分层铁律）。

## 实现方式

1. `createWebDomain(id)` 返回链式 builder：
   - `.addRoute(outlet, factory)`：outlet 参数类型收敛为 `Outlets` 字面量联合；`factory(parentRoute)` 返回子路由树；
   - `.addCapability(key, value)`：capability 以 `key -> value` 显式注册（首批约定 key：`nav`（导航元数据）、`permissionCodes`、`homeTile`）；
   - `.disable()`/`.enabled(flag)`：与宿主 feature flag 对接的声明位。
2. `collectWebDomains(domains, rootOutlets)`：按 outlet 分组调 factory；校验重复 id、未知 outlet、被禁用 outlet 的使用，违例 throw 带插件 id 的错误。
3. `collectCapabilities(domains, key)`：宿主按 key 拉取全部插件能力。
4. `createStandaloneWebDomainRouter(domain)`：为单个 domain 生成临时根路由的 router（dev 预览与单仓类型支持）。
5. 包出口 `./globals.css` 约定（空文件占位）：为 T09 的样式聚合预留统一接缝。
6. vitest 单测覆盖全部防亡路径与 builder 不可变性。

## Verify 点

- [ ] `pnpm --filter @innate/web-domain test`：全部防亡断言绿（重复 id / 未知 outlet / 禁用 outlet / capability 覆盖行为符合设计）；
- [ ] 类型测试（expectTypeOf 或 tsc fixture）：outlet 传错字面量在编译期报错；`addRoute` 后链式再 `addCapability` 类型不丢 id；
- [ ] 用 standalone router 在测试页里真实渲染一个内存 domain（可临时挂在包内 `examples/`），`<Link>`/`navigate` 可用；
- [ ] `pnpm --filter @innate/web-domain exec tsc --noEmit` 通过，且无 React 双类型告警（peer 声明 + tsconfig paths 钉法参照 cycle `change.web.md:104-125`）。

## 执行记录（2026-09-16）

已落地 `packages/web-domain`（@innate/web-domain）：
- `createWebDomain(id)` 不可变链式 builder + `OUTLETS = {app, admin}` 字面量联合；非法 id / 未知 outlet / 重复 capability 构造期即抛
- `collectWebDomainRoutes` 防亡：重复 domain id / 未知 outlet / 禁用 outlet / 同 outlet 重复路由 id → throw（带插件 id）；disabled domain 整体跳过
- `collectWebDomainCapabilities` / `collectNavItems`（畸形 nav 显式抛错，order 排序）
- `createStandaloneWebDomainRouter`（memory history，standalone.ts，不被 app 导入）
- 类型取舍按文档执行：路由树宽松（AnyRoute/addChildren any[]），保住 outlet/能力结构类型
- 验证：vitest 19/19（含 builder 不可变、全防亡路径、standalone）、typecheck/lint 绿；peer 仅 @tanstack/react-router
