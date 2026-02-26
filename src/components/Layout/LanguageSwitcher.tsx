'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, defaultLocale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

function getCurrentLocale(pathname: string): Locale {
  for (const locale of locales) {
    if (locale !== defaultLocale && (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))) {
      return locale;
    }
  }
  return defaultLocale;
}

function getPathWithoutLocale(pathname: string): string {
  for (const locale of locales) {
    if (locale !== defaultLocale) {
      if (pathname === `/${locale}`) return '/';
      if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length);
    }
  }
  return pathname;
}

function getLocalizedPath(basePath: string, locale: Locale): string {
  if (locale === defaultLocale) return basePath;
  return `/${locale}${basePath === '/' ? '' : basePath}`;
}

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = getCurrentLocale(pathname);
  const basePath = getPathWithoutLocale(pathname);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    setIsOpen(false);
    const newPath = getLocalizedPath(basePath, locale);
    router.push(newPath);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="uppercase">{currentLocale}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                locale === currentLocale
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="uppercase mr-2 text-xs font-bold text-gray-400">{locale}</span>
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
