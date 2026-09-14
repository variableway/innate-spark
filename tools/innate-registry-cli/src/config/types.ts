export type FileConfig = {
  hubRoot?: string;
  /** Dirs under hubRoot to scan into the hub registry (current-dir scannable object). */
  hubScanDirs?: string[];
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
  hubScanDirs: string[];
=======
  hubName: string;
>>>>>>> a5cd4f1 (scan: cover hub-hosted base/projects repos in apps registry)
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
