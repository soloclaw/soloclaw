import { spawnSync } from "node:child_process";
import { isGatewayArgv } from "./gateway-process-argv.js";
import { findGatewayPidsOnPortSync as findUnixGatewayPidsOnPortSync } from "./restart-stale-pids.js";

export function readGatewayProcessArgsSync(pid: number): string[] | null {
  const ps = spawnSync("ps", ["-o", "command=", "-p", String(pid)], {
    encoding: "utf8",
    timeout: 1000,
  });
  if (ps.error || ps.status !== 0) {
    return null;
  }
  const command = ps.stdout.trim();
  return command ? command.split(/\s+/) : null;
}

export function signalVerifiedGatewayPidSync(pid: number, signal: "SIGTERM" | "SIGUSR1"): void {
  const args = readGatewayProcessArgsSync(pid);
  if (!args || !isGatewayArgv(args, { allowGatewayBinary: true })) {
    throw new Error(`refusing to signal non-gateway process pid ${pid}`);
  }
  process.kill(pid, signal);
}

export function findVerifiedGatewayListenerPidsOnPortSync(port: number): number[] {
  const rawPids = findUnixGatewayPidsOnPortSync(port);

  return Array.from(new Set(rawPids))
    .filter((pid): pid is number => Number.isFinite(pid) && pid > 0 && pid !== process.pid)
    .filter((pid) => {
      const args = readGatewayProcessArgsSync(pid);
      return args != null && isGatewayArgv(args, { allowGatewayBinary: true });
    });
}

export function formatGatewayPidList(pids: number[]): string {
  return pids.join(", ");
}
