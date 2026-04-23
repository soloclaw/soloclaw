import type { OpenClawConfig } from "../../../config/types.soloclaw.js";
import { resolveUserPath } from "../../../utils.js";
import type { OnboardOptions } from "../../onboard-types.js";

function migrateWorkspacePath(workspace: string): string {
  return workspace.replace(/\/\.openclaw\//, "/.soloclaw/");
}

export function resolveNonInteractiveWorkspaceDir(params: {
  opts: OnboardOptions;
  baseConfig: OpenClawConfig;
  defaultWorkspaceDir: string;
}) {
  const raw = (
    params.opts.workspace ??
    params.baseConfig.agents?.defaults?.workspace ??
    params.defaultWorkspaceDir
  ).trim();
  return resolveUserPath(migrateWorkspacePath(raw));
}
