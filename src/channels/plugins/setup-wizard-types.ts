import type { DmPolicy } from "../../config/types.js";
import type { SoloClawConfig } from "../../config/types.soloclaw.js";
import type { RuntimeEnv } from "../../runtime.js";
import type { WizardPrompter } from "../../wizard/prompts.js";
import type { ChannelAccessPolicy } from "./setup-group-access.js";
import type { ChannelConfigAdapter, ChannelSetupAdapter } from "./types.adapters.js";
import type {
  ChannelCapabilities,
  ChannelId,
  ChannelMeta,
  ChannelSetupInput,
} from "./types.core.js";

export type ChannelSetupPlugin = {
  id: ChannelId;
  meta: ChannelMeta;
  capabilities: ChannelCapabilities;
  config: ChannelConfigAdapter<unknown>;
  setup?: ChannelSetupAdapter;
  setupWizard?: ChannelSetupWizard | ChannelSetupWizardAdapter;
};

export type ChannelSetupWizardStatus = {
  configuredLabel: string;
  unconfiguredLabel: string;
  configuredHint?: string;
  unconfiguredHint?: string;
  configuredScore?: number;
  unconfiguredScore?: number;
  resolveConfigured: (params: {
    cfg: SoloClawConfig;
    accountId?: string;
  }) => boolean | Promise<boolean>;
  resolveStatusLines?: (params: {
    cfg: SoloClawConfig;
    accountId?: string;
    configured: boolean;
  }) => string[] | Promise<string[]>;
  resolveSelectionHint?: (params: {
    cfg: SoloClawConfig;
    accountId?: string;
    configured: boolean;
  }) => string | undefined | Promise<string | undefined>;
  resolveQuickstartScore?: (params: {
    cfg: SoloClawConfig;
    accountId?: string;
    configured: boolean;
  }) => number | undefined | Promise<number | undefined>;
};

export type ChannelSetupWizardCredentialState = {
  accountConfigured: boolean;
  hasConfiguredValue: boolean;
  resolvedValue?: string;
  envValue?: string;
};

export type ChannelSetupWizardCredentialValues = Partial<Record<string, string>>;

export type ChannelSetupWizardNote = {
  title: string;
  lines: string[];
  shouldShow?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => boolean | Promise<boolean>;
};

export type ChannelSetupWizardEnvShortcut = {
  prompt: string;
  preferredEnvVar?: string;
  isAvailable: (params: { cfg: SoloClawConfig; accountId: string }) => boolean;
  apply: (params: {
    cfg: SoloClawConfig;
    accountId: string;
  }) => SoloClawConfig | Promise<SoloClawConfig>;
};

export type ChannelSetupWizardCredential = {
  inputKey: keyof ChannelSetupInput;
  providerHint: string;
  credentialLabel: string;
  preferredEnvVar?: string;
  helpTitle?: string;
  helpLines?: string[];
  envPrompt: string;
  keepPrompt: string;
  inputPrompt: string;
  allowEnv?: (params: { cfg: SoloClawConfig; accountId: string }) => boolean;
  inspect: (params: {
    cfg: SoloClawConfig;
    accountId: string;
  }) => ChannelSetupWizardCredentialState;
  shouldPrompt?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    currentValue?: string;
    state: ChannelSetupWizardCredentialState;
  }) => boolean | Promise<boolean>;
  applyUseEnv?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
  }) => SoloClawConfig | Promise<SoloClawConfig>;
  applySet?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    value: unknown;
    resolvedValue: string;
  }) => SoloClawConfig | Promise<SoloClawConfig>;
};

export type ChannelSetupWizardTextInput = {
  inputKey: keyof ChannelSetupInput;
  message: string;
  placeholder?: string;
  required?: boolean;
  applyEmptyValue?: boolean;
  helpTitle?: string;
  helpLines?: string[];
  confirmCurrentValue?: boolean;
  keepPrompt?: string | ((value: string) => string);
  currentValue?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => string | undefined | Promise<string | undefined>;
  initialValue?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => string | undefined | Promise<string | undefined>;
  shouldPrompt?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    currentValue?: string;
  }) => boolean | Promise<boolean>;
  applyCurrentValue?: boolean;
  validate?: (params: {
    value: string;
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => string | undefined;
  normalizeValue?: (params: {
    value: string;
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
  }) => string;
  applySet?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    value: string;
  }) => SoloClawConfig | Promise<SoloClawConfig>;
};

