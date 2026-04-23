import { createConfigIO, getRuntimeConfigSnapshot, type SoloClawConfig } from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): SoloClawConfig {
  return getRuntimeConfigSnapshot() ?? createConfigIO().loadConfig();
}
