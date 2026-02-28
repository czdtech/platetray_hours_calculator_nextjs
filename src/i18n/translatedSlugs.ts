import type { Locale } from './config';

const SHARED_TRANSLATED_BLOG_SLUGS = [
  'venus-hour-guide',
  'jupiter-hour-guide',
  'saturn-hour-guide',
  'mercury-hour-guide',
  'mars-hour-guide',
  'sun-hour-guide',
  'moon-hour-guide',
  'planetary-hours-and-their-meanings',
  'planetary-hours-for-love',
  'planetary-hours-for-magic',
  'planetary-hours-for-manifestation',
  'planetary-hours-for-money',
  'best-planetary-hour-for-marriage',
] as const;

export const TRANSLATED_BLOG_SLUG_LIST: Record<Locale, readonly string[]> = {
  en: [],
  es: SHARED_TRANSLATED_BLOG_SLUGS,
  pt: SHARED_TRANSLATED_BLOG_SLUGS,
};

export const TRANSLATED_SLUGS: Record<Locale, Set<string>> = {
  en: new Set(),
  es: new Set(TRANSLATED_BLOG_SLUG_LIST.es),
  pt: new Set(TRANSLATED_BLOG_SLUG_LIST.pt),
};
