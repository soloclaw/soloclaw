import {
  findModelInCatalog,
  loadModelCatalog,
  modelSupportsVision,
  resolveDefaultModelForAgent,
} from "soloclaw/plugin-sdk/agent-runtime";
import type { SoloClawConfig } from "soloclaw/plugin-sdk/config-runtime";

export async function resolveStickerVisionSupportRuntime(params: {
  cfg: SoloClawConfig;
  agentId?: string;
}): Promise<boolean> {
  const catalog = await loadModelCatalog({ config: params.cfg });
  const defaultModel = resolveDefaultModelForAgent({
    cfg: params.cfg,
    agentId: params.agentId,
  });
  const entry = findModelInCatalog(catalog, defaultModel.provider, defaultModel.model);
  if (!entry) {
    return false;
  }
  return modelSupportsVision(entry);
}
