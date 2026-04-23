import type { SoloClawConfig } from "../../config/types.soloclaw.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<SoloClawConfig["session"]>> = {},
): NonNullable<SoloClawConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
