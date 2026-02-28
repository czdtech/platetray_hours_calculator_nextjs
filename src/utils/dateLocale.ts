import type { Locale as DateFnsLocale } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Locale } from "@/i18n/config";

const DATE_FNS_LOCALE_BY_APP_LOCALE: Record<Locale, DateFnsLocale> = {
  en: enUS,
  es,
  pt: ptBR,
};

export function getDateFnsLocale(locale: Locale): DateFnsLocale {
  return DATE_FNS_LOCALE_BY_APP_LOCALE[locale];
}
