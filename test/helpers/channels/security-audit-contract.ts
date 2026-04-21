import { resolveRelativeBundledPluginPublicModuleId } from "../../../src/test-utils/bundled-plugin-public-surface.js";

type DiscordSecurityAuditSurface =
  typeof import("@openclaw/discord/security-audit-contract-api.js");
type TelegramSecuritySurface = typeof import("@openclaw/telegram/security-audit-contract-api.js");

const discordSecurityAuditModuleId = resolveRelativeBundledPluginPublicModuleId({
  fromModuleUrl: import.meta.url,
  pluginId: "discord",
  artifactBasename: "security-audit-contract-api.js",
});
const telegramSecurityModuleId = resolveRelativeBundledPluginPublicModuleId({
  fromModuleUrl: import.meta.url,
  pluginId: "telegram",
  artifactBasename: "security-audit-contract-api.js",
});
let discordSecurityAuditSurfacePromise: Promise<DiscordSecurityAuditSurface> | undefined;
let telegramSecuritySurfacePromise: Promise<TelegramSecuritySurface> | undefined;

function loadDiscordSecurityAuditSurface(): Promise<DiscordSecurityAuditSurface> {
  discordSecurityAuditSurfacePromise ??= import(
    discordSecurityAuditModuleId
  ) as Promise<DiscordSecurityAuditSurface>;
  return discordSecurityAuditSurfacePromise;
}

function loadTelegramSecuritySurface(): Promise<TelegramSecuritySurface> {
  telegramSecuritySurfacePromise ??= import(
    telegramSecurityModuleId
  ) as Promise<TelegramSecuritySurface>;
  return telegramSecuritySurfacePromise;
}

export const collectDiscordSecurityAuditFindings: DiscordSecurityAuditSurface["collectDiscordSecurityAuditFindings"] =
  (async (...args) =>
    (await loadDiscordSecurityAuditSurface()).collectDiscordSecurityAuditFindings(
      ...args,
    )) as DiscordSecurityAuditSurface["collectDiscordSecurityAuditFindings"];

export const collectTelegramSecurityAuditFindings: TelegramSecuritySurface["collectTelegramSecurityAuditFindings"] =
  (async (...args) =>
    (await loadTelegramSecuritySurface()).collectTelegramSecurityAuditFindings(
      ...args,
    )) as TelegramSecuritySurface["collectTelegramSecurityAuditFindings"];
