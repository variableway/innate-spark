# T04 — Shell UI 基座

- **阶段**：P1　**前置**：无　**产物**：`packages/web-shell` → `@innate/web-shell`
- **对应目标**：[G7](../overview.md)（复用优先，不重复造）

---

## 目的

把"外壳长什么样"从"外壳怎么组装"里拆出来。具体是三件**纯逻辑**：

1. 插件清单 → 导航模型（`buildNavModel`）
2. 当前路径 → 激活态（`isNavItemActive`）
3. 布局容器本身（`AppShellFrame`：品牌位 / 侧栏 / 顶栏 / children）

拆成独立包的理由：这些逻辑既被主 shell app（T03）用，也应能被单个 domain 的独立预览（T07）用——如果它们留在 `apps/web/src` 里，domain 的独立产物就得反向依赖 app，违反 T03 的单向依赖约束。

---

## Context

### 参考实现（可搬逻辑，不可搬耦合）

innate-wip 的侧栏与顶栏已经实现了分组渲染与激活态：
[app-sidebar.tsx](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/components/app-sidebar.tsx)、
[site-header.tsx](file:///Users/patrick/workspace/variableway/innate-spark/innate-apps/content/innate-wip/apps/web/components/site-header.tsx)。

但它**直接 import `lib/plugins/registry.ts`**（业务耦合），本任务只抽出去掉该依赖后的部分，改由 props / 参数注入 manifest。

### 不要新写 UI 原语

`@innate/ui` 已有 55 个 shadcn primitive，其中本任务需要的直接可用：

| 用途 | 现成组件 |
|---|---|
| 侧栏容器 | `packages/ui/src/components/ui/sidebar.tsx` |
| 面包屑 | `breadcrumb.tsx` |
| 用户菜单 | `dropdown-menu.tsx` |
| 主题切换 | `theme-provider.tsx` + `packages/ui/src/themes/*.css` |
| 页面容器 | `packages/admin-composites/src/page-container.tsx` |

**Won't Borrow 之一**（见 analysis §6）：不复制 shadcn 组件到新包。

### 依赖方向

```
@innate/web-shell  →  @innate/plugin-contract（只读类型）
                   →  @innate/ui（primitive）
                   ✗  @innate/domain-*（禁止）
                   ✗  apps/*（禁止）
```

---

## 实现方式

1. **目录**

```
packages/web-shell/
├── package.json      # @innate/web-shell, exports: { ".": "./src/index.ts" }
├── tsconfig.json     # extends @innate/tsconfig/base.json
├── vitest.config.ts
└── src/
    ├── index.ts
    ├── app-shell-frame.tsx
    ├── nav-model.ts
    ├── nav-utils.ts
    └── types.ts
```

2. **纯函数签名**（`nav-model.ts` / `nav-utils.ts`）

```ts
export interface NavSection {
  id: string
  label: string
  icon?: string
  items: readonly PluginNavItem[]
}

export function buildNavModel(plugins: readonly PluginManifest[]): NavSection[]
export function isNavItemActive(pathname: string, href: string): boolean
```

`buildNavModel` 只吃 manifest（T01 定义），不 import 任何 domain。

3. **激活态用路径段边界比较**，不用裸 `pathname.startsWith(href)`。必须成立的四组：

```
isNavItemActive('/making/weekly', '/making')        // true  （父项在子页仍激活）
isNavItemActive('/making',        '/making/weekly') // false
isNavItemActive('/making-x',      '/making')        // false ← 关键：不是前缀命中
isNavItemActive('/making',        '/')              // false （'/' 不应吞掉一切）
```

4. **`AppShellFrame` 的 props 只接受模型，不接受插件**：

```ts
interface AppShellFrameProps {
  brand: ReactNode
  navSections: readonly NavSection[]
  currentPath: string
  headerSlot?: ReactNode
  children: ReactNode
}
```

保持与 manifest 解耦，便于在测试里直接喂假数据。

5. **排序稳定性**：`order` 升序，未声明 `order` 的排在最后并按 `id` 字典序，保证同一组输入永远产出同一顺序（生成物与快照测试都依赖这一点）。

---

## Verify

| # | 命令 / 断言 | 预期 |
|---|---|---|
| 1 | `pnpm --filter @innate/web-shell test` | 通过 |
| 2 | `buildNavModel` 排序用例 | `order` 生效；无 `order` 的稳定落尾；同输入两次调用结果 `toEqual` |
| 3 | `isNavItemActive` 四组边界用例（见实现方式 §3） | 全部通过，尤其 `/making-x` → `false` |
| 4 | 输入 `[]` | 返回 `[]`，不抛错 |
| 5 | 输入含 `enabled: false` 的 manifest | 由调用方先过滤；本函数不做过滤（单测固定该边界：传入即输出） |
| 6 | `pnpm --filter @innate/web-shell typecheck` | 通过 |
| 7 | `grep -rn "@innate/domain-" packages/web-shell/src` | 无输出 |
| 8 | `grep -rn "apps/" packages/web-shell/src` | 无输出（无反向依赖） |

**通用门槛**（见 [README](./README.md)）另需满足幂等与版本声明两项。
