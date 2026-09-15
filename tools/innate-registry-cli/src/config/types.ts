export type FileConfig = {
  hubRoot?: string;
<<<<<<< HEAD
=======
  /** Logical hub name for `<hubName>/...` registry paths (defaults to basename of hubRoot). */
  hubName?: string;
  /** Dirs under hubRoot to scan into the hub registry (current-dir scannable object). */
  hubScanDirs?: string[];
>>>>>>> 4070f9c (update registry)
  worksRoot?: string;
  worksName?: string;
  appsRoot?: string;
  appsPrefix?: string;
  registry?: string;
  refsRegistry?: string;
  /** Dirs under worksRoot / appsRoot to scan into the hub registry (external scannable object). */
  scanDirs?: string[];
  refsScanDirs?: string[];
  sectionSecondOnly?: string[];
  sectionKeepPrefix?: string[];
  defaultDescBySection?: Record<string, string>;
  ignoreDirs?: string[];
};

export type LayoutOverrides = {
  configPath?: string;
  hubRoot?: string;
  worksRoot?: string;
  worksName?: string;
  appsRoot?: string;
  appsPrefix?: string;
  registry?: string;
};

export type RuntimeLayout = {
  hubRoot: string;
<<<<<<< HEAD
=======
  hubScanDirs: string[];
  /** Basename of hubRoot; `innate-spark/...` registry paths map back into the hub. */
>>>>>>> 4070f9c (update registry)
  hubName: string;
  worksRoot: string;
  appsRoot: string;
  appsPrefix: string;
  registry: string;
  refsRegistry: string;
  scanDirs: string[];
  refsScanDirs: string[];
  sectionSecondOnly: string[];
  sectionKeepPrefix: string[];
  defaultDescBySection: Record<string, string>;
  ignoreDirs: Set<string>;
};

export const CONFIG_FILENAMES = [".innate-registry-cli.yaml", "registry-cli.yaml"] as const;

export const DEFAULT_IGNORE_DIRS = [
  "node_modules",
  "venv",
  ".venv",
  "__pycache__",
  "dist",
  "build",
] as const;
