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

  test("parses the moved registry", () => {
    const projects = readExisting(registry);
    expect(projects.length).toBeGreaterThan(0);
    const wip = projects.find((p) => p.name === "innate-wip");
    expect(wip?.kind).toBe("app");
    expect(wip?.deploy).toEqual(["pages", "cloudflare"]);
    const base = projects.find((p) => p.name === "innate-fe-base");
    expect(base?.publishes).toEqual(["@innate/ui"]);
  });

  test("round-trip write keeps extra fields", () => {
    const projects = readExisting(registry);
    const tmp = join(import.meta.dir, "../../../registry/.apps.roundtrip.yaml");
    writeRegistry(projects, tmp, "test", "test");
    const again = readExisting(tmp);
    unlinkSync(tmp);
    expect(new Set(again.map((p) => p.name))).toEqual(new Set(projects.map((p) => p.name)));
    expect(again.find((p) => p.name === "innate-wip")?.deploy).toEqual(["pages", "cloudflare"]);
    expect(again.find((p) => p.name === "innate-fe-base")?.publishes).toEqual(["@innate/ui"]);
  });
});
