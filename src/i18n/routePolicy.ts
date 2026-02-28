import { Locale, defaultLocale, locales } from './config';
import { TRANSLATED_SLUGS } from './translatedSlugs';

export { TRANSLATED_SLUGS };

const LEGAL_EN_ONLY_PATHS = ['/privacy', '/terms', '/debug'];

export function getCurrentLocale(pathname: string): Locale {
  for (const locale of locales) {
    if (locale !== defaultLocale && (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))) {
      return locale;
    }
  }
  return defaultLocale;
}

export function stripLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (locale !== defaultLocale) {
      if (pathname === `/${locale}`) return '/';
      if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

export function toLocalizedPath(pathname: string, locale: Locale): string {
  const stripped = stripLocalePrefix(pathname);

  if (LEGAL_EN_ONLY_PATHS.some(p => stripped === p || stripped.startsWith(p + '/'))) {
    return stripped;
  }

  if (locale === defaultLocale) return stripped;
  return `/${locale}${stripped}`;
}

export function isSlugTranslated(slug: string, locale: Locale): boolean {
  if (locale === defaultLocale) return true;
  return TRANSLATED_SLUGS[locale]?.has(slug) ?? false;
}

export function resolveLocaleSwitchPath(currentPath: string, targetLocale: Locale): string {
  const stripped = stripLocalePrefix(currentPath);

  if (LEGAL_EN_ONLY_PATHS.some(p => stripped === p)) {
    return stripped;
  }

  const blogMatch = stripped.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    if (targetLocale === defaultLocale) return stripped;
    if (isSlugTranslated(slug, targetLocale)) {
      return `/${targetLocale}${stripped}`;
    }
    return `/${targetLocale}/blog`;
  }

  if (stripped.startsWith('/blog/category/')) {
    if (targetLocale === defaultLocale) return stripped;
    return `/${targetLocale}/blog`;
  }

  return toLocalizedPath(stripped, targetLocale);
}
