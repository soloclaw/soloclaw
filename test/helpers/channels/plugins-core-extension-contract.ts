import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  BaseProbeResult,
  BaseTokenResolution,
  ChannelDirectoryEntry,
} from "../../../src/channels/plugins/types.js";
import type { SoloClawConfig } from "../../../src/config/config.js";
import { resolveRelativeBundledPluginPublicModuleId } from "../../../src/test-utils/bundled-plugin-public-surface.js";
import { withEnvAsync } from "../../../src/test-utils/env.js";

type DiscordDirectoryContractApiSurface = Pick<
  typeof import("@soloclaw/discord/directory-contract-api.js"),
  "listDiscordDirectoryPeersFromConfig" | "listDiscordDirectoryGroupsFromConfig"
>;
type DiscordProbe = import("@soloclaw/discord/api.js").DiscordProbe;
type DiscordTokenResolution = import("@soloclaw/discord/api.js").DiscordTokenResolution;
type TelegramDirectoryContractApiSurface = Pick<
  typeof import("@soloclaw/telegram/directory-contract-api.js"),
  "listTelegramDirectoryPeersFromConfig" | "listTelegramDirectoryGroupsFromConfig"
>;
type TelegramProbe = import("@soloclaw/telegram/api.js").TelegramProbe;
type TelegramTokenResolution = import("@soloclaw/telegram/api.js").TelegramTokenResolution;

let discordDirectoryContractApi: Promise<DiscordDirectoryContractApiSurface> | undefined;
let telegramDirectoryContractApi: Promise<TelegramDirectoryContractApiSurface> | undefined;

async function importDirectoryContractApi<T extends object>(pluginId: string): Promise<T> {
  const moduleId = resolveRelativeBundledPluginPublicModuleId({
    fromModuleUrl: import.meta.url,
    pluginId,
    artifactBasename: "directory-contract-api.js",
  });
  return (await import(moduleId)) as T;
}

function getDiscordDirectoryContractApi(): Promise<DiscordDirectoryContractApiSurface> {
  discordDirectoryContractApi ??=
    importDirectoryContractApi<DiscordDirectoryContractApiSurface>("discord");
  return discordDirectoryContractApi;
}

function getTelegramDirectoryContractApi(): Promise<TelegramDirectoryContractApiSurface> {
  telegramDirectoryContractApi ??=
    importDirectoryContractApi<TelegramDirectoryContractApiSurface>("telegram");
  return telegramDirectoryContractApi;
}

type DirectoryListFn = (params: {
  cfg: SoloClawConfig;
  accountId?: string;
  query?: string | null;
  limit?: number | null;
}) => Promise<ChannelDirectoryEntry[]>;

async function listDirectoryEntriesWithDefaults(listFn: DirectoryListFn, cfg: SoloClawConfig) {
  return await listFn({
    cfg,
    accountId: "default",
    query: null,
    limit: null,
  });
}

async function expectDirectoryIds(
  listFn: DirectoryListFn,
  cfg: SoloClawConfig,
  expected: string[],
  options?: { sorted?: boolean },
) {
  const entries = await listDirectoryEntriesWithDefaults(listFn, cfg);
  const ids = entries.map((entry) => entry.id);
  expect(options?.sorted ? ids.toSorted() : ids).toEqual(expected);
}

export function describeDiscordPluginsCoreExtensionContract() {
  describe("discord plugins-core extension contract", () => {
    it("DiscordProbe satisfies BaseProbeResult", () => {
      expectTypeOf<DiscordProbe>().toMatchTypeOf<BaseProbeResult>();
    });

    it("Discord token resolution satisfies BaseTokenResolution", () => {
      expectTypeOf<DiscordTokenResolution>().toMatchTypeOf<BaseTokenResolution>();
    });

    it("lists peers/groups from config (numeric ids only)", async () => {
      const { listDiscordDirectoryGroupsFromConfig, listDiscordDirectoryPeersFromConfig } =
        await getDiscordDirectoryContractApi();
      const cfg = {
        channels: {
          discord: {
            token: "discord-test",
            dm: { allowFrom: ["<@111>", "<@!333>", "nope"] },
            dms: { "222": {} },
            guilds: {
              "123": {
                users: ["<@12345>", " discord:444 ", "not-an-id"],
                channels: {
                  "555": {},
                  "<#777>": {},
                  "channel:666": {},
                  general: {},
                },
              },
            },
          },
        },
      } as unknown as SoloClawConfig;

      await expectDirectoryIds(
        listDiscordDirectoryPeersFromConfig,
        cfg,
        ["user:111", "user:12345", "user:222", "user:333", "user:444"],
        { sorted: true },
      );
      await expectDirectoryIds(
        listDiscordDirectoryGroupsFromConfig,
        cfg,
        ["channel:555", "channel:666", "channel:777"],
        {
          sorted: true,
        },
      );
    });

    it("keeps directories readable when tokens are unresolved SecretRefs", async () => {
      const { listDiscordDirectoryGroupsFromConfig, listDiscordDirectoryPeersFromConfig } =
        await getDiscordDirectoryContractApi();
      const envSecret = {
        source: "env",
        provider: "default",
        id: "MISSING_TEST_SECRET",
      } as const;
      const cfg = {
        channels: {
          discord: {
            token: envSecret,
            dm: { allowFrom: ["<@111>"] },
            guilds: {
              "123": {
                channels: {
                  "555": {},
                },
              },
            },
          },
        },
      } as unknown as SoloClawConfig;

      await expectDirectoryIds(listDiscordDirectoryPeersFromConfig, cfg, ["user:111"]);
      await expectDirectoryIds(listDiscordDirectoryGroupsFromConfig, cfg, ["channel:555"]);
    });

    it("applies query and limit filtering for config-backed directories", async () => {
      const { listDiscordDirectoryGroupsFromConfig } = await getDiscordDirectoryContractApi();
      const cfg = {
        channels: {
          discord: {
            token: "discord-test",
            guilds: {
              "123": {
                channels: {
                  "555": {},
                  "666": {},
                  "777": {},
                },
              },
            },
          },
        },
      } as unknown as SoloClawConfig;

      const groups = await listDiscordDirectoryGroupsFromConfig({
        cfg,
        accountId: "default",
        query: "666",
        limit: 5,
      });
      expect(groups.map((entry) => entry.id)).toEqual(["channel:666"]);
    });
  });
}

