import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
      <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        {/* 版权信息 */}
        <p className="mb-2 sm:mb-0">© 2025 Planetary Hours Calculator</p>
        {/* 链接 - 在小屏幕上换行显示，大屏幕上水平排列 */}
        <nav className="flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-x-4" aria-label="Footer navigation">
          <Link
            href="/about"
            className="text-purple-700 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            About
          </Link>
          <span className="text-gray-400 dark:text-gray-600 hidden sm:inline" aria-hidden="true">|</span>
          <Link
            href="/privacy"
            prefetch={false}
            className="text-purple-700 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-400 dark:text-gray-600 hidden sm:inline" aria-hidden="true">|</span>
          <Link
            href="/terms"
            prefetch={false}
            className="text-purple-700 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
