import { describe, it, expect } from 'vitest';
import { getArticleAlternates } from '@/utils/seo/articleAlternates';

describe('Article alternates', () => {
  it('returns alternates for translated slug', () => {
    const result = getArticleAlternates('venus-hour-guide');
    expect(result).toBeDefined();
    expect(result?.languages?.es).toContain('/es/blog/venus-hour-guide');
    expect(result?.languages?.pt).toContain('/pt/blog/venus-hour-guide');
    expect(result?.languages?.en).toContain('/blog/venus-hour-guide');
  });

  it('returns undefined for untranslated slug', () => {
    const result = getArticleAlternates('what-are-planetary-hours');
    expect(result).toBeUndefined();
  });

  it('returns x-default pointing to EN', () => {
    const result = getArticleAlternates('jupiter-hour-guide');
    expect(result?.languages?.['x-default']).toContain('/blog/jupiter-hour-guide');
  });
});
