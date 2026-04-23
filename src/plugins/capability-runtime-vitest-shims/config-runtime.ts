import { resolveActiveTalkProviderConfig } from "../../config/talk.js";
import type { SoloClawConfig } from "../../config/types.js";

export { resolveActiveTalkProviderConfig };

export function getRuntimeConfigSnapshot(): SoloClawConfig | null {
  return null;
}
