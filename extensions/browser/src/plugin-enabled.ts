import type { OpenClawConfig } from "soloclaw/plugin-sdk/browser-config-runtime";
import {
  normalizePluginsConfig,
  resolveEffectiveEnableState,
} from "soloclaw/plugin-sdk/browser-config-runtime";

export function isDefaultBrowserPluginEnabled(cfg: OpenClawConfig): boolean {
  return resolveEffectiveEnableState({
    id: "browser",
    origin: "bundled",
    config: normalizePluginsConfig(cfg.plugins),
    rootConfig: cfg,
    enabledByDefault: true,
  }).enabled;
}
