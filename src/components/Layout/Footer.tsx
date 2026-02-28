import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getMessagesSync } from "@/i18n/getMessages";
import { toLocalizedPath } from "@/i18n/routePolicy";

interface FooterProps {
  locale?: Locale;
}

export function Footer({ locale = "en" }: FooterProps) {
  const messages = getMessagesSync(locale);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
      <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p className="mb-2 sm:mb-0">© {currentYear} {messages.common.siteName}</p>
        <nav className="flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-x-4" aria-label={messages.common.footerNavigation}>
          <Link
            href={toLocalizedPath('/about', locale)}
            className="text-purple-700 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            {messages.common.about}
          </Link>
          <span className="text-gray-400 dark:text-gray-600 hidden sm:inline" aria-hidden="true">|</span>
          {/* Privacy & Terms intentionally EN-only — see routePolicy.ts */}
          <Link
            href="/privacy"
            prefetch={false}
            className="text-purple-700 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            {messages.common.privacyPolicy}
          </Link>
          <span className="text-gray-400 dark:text-gray-600 hidden sm:inline" aria-hidden="true">|</span>
          <Link
            href="/terms"
            prefetch={false}
            className="text-purple-700 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            {messages.common.termsOfService}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
