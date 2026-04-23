import "@mariozechner/pi-agent-core";

declare module "@mariozechner/pi-agent-core" {
  // SoloClaw persists compaction markers alongside normal agent history.
  interface CustomAgentMessages {
    compactionSummary: {
      role: "compactionSummary";
      summary: string;
      tokensBefore: number;
      timestamp: number | string;
      tokensAfter?: number;
      firstKeptEntryId?: string;
      details?: unknown;
    };
  }
}
