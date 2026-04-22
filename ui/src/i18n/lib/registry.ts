import type { Locale, TranslationMap } from "./types.ts";

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORTED_LOCALES: ReadonlyArray<Locale> = [DEFAULT_LOCALE];

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return value === "en";
}

export function resolveNavigatorLocale(_navLang: string): Locale {
  return DEFAULT_LOCALE;
}

export async function loadLazyLocaleTranslation(_locale: Locale): Promise<TranslationMap | null> {
  return null;
}
