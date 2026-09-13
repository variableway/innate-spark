#!/usr/bin/env bun
import { findConfigFile, listProfiles, readFileConfig, resolveShare, type ShareOverrides } from "./config/index.ts";

import { runMount, runOpen, runPath, runStatus, runUmount } from "./smb/mount.ts";

const CLI = "innate-selfhost-cli";

const HELP = `${CLI} — mount or open a self-hosted SMB share (macOS)

Profiles live in one config.json. The only environment variable is
SELFHOST_CLI_PASSWORD (used by mount --via smbfs). Prefer \`open\` + Keychain.

Usage:
  ${CLI} mount [options]     Mount with mount_smbfs, or open Finder if via=open
  ${CLI} open [options]      open smb://… (Keychain / Finder prompt)
  ${CLI} umount [options]    Unmount the share
  ${CLI} status [options]    Show whether the mount point is active
  ${CLI} path [options]      Print the local path to use with cp / mv
  ${CLI} profiles [options]  List profiles in config.json

Options:
  --config <path>     config.json (default: tools/innate-selfhost-cli/config.json)
  --profile <name>    Profile name (default: config.json "default")
  -h, --help
`;

type Flags = {
  help?: boolean;
  config?: string;
  profile?: string;
};

function parseArgs(argv: string[]): { cmd: string; flags: Flags } {
  const flags: Flags = {};
  let cmd = "";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "-h" || a === "--help") {
      flags.help = true;
      continue;
    }
    if (a.startsWith("--")) {
      const key = a.slice(2) as keyof Flags;
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) throw new Error(`flag ${a} requires a value`);
      (flags as Record<string, string | boolean>)[key] = next;
      i += 1;
      continue;
    }
    if (!cmd) {
      cmd = a;
      continue;
    }
    throw new Error(`unexpected argument: ${a}`);
  }
  return { cmd, flags };
}

function overridesFromFlags(flags: Flags): ShareOverrides {
  return { configPath: flags.config, profile: flags.profile };
}

function runProfiles(cwd: string, flags: Flags): number {
  const configPath = findConfigFile(cwd, flags.config);
  if (!configPath) {
    console.error("[ERROR] config.json not found");
    return 1;
  }
  const file = readFileConfig(configPath);
  const names = listProfiles(file);
  const current = flags.profile || file.default || names[0] || "";
  console.log(`==> ${configPath}`);
  for (const name of names) {
    const mark = name === current ? "*" : " ";
    const p = file.profiles?.[name];
    console.log(`${mark} ${name}  ${p?.user ?? ""}@${p?.host ?? ""}/${p?.share ?? ""}`);
  }
  return 0;
}

async function main(): Promise<number> {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`[ERROR] ${err instanceof Error ? err.message : err}`);
    return 1;
  }

  const { cmd, flags } = parsed;
  if (!cmd || flags.help) {
    console.log(HELP);
    return flags.help || !cmd ? 0 : 1;
  }

  try {
    if (cmd === "profiles") return runProfiles(process.cwd(), flags);
    const share = resolveShare(process.cwd(), overridesFromFlags(flags));
    if (cmd === "mount") return runMount(share);
    if (cmd === "open") return runOpen(share);
    if (cmd === "umount" || cmd === "unmount") return runUmount(share);
    if (cmd === "status") return runStatus(share);
    if (cmd === "path") return runPath(share);
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
