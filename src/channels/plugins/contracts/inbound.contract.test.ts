import { describe } from "vitest";
import { installDiscordInboundContractSuite } from "../../../../test/helpers/channels/inbound-contract.discord.js";
import { installTelegramInboundContractSuite } from "../../../../test/helpers/channels/inbound-contract.telegram.js";

describe("inbound channel contracts", () => {
  describe("discord", () => {
    installDiscordInboundContractSuite();
  });

  describe("telegram", () => {
    installTelegramInboundContractSuite();
  });
});
