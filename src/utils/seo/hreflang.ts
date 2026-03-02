import { siteConfig } from '@/config/seo';

export function getHreflangTags(path: string) {
  const baseUrl = siteConfig.url;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return {
    en: `${baseUrl}${cleanPath}`,
    es: `${baseUrl}/es${cleanPath}`,
    pt: `${baseUrl}/pt${cleanPath}`,
    'x-default': `${baseUrl}${cleanPath}`,
  };
}
