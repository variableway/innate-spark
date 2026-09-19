# 06 · 任务分解

编号 `SF-<phase>-<nn>`。估时人日。

## 横切

| ID | 任务 | 人日 | 验收 |
|---|---|---|---|
| SF-X-01 | 钉 DSH / Cordis 版本；记录 `dsh plugin` 与 `--dump-config` | 1 | `versions.lock.md` 有可安装版本 |
| SF-X-02 | artifact-lib：引用 yorun-qa schemas + factory-run 作投影形状 | 1 | 单测不启动 dsh |
| SF-X-03 | material pack YAML 作为插件 config 样例 | 0.5 | 无绝对路径 |
| SF-X-04 | 维度词典单源 | 0.5 | UI 与报告共用 |

## P0 插件骨架

| ID | 任务 | 人日 | 验收 |
|---|---|---|---|
| SF-0-01 | hello 插件 apply + inject + package.json `dsh` 字段 | 1 | dump-config 可见 |
| SF-0-02 | `dsh plugin --profile web add` 文档化 | 0.5 | README 可复现 |
| SF-0-03 | artifact-lib scanner 扫 material | 2 | 阶段填充表 |

## P1 Bundle + 看板

| ID | 任务 | 人日 | 验收 |
|---|---|---|---|
| SF-1-01 | bundle `cordis.patch.yml` insert board（双面） | 2 | web 启动无报错 |
| SF-1-02 | host projection：扫描结果 | 2 | 看板只读 |
| SF-1-03 | client slots：阶段列、打开 md | 3 | 不离开 dsh 能读 US |
| SF-1-04 | 复用官方 Trajectory，不重画聊天 | 0.5 | 空会话可开 |

## P2 Preset + Skill

| ID | 任务 | 人日 | 验收 |
|---|---|---|---|
| SF-2-01 | preset 根挂进 agentPresets config（整行覆盖注意 restatement） | 1 | 选择器出现 factory-* |
| SF-2-02 | factory-s3-us：skill-filesystem customSkillDirs + isolate 规则 | 2 | 第二会话不撞 service |
| SF-2-03 | command `/run-stage` → `ctx.agents.create` | 2 | 无 spawn pi |
| SF-2-04 | skip_if_outputs_exist + force | 0.5 | 默认不覆盖 |
| SF-2-05 | fixture 生成 US | 2 | CI 用 headless profile |

## P3 Runners

| ID | 任务 | 人日 | 验收 |
|---|---|---|---|
| SF-3-01 | runner 插件：catalog/validate/trace | 2 | tool + command |
| SF-3-02 | `run_go_test` 走 sandbox+jobs | 2 | 可取消 |
| SF-3-03 | 报告 iframe | 1 | 两维 + go-cover 侧栏 |
| SF-3-04 | 覆盖文案：MaterialType core/impl | 0.5 | KPI 正确 |

## P4 Guard

| ID | 任务 | 人日 | 验收 |
|---|---|---|---|
| SF-4-01 | tools/pre-execute 拦 skel | 1 | 冻结后 edit 失败 |
| SF-4-02 | freeze/ack/sign commands | 2 | 无模型回合 |
| SF-4-03 | 失败摘要 inject + s8 preset | 2 | 只写测试 glob |
| SF-4-04 | goals + resume | 2 | 杀 dsh 再开能续 |
| SF-4-05 | 改红再绿演示 | 1 | README |

## P5 Desktop

| ID | 任务 | 人日 | 验收 |
|---|---|---|---|
| SF-5-01 | desktop profile add 同一 bundle | 2 | 无 loopback |
| SF-5-02 | go test PATH / sandbox 例外 | 2 | 桌面能跑 |
| SF-5-03 | 离线看历史 session | 1 | 无网 |

## P6 SQL / 签收

| ID | 任务 | 人日 | 验收 |
|---|---|---|---|
| SF-6-01 | pgembed 实现 + job 包装 | 2 | skip + howToStart |
| SF-6-02 | sign-handoff 写文件 | 1 | handoff.json |
| SF-6-03 | howToStart 文案 | 0.5 | 与 job 输出一致 |

## 刻意不做（相对旧计划）

| 取消 | 原因 |
|---|---|
| `pi-adapter` + AgentSessionRuntime 池 | 绕过 session/tools/sandbox |
| 独立 `factory` CLI 作为应用入口 | DSH 只认 `dsh --profile` |
| Skills 双载到 Pi package.json | 只走 ctx.skills |

v2 才评估 `dsh-subagent-pi`（SF-V2-01）。
