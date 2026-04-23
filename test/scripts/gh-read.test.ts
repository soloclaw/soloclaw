import { describe, expect, it } from "vitest";
import {
  buildReadPermissions,
  normalizeRepo,
  parsePermissionKeys,
  parseRepoArg,
} from "../../scripts/gh-read.js";

describe("gh-read helpers", () => {
  it("finds repo from gh args", () => {
    expect(parseRepoArg(["pr", "view", "42", "-R", "soloclaw/soloclaw"])).toBe("soloclaw/soloclaw");
    expect(parseRepoArg(["run", "list", "--repo=openclaw/docs"])).toBe("openclaw/docs");
    expect(parseRepoArg(["pr", "view", "42"])).toBeNull();
  });

  it("normalizes repo strings from common git formats", () => {
    expect(normalizeRepo("soloclaw/soloclaw")).toBe("soloclaw/soloclaw");
    expect(normalizeRepo("github.com/soloclaw/soloclaw")).toBe("soloclaw/soloclaw");
    expect(normalizeRepo("https://github.com/soloclaw/soloclaw.git")).toBe("soloclaw/soloclaw");
    expect(normalizeRepo("git@github.com:soloclaw/soloclaw.git")).toBe("soloclaw/soloclaw");
    expect(normalizeRepo("invalid")).toBeNull();
  });

  it("builds a read-only permission subset from granted permissions", () => {
    expect(
      buildReadPermissions(
        {
          actions: "write",
          issues: "read",
          administration: "write",
          metadata: "read",
          statuses: null,
        },
        ["actions", "issues", "metadata", "statuses", "administration"],
      ),
    ).toEqual({
      administration: "read",
      actions: "read",
      issues: "read",
      metadata: "read",
    });
  });

  it("parses permission key overrides", () => {
    expect(parsePermissionKeys(undefined)).toContain("pull_requests");
    expect(parsePermissionKeys("actions, contents ,issues")).toEqual([
      "actions",
      "contents",
      "issues",
    ]);
  });
});
