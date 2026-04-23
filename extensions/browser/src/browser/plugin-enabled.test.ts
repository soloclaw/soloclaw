import { describe, expect, it } from "vitest";
import type { SoloClawConfig } from "../config/config.js";
import { isDefaultBrowserPluginEnabled } from "../plugin-enabled.js";

describe("isDefaultBrowserPluginEnabled", () => {
  it("defaults to enabled", () => {
    expect(isDefaultBrowserPluginEnabled({} as SoloClawConfig)).toBe(true);
  });

  it("respects explicit plugin disablement", () => {
    expect(
      isDefaultBrowserPluginEnabled({
        plugins: {
          entries: {
            browser: {
              enabled: false,
            },
          },
        },
      } as SoloClawConfig),
    ).toBe(false);
  });
});
