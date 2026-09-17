# UC-09 打成本机命令

**情境：** 不想每次敲 `bun tools/fire-skills/.../src/index.ts`。希望 PATH 里有一条本地命令，目标机也不必装 Bun。

**做法：**

```bash
cd tools/fire-skills && bun test && bun run build:all
```

产物：

```text
tools/fire-skills/dist/index.js      # node target
tools/fire-skills/dist/skill-spark   # 单文件 binary
```

**例子：**

```bash
./tools/fire-skills/dist/skill-spark registry scan --help
./tools/fire-skills/dist/skill-spark selfhost profiles --config tools/fire-skills/config.json
```

接到 PATH（按自己的习惯改目标目录）：

```bash
mkdir -p ~/bin
ln -sf "$PWD/tools/fire-skills/dist/skill-spark" ~/bin/skill-spark
```

跨平台再加 Bun 的 `--target`，例如 `bun-linux-x64`、`bun-darwin-arm64`。`dist/` 已 gitignore，不要把 binary 提交进仓。
