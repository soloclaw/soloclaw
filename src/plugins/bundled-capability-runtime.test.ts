import { describe, expect, it } from "vitest";
import { buildVitestCapabilityShimAliasMap } from "./bundled-capability-runtime.js";

describe("buildVitestCapabilityShimAliasMap", () => {
  it("keeps scoped and unscoped capability shim aliases aligned", () => {
    const aliasMap = buildVitestCapabilityShimAliasMap();

    expect(aliasMap["soloclaw/plugin-sdk/llm-task"]).toBe(
      aliasMap["@soloclaw/plugin-sdk/llm-task"],
    );
    expect(aliasMap["soloclaw/plugin-sdk/config-runtime"]).toBe(
      aliasMap["@soloclaw/plugin-sdk/config-runtime"],
    );
    expect(aliasMap["soloclaw/plugin-sdk/media-runtime"]).toBe(
      aliasMap["@soloclaw/plugin-sdk/media-runtime"],
    );
    expect(aliasMap["soloclaw/plugin-sdk/provider-onboard"]).toBe(
      aliasMap["@soloclaw/plugin-sdk/provider-onboard"],
    );
    expect(aliasMap["soloclaw/plugin-sdk/speech-core"]).toBe(
      aliasMap["@soloclaw/plugin-sdk/speech-core"],
    );
  });
});
