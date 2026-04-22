import { transcribeFirstAudio as transcribeFirstAudioImpl } from "soloclaw/plugin-sdk/media-runtime";

type TranscribeFirstAudio = typeof import("soloclaw/plugin-sdk/media-runtime").transcribeFirstAudio;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}