export type ChannelSetupWizardAllowFromEntry = {
  input: string;
  resolved: boolean;
  id: string | null;
};

export type ChannelSetupWizardAllowFrom = {
  helpTitle?: string;
  helpLines?: string[];
  credentialInputKey?: keyof ChannelSetupInput;
  message: string;
  placeholder: string;
  invalidWithoutCredentialNote: string;
  parseInputs?: (raw: string) => string[];
  parseId: (raw: string) => string | null;
  resolveEntries: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    entries: string[];
  }) => Promise<ChannelSetupWizardAllowFromEntry[]>;
  apply: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    allowFrom: string[];
  }) => SoloClawConfig | Promise<SoloClawConfig>;
};

export type ChannelSetupWizardGroupAccess = {
  label: string;
  placeholder: string;
  helpTitle?: string;
  helpLines?: string[];
  skipAllowlistEntries?: boolean;
  currentPolicy: (params: { cfg: SoloClawConfig; accountId: string }) => ChannelAccessPolicy;
  currentEntries: (params: { cfg: SoloClawConfig; accountId: string }) => string[];
  updatePrompt: (params: { cfg: SoloClawConfig; accountId: string }) => boolean;
  setPolicy: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    policy: ChannelAccessPolicy;
  }) => SoloClawConfig;
  resolveAllowlist?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    credentialValues: ChannelSetupWizardCredentialValues;
    entries: string[];
    prompter: Pick<WizardPrompter, "note">;
  }) => Promise<unknown>;
  applyAllowlist?: (params: {
    cfg: SoloClawConfig;
    accountId: string;
    resolved: unknown;
  }) => SoloClawConfig;
};

export type ChannelSetupWizardPrepare = (params: {
  cfg: SoloClawConfig;
  accountId: string;
  credentialValues: ChannelSetupWizardCredentialValues;
  runtime: ChannelSetupConfigureContext["runtime"];
  prompter: WizardPrompter;
  options?: ChannelSetupConfigureContext["options"];
}) =>
  | {
      cfg?: SoloClawConfig;
      credentialValues?: ChannelSetupWizardCredentialValues;
    }
  | void
  | Promise<{
      cfg?: SoloClawConfig;
      credentialValues?: ChannelSetupWizardCredentialValues;
    } | void>;

export type ChannelSetupWizardFinalize = (params: {
  cfg: SoloClawConfig;
  accountId: string;
  credentialValues: ChannelSetupWizardCredentialValues;
  runtime: ChannelSetupConfigureContext["runtime"];
  prompter: WizardPrompter;
  options?: ChannelSetupConfigureContext["options"];
  forceAllowFrom: boolean;
}) =>
  | {
      cfg?: SoloClawConfig;
      credentialValues?: ChannelSetupWizardCredentialValues;
    }
  | void
  | Promise<{
      cfg?: SoloClawConfig;
      credentialValues?: ChannelSetupWizardCredentialValues;
    } | void>;

export type ChannelSetupWizard = {
  channel: string;
  status: ChannelSetupWizardStatus;
  introNote?: ChannelSetupWizardNote;
  envShortcut?: ChannelSetupWizardEnvShortcut;
  resolveAccountIdForConfigure?: (params: {
    cfg: SoloClawConfig;
    prompter: WizardPrompter;
    options?: ChannelSetupConfigureContext["options"];
    accountOverride?: string;
    shouldPromptAccountIds: boolean;
    listAccountIds: ChannelSetupPlugin["config"]["listAccountIds"];
    defaultAccountId: string;
  }) => string | Promise<string>;
  resolveShouldPromptAccountIds?: (params: {
    cfg: SoloClawConfig;
    options?: ChannelSetupConfigureContext["options"];
    shouldPromptAccountIds: boolean;
  }) => boolean;
  prepare?: ChannelSetupWizardPrepare;
  stepOrder?: "credentials-first" | "text-first";
  credentials: ChannelSetupWizardCredential[];
  textInputs?: ChannelSetupWizardTextInput[];
  finalize?: ChannelSetupWizardFinalize;
  completionNote?: ChannelSetupWizardNote;
  dmPolicy?: ChannelSetupDmPolicy;
  allowFrom?: ChannelSetupWizardAllowFrom;
  groupAccess?: ChannelSetupWizardGroupAccess;
  disable?: (cfg: SoloClawConfig) => SoloClawConfig;
  onAccountRecorded?: ChannelSetupWizardAdapter["onAccountRecorded"];
};

