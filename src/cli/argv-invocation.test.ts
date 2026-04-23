import { describe, expect, it } from "vitest";
import { resolveCliArgvInvocation } from "./argv-invocation.js";

describe("argv-invocation", () => {
  it("resolves root help and empty command path", () => {
    expect(resolveCliArgvInvocation(["node", "soloclaw", "--help"])).toEqual({
      argv: ["node", "soloclaw", "--help"],
      commandPath: [],
      primary: null,
      hasHelpOrVersion: true,
      isRootHelpInvocation: true,
    });
  });

  it("resolves command path and primary with root options", () => {
    expect(
      resolveCliArgvInvocation(["node", "soloclaw", "--profile", "work", "gateway", "status"]),
    ).toEqual({
      argv: ["node", "soloclaw", "--profile", "work", "gateway", "status"],
      commandPath: ["gateway", "status"],
      primary: "gateway",
      hasHelpOrVersion: false,
      isRootHelpInvocation: false,
    });
  });
});
