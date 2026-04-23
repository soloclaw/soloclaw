import type { SoloClawConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: SoloClawConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
