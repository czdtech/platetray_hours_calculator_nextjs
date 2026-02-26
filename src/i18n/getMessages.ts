import type { Locale } from './config';

import en from './messages/en.json';
import es from './messages/es.json';
import pt from './messages/pt.json';

const messages = { en, es, pt } as const;

export type Messages = typeof en;

export async function getMessages(locale: Locale): Promise<Messages> {
  return (await import(`./messages/${locale}.json`)).default;
}

export function getMessagesSync(locale: Locale): Messages {
  return messages[locale];
}

export function t(template: string, vars?: Record<string, string>): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), val),
    template,
  );
}
