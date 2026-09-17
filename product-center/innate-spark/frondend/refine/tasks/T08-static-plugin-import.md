# T08 — 静态插件导入（dist → public/plugins/&lt;id&gt;/）

> **状态：已完成（2026-09-16）**
> 阶段：P3 · 独立任务。输入只依赖"一份符合目录约定的静态产物"（T07 或任意静态站产物），可先用手工放置的夹具开发。

## 目的

实现"独立打包出来的东西，经过一定配置可以 plugin 到 web 项目中"（overview 目标 4 后半）：把外部/独立的静态产物安全地导入 shell 的 `public/plugins/<id>/`，并以 `runtime: 'static'` 的 manifest 形态出现在导航里。

## Context

- 历史参照：innate-fe-base 曾有 `apps/desktop-base/scripts/import-static-app.mjs`——clone 远端仓库 → install/build → 拷入 `public/plugins/<plugin-id>/` → 登记 `src/plugins.ts`（脚本本体已随 desktop 线迁出，模式记录于 `docs/achieve/desktop-shell.md`）。
- 安全治理参照：`base/innate-fe-base/tasks/features/skill-refine/P0/P0-03-secure-static-plugin-import.md`——默认只收**静态产物**、源码构建需显式信任开关、frozen lockfile、dist 逃逸/symlink 校验、staging 目录 + 原子替换。本任务按此清单实现。
- 与 T06 的分工：T06 是 external-url（运行时 iframe 指向远端）；本任务是 **static**（产物随 shell 同源部署）——同协议 `innate.web-plugin.v1` 的另一种 runtime，iframe 加载同源路径。

## 实现方式

1. bun 脚本 `scripts/import-static-plugin.ts <id> --from <dir|git-url>`（落在 webshell app 或 innate-fe-base 根 tools）：
   - `--from dir`：直接取本地 dist；`--from git-url`：clone 后**只寻找已构建的静态产物**，若需在本地跑 install/build 必须显式 `--trust-source`；
   - 校验：目标必须是纯静态（存在 index.html）、无 symlink、无 `../` 逃逸路径；
   - 写入：先拷到 `public/plugins/.staging/<id>/` 校验通过后原子 rename 到 `public/plugins/<id>/`。
2. manifest 登记：更新 registry 的 static 条目（`iframeSrc: '/plugins/<id>/index.html'`、同源 origin），navigation 自动出现。
3. `.gitignore` 决策：默认 ignore `public/plugins/`（每次导入重建，可重复）；如需版本化个别小插件可白名单。
4. 卸载：`--remove <id>` 清目录 + 摘除 manifest 条目。

## Verify 点

- [ ] 从本地 dist 导入后，shell 导航出现该插件，iframe 同源加载成功，bridge 握手在 same-origin 分支通过；
- [ ] 含 symlink / 越界路径 / 无 index.html 的恶意夹具被拒绝，报错信息指出原因；
- [ ] `--from git-url` 不带 `--trust-source` 时拒绝执行任何 install/build；
- [ ] 导入过程 shell 可正常 dev（staging + 原子替换下无半成品状态被 vite 观察）；
- [ ] `--remove` 后导航消失、目录清空、可重复导入同 id 无残留。

## 执行记录（2026-09-16）

- 核心逻辑 `tools/fe-plugin-cli/src/lib/import-static.ts` + CLI 封装 `apps/webshell/scripts/import-static-plugin.ts`（bun）
- 安全清单全部落地：git 源默认拒绝（需 `--trust-source` + 可选 `--build-command`）、纯静态校验（根 index.html）、symlink 拒绝、路径逃逸拒绝、staging 拷贝后二次校验、旧目录挪 `.trash` 后原子 rename、manifest upsert（origins: ["self"]）
- 实测：本地 dist 导入 → 导航出现（iframe 同源加载）；重复导入原子替换；无 index.html / symlink 夹具被拒且报错指出原因；--remove 清目录+摘 manifest 无残留