export type SetupChannelsOptions = {
  allowDisable?: boolean;
  allowSignalInstall?: boolean;
  onSelection?: (selection: ChannelId[]) => void;
  onPostWriteHook?: (hook: ChannelOnboardingPostWriteHook) => void;
  accountIds?: Partial<Record<ChannelId, string>>;
  onAccountId?: (channel: ChannelId, accountId: string) => void;
  onResolvedPlugin?: (channel: ChannelId, plugin: ChannelSetupPlugin) => void;
  promptAccountIds?: boolean;
  forceAllowFromChannels?: ChannelId[];
  deferStatusUntilSelection?: boolean;
  skipStatusNote?: boolean;
  skipDmPolicyPrompt?: boolean;
  skipConfirm?: boolean;
  quickstartDefaults?: boolean;
  initialSelection?: ChannelId[];
  secretInputMode?: "plaintext" | "ref";
};

export type PromptAccountIdParams = {
  cfg: SoloClawConfig;
  prompter: WizardPrompter;
  label: string;
  currentId?: string;
  listAccountIds: (cfg: SoloClawConfig) => string[];
  defaultAccountId: string;
};

export type PromptAccountId = (params: PromptAccountIdParams) => Promise<string>;

export type ChannelSetupStatus = {
  channel: ChannelId;
  configured: boolean;
  statusLines: string[];
  selectionHint?: string;
  quickstartScore?: number;
};

export type ChannelSetupStatusContext = {
  cfg: SoloClawConfig;
  options?: SetupChannelsOptions;
  accountOverrides: Partial<Record<ChannelId, string>>;
};

export type ChannelSetupConfigureContext = {
  cfg: SoloClawConfig;
  runtime: RuntimeEnv;
  prompter: WizardPrompter;
  options?: SetupChannelsOptions;
  accountOverrides: Partial<Record<ChannelId, string>>;
  shouldPromptAccountIds: boolean;
  forceAllowFrom: boolean;
};

export type ChannelOnboardingPostWriteContext = {
  previousCfg: SoloClawConfig;
  cfg: SoloClawConfig;
  accountId: string;
  runtime: RuntimeEnv;
};

export type ChannelOnboardingPostWriteHook = {
  channel: ChannelId;
  accountId: string;
  run: (ctx: { cfg: SoloClawConfig; runtime: RuntimeEnv }) => Promise<void> | void;
};

export type ChannelSetupResult = {
  cfg: SoloClawConfig;
  accountId?: string;
};

export type ChannelSetupConfiguredResult = ChannelSetupResult | "skip";

export type ChannelSetupInteractiveContext = ChannelSetupConfigureContext & {
  configured: boolean;
  label: string;
};

export type ChannelSetupDmPolicy = {
  label: string;
  channel: ChannelId;
  policyKey: string;
  allowFromKey: string;
  resolveConfigKeys?: (
    cfg: SoloClawConfig,
    accountId?: string,
  ) => { policyKey: string; allowFromKey: string };
  getCurrent: (cfg: SoloClawConfig, accountId?: string) => DmPolicy;
  setPolicy: (cfg: SoloClawConfig, policy: DmPolicy, accountId?: string) => SoloClawConfig;
  promptAllowFrom?: (params: {
    cfg: SoloClawConfig;
    prompter: WizardPrompter;
    accountId?: string;
  }) => Promise<SoloClawConfig>;
};

export type ChannelSetupWizardAdapter = {
  channel: ChannelId;
  getStatus: (ctx: ChannelSetupStatusContext) => Promise<ChannelSetupStatus>;
  configure: (ctx: ChannelSetupConfigureContext) => Promise<ChannelSetupResult>;
  configureInteractive?: (
    ctx: ChannelSetupInteractiveContext,
  ) => Promise<ChannelSetupConfiguredResult>;
  configureWhenConfigured?: (
    ctx: ChannelSetupInteractiveContext,
  ) => Promise<ChannelSetupConfiguredResult>;
  afterConfigWritten?: (ctx: ChannelOnboardingPostWriteContext) => Promise<void> | void;
  dmPolicy?: ChannelSetupDmPolicy;
  onAccountRecorded?: (accountId: string, options?: SetupChannelsOptions) => void;
  disable?: (cfg: SoloClawConfig) => SoloClawConfig;
};
