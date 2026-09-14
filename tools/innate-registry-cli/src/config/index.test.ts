import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { resolveLayout, resolveOnDisk, resolveScanRoot } from "./index.ts";
import type { RuntimeLayout } from "./types.ts";

function layout(partial: Partial<RuntimeLayout>): RuntimeLayout {
  return {
    hubRoot: "/hub",
<<<<<<< HEAD
    hubScanDirs: [],
=======
    hubName: "",
>>>>>>> a5cd4f1 (scan: cover hub-hosted base/projects repos in apps registry)
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

<<<<<<< HEAD
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
=======
  test("maps hubName paths onto hubRoot", () => {
    const current = layout({ hubRoot: "/hub", hubName: "my-hub", worksRoot: "/works" });
    expect(resolveOnDisk(current, "my-hub/base/x")).toBe("/hub/base/x");
    expect(resolveOnDisk(current, "my-hub")).toBe("/hub");
    expect(resolveOnDisk(current, "base/x")).toBe("/works/base/x");
  });

  test("appsPrefix wins when it collides with hubName", () => {
    const current = layout({
      hubRoot: "/hub",
      hubName: "shared",
      appsRoot: "/elsewhere/apps",
      appsPrefix: "shared",
    });
    expect(resolveOnDisk(current, "shared/foo")).toBe("/elsewhere/apps/foo");
  });
});

describe("resolveScanRoot", () => {
  test("routes hub-prefixed scan dirs into the hub with hub-relative paths", () => {
    const current = layout({ hubRoot: "/parent/my-hub", hubName: "my-hub", worksRoot: "/works" });
    expect(resolveScanRoot(current, "my-hub")).toEqual({ root: "/parent/my-hub", relBase: "/parent" });
    expect(resolveScanRoot(current, "my-hub/base")).toEqual({ root: "/parent/my-hub/base", relBase: "/parent" });
  });

  test("keeps plain dirs on worksRoot", () => {
    const current = layout({ hubRoot: "/parent/my-hub", hubName: "my-hub", worksRoot: "/works" });
    expect(resolveScanRoot(current, "base")).toEqual({ root: "/works/base", relBase: "/works" });
>>>>>>> a5cd4f1 (scan: cover hub-hosted base/projects repos in apps registry)
  });
});

describe("resolveLayout", () => {
  test("reads this hub's config file and does not assume a parent named innate", () => {
    const hub = resolve(import.meta.dir, "../../../..");
    const current = resolveLayout(hub);
    expect(current.hubRoot).toBe(hub);
<<<<<<< HEAD
    expect(current.hubScanDirs).toEqual(["base"]);
=======
    expect(current.hubName).toBe("innate-spark");
>>>>>>> a5cd4f1 (scan: cover hub-hosted base/projects repos in apps registry)
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
