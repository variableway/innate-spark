# UC-09 打成本机命令

**情境：** 不想每次敲 `bun tools/.../src/cli.ts`。希望 PATH 里有一条本地命令，目标机也不必装 Bun。

**做法：**

```bash
cd tools/innate-registry-cli && bun test && bun run build
cd ../innate-selfhost-cli && bun test && bun run build
```

产物：

```text
tools/bin/innate-registry-cli
tools/bin/innate-selfhost-cli
```

**例子：**

```bash
./tools/bin/innate-registry-cli scan --help
./tools/bin/innate-selfhost-cli profiles
```

接到 PATH（按自己的习惯改目标目录）：

```bash
mkdir -p ~/bin
ln -sf "$PWD/tools/bin/innate-registry-cli" ~/bin/innate-registry-cli
ln -sf "$PWD/tools/bin/innate-selfhost-cli" ~/bin/innate-selfhost-cli
```

跨平台再加 Bun 的 `--target`，例如 `bun-linux-x64`、`bun-darwin-arm64`。`bin/` 已 gitignore，不要把 binary 提交进仓。
