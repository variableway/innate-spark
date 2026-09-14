# Registry Schema

本目录是 innate-workspace（innate-factory）的四张登记表。2026-09-12 从兄弟目录 `innate-works/registry/` 迁到本 hub 的 `tools/registry/`。

设计全文见兄弟仓 `innate-works` 内 `innate-apps/content/innate-wip/docs/solution/innate-factory.md`，sprint 执行文档见 `innate-works/docs/innate-factory/`。

## 红线：不动的部分

- **兄弟仓根目录 `innate-works/registry.yaml` 仍留在原处**——它管理 references 克隆，功能已由 spark-cli 实现，`scan.py` / `clone.py` 对它的行为不在本目录范围内

## 四张表

| 文件 | 同步方向 | 内容 |
|------|----------|------|
| `apps.yaml` | scan 同步（目录为源）+ 手工扩展字段 | app / base / 外部克隆的登记（hub：`base/`；外部：`innate-apps/`、`skills/`） |
| `plugins.yaml` | 纯手工 | 双轨插件清单（package / iframe） |
| `skills.yaml` | 纯手工 | Agent skill 分层清单（repo / user） |
| `deploy.yaml` | 纯手工 | app → 部署目标映射 |

## apps.yaml 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` / `repo` / `path` / `desc` | scan 维护 | 基础四字段，目录为源 |
| `kind` | 手工 | `app`（我方应用）｜`base`（基座）｜`external`（外部克隆）｜`archived`。**缺省 = external** |
| `template` | 手工 | 生成该 app 所用模板（如 `app-content`） |
| `templateVersion` | 手工 | 生成时模板版本（升级是显式动作，doctor 报告落差） |
| `deploy` | 手工 | 部署目标列表（与 deploy.yaml 互为索引） |
| `publishes` | 手工 | 该条目发布到私有 npm 的包名列表（仅 base 类） |

### kind 模型决策记录（2026-09）

- 原设计 `core | satellite` 二分**已废弃**：它意味着两套共享机制（核心仓 workspace:* + 基座发布），是不统一的根源
- 收敛为一套：**base 是唯一共享源**（ui / plugin / sdk 全部从 base 发布），所有 app 平等消费（`kind: app`），innate-wip 不再有特殊地位，只是第一个 app
- 复用规则一句话：**跨 app 复用 → base；app 私有 → app 仓**
- plugin 归属按复用视野判断：making / cheatsheets / awesome（通用引擎）→ base（`targetHome: @innate/plugin-*`）；writing / feed（站点私有内容主题）→ 留在 app 仓

### scan 的字段保留契约

`innate-registry-cli scan`（`tools/innate-registry-cli`）的 read → merge → write 会**原样保留** `kind / template / deploy / publishes` 等扩展字段（含 `@` 开头的包名引号处理）。验收方式：跑 scan 后扩展字段不丢失、条目不重排。`--regenerate` 会丢弃全部扩展字段，慎用。

同步命令：

```bash
bun tools/innate-registry-cli/src/cli.ts scan          # 写本文件 apps.yaml
bun tools/innate-registry-cli/src/cli.ts clone         # 按 path clone 到 innate-works
```
