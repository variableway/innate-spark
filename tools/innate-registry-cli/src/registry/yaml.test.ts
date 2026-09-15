import { describe, expect, test } from "bun:test";
import { unlinkSync } from "node:fs";
import { join } from "node:path";
import { extraFields, readExisting, sectionOf, writeRegistry, yamlScalar } from "./yaml.ts";

describe("yamlScalar", () => {
  test("quotes leading @ for npm scopes", () => {
    expect(yamlScalar("@innate/ui")).toBe('"@innate/ui"');
  });

  test("leaves plain tokens unquoted", () => {
    expect(yamlScalar("app")).toBe("app");
  });
});

describe("sectionOf", () => {
  const rules = { secondOnly: ["apps"], keepPrefix: ["refs"] };

  test("secondOnly uses the category folder", () => {
    expect(sectionOf("apps/content/feeds", rules)).toBe("content");
  });

  test("keepPrefix keeps the first two segments", () => {
    expect(sectionOf("refs/fe/foo", rules)).toBe("refs/fe");
  });

  test("other paths use the first segment", () => {
    expect(sectionOf("skills/wip-skills", rules)).toBe("skills");
  });
});

describe("extraFields", () => {
  test("keeps kind/template/deploy/publishes", () => {
    expect(
      extraFields({
        name: "innate-wip",
        repo: "https://example.com/wip.git",
        path: "innate-apps/content/innate-wip",
        desc: "flagship",
        kind: "app",
        template: "app-content",
        templateVersion: "v0",
        deploy: ["pages", "cloudflare"],
      }),
    ).toEqual({
      kind: "app",
      template: "app-content",
      templateVersion: "v0",
      deploy: ["pages", "cloudflare"],
    });
  });
});

describe("apps.yaml", () => {
  const registry = join(import.meta.dir, "../../../registry/apps.yaml");

  test("parses the live registry including hub-hosted repos", () => {
    const projects = readExisting(registry);
    expect(projects.length).toBeGreaterThan(0);
    const backend = projects.find((p) => p.name === "innate-backend");
    expect(backend?.repo).toBe("https://github.com/variableway/innate-backend.git");
    // hubName path (preferred) or hubScanDirs short path
    expect(["innate-spark/base/innate-backend", "base/innate-backend"]).toContain(backend?.path);
    const feBase = projects.find((p) => p.name === "innate-fe-base");
    expect(feBase?.repo).toBe("https://github.com/variableway/innate-fe-templates.git");
    expect(["innate-spark/base/innate-fe-base", "base/innate-fe-base"]).toContain(feBase?.path);
    if (feBase?.publishes) expect(feBase.publishes).toContain("@innate/ui");
  });

  test("round-trip write keeps extra fields", () => {
    const projects = [
      {
        name: "innate-wip",
        repo: "https://example.com/wip.git",
        path: "innate-apps/content/innate-wip",
        desc: "flagship",
        kind: "app",
        template: "app-content",
        templateVersion: "v0",
        deploy: ["pages", "cloudflare"],
      },
      {
        name: "innate-fe-base",
        repo: "https://github.com/variableway/innate-fe-templates.git",
        path: "innate-spark/base/innate-fe-base",
        desc: "",
        kind: "base",
        publishes: ["@innate/ui"],
      },
    ];
    const tmp = join(import.meta.dir, "../../../registry/.apps.roundtrip.yaml");
    writeRegistry(projects, tmp, "test", "test");
    const again = readExisting(tmp);
    unlinkSync(tmp);
    expect(new Set(again.map((p) => p.name))).toEqual(new Set(projects.map((p) => p.name)));
    expect(again.find((p) => p.name === "innate-wip")?.deploy).toEqual(["pages", "cloudflare"]);
    expect(again.find((p) => p.name === "innate-wip")?.templateVersion).toBe("v0");
    expect(again.find((p) => p.name === "innate-fe-base")?.publishes).toEqual(["@innate/ui"]);
    expect(again.find((p) => p.name === "innate-fe-base")?.kind).toBe("base");
  });
});
