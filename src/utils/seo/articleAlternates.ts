import { isSlugTranslated } from '@/i18n/routePolicy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";

export function getArticleAlternates(slug: string) {
  const hasEs = isSlugTranslated(slug, 'es');
  const hasPt = isSlugTranslated(slug, 'pt');

  if (!hasEs && !hasPt) return undefined;

  const languages: Record<string, string> = {
    'en': `${SITE_URL}/blog/${slug}`,
    'x-default': `${SITE_URL}/blog/${slug}`,
  };
  if (hasEs) languages['es'] = `${SITE_URL}/es/blog/${slug}`;
  if (hasPt) languages['pt'] = `${SITE_URL}/pt/blog/${slug}`;

  return { languages };
}
