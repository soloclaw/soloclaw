// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to the bundled diffs surface.

export { definePluginEntry } from "./plugin-entry.js";
export type { SoloClawConfig } from "../config/config.js";
export { resolvePreferredSoloClawTmpDir } from "../infra/tmp-soloclaw-dir.js";
export type {
  AnyAgentTool,
  SoloClawPluginApi,
  SoloClawPluginConfigSchema,
  SoloClawPluginToolContext,
  PluginLogger,
} from "../plugins/types.js";
