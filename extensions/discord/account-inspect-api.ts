import type { SoloClawConfig } from "soloclaw/plugin-sdk/config-runtime";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: SoloClawConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
