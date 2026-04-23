import type { SoloClawConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: SoloClawConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
