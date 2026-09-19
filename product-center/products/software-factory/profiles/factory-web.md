# factory 叠在官方 web profile 上

不要自造「factory-web 应用」。用户：

```bash
dsh plugin --profile web add ./packages/dsh-factory-bundle
dsh --profile web --dump-config   # 应出现 factory 层注释
dsh web
```

`dsh plugin` 会按已安装、且声明了 `dsh.bundle` 的包 reconcile `dsh.profile.bundles`。本厂 bundle 出现在 `@deepseek-ai/dsh-base` 与 `@deepseek-ai/dsh-web-app` **之后**。

本机路径（pack 根、模型）只写在 `$DSH_HOME/profiles/web/cordis.patch.yml`，整行替换我们暴露的 config，不要改 bundle 源码。
