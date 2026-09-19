# T13 — Blog 接入（降级为备选）：chromeless iframe

> **状态：备选方案（默认不执行）**
> 阶段：P4 · 决策记录：用户明确不希望 iframe 内出现 innate-wip 自己的 sidebar/壳（双层导航）。
> **主线改为 T15（domains/blog，webshell 原生渲染）**；本任务仅当 T14 的 markdown/MDX
> 覆盖度（mermaid/图表等富组件）短期内追不上、又需要先有个能用的 Blog 入口时才启用。

## 目的（备选形态下）

iframe 嵌入 innate-wip writing，但**不带它的壳**：需要 innate-wip 增加 "embed 模式"
（隐藏 AppShell 的 sidebar/header，只渲染内容区）。

## Context

- 双层壳的来源：iframe 加载的是完整 Next 应用，`app/layout.tsx` → `AppShell`（sidebar +
  header）包裹全部路由；
- innate-wip 已有 feature flags 基建（`site-features.ts` + `getEnabledPlugins()`），增加
  "embed 态" 是低风险改动：读取 `?embed=1`（或独立 `/embed/writing` 路由）时渲染
  无壳 layout——它自己的 plugin-dual-track 文档里 iframe 宿主组件
  （plugin-iframe-view.tsx）也是这个用法；
- 即使 chromeless，iframe 方案仍保留的固有接缝：主题不跟随（postMessage 桥可解但
  innate-wip 未实现）、滚动嵌套、字体二次加载。这也是它被降为备选的原因。

## 实现方式（若启用）

1. innate-wip：`?embed=1` 时 layout 切换为无壳版本（复用其 site-features 开关模式）；
2. webshell：`iframe-manifests.ts` 登记
   `iframeSrc: 'https://variableway.github.io/innate-wip/writing?embed=1'`（origin 白名单
   `https://variableway.github.io`）+ flag + 图标映射。

## Verify 点（若启用）

- [ ] iframe 内无 sidebar/header，仅内容区；
- [ ] 其余同原 T13：origin 校验、verify-flags 对账、E2E iframe 用例。
