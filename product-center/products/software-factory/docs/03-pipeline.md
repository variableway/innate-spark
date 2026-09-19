# 03 · 工厂流水线（阶段 = preset + command/tool + goal）

对应 Cycle G1–G4。跨阶段必须过人 command；阶段内部是同一次 DSH Session 上的 agent-loop 迭代。

## 1. 阶段总图

```text
S0  Workspace bind                 command（无模型）
S1  Ingest PRD                     preset operator / 只读
S2  requirements.json              preset + skill prd-schema
S3  User Story + Review            preset factory-s3-us → 人 ack command
        ├─ Path B  S4 FE/BE → S4b 写 skel → freeze-skel command
        └─ Path A  已冻结
S5  backend-on-skel                preset factory-s5-backend + skel-guard
S6  catalog/contracts              runner 工具（无模型）
S7  method 测试包                  preset factory-s7-cases
S8  修测试/实现对齐                preset factory-s8-repair
S9  go test nomock/mock/pgembed    runner → ctx.jobs
S10 报告 + Handoff                 projection + sign command
```

G2 = freeze command。G3 = S9 job 绿 + GAP 显式。G4 = sign command。

## 2. 阶段合同（preset 元数据，不是 worker 类型）

| 字段 | 含义 |
|---|---|
| `id` | `S3` |
| `preset` | `factory-s3-us` 或空（纯 command/runner） |
| `skill` | 该 preset 层 `customSkillDirs` 里的 SKILL |
| `inputs[]` / `outputs[]` | 工作区 glob |
| `runner` | `ctx.tools`/`commands` 名，如 `run_go_test` |
| `gate` | exists / schema / human_ack / skel_frozen / tests_green |
| `write_allow` / `write_deny` | 由 skel-guard + fs 政策执行，不是 prompt |

S6、S9、S10 没有 preset 也可以：只跑 runner command。S8 才需要编码 agent。

编排第一期用 **人逐段点 command**（`/run-stage S5` → `ctx.agents.create({ preset })`）。第二期可把 Path A 写成 `ctx.workflowEngine` 脚本，`agent()` 子会话带上对应 preset；需要 Pi 循环时 workflow 指定 `subagentProvider: 'pi'`。

## 3. 门禁（插件强制，不是 Host 私有状态机）

1. **不发明 REST** — contracts 校验器（runner）。
2. **不改冻结 Skel** — `tools/pre-execute`。
3. **AC 原文进 method** — 校验 runner + 人 ack。
4. **产品轨道 ≠ 技术轨道** — 报告 schema。
5. **测试按 method**。
6. **缺口显式**。
7. **覆盖不计 tests / Memory**。
8. **SQL 只用 material-ddl.sql**。
9. **中断可续** — `ctx.agents.resume` + job 句柄；不要另存一份 Pi session id。

## 4. Material 路径映射

与现目录相同（US / backend-on-skel / tests/materialtypes/reports）。工厂托管这些路径，不换哲学。

## 5. 失败

- Agent 阶段失败：同一 Session `resume`，或 command 清空输出重跑。
- Runner 失败：不自动再开模型。S8 配置为 command「带失败摘要 inject 后再 create preset-s8」。
- 并行：不同 Service 可用 jobs；同一 `reports/` 不要两个 job 同写。
