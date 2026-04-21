import { loadBundledPluginPublicSurfaceSync } from "../../test-utils/bundled-plugin-public-surface.js";
import type { WebSearchProviderPlugin } from "../types.js";

export type WebSearchProviderContractEntry = {
  pluginId: string;
  provider: WebSearchProviderPlugin;
  credentialValue: unknown;
};

let webSearchProviderContractRegistryCache: WebSearchProviderContractEntry[] | null = null;

type OllamaWebSearchContractApiSurface =
  typeof import("../../../extensions/ollama/web-search-contract-api.js");

export function loadVitestWebSearchProviderContractRegistry(): WebSearchProviderContractEntry[] {
  const ollamaWebSearchContractApi =
    loadBundledPluginPublicSurfaceSync<OllamaWebSearchContractApiSurface>({
      pluginId: "ollama",
      artifactBasename: "web-search-contract-api.js",
    });
  webSearchProviderContractRegistryCache ??= [
    {
      pluginId: "ollama",
      provider: ollamaWebSearchContractApi.createOllamaWebSearchProvider(),
      credentialValue: undefined,
    },
  ];
  return webSearchProviderContractRegistryCache;
}
