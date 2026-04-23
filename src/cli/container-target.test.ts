import { describe, expect, it, vi } from "vitest";
import {
  maybeRunCliInContainer,
  parseCliContainerArgs,
  resolveCliContainerTarget,
} from "./container-target.js";

describe("parseCliContainerArgs", () => {
  it("extracts a root --container flag before the command", () => {
    expect(
      parseCliContainerArgs(["node", "soloclaw", "--container", "demo", "status", "--deep"]),
    ).toEqual({
      ok: true,
      container: "demo",
      argv: ["node", "soloclaw", "status", "--deep"],
    });
  });

  it("accepts the equals form", () => {
    expect(parseCliContainerArgs(["node", "soloclaw", "--container=demo", "health"])).toEqual({
      ok: true,
      container: "demo",
      argv: ["node", "soloclaw", "health"],
    });
  });

  it("rejects a missing container value", () => {
    expect(parseCliContainerArgs(["node", "soloclaw", "--container"])).toEqual({
      ok: false,
      error: "--container requires a value",
    });
  });

  it("does not consume an adjacent flag as the container value", () => {
    expect(
      parseCliContainerArgs(["node", "soloclaw", "--container", "--no-color", "status"]),
    ).toEqual({
      ok: false,
      error: "--container requires a value",
    });
  });

  it("leaves argv unchanged when the flag is absent", () => {
    expect(parseCliContainerArgs(["node", "soloclaw", "status"])).toEqual({
      ok: true,
      container: null,
      argv: ["node", "soloclaw", "status"],
    });
  });

  it("extracts --container after the command like other root options", () => {
    expect(
      parseCliContainerArgs(["node", "soloclaw", "status", "--container", "demo", "--deep"]),
    ).toEqual({
      ok: true,
      container: "demo",
      argv: ["node", "soloclaw", "status", "--deep"],
    });
  });

  it("stops parsing --container after the -- terminator", () => {
    expect(
      parseCliContainerArgs([
        "node",
        "soloclaw",
        "nodes",
        "run",
        "--",
        "docker",
        "run",
        "--container",
        "demo",
        "alpine",
      ]),
    ).toEqual({
      ok: true,
      container: null,
      argv: [
        "node",
        "soloclaw",
        "nodes",
        "run",
        "--",
        "docker",
        "run",
        "--container",
        "demo",
        "alpine",
      ],
    });
  });
});

describe("resolveCliContainerTarget", () => {
  it("uses argv first and falls back to SOLOCLAW_CONTAINER", () => {
    expect(
      resolveCliContainerTarget(["node", "soloclaw", "--container", "demo", "status"], {}),
    ).toBe("demo");
    expect(resolveCliContainerTarget(["node", "soloclaw", "status"], {})).toBeNull();
    expect(
      resolveCliContainerTarget(["node", "soloclaw", "status"], {
        SOLOCLAW_CONTAINER: "demo",
      } as NodeJS.ProcessEnv),
    ).toBe("demo");
  });
});

