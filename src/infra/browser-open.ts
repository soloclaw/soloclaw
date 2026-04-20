import { runCommandWithTimeout } from "../process/exec.js";
import { detectBinary } from "./detect-binary.js";

export type BrowserOpenCommand = {
  argv: string[] | null;
  reason?: string;
  command?: string;
};

export type BrowserOpenSupport = {
  ok: boolean;
  reason?: string;
  command?: string;
};

function shouldSkipBrowserOpenInTests(): boolean {
  if (process.env.VITEST) {
    return true;
  }
  return process.env.NODE_ENV === "test";
}

export async function resolveBrowserOpenCommand(): Promise<BrowserOpenCommand> {
  const isSsh =
    Boolean(process.env.SSH_CLIENT) ||
    Boolean(process.env.SSH_TTY) ||
    Boolean(process.env.SSH_CONNECTION);

  if (isSsh) {
    return { argv: null, reason: "ssh-no-display" };
  }

  const hasOpen = await detectBinary("open");
  return hasOpen ? { argv: ["open"], command: "open" } : { argv: null, reason: "missing-open" };
}

export async function detectBrowserOpenSupport(): Promise<BrowserOpenSupport> {
  const resolved = await resolveBrowserOpenCommand();
  if (!resolved.argv) {
    return { ok: false, reason: resolved.reason };
  }
  return { ok: true, command: resolved.command };
}

export async function openUrl(url: string): Promise<boolean> {
  if (shouldSkipBrowserOpenInTests()) {
    return false;
  }
  const resolved = await resolveBrowserOpenCommand();
  if (!resolved.argv) {
    return false;
  }
  const command = [...resolved.argv];
  command.push(url);
  try {
    await runCommandWithTimeout(command, { timeoutMs: 5_000 });
    return true;
  } catch {
    return false;
  }
}

export async function openUrlInBackground(url: string): Promise<boolean> {
  if (shouldSkipBrowserOpenInTests()) {
    return false;
  }
  if (process.platform !== "darwin") {
    return false;
  }
  const resolved = await resolveBrowserOpenCommand();
  if (!resolved.argv || resolved.command !== "open") {
    return false;
  }
  try {
    await runCommandWithTimeout(["open", "-g", url], { timeoutMs: 5_000 });
    return true;
  } catch {
    return false;
  }
}
