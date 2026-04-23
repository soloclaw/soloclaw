import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          SOLOCLAW_STATE_DIR: "/tmp/openclaw-state",
          SOLOCLAW_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "openclaw-gateway",
        windowsTaskName: "SoloClaw Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/openclaw-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/openclaw-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "openclaw-gateway",
        windowsTaskName: "SoloClaw Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u openclaw-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "openclaw-gateway",
        windowsTaskName: "SoloClaw Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "SoloClaw Gateway" /V /FO LIST']);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "soloclaw gateway install",
        startCommand: "soloclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.soloclaw.gateway.plist",
        systemdServiceName: "openclaw-gateway",
        windowsTaskName: "SoloClaw Gateway",
      }),
    ).toEqual([
      "soloclaw gateway install",
      "soloclaw gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.soloclaw.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "soloclaw gateway install",
        startCommand: "soloclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.soloclaw.gateway.plist",
        systemdServiceName: "openclaw-gateway",
        windowsTaskName: "SoloClaw Gateway",
      }),
    ).toEqual([
      "soloclaw gateway install",
      "soloclaw gateway",
      "systemctl --user start openclaw-gateway.service",
    ]);
  });
});
