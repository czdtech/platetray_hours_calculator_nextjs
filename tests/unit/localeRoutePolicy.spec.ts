import { describe, it, expect } from 'vitest';
import {
  getCurrentLocale,
  stripLocalePrefix,
  toLocalizedPath,
  resolveLocaleSwitchPath,
  isSlugTranslated,
} from '@/i18n/routePolicy';

describe('getCurrentLocale', () => {
  it('returns "en" for root /', () => {
    expect(getCurrentLocale('/')).toBe('en');
  });

  it('returns "es" for /es', () => {
    expect(getCurrentLocale('/es')).toBe('es');
  });

  it('returns "pt" for /pt', () => {
    expect(getCurrentLocale('/pt')).toBe('pt');
  });

  it('returns "es" for /es/blog/venus-hour-guide', () => {
    expect(getCurrentLocale('/es/blog/venus-hour-guide')).toBe('es');
  });

  it('returns "en" for /blog/venus-hour-guide (no locale prefix)', () => {
    expect(getCurrentLocale('/blog/venus-hour-guide')).toBe('en');
  });

  it('returns "en" for /about', () => {
    expect(getCurrentLocale('/about')).toBe('en');
  });
});

describe('stripLocalePrefix', () => {
  it('returns / for /es', () => {
    expect(stripLocalePrefix('/es')).toBe('/');
  });

  it('returns / for /pt', () => {
    expect(stripLocalePrefix('/pt')).toBe('/');
  });

  it('returns /blog for /es/blog', () => {
    expect(stripLocalePrefix('/es/blog')).toBe('/blog');
  });

  it('returns /blog/x for /pt/blog/x', () => {
    expect(stripLocalePrefix('/pt/blog/x')).toBe('/blog/x');
  });

  it('returns /about for /about (no prefix)', () => {
    expect(stripLocalePrefix('/about')).toBe('/about');
  });

  it('returns / for /', () => {
    expect(stripLocalePrefix('/')).toBe('/');
  });
});

describe('toLocalizedPath', () => {
  it('returns / for home + en', () => {
    expect(toLocalizedPath('/', 'en')).toBe('/');
  });

  it('returns /es for home + es', () => {
    expect(toLocalizedPath('/', 'es')).toBe('/es/');
  });

  it('returns /pt/blog for blog + pt', () => {
    expect(toLocalizedPath('/blog', 'pt')).toBe('/pt/blog');
  });

  it('returns /es/about for about + es', () => {
    expect(toLocalizedPath('/about', 'es')).toBe('/es/about');
  });

  it('returns /privacy for privacy + es (EN-only)', () => {
    expect(toLocalizedPath('/privacy', 'es')).toBe('/privacy');
  });

  it('returns /terms for terms + pt (EN-only)', () => {
    expect(toLocalizedPath('/terms', 'pt')).toBe('/terms');
  });

  it('returns /debug for debug + es (EN-only)', () => {
    expect(toLocalizedPath('/debug', 'es')).toBe('/debug');
  });

  it('strips existing locale before re-localizing', () => {
    expect(toLocalizedPath('/es/about', 'pt')).toBe('/pt/about');
  });
});

describe('isSlugTranslated', () => {
  it('returns true for EN regardless of slug', () => {
    expect(isSlugTranslated('nonexistent-slug', 'en')).toBe(true);
  });

  it('returns true for a translated ES slug', () => {
    expect(isSlugTranslated('venus-hour-guide', 'es')).toBe(true);
  });

  it('returns false for an untranslated ES slug', () => {
    expect(isSlugTranslated('some-en-only-article', 'es')).toBe(false);
  });

  it('returns true for a translated PT slug', () => {
    expect(isSlugTranslated('moon-hour-guide', 'pt')).toBe(true);
  });

  it('returns false for an untranslated PT slug', () => {
    expect(isSlugTranslated('unknown-slug', 'pt')).toBe(false);
  });
});

describe('resolveLocaleSwitchPath', () => {
  it('maps translated blog slug to target locale', () => {
    expect(resolveLocaleSwitchPath('/blog/venus-hour-guide', 'es')).toBe('/es/blog/venus-hour-guide');
  });

  it('falls back to locale blog index for untranslated slug', () => {
    expect(resolveLocaleSwitchPath('/blog/some-en-only-post', 'es')).toBe('/es/blog');
  });

  it('maps EN blog slug back to EN', () => {
    expect(resolveLocaleSwitchPath('/es/blog/venus-hour-guide', 'en')).toBe('/blog/venus-hour-guide');
  });

  it('maps city page to target locale', () => {
    expect(resolveLocaleSwitchPath('/planetary-hours/new-york', 'pt')).toBe('/pt/planetary-hours/new-york');
  });

  it('falls back blog category to locale blog index', () => {
    expect(resolveLocaleSwitchPath('/blog/category/guides', 'es')).toBe('/es/blog');
  });

  it('keeps blog category as-is for EN', () => {
    expect(resolveLocaleSwitchPath('/blog/category/guides', 'en')).toBe('/blog/category/guides');
  });

  it('keeps privacy as EN-only', () => {
    expect(resolveLocaleSwitchPath('/privacy', 'pt')).toBe('/privacy');
  });

  it('keeps terms as EN-only', () => {
    expect(resolveLocaleSwitchPath('/terms', 'es')).toBe('/terms');
  });

  it('maps home to target locale', () => {
    expect(resolveLocaleSwitchPath('/', 'es')).toBe('/es/');
  });

  it('maps about to target locale', () => {
    expect(resolveLocaleSwitchPath('/about', 'pt')).toBe('/pt/about');
  });
});
