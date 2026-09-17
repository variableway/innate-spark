#!/usr/bin/env bun
import { resolveLayout, type LayoutOverrides } from "./config/index.ts";
import { runClone } from "./git/index.ts";
import { DEFAULT_SCAN_DEPTH, runScan } from "./scan/index.ts";

const CLI = "innate-registry-cli";

const HELP = `${CLI} — scan and clone git repos listed in a registry YAML

Usage:
  ${CLI} scan [dirs...] [options]       Scan configured dirs into the hub registry
  ${CLI} clone [options]                Clone / pull hub registry entries
  ${CLI} scan-refs [dirs...] [options]  Scan configured refs dirs into the works registry
  ${CLI} clone-refs [options]           Clone / pull works registry entries

Layout comes from a config file (.innate-registry-cli.yaml or registry-cli.yaml),
then flags / env. Nothing about a specific monorepo is hardcoded.

Options:
  --config <path>        Config file. Env: REGISTRY_CLI_CONFIG
  --hub-root <path>      Hub repo. Env: REGISTRY_CLI_HUB_ROOT
  --works-root <path>    Works / clone root. Env: REGISTRY_CLI_WORKS_ROOT
  --works-name <name>    Directory basename to search upward. Env: REGISTRY_CLI_WORKS_NAME
  --apps-root <path>     Optional relocated apps tree. Env: REGISTRY_CLI_APPS_ROOT
  --apps-prefix <name>   Registry path prefix mapped onto --apps-root
  --registry <path>      Override hub registry file
  --depth <n>            Recursion depth (1 = direct children, 0 = unlimited). Default: ${DEFAULT_SCAN_DEPTH}
  --keep-missing         Keep registry rows whose directories disappeared
  --regenerate           Rebuild registry from disk; drop extra fields
  -h, --help             Show this help
`;

type Flags = {
  help?: boolean;
  config?: string;
  "hub-root"?: string;
  "works-root"?: string;
  "works-name"?: string;
  "apps-root"?: string;
  "apps-prefix"?: string;
  registry?: string;
  depth?: string;
  "keep-missing"?: boolean;
  regenerate?: boolean;
};

function parseArgs(argv: string[]): { cmd: string; positional: string[]; flags: Flags } {
  const positional: string[] = [];
  const flags: Flags = {};
  let cmd = "";

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "-h" || a === "--help") {
      flags.help = true;
      continue;
    }
    if (a === "--keep-missing" || a === "--regenerate") {
      flags[a.slice(2) as "keep-missing" | "regenerate"] = true;
      continue;
    }
    if (a.startsWith("--")) {
      const key = a.slice(2) as keyof Flags;
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error(`flag ${a} requires a value`);
      }
      (flags as Record<string, string | boolean>)[key] = next;
      i += 1;
      continue;
    }
    if (!cmd) {
      cmd = a;
      continue;
    }
    positional.push(a);
  }

  return { cmd, positional, flags };
}

function overridesFromFlags(flags: Flags): LayoutOverrides {
  return {
    configPath: flags.config,
    hubRoot: flags["hub-root"],
    worksRoot: flags["works-root"],
    worksName: flags["works-name"],
    appsRoot: flags["apps-root"],
    appsPrefix: flags["apps-prefix"],
    registry: flags.registry,
  };
}

async function main(): Promise<number> {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`[ERROR] ${err instanceof Error ? err.message : err}`);
    return 1;
  }

  const { cmd, positional, flags } = parsed;
  if (!cmd || flags.help) {
    console.log(HELP);
    return flags.help || !cmd ? 0 : 1;
  }

  try {
    const layout = resolveLayout(process.cwd(), overridesFromFlags(flags));
    const depth = flags.depth !== undefined ? Number(flags.depth) : DEFAULT_SCAN_DEPTH;
    if (Number.isNaN(depth) || depth < 0) {
      console.error("[ERROR] --depth must be a non-negative integer");
      return 1;
    }

    if (cmd === "scan") {
      const dirs = positional.length ? positional : layout.scanDirs;
      if (!dirs.length) {
        console.error(
          "[ERROR] no scan dirs: pass them as arguments or set scanDirs in config",
        );
        return 1;
      }
      await runScan({
        layout,
        registry: layout.registry,
        dirs,
        depth,
        keepMissing: Boolean(flags["keep-missing"]),
        regenerate: Boolean(flags.regenerate),
        syncedBy: `${CLI} scan`,
        consumedBy: `${CLI} clone`,
      });
      return 0;
    }

    if (cmd === "scan-refs") {
      const dirs = positional.length ? positional : layout.refsScanDirs;
      if (!dirs.length) {
        console.error("[ERROR] no refs scan dirs: pass them as arguments or set refsScanDirs in config");
        return 1;
      }
      if (!layout.refsRegistry) {
        console.error("[ERROR] no works registry: set refsRegistry in config or pass --registry");
        return 1;
      }
      await runScan({
        layout,
        registry: flags.registry ?? layout.refsRegistry,
        dirs,
        depth,
        keepMissing: Boolean(flags["keep-missing"]),
        regenerate: Boolean(flags.regenerate),
        syncedBy: `${CLI} scan-refs`,
        consumedBy: `${CLI} clone-refs`,
      });
      return 0;
    }

    if (cmd === "clone") {
      return await runClone({ layout, registry: layout.registry });
    }

    if (cmd === "clone-refs") {
      if (!layout.refsRegistry && !flags.registry) {
        console.error("[ERROR] no works registry: set refsRegistry in config or pass --registry");
        return 1;
      }
      return await runClone({
        layout,
        registry: flags.registry ?? layout.refsRegistry,
      });
    }

    console.error(`[ERROR] unknown command: ${cmd}`);
    console.log(HELP);
    return 1;
  } catch (err) {
    console.error(`[ERROR] ${err instanceof Error ? err.message : err}`);
    return 1;
  }
}

const code = await main();
process.exit(code);
