import type { Locale } from "@/i18n/config";

const INTL_LOCALE_BY_APP_LOCALE: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
};

export function getIntlLocale(locale: Locale): string {
  return INTL_LOCALE_BY_APP_LOCALE[locale];
}
