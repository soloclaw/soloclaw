/**
 * Backward compatibility shim: copies OPENCLAW_* env vars to SOLOCLAW_*
 * so existing user configurations continue to work after the rename.
 * SOLOCLAW_* takes priority if both are set.
 */
export function migrateOpenClawEnvVars(env: NodeJS.ProcessEnv = process.env): void {
  for (const key of Object.keys(env)) {
    if (key.startsWith("OPENCLAW_")) {
      const newKey = key.replace("OPENCLAW_", "SOLOCLAW_");
      if (env[newKey] === undefined) {
        env[newKey] = env[key];
      }
    }
  }
}
