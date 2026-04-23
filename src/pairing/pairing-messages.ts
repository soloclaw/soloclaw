import { formatCliCommand } from "../cli/command-format.js";
import type { PairingChannel } from "./pairing-store.types.js";

export function buildPairingReply(params: {
  channel: PairingChannel;
  idLine: string;
  code: string;
}): string {
  const { channel, idLine, code } = params;
  const approveCommand = formatCliCommand(`soloclaw pairing approve ${channel} ${code}`);
  return [
    "SoloClaw: access not configured.",
    "",
    idLine,
    "Pairing code:",
    "```",
    code,
    "```",
    "",
    "Ask the bot owner to approve with:",
    formatCliCommand(`soloclaw pairing approve ${channel} ${code}`),
    "```",
    approveCommand,
    "```",
  ].join("\n");
}
