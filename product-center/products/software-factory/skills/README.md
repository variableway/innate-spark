# Skills

只走 DSH `ctx.skills`。把现有 `.cursor/skills/*` 链到：

- 项目 `.dsh/skills/`（skill-filesystem 默认会扫），或
- preset 里 `customSkillDirs`

不要维护 `pi.skills`。`dsh-subagent-pi` 若存在，内部可把同一目录传给子进程，产品 catalog 仍是 DSH 的。

Preset 层注册的 skill 只对该 preset 的 agent 可见（registry 分层），operator 会话不会自动带上 `prd-to-user-story` 全文。
