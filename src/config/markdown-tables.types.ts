import type { MarkdownTableMode } from "./types.base.js";
import type { SoloClawConfig } from "./types.soloclaw.js";

export type ResolveMarkdownTableModeParams = {
  cfg?: Partial<SoloClawConfig>;
  channel?: string | null;
  accountId?: string | null;
};

export type ResolveMarkdownTableMode = (
  params: ResolveMarkdownTableModeParams,
) => MarkdownTableMode;
