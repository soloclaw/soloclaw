import { afterEach, describe, expect, it, vi } from "vitest";
import { importFreshModule } from "../../test/helpers/import-fresh.js";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredSoloClawTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredSoloClawTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredSoloClawTmpDir =
    params?.resolvePreferredSoloClawTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredSoloClawTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-soloclaw-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-soloclaw-dir.js")>(
      "../infra/tmp-soloclaw-dir.js",
    );
    return {
      ...actual,
      resolvePreferredSoloClawTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredSoloClawTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-soloclaw-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredSoloClawTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredSoloClawTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/openclaw");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/soloclaw/soloclaw.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredSoloClawTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toMatchObject({
      level: "silent",
      file: "/tmp/soloclaw/soloclaw.log",
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(() => module.getLogger().info("browser-safe")).not.toThrow();
    expect(resolvePreferredSoloClawTmpDir).not.toHaveBeenCalled();
  });
});
