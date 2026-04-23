export type RiskLevel = "low" | "medium" | "high" | "critical";

export type SecurityAssessment = {
  level: RiskLevel;
  command: string;
  reasons: string[];
  blocked: boolean;
};

export type SecurityMonitorConfig = {
  threshold: RiskLevel;
  allowlist: string[];
  denylist: string[];
};

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const DEFAULT_CONFIG: SecurityMonitorConfig = {
  threshold: "critical",
  allowlist: [],
  denylist: [],
};

const LOW_RISK_COMMANDS = new Set([
  "ls", "cat", "head", "tail", "grep", "find", "echo", "pwd", "whoami",
  "date", "wc", "sort", "uniq", "diff", "file", "which", "type", "env",
  "printenv", "uname", "hostname", "id", "df", "du", "stat", "realpath",
  "dirname", "basename", "tr", "cut", "awk", "sed", "less", "more",
  "man", "help", "true", "false", "test", "expr",
]);

const HIGH_RISK_COMMANDS = new Set([
  "rm", "rmdir", "mv", "chmod", "chown", "chgrp", "kill", "killall",
  "pkill", "reboot", "shutdown", "halt", "poweroff", "mount", "umount",
  "fdisk", "parted", "systemctl", "service", "iptables", "firewall-cmd",
  "useradd", "userdel", "usermod", "groupadd", "groupdel", "passwd",
  "visudo", "crontab",
]);

const CRITICAL_COMMANDS = new Set([
  "dd", "mkfs", "fsck", "format", "shred",
]);

const SYSTEM_PATHS = ["/etc", "/usr", "/bin", "/sbin", "/boot", "/sys", "/proc", "/dev", "/var"];

function extractBaseCommand(command: string): string {
  const trimmed = command.trim();
  const parts = trimmed.split(/\s+/);
  const first = parts[0] ?? "";
  if (first === "sudo" || first === "doas") {
    return parts[1] ?? first;
  }
  const basename = first.split("/").pop() ?? first;
  return basename;
}

function hasDangerousRmFlags(command: string): boolean {
  return /\brm\b.*\s-[a-zA-Z]*r[a-zA-Z]*f|\brm\b.*\s-[a-zA-Z]*f[a-zA-Z]*r|\brm\s+-rf\b|\brm\s+-fr\b/.test(command);
}

function targetsSystemPath(command: string): boolean {
  return SYSTEM_PATHS.some((sp) => command.includes(` ${sp}`) || command.includes(` ${sp}/`));
}

function targetsRoot(command: string): boolean {
  return /\s+\/\s*$|\s+\/\s/.test(command) || command.trim().endsWith(" /");
}

function usesSudo(command: string): boolean {
  return command.trim().startsWith("sudo ") || command.trim().startsWith("doas ");
}

function hasPipeOrRedirect(command: string): boolean {
  return /[|]/.test(command) || />{1,2}/.test(command) || /</.test(command);
}

export function assessCommandRisk(
  command: string,
  config: SecurityMonitorConfig = DEFAULT_CONFIG,
): SecurityAssessment {
  const reasons: string[] = [];
  let level: RiskLevel = "low";

  const baseCmd = extractBaseCommand(command);

  if (config.denylist.some((pattern) => command.includes(pattern))) {
    return {
      level: "critical",
      command,
      reasons: ["Command matches denylist pattern"],
      blocked: RISK_ORDER.critical >= RISK_ORDER[config.threshold],
    };
  }

  if (config.allowlist.some((pattern) => command.includes(pattern))) {
    return {
      level: "low",
      command,
      reasons: ["Command matches allowlist pattern"],
      blocked: false,
    };
  }

  if (CRITICAL_COMMANDS.has(baseCmd)) {
    level = "critical";
    reasons.push(`Command '${baseCmd}' is inherently dangerous`);
  } else if (HIGH_RISK_COMMANDS.has(baseCmd)) {
    level = "high";
    reasons.push(`Command '${baseCmd}' can cause data loss or system changes`);
  } else if (LOW_RISK_COMMANDS.has(baseCmd)) {
    level = "low";
    reasons.push(`Command '${baseCmd}' is a safe read-only operation`);
  } else {
    level = "medium";
    reasons.push(`Command '${baseCmd}' has unknown risk profile`);
  }

  if (hasDangerousRmFlags(command)) {
    level = "critical";
    reasons.push("Recursive forced deletion detected");
  }

  if (targetsRoot(command) && level !== "low") {
    level = "critical";
    reasons.push("Command targets root filesystem");
  }

  if (targetsSystemPath(command) && RISK_ORDER[level] < RISK_ORDER.high) {
    level = "high";
    reasons.push("Command targets system directory");
  }

  if (usesSudo(command) && RISK_ORDER[level] < RISK_ORDER.high) {
    level = "high";
    reasons.push("Command uses privilege escalation");
  }

  if (hasPipeOrRedirect(command) && RISK_ORDER[level] < RISK_ORDER.medium) {
    level = "medium";
    reasons.push("Command uses pipes or redirects");
  }

  return {
    level,
    command,
    reasons,
    blocked: RISK_ORDER[level] >= RISK_ORDER[config.threshold],
  };
}

export function createSecurityMonitor(config?: Partial<SecurityMonitorConfig>) {
  const resolvedConfig: SecurityMonitorConfig = { ...DEFAULT_CONFIG, ...config };
  const auditLog: SecurityAssessment[] = [];

  return {
    assess(command: string): SecurityAssessment {
      const assessment = assessCommandRisk(command, resolvedConfig);
      auditLog.push(assessment);
      return assessment;
    },

    getAuditLog(): readonly SecurityAssessment[] {
      return auditLog;
    },

    getConfig(): Readonly<SecurityMonitorConfig> {
      return resolvedConfig;
    },

    updateConfig(updates: Partial<SecurityMonitorConfig>): void {
      Object.assign(resolvedConfig, updates);
    },
  };
}
