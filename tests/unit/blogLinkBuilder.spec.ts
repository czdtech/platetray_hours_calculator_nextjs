import { describe, it, expect } from 'vitest';
import { resolveLocaleSwitchPath, toLocalizedPath, isSlugTranslated } from '@/i18n/routePolicy';

describe('Blog link building for locales', () => {
  it('toLocalizedPath generates /es/blog for ES locale', () => {
    expect(toLocalizedPath('/blog', 'es')).toBe('/es/blog');
  });

  it('toLocalizedPath keeps /privacy as EN-only', () => {
    expect(toLocalizedPath('/privacy', 'es')).toBe('/privacy');
  });

  it('resolveLocaleSwitchPath falls back for untranslated slug', () => {
    expect(resolveLocaleSwitchPath('/blog/what-are-planetary-hours', 'es')).toBe('/es/blog');
  });

  it('resolveLocaleSwitchPath keeps translated slug', () => {
    expect(resolveLocaleSwitchPath('/blog/venus-hour-guide', 'es')).toBe('/es/blog/venus-hour-guide');
  });

  it('resolveLocaleSwitchPath handles city pages', () => {
    expect(resolveLocaleSwitchPath('/planetary-hours/tokyo', 'pt')).toBe('/pt/planetary-hours/tokyo');
  });

  it('blog category falls back to locale blog index', () => {
    expect(resolveLocaleSwitchPath('/blog/category/planet-hours', 'es')).toBe('/es/blog');
  });

  it('does not jump to EN from ES context', () => {
    expect(resolveLocaleSwitchPath('/es/blog/venus-hour-guide', 'es')).toBe('/es/blog/venus-hour-guide');
  });

  it('switching from ES to EN removes locale prefix', () => {
    expect(resolveLocaleSwitchPath('/es/blog/venus-hour-guide', 'en')).toBe('/blog/venus-hour-guide');
  });
});
