# 00 · 产品愿景

## 要做成什么

一个给 Cycle / Yorun 域团队用的 **软件工厂**：把散落的 Idea、PRD、Skel、实现和测试收成一条可追溯流水线。人决定范围和冻结点；Agent 在门禁之间干活；确定性工具负责 catalog、校验、跑测和覆盖。

目标用户：

| 角色 | 在工厂里做什么 |
|---|---|
| 产品 | 丢 PRD、审 User Story / AC、签 G1 / G4 |
| 研发 | 冻 Skel、看 backend-on-skel、看缺口、改实现 |
| QA | 生成 method 包、跑 nomock/mock/SQL、看两维覆盖 + Go 覆盖 |
| 领域负责人 | 审实体字段、跨域隐藏输入、Mock 边界 |

## 不是什么

- 不是通用 vibe-coding IDE。没有固定 Vine / Skel / 域边界的「随便生成」不算交付。
- 不是把 Cursor 聊天记录产品化。聊天是轨迹的一种投影，产物必须是文件与 Schema。
- 不是只生成测试 JSON。必须能执行，并产出 `RUN-*` 与覆盖报告。
- 不是在 Harness 外面再做一套 Host/Worker。本厂是 **DSH bundle + Cordis 插件 + agent presets + skills**；Pi 只作为 `ctx.llm` / `ctx.subagents` 上的插件。

## 和 vibe coding 的差

来自 `apps/README.md` 的产品假设，工厂必须守住：

1. 在确定的前后端架构下开发（Vine + Skel + 域 `core/impl/repo`）。
2. 文档与 Spec 有序管理（分层产物，禁止把未裁决项写成已定）。
3. 业务可按域拆，流水线按 **method** 测，不按 US 文件复制一套测试。
4. 持续迭代：同一 method 可挂新 US；覆盖报告分业务能力 / 领域能力 / 代码覆盖。

## 成功标准（第一版）

以 **MaterialTypeService** 为垂直切片，在 Web 和 Desktop 上各走通一次：

1. 导入现有 `projects/domain/material/` PRD + US + 冻结 Skel。
2. 跑 Path A（不改 Skel）生成 backend-on-skel 与 method 测试包。
3. 调度 Pi Agent 在 `domain/material/tests/materialtypes/` 工作区维护 Go BDD。
4. 执行 nomock + mock；可选 pgembed SQL 烟雾。
5. 报告三层：User Story、Method、Go 语句覆盖（侧栏源码树，蓝覆盖 / 红未覆盖）。
6. 全程 Session 可 resume / fork / replay；人可在门禁挡住 Agent。

未做到「全公司所有域自动生成」不算失败。第一版只证明工厂能托管现有流水线。
