# 10 · 风险

| ID | 风险 | 缓解 |
|---|---|---|
| R1 | DSH preview 周更，插件 API 碎 | 钉版本；只依赖公开 seam；每周 `--dump-config` |
| R2 | patch config 整行替换漏字段 | 覆盖官方行时抄全量；优先 insert 自己的 id |
| R3 | preset 服务行忘记 isolate，第二会话碰撞 | 对照 standard preset；mount audit 失败即修 |
| R4 | 工厂 inject 了 agentLoop 或 spawn 外部 runtime，导致无法 L3 热换 | 依赖审查：只允许 ctx.agents；CI grep import agent-loop |
| R11 | L3 适配器未走 ctx.tools，冻结失效 | SPI 清单验收：pre-execute 仍能拦 skel |
| R5 | go test 在 sandbox 找不到 toolchain | pack 声明 confine 例外 |
| R6 | desktop 与 cli profile 两份插件 | 同一 bundle 分别 add；CI 两 profile dump-config |
| R7 | 模型覆盖人审 US | skip_if_outputs + ack command |
| R8 | iframe 报告在 dsh-app:// 下失败 | host 资源通道 |
| R9 | 把 workflow 脚本当门禁 | 门禁用 commands + pre-execute；workflow 只编排 |
| R10 | `llm-pi-ai` 与 `llm-deepseek` 路由混乱 | pack/profile 写明默认 adapter |

开放问题：工作区根默认 cycle-all；单用户无账号；headless CI 用同一 bundle。
