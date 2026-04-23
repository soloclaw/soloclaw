import type {
  SoloClawPluginApi,
  SoloClawPluginNodeHostCommand,
  SoloClawPluginToolContext,
  SoloClawPluginToolFactory,
} from "soloclaw/plugin-sdk/plugin-entry";
import {
  collectBrowserSecurityAuditFindings,
  createBrowserPluginService,
  createBrowserTool,
  handleBrowserGatewayRequest,
  registerBrowserCli,
  runBrowserProxyCommand,
} from "./register.runtime.js";

export const browserPluginReload = { restartPrefixes: ["browser"] };

export const browserPluginNodeHostCommands: SoloClawPluginNodeHostCommand[] = [
  {
    command: "browser.proxy",
    cap: "browser",
    handle: runBrowserProxyCommand,
  },
];

export const browserSecurityAuditCollectors = [collectBrowserSecurityAuditFindings];

export function registerBrowserPlugin(api: SoloClawPluginApi) {
  api.registerTool(((ctx: SoloClawPluginToolContext) =>
    createBrowserTool({
      sandboxBridgeUrl: ctx.browser?.sandboxBridgeUrl,
      allowHostControl: ctx.browser?.allowHostControl,
      agentSessionKey: ctx.sessionKey,
    })) as SoloClawPluginToolFactory);
  api.registerCli(({ program }) => registerBrowserCli(program), { commands: ["browser"] });
  api.registerGatewayMethod("browser.request", handleBrowserGatewayRequest, {
    scope: "operator.write",
  });
  api.registerService(createBrowserPluginService());
}
