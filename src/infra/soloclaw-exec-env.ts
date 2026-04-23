export const SOLOCLAW_CLI_ENV_VAR = "SOLOCLAW_CLI";
export const SOLOCLAW_CLI_ENV_VALUE = "1";

export function markSoloClawExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [SOLOCLAW_CLI_ENV_VAR]: SOLOCLAW_CLI_ENV_VALUE,
  };
}

export function ensureSoloClawExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[SOLOCLAW_CLI_ENV_VAR] = SOLOCLAW_CLI_ENV_VALUE;
  return env;
}
