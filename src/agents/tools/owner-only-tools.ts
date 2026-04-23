export const SOLOCLAW_OWNER_ONLY_CORE_TOOL_NAMES = ["cron", "gateway", "nodes"] as const;

const SOLOCLAW_OWNER_ONLY_CORE_TOOL_NAME_SET: ReadonlySet<string> = new Set(
  SOLOCLAW_OWNER_ONLY_CORE_TOOL_NAMES,
);

export function isSoloClawOwnerOnlyCoreToolName(toolName: string): boolean {
  return SOLOCLAW_OWNER_ONLY_CORE_TOOL_NAME_SET.has(toolName);
}