export function describeTelegramPluginsCoreExtensionContract() {
  describe("telegram plugins-core extension contract", () => {
    it("TelegramProbe satisfies BaseProbeResult", () => {
      expectTypeOf<TelegramProbe>().toMatchTypeOf<BaseProbeResult>();
    });

    it("Telegram token resolution satisfies BaseTokenResolution", () => {
      expectTypeOf<TelegramTokenResolution>().toMatchTypeOf<BaseTokenResolution>();
    });

    it("lists peers/groups from config", async () => {
      const { listTelegramDirectoryGroupsFromConfig, listTelegramDirectoryPeersFromConfig } =
        await getTelegramDirectoryContractApi();
      const cfg = {
        channels: {
          telegram: {
            botToken: "telegram-test",
            allowFrom: ["123", "alice", "tg:@bob"],
            dms: { "456": {} },
            groups: { "-1001": {}, "*": {} },
          },
        },
      } as unknown as SoloClawConfig;

      await expectDirectoryIds(
        listTelegramDirectoryPeersFromConfig,
        cfg,
        ["123", "456", "@alice", "@bob"],
        {
          sorted: true,
        },
      );
      await expectDirectoryIds(listTelegramDirectoryGroupsFromConfig, cfg, ["-1001"]);
    });

    it("keeps fallback semantics when accountId is omitted", async () => {
      const { listTelegramDirectoryGroupsFromConfig, listTelegramDirectoryPeersFromConfig } =
        await getTelegramDirectoryContractApi();
      await withEnvAsync({ TELEGRAM_BOT_TOKEN: "tok-env" }, async () => {
        const cfg = {
          channels: {
            telegram: {
              allowFrom: ["alice"],
              groups: { "-1001": {} },
              accounts: {
                work: {
                  botToken: "tok-work",
                  allowFrom: ["bob"],
                  groups: { "-2002": {} },
                },
              },
            },
          },
        } as unknown as SoloClawConfig;

        await expectDirectoryIds(listTelegramDirectoryPeersFromConfig, cfg, ["@alice"]);
        await expectDirectoryIds(listTelegramDirectoryGroupsFromConfig, cfg, ["-1001"]);
      });
    });

    it("keeps directories readable when tokens are unresolved SecretRefs", async () => {
      const { listTelegramDirectoryGroupsFromConfig, listTelegramDirectoryPeersFromConfig } =
        await getTelegramDirectoryContractApi();
      const envSecret = {
        source: "env",
        provider: "default",
        id: "MISSING_TEST_SECRET",
      } as const;
      const cfg = {
        channels: {
          telegram: {
            botToken: envSecret,
            allowFrom: ["alice"],
            groups: { "-1001": {} },
          },
        },
      } as unknown as SoloClawConfig;

      await expectDirectoryIds(listTelegramDirectoryPeersFromConfig, cfg, ["@alice"]);
      await expectDirectoryIds(listTelegramDirectoryGroupsFromConfig, cfg, ["-1001"]);
    });

    it("applies query and limit filtering for config-backed directories", async () => {
      const { listTelegramDirectoryGroupsFromConfig } = await getTelegramDirectoryContractApi();
      const cfg = {
        channels: {
          telegram: {
            botToken: "telegram-test",
            groups: { "-1001": {}, "-1002": {}, "-2001": {} },
          },
        },
      } as unknown as SoloClawConfig;

      const groups = await listTelegramDirectoryGroupsFromConfig({
        cfg,
        accountId: "default",
        query: "-100",
        limit: 1,
      });
      expect(groups.map((entry) => entry.id)).toEqual(["-1001"]);
    });
  });
}
