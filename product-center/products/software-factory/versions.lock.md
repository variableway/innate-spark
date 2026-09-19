# 版本钉

| 组件 | 角色 |
|---|---|
| DeepSeek Harness | 唯一运行时。`npx @deepseek-ai/dsh web`；preview 允许破坏性变更 |
| Cordis `@deepseek-ai/cordis` | 插件框架；插件必须 import 该 scope |
| `dsh-base` / `dsh-web-app` | 官方 bundle 层，本厂叠在后面 |
| `llm-pi-ai` | Pi 作为 **ctx.llm** 适配器（已有包） |
| `@mariozechner/pi-ai` | llm-pi-ai 的实现依赖，业务插件不直接引用 |
| `@mariozechner/pi-coding-agent` | 仅 L2 `dsh-subagent-pi` 或 L3 `dsh-agent-loop-pi` 可依赖 |
| Go 1.27 / embedded-postgres V16 | runners 插件子进程 |

实现第一天把 npm 版本填进本表。
