// Narrow plugin-sdk surface for the bundled phone-control plugin.
// Keep this list additive and scoped to the bundled phone-control surface.

export { definePluginEntry } from "./plugin-entry.js";
export type {
  SoloClawPluginApi,
  SoloClawPluginCommandDefinition,
  SoloClawPluginService,
  PluginCommandContext,
} from "../plugins/types.js";
