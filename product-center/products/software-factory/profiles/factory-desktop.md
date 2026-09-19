# Desktop = 同一 bundle，另一个 profile

官方 Desktop 占用 `$DSH_HOME/profiles/desktop`。工厂：

```bash
dsh plugin --profile desktop add ./packages/dsh-factory-bundle
```

（以当时 Desktop 是否暴露 `dsh plugin --profile desktop` 为准；若只有捆绑 pnpm store，则按 DSH 文档在该 profile 的 package.json 里加依赖并 reconcile bundles。）

约束不变：无 loopback；与 CLI profile 不共享 node_modules。Client 半 `dsh.client.platform` **永远是 `'web'`**（Desktop 复用同一 client 图，没有单独的 desktop platform）。详见 [docs/08-ui-surfaces.md](../docs/08-ui-surfaces.md)。

现成壳 / 插件对照（Electron 5 选、Tauri 5 选）：[docs/11-existing-github-matches.md](../docs/11-existing-github-matches.md) 第 11、12 节。工厂不自写桌面应用；只把同一 bundle 挂进官方（或社区）Desktop Host。
