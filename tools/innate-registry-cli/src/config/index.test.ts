import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { resolveLayout, resolveOnDisk } from "./index.ts";
import type { RuntimeLayout } from "./types.ts";

function layout(partial: Partial<RuntimeLayout>): RuntimeLayout {
  return {
    hubRoot: "/hub",
    hubScanDirs: [],
    worksRoot: "/works",
    appsRoot: "/works",
    appsPrefix: "",
    registry: "/hub/registry.yaml",
    refsRegistry: "",
    scanDirs: [],
    refsScanDirs: [],
    sectionSecondOnly: [],
    sectionKeepPrefix: [],
    defaultDescBySection: {},
    ignoreDirs: new Set(),
    ...partial,
  };
}

describe("resolveOnDisk", () => {
  test("maps appsPrefix onto appsRoot and leaves other paths on worksRoot", () => {
    const current = layout({
      worksRoot: "/works",
      appsRoot: "/elsewhere/apps",
      appsPrefix: "my-apps",
    });
    expect(resolveOnDisk(current, "my-apps/foo")).toBe("/elsewhere/apps/foo");
    expect(resolveOnDisk(current, "my-apps")).toBe("/elsewhere/apps");
    expect(resolveOnDisk(current, "base/x")).toBe("/works/base/x");
  });

  test("maps hubScanDirs onto hubRoot before worksRoot", () => {
    const current = layout({
      hubRoot: "/hub",
      hubScanDirs: ["base"],
      worksRoot: "/works",
      appsRoot: "/elsewhere/apps",
      appsPrefix: "innate-apps",
    });
    expect(resolveOnDisk(current, "base/innate-backend")).toBe("/hub/base/innate-backend");
    expect(resolveOnDisk(current, "base")).toBe("/hub/base");
    expect(resolveOnDisk(current, "skills/foo")).toBe("/works/skills/foo");
    expect(resolveOnDisk(current, "innate-apps/bar")).toBe("/elsewhere/apps/bar");
  });
});

describe("resolveLayout", () => {
  test("reads this hub's config file and does not assume a parent named innate", () => {
    const hub = resolve(import.meta.dir, "../../../..");
    const current = resolveLayout(hub);
    expect(current.hubRoot).toBe(hub);
    expect(current.hubScanDirs).toEqual(["base"]);
    expect(current.worksRoot).toBe(resolve(hub, "../innate-works"));
    expect(current.appsRoot).toBe(resolve(hub, "../innate-apps"));
    expect(current.appsPrefix).toBe("innate-apps");
    expect(current.scanDirs).toEqual(["innate-apps", "skills"]);
    expect(current.registry).toBe(resolve(hub, "tools/registry/apps.yaml"));
  });

  test("CLI overrides win over the config file", () => {
    const hub = resolve(import.meta.dir, "../../../..");
    const current = resolveLayout(hub, {
      worksRoot: "/tmp/other-works",
      worksName: "ignored-when-root-set",
      appsPrefix: "pkgs",
      appsRoot: "/tmp/pkgs",
    });
    expect(current.worksRoot).toBe("/tmp/other-works");
    expect(current.appsPrefix).toBe("pkgs");
    expect(current.appsRoot).toBe("/tmp/pkgs");
  });
});
