export type McpLoopbackRuntime = {
  port: number;
  token: string;
};

let activeRuntime: McpLoopbackRuntime | undefined;

export function getActiveMcpLoopbackRuntime(): McpLoopbackRuntime | undefined {
  return activeRuntime ? { ...activeRuntime } : undefined;
}

export function setActiveMcpLoopbackRuntime(runtime: McpLoopbackRuntime): void {
  activeRuntime = { ...runtime };
}

export function clearActiveMcpLoopbackRuntime(token: string): void {
  if (activeRuntime?.token === token) {
    activeRuntime = undefined;
  }
}

export function createMcpLoopbackServerConfig(port: number) {
  return {
    mcpServers: {
      openclaw: {
        type: "http",
        url: `http://127.0.0.1:${port}/mcp`,
        headers: {
          Authorization: "Bearer ${SOLOCLAW_MCP_TOKEN}",
          "x-session-key": "${SOLOCLAW_MCP_SESSION_KEY}",
          "x-openclaw-agent-id": "${SOLOCLAW_MCP_AGENT_ID}",
          "x-openclaw-account-id": "${SOLOCLAW_MCP_ACCOUNT_ID}",
          "x-openclaw-message-channel": "${SOLOCLAW_MCP_MESSAGE_CHANNEL}",
          "x-openclaw-sender-is-owner": "${SOLOCLAW_MCP_SENDER_IS_OWNER}",
        },
      },
    },
  };
}
