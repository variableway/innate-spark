# T12 — 部署管线（Pages / Cloudflare 双目标）

> **状态：已完成（2026-09-16）**
> 阶段：P3 · 独立任务。输入是任一份静态产物（早期可用 web-showcase 或 webshell 手动 build 的 dist 验证），不依赖 T10 完成才可开工。

## 目的

为 webshell 及其插件产物建立可持续的部署管线：GitHub Pages 与 Cloudflare Pages 双目标、按路径触发、产物可回滚，并把外部 iframe 插件的部署约定（各自独立部署、shell 只维护 manifest）写进文档。

## Context

- 现成模板（innate-wip `.github/workflows/`，可直接改造）：
  - `deploy-pages.yml`：push main → setup-workspace → build:static → `actions/deploy-pages@v4`；`GITHUB_PAGES=true` 时自动加 `basePath`/`assetPrefix`（`apps/web/next.config.mjs` 的做法）；
  - `deploy-cloudflare.yml`：`wrangler pages deploy dist --project-name=<name>`，受 repo 变量 `ENABLE_CLOUDFLARE` 开关控制双目标；
  - `full-deploy.yml`：cron 定时全量管线（数据回流场景）——webshell 无数据回流需求，**不引入** cron。
- innate-fe-base 侧现成参照：`apps/web-showcase` 静态导出 + basePath 仅 CI 时启用（`apps/web-showcase/next.config.js:5-20`）+ `.github/workflows/deploy-web-showcase.yml` 的按 packages 路径触发。
- 前置注意：T01 修复 lockfile 之前，innate-fe-base 的 CI/CD 均无法真正跑通——本任务的 workflow 编写可与 T01 并行，但首次真实部署依赖 T01 完成。

## 实现方式

1. `deploy-webshell.yml`（innate-fe-base 仓）：
   - 触发：push main 且路径命中 `apps/webshell/**`、`domains/**`、`packages/web-domain/**`、`tools/**`、`public/plugins/**`；
   - 步骤：checkout → pnpm 安装（frozen）→ `bun tools/fe-plugin-cli/src/cli.ts all`（T10 就绪前退化为 `pnpm --filter webshell build`）→ Pages 部署 `deploy/`；
   - basePath：Pages 项目页启用 `basePath: /<repo>`，构建变量注入（沿用 web-showcase 方案）。
2. Cloudflare 目标：同 workflow 内独立 job，`ENABLE_CLOUDFLARE` 变量开启时 `wrangler pages deploy`，project 名 `innate-webshell`；注意 Cloudflare 无 basePath 需求 → 构建需支持 `--public-path=/` 与 `--public-path=/<repo>/` 两种产物（CLI 参数）。
3. 外部 iframe 插件约定文档（`apps/webshell/docs/deploy.md`）：插件自行部署 → 提 PR 更新 shell manifest（iframeSrc + origins）→ shell 重新部署即接入；origin 白名单变更必须 PR 评审。
4. 回滚：Pages 版本化自带回滚；Cloudflare 侧记录 deployment id 进 workflow summary。

## Verify 点

- [ ] push 命中路径触发 workflow，Pages URL 打开 shell 且各启用插件路由可达；
- [ ] 开启 `ENABLE_CLOUDFLARE` 后 Cloudflare URL 同样可用（无 basePath 场景产物正确）；
- [ ] 未命中路径的纯文档 push 不触发部署；
- [ ] 外部 iframe 插件按文档流程接入一次真实演练（部署假插件 → PR 更新 manifest → shell 部署后导航出现）；
- [ ] Pages 控制台执行一次回滚操作成功恢复上一版本。

## 执行记录（2026-09-16）

- `.github/workflows/deploy-webshell.yml`：路径触发（apps/webshell/domains/packages/web-domain/tools）；**Pages 子路径组合**（同仓仅一个 Pages 站点且根路径被 showcase 占用 → artifact = showcase(根) + webshell(/webshell/)，PUBLIC_PATH 注入 vite base）；Cloudflare job 受 vars.ENABLE_CLOUDFLARE 开关（PUBLIC_PATH=/，wrangler project=innate-webshell，deployment id 进日志）
- ci.yml：bun setup + gen --check + verify-flags + 新增包测试 + bun test + E2E
- 文档：apps/webshell/README.md（接入双轨 + 命令）+ docs/deploy.md（目标/子路径组合原理/外部插件 PR 流程与 origin 评审要求/消息桥接入/已知限制）
- 未实测：真实 push 触发的 Pages/Cloudflare 部署与回滚演练（需远端执行，本地仅静态校验 yaml 与 PUBLIC_PATH 构建路径）