describe("maybeRunCliInContainer", () => {
  it("passes through when no container target is provided", () => {
    expect(maybeRunCliInContainer(["node", "soloclaw", "status"], { env: {} })).toEqual({
      handled: false,
      argv: ["node", "soloclaw", "status"],
    });
  });

  it("uses SOLOCLAW_CONTAINER when the flag is absent", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "",
      });

    expect(
      maybeRunCliInContainer(["node", "soloclaw", "status"], {
        env: { SOLOCLAW_CONTAINER: "demo" } as NodeJS.ProcessEnv,
        spawnSync,
      }),
    ).toEqual({
      handled: true,
      exitCode: 0,
    });

    expect(spawnSync).toHaveBeenNthCalledWith(
      3,
      "podman",
      [
        "exec",
        "-i",
        "--env",
        "SOLOCLAW_CONTAINER_HINT=demo",
        "--env",
        "SOLOCLAW_CLI_CONTAINER_BYPASS=1",
        "demo",
        "soloclaw",
        "status",
      ],
      {
        stdio: "inherit",
        env: {
          SOLOCLAW_CONTAINER: "",
        },
      },
    );
  });

  it("clears inherited host routing and gateway env before execing into the child CLI", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "",
      });

    maybeRunCliInContainer(["node", "soloclaw", "status"], {
      env: {
        SOLOCLAW_CONTAINER: "demo",
        SOLOCLAW_PROFILE: "work",
        SOLOCLAW_GATEWAY_PORT: "19001",
        SOLOCLAW_GATEWAY_URL: "ws://127.0.0.1:18789",
        SOLOCLAW_GATEWAY_TOKEN: "token",
        SOLOCLAW_GATEWAY_PASSWORD: "password",
      } as NodeJS.ProcessEnv,
      spawnSync,
    });

    expect(spawnSync).toHaveBeenNthCalledWith(
      3,
      "podman",
      [
        "exec",
        "-i",
        "--env",
        "SOLOCLAW_CONTAINER_HINT=demo",
        "--env",
        "SOLOCLAW_CLI_CONTAINER_BYPASS=1",
        "demo",
        "soloclaw",
        "status",
      ],
      {
        stdio: "inherit",
        env: {
          SOLOCLAW_CONTAINER: "",
        },
      },
    );
  });

  it("executes through podman when the named container is running", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "",
      });

    expect(
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "status"], {
        env: {},
        spawnSync,
      }),
    ).toEqual({
      handled: true,
      exitCode: 0,
    });

    expect(spawnSync).toHaveBeenNthCalledWith(
      1,
      "podman",
      ["inspect", "--format", "{{.State.Running}}", "demo"],
      { encoding: "utf8" },
    );
    expect(spawnSync).toHaveBeenNthCalledWith(
      3,
      "podman",
      [
        "exec",
        "-i",
        "--env",
        "SOLOCLAW_CONTAINER_HINT=demo",
        "--env",
        "SOLOCLAW_CLI_CONTAINER_BYPASS=1",
        "demo",
        "soloclaw",
        "status",
      ],
      {
        stdio: "inherit",
        env: { SOLOCLAW_CONTAINER: "" },
      },
    );
  });

  it("falls back to docker when podman does not have the container", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "",
      });

    expect(
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "health"], {
        env: { USER: "soloclaw" } as NodeJS.ProcessEnv,
        spawnSync,
      }),
    ).toEqual({
      handled: true,
      exitCode: 0,
    });

    expect(spawnSync).toHaveBeenNthCalledWith(
      2,
      "docker",
      ["inspect", "--format", "{{.State.Running}}", "demo"],
      { encoding: "utf8" },
    );
    expect(spawnSync).toHaveBeenNthCalledWith(
      3,
      "docker",
      [
        "exec",
        "-i",
        "-e",
        "SOLOCLAW_CONTAINER_HINT=demo",
        "-e",
        "SOLOCLAW_CLI_CONTAINER_BYPASS=1",
        "demo",
        "soloclaw",
        "health",
      ],
      {
        stdio: "inherit",
        env: { USER: "soloclaw", SOLOCLAW_CONTAINER: "" },
      },
    );
  });

  it("checks docker after podman and before failing", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "",
      });

    expect(
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "status"], {
        env: { USER: "somalley" } as NodeJS.ProcessEnv,
        spawnSync,
      }),
    ).toEqual({
      handled: true,
      exitCode: 0,
    });

    expect(spawnSync).toHaveBeenNthCalledWith(
      1,
      "podman",
      ["inspect", "--format", "{{.State.Running}}", "demo"],
      { encoding: "utf8" },
    );
    expect(spawnSync).toHaveBeenNthCalledWith(
      2,
      "docker",
      ["inspect", "--format", "{{.State.Running}}", "demo"],
      { encoding: "utf8" },
    );
    expect(spawnSync).toHaveBeenNthCalledWith(
      3,
      "docker",
      [
        "exec",
        "-i",
        "-e",
        "SOLOCLAW_CONTAINER_HINT=demo",
        "-e",
        "SOLOCLAW_CLI_CONTAINER_BYPASS=1",
        "demo",
        "soloclaw",
        "status",
      ],
      {
        stdio: "inherit",
        env: { USER: "somalley", SOLOCLAW_CONTAINER: "" },
      },
    );
    expect(spawnSync).toHaveBeenCalledTimes(3);
  });

  it("does not try any sudo podman fallback for regular users", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      });

    expect(() =>
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "status"], {
        env: { USER: "somalley" } as NodeJS.ProcessEnv,
        spawnSync,
      }),
    ).toThrow('No running container matched "demo" under podman or docker.');

    expect(spawnSync).toHaveBeenCalledTimes(2);
    expect(spawnSync).toHaveBeenNthCalledWith(
      1,
      "podman",
      ["inspect", "--format", "{{.State.Running}}", "demo"],
      { encoding: "utf8" },
    );
    expect(spawnSync).toHaveBeenNthCalledWith(
      2,
      "docker",
      ["inspect", "--format", "{{.State.Running}}", "demo"],
      { encoding: "utf8" },
    );
  });

  it("rejects ambiguous matches across runtimes", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      });

    expect(() =>
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "status"], {
        env: { USER: "somalley" } as NodeJS.ProcessEnv,
        spawnSync,
      }),
    ).toThrow(
      'Container "demo" is running under multiple runtimes (podman, docker); use a unique container name.',
    );
  });

  it("allocates a tty for interactive terminal sessions", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "",
      });

    maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "setup"], {
      env: {},
      spawnSync,
      stdinIsTTY: true,
      stdoutIsTTY: true,
    });

    expect(spawnSync).toHaveBeenNthCalledWith(
      3,
      "podman",
      [
        "exec",
        "-i",
        "-t",
        "--env",
        "SOLOCLAW_CONTAINER_HINT=demo",
        "--env",
        "SOLOCLAW_CLI_CONTAINER_BYPASS=1",
        "demo",
        "soloclaw",
        "setup",
      ],
      {
        stdio: "inherit",
        env: { SOLOCLAW_CONTAINER: "" },
      },
    );
  });

  it("prefers --container over SOLOCLAW_CONTAINER", () => {
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: "true\n",
      })
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
      })
      .mockReturnValueOnce({
        status: 0,
        stdout: "",
      });

    expect(
      maybeRunCliInContainer(["node", "soloclaw", "--container", "flag-demo", "health"], {
        env: { SOLOCLAW_CONTAINER: "env-demo" } as NodeJS.ProcessEnv,
        spawnSync,
      }),
    ).toEqual({
      handled: true,
      exitCode: 0,
    });

    expect(spawnSync).toHaveBeenNthCalledWith(
      1,
      "podman",
      ["inspect", "--format", "{{.State.Running}}", "flag-demo"],
      { encoding: "utf8" },
    );
  });

  it("throws when the named container is not running", () => {
    const spawnSync = vi.fn().mockReturnValue({
      status: 1,
      stdout: "",
    });

    expect(() =>
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "status"], {
        env: {},
        spawnSync,
      }),
    ).toThrow('No running container matched "demo" under podman or docker.');
  });

  it("skips recursion when the bypass env is set", () => {
    expect(
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "status"], {
        env: { SOLOCLAW_CLI_CONTAINER_BYPASS: "1" } as NodeJS.ProcessEnv,
      }),
    ).toEqual({
      handled: false,
      argv: ["node", "soloclaw", "--container", "demo", "status"],
    });
  });

  it("blocks updater commands from running inside the container", () => {
    const spawnSync = vi.fn().mockReturnValue({
      status: 0,
      stdout: "true\n",
    });

    expect(() =>
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "update"], {
        env: {},
        spawnSync,
      }),
    ).toThrow(
      "soloclaw update is not supported with --container; rebuild or restart the container image instead.",
    );
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("blocks update after interleaved root flags", () => {
    const spawnSync = vi.fn().mockReturnValue({
      status: 0,
      stdout: "true\n",
    });

    expect(() =>
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "--no-color", "update"], {
        env: {},
        spawnSync,
      }),
    ).toThrow(
      "soloclaw update is not supported with --container; rebuild or restart the container image instead.",
    );
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("blocks the --update shorthand from running inside the container", () => {
    const spawnSync = vi.fn().mockReturnValue({
      status: 0,
      stdout: "true\n",
    });

    expect(() =>
      maybeRunCliInContainer(["node", "soloclaw", "--container", "demo", "--update"], {
        env: {},
        spawnSync,
      }),
    ).toThrow(
      "soloclaw update is not supported with --container; rebuild or restart the container image instead.",
    );
    expect(spawnSync).not.toHaveBeenCalled();
  });
});
