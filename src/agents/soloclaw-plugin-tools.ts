import type { SoloClawConfig } from "../config/types.soloclaw.js";
import { resolvePluginTools } from "../plugins/tools.js";
import { getActiveSecretsRuntimeSnapshot } from "../secrets/runtime.js";
import { normalizeDeliveryContext } from "../utils/delivery-context.js";
import {
  resolveSoloClawPluginToolInputs,
  type SoloClawPluginToolOptions,
} from "./soloclaw-tools.plugin-context.js";
import { applyPluginToolDeliveryDefaults } from "./plugin-tool-delivery-defaults.js";
import type { AnyAgentTool } from "./tools/common.js";

type ResolveSoloClawPluginToolsOptions = SoloClawPluginToolOptions & {
  pluginToolAllowlist?: string[];
  currentChannelId?: string;
  currentThreadTs?: string;
  currentMessageId?: string | number;
  sandboxRoot?: string;
  modelHasVision?: boolean;
  modelProvider?: string;
  allowMediaInvokeCommands?: boolean;
  requesterAgentIdOverride?: string;
  requireExplicitMessageTarget?: boolean;
  disableMessageTool?: boolean;
  disablePluginTools?: boolean;
};

export function resolveSoloClawPluginToolsForOptions(params: {
  options?: ResolveSoloClawPluginToolsOptions;
  resolvedConfig?: SoloClawConfig;
  existingToolNames?: Set<string>;
}): AnyAgentTool[] {
  if (params.options?.disablePluginTools) {
    return [];
  }

  const runtimeSnapshot = getActiveSecretsRuntimeSnapshot();
  const deliveryContext = normalizeDeliveryContext({
    channel: params.options?.agentChannel,
    to: params.options?.agentTo,
    accountId: params.options?.agentAccountId,
    threadId: params.options?.agentThreadId,
  });

  const pluginTools = resolvePluginTools({
    ...resolveSoloClawPluginToolInputs({
      options: params.options,
      resolvedConfig: params.resolvedConfig,
      runtimeConfig: runtimeSnapshot?.config,
    }),
    existingToolNames: params.existingToolNames ?? new Set<string>(),
    toolAllowlist: params.options?.pluginToolAllowlist,
  });

  return applyPluginToolDeliveryDefaults({
    tools: pluginTools,
    deliveryContext,
  });
}
