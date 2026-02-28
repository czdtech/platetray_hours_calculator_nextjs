import { describe, expect, it } from 'vitest';

import { getMarkdownContent } from '@/utils/markdown';

describe('markdown internal link localization', () => {
  it('localizes ES internal /blog links to /es/blog', async () => {
    const content = await getMarkdownContent('planetary-hours-faq', 'blog/es', 'es');

    expect(content).not.toBeNull();
    expect(content!.contentHtml).toContain('href="/es/blog/planetary-hours-history-culture"');
    expect(content!.contentHtml).not.toContain('href="/blog/planetary-hours-history-culture"');
  });

  it('localizes PT internal /blog links to /pt/blog', async () => {
    const content = await getMarkdownContent('planetary-hours-faq', 'blog/pt', 'pt');

    expect(content).not.toBeNull();
    expect(content!.contentHtml).toContain('href="/pt/blog/planetary-hours-history-culture"');
    expect(content!.contentHtml).not.toContain('href="/blog/planetary-hours-history-culture"');
  });

  it('keeps EN links unchanged', async () => {
    const content = await getMarkdownContent('algorithm-behind-calculator', 'blog', 'en');

    expect(content).not.toBeNull();
    expect(content!.contentHtml).toContain('href="/blog/what-are-planetary-hours"');
    expect(content!.contentHtml).not.toContain('href="/en/blog/what-are-planetary-hours"');
  });

  it('does not rewrite non-blog localized links', async () => {
    const content = await getMarkdownContent('introduction', 'blog/es', 'es');

    expect(content).not.toBeNull();
    expect(content!.contentHtml).toContain('href="/es"');
  });
});
