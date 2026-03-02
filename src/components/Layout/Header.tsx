"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/Theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/Layout/LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import { getMessagesSync } from "@/i18n/getMessages";
import { toLocalizedPath } from "@/i18n/routePolicy";

interface HeaderProps {
  activePage: "calculator" | "about" | "blog" | "cities";
  locale?: Locale;
}

export function Header({ activePage, locale = "en" }: HeaderProps) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const messages = getMessagesSync(locale);

  const handleFAQClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;

    const homePath = toLocalizedPath('/', locale);
    if (window.location.pathname !== homePath) {
      router.push(toLocalizedPath('/', locale));
      setTimeout(() => {
        const faqElement = document.getElementById("faq");
        if (faqElement) {
          faqElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    } else {
      const faqElement = document.getElementById("faq");
      if (faqElement) {
        faqElement.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href={toLocalizedPath('/', locale)}
          aria-label={messages.common.homeAriaLabel}
          className="text-xl font-bold text-gray-800 dark:text-gray-100"
        >
          {messages.common.siteName}
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href={toLocalizedPath('/', locale)}
            className={`text-sm ${
              activePage === "calculator"
                ? "text-purple-600 dark:text-purple-400 font-medium border-b-2 border-purple-600 dark:border-purple-400 pb-1"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            }`}
          >
            {messages.common.calculator}
          </Link>
          {activePage === "calculator" && (
            <Link
              href={`${toLocalizedPath('/', locale)}#faq`}
              onClick={handleFAQClick}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            >
              {messages.common.faq}
            </Link>
          )}
          <Link
            href={toLocalizedPath('/planetary-hours', locale)}
            className={`text-sm ${
              activePage === "cities"
                ? "text-purple-600 dark:text-purple-400 font-medium border-b-2 border-purple-600 dark:border-purple-400 pb-1"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            }`}
          >
            {messages.common.cities}
          </Link>
          <Link
            href={toLocalizedPath('/blog', locale)}
            className={`text-sm ${
              activePage === "blog"
                ? "text-purple-600 dark:text-purple-400 font-medium border-b-2 border-purple-600 dark:border-purple-400 pb-1"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            }`}
          >
            {messages.common.blog}
          </Link>
          <Link
            href={toLocalizedPath('/about', locale)}
            className={`text-sm ${
              activePage === "about"
                ? "text-purple-600 dark:text-purple-400 font-medium border-b-2 border-purple-600 dark:border-purple-400 pb-1"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            }`}
          >
            {messages.common.about}
          </Link>
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
        </nav>

        {/* Mobile: Theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 focus:outline-none"
            aria-label={messages.common.toggleNavigation}
            aria-expanded={isMenuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 pb-4 shadow-sm">
          <Link
            href={toLocalizedPath('/', locale)}
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
            onClick={() => setMenuOpen(false)}
          >
            {messages.common.calculator}
          </Link>
          {activePage === "calculator" && (
            <Link
              href={`${toLocalizedPath('/', locale)}#faq`}
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
              onClick={handleFAQClick}
            >
              {messages.common.faq}
            </Link>
          )}
          <Link
            href={toLocalizedPath('/planetary-hours', locale)}
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
            onClick={() => setMenuOpen(false)}
          >
            {messages.common.cities}
          </Link>
          <Link
            href={toLocalizedPath('/blog', locale)}
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
            onClick={() => setMenuOpen(false)}
          >
            {messages.common.blog}
          </Link>
          <Link
            href={toLocalizedPath('/about', locale)}
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
            onClick={() => setMenuOpen(false)}
          >
            {messages.common.about}
          </Link>
        </nav>
      )}
    </header>
  );
}
