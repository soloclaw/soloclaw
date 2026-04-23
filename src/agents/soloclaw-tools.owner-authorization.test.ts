import { describe, expect, it } from "vitest";
import {
  isSoloClawOwnerOnlyCoreToolName,
  SOLOCLAW_OWNER_ONLY_CORE_TOOL_NAMES,
} from "./tools/owner-only-tools.js";

describe("createSoloClawTools owner authorization", () => {
  it("marks owner-only core tool names", () => {
    expect(SOLOCLAW_OWNER_ONLY_CORE_TOOL_NAMES).toEqual(["cron", "gateway", "nodes"]);
    expect(isSoloClawOwnerOnlyCoreToolName("cron")).toBe(true);
    expect(isSoloClawOwnerOnlyCoreToolName("gateway")).toBe(true);
    expect(isSoloClawOwnerOnlyCoreToolName("nodes")).toBe(true);
  });

  it("keeps canvas non-owner-only", () => {
    expect(isSoloClawOwnerOnlyCoreToolName("canvas")).toBe(false);
  });
});
