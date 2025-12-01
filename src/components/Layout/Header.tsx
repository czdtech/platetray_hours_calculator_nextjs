"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/Theme/ThemeToggle";
// import { HashLink } from 'react-router-hash-link'; // HashLink might need a Next.js alternative or different handling

interface HeaderProps {
  activePage: "calculator" | "about" | "blog";
}

export function Header({ activePage }: HeaderProps) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleFAQClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // 安全检查：确保在客户端环境
    if (typeof window === 'undefined') return;
    
    // 如果当前不在首页，先导航到首页
    if (window.location.pathname !== "/") {
      router.push("/");
      // 需要等到页面加载完毕后才能滚动
      setTimeout(() => {
        const faqElement = document.getElementById("faq");
        if (faqElement) {
          faqElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    } else {
      // 如果已经在首页，直接滚动
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
        {/* Logo / Brand name 可点击返回首页，不使用 H1 避免重复主标题 */}
        <Link
          href="/"
          aria-label="Planetary Hours home"
          className="text-xl font-bold text-gray-800 dark:text-gray-100"
        >
          Planetary Hours
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm ${
              activePage === "calculator"
                ? "text-purple-600 dark:text-purple-400 font-medium border-b-2 border-purple-600 dark:border-purple-400 pb-1"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            }`}
          >
            Calculator
          </Link>
          {activePage === "calculator" && (
            <Link
              href="/#faq"
              onClick={handleFAQClick}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            >
              FAQ
            </Link>
          )}
          <Link
            href="/blog"
            className={`text-sm ${
              activePage === "blog"
                ? "text-purple-600 dark:text-purple-400 font-medium border-b-2 border-purple-600 dark:border-purple-400 pb-1"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            }`}
          >
            Blog
          </Link>
          <Link
            href="/about"
            className={`text-sm ${
              activePage === "about"
                ? "text-purple-600 dark:text-purple-400 font-medium border-b-2 border-purple-600 dark:border-purple-400 pb-1"
                : "text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200"
            }`}
          >
            About
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile: Theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 focus:outline-none"
            aria-label="Toggle navigation"
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
            href="/"
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
            onClick={() => setMenuOpen(false)}
          >
            Calculator
          </Link>
          {activePage === "calculator" && (
            <Link
              href="/#faq"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
              onClick={handleFAQClick}
            >
              FAQ
            </Link>
          )}
          <Link
            href="/blog"
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
        </nav>
      )}
    </header>
  );
}
