import type { ProviderPlugin } from "../types.js";

export type ProviderContractEntry = {
  pluginId: string;
  provider: ProviderPlugin;
};

export function loadVitestProviderContractRegistry(): ProviderContractEntry[] {
  return [];
}
