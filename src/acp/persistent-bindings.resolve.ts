import {
  resolveConfiguredBindingRecord,
  resolveConfiguredBindingRecordBySessionKey,
  resolveConfiguredBindingRecordForConversation,
} from "../channels/plugins/binding-registry.js";
import type { SoloClawConfig } from "../config/types.soloclaw.js";
import type { ConversationRef } from "../infra/outbound/session-binding-service.js";
import {
  resolveConfiguredAcpBindingSpecFromRecord,
  toResolvedConfiguredAcpBinding,
  type ConfiguredAcpBindingSpec,
  type ResolvedConfiguredAcpBinding,
} from "./persistent-bindings.types.js";

export function resolveConfiguredAcpBindingRecord(params: {
  cfg: SoloClawConfig;
  channel: string;
  accountId: string;
  conversationId: string;
  parentConversationId?: string;
}): ResolvedConfiguredAcpBinding | null {
  const resolved = resolveConfiguredBindingRecord(params);
  return resolved ? toResolvedConfiguredAcpBinding(resolved.record) : null;
}

export function resolveConfiguredAcpBindingRecordForConversation(params: {
  cfg: SoloClawConfig;
  conversation: ConversationRef;
}): ResolvedConfiguredAcpBinding | null {
  const resolved = resolveConfiguredBindingRecordForConversation(params);
  return resolved ? toResolvedConfiguredAcpBinding(resolved.record) : null;
}

export function resolveConfiguredAcpBindingSpecBySessionKey(params: {
  cfg: SoloClawConfig;
  sessionKey: string;
}): ConfiguredAcpBindingSpec | null {
  const resolved = resolveConfiguredBindingRecordBySessionKey(params);
  return resolved ? resolveConfiguredAcpBindingSpecFromRecord(resolved.record) : null;
}
