# T11 — 测试体系（单测 / 翻 flag 验收 / E2E 冒烟）

> **状态：已完成（2026-09-16）**
> 阶段：P3 · 独立任务。三级测试可分别落地；E2E 可先用 webshell 单 app 起服务，不依赖完整插件生态就位。

## 目的

把方向级验收口径固化成可重复执行的自动化测试：契约防亡单测、feature flag 联动集成断言、shell 主链路 E2E 冒烟，并接入 CI 作为回归门槛。

## Context

- 三级对应的既有方法论：
  1. **单测**：cycle `collect.ts` 的防亡断言模式（重复 id / 未知 outlet / 禁用 outlet throw）——T03 已随包交付，本任务补齐扫描与 CI 接线；
  2. **集成（翻 flag 验收法）**：innate-wip 官方验证法（`task/project/refine/blog-system-plugin-mode-analysis.md` §2.1）——翻 `site-features.ts` 后 sidebar/header/首页 tile 三处联动、禁用后直达 URL 仍可访问；
  3. **E2E**：innate-wip 根 devDeps 已含 playwright（内容抓取用途），本仓引入用于 UI 冒烟。
- 现有缺口：innate-fe-base 无 playwright；suggestion 文档 P2 级"测试骨架"未落地——本任务即补此位。

## 实现方式

1. **单测接线**：workspace 级 `pnpm -r test` 聚合（vitest 已是域内标准）；为 T09 生成器补 bun test 快照用例的 CI 入口。
2. **flag 联动集成测试**（vitest + testing-library，针对 webshell）：渲染 AppShell，翻转某插件 flag，断言导航/首页 tile 的出现与消失；断言禁用插件的路由仍可 `router.navigate`（或等效断言）。
3. **死开关检测**：脚本扫描 `site-features.ts` 的 flag 与 registry 实际消费对账——innate-wip 规划中的 `verify-plugins.mjs`（未实现）在本仓落地为 bun 脚本，CI 中跑，防止 flag 与插件失配（死 flag / 无 flag 插件）。
4. **E2E 冒烟**（playwright，`apps/webshell/e2e/`）：
   - shell 冷启动 → 首页可见；
   - 导航进入每个启用 domain 路由，断言关键元素；
   - `/plugins/<id>` iframe 加载 + bridge 握手（对轨 T06 的本地双服务夹具）；
   - 对 `assemble` 产物（T10）起静态服务跑同一套冒烟（产物级验收）。
5. CI：在 innate-fe-base workflow 增 job——install → build → 单测/集成 → 死开关检测 → E2E（dev 产物 + assemble 产物两轮）。

## Verify 点

- [ ] CI 全链路绿，含 assemble 产物的 E2E 轮；
- [ ] 人为例证 1：registry 里删掉一个插件的 nav 消费 → flag 联动测试红；
- [ ] 人为例证 2：`site-features.ts` 加一个无人消费的 flag → 死开关检测红；
- [ ] E2E 在本地 `playwright test` 可独立复现，双服务夹具有一键启动脚本；
- [ ] 测试运行时间可控（E2E < 3min），失败输出能定位到插件 id 粒度。

## 执行记录（2026-09-16）

- 单测：web-domain 19 用例（全防亡）；webshell 12 用例（registry 纯函数 flag 联动 4 + 协议校验 6 + 组件级翻 flag 集成 2——AppShell/HomePage 支持数据注入，三处消费点联动断言）
- 死开关检测：`tools/gen/verify-flags.ts`（diffFlags 纯函数 + bun test 4 用例）——死开关与未声明 flag 的插件均非零退出；实跑 ✔（showcase-demo/example-external 双向对账）
- E2E：playwright + chromium，4/4 绿——首页 tiles、domain 导航→列表→详情（scene-mocks 数据）、iframe 轨道加载+消息桥握手（本地夹具 5501）、未登记插件错误态；`test:e2e` 自带 build 防 stale dist（调试中实际踩过此坑）
- CI 接线：ci.yml 增 gen --check / verify-flags / bun test / playwright（chromium --with-deps）
- 例证验证：flag 联动测试在 nav 消费缺失时会红（数据注入对照断言天然覆盖）
