'use client';

import { useState } from 'react';
import Link from 'next/link';
// import { HashLink } from 'react-router-hash-link'; // HashLink might need a Next.js alternative or different handling

// interface HeaderProps {
//   activePage: 'calculator' | 'about' | 'blog';
// }

// export function Header({ activePage }: HeaderProps) {
export function Header() { // Removed activePage prop
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo / Brand name 可点击返回首页，不使用 H1 避免重复主标题 */}
        <Link
          href="/"
          aria-label="Planetary Hours home"
          className="text-xl font-bold text-gray-800"
        >
          Planetary Hours
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/"
            // className={`text-sm ${activePage === 'calculator' // activePage logic removed for now
            //   ? 'text-purple-600 font-medium border-b-2 border-purple-600 pb-1'
            //   : 'text-gray-600 hover:text-purple-700 transition-colors duration-200'
            //   }`}
            className="text-sm text-gray-600 hover:text-purple-700 transition-colors duration-200"
          >
            Calculator
          </Link>
          {/* {activePage === 'calculator' && ( // activePage logic removed for now */}
          <Link
            href="/#faq"
            className="text-sm text-gray-600 hover:text-purple-700 transition-colors duration-200"
          >
            FAQ
          </Link>
          {/* )} */}
          <Link
            href="/blog"
            // className={`text-sm ${activePage === 'blog' // activePage logic removed for now
            //   ? 'text-purple-600 font-medium border-b-2 border-purple-600 pb-1'
            //   : 'text-gray-600 hover:text-purple-700 transition-colors duration-200'
            //   }`}
            className="text-sm text-gray-600 hover:text-purple-700 transition-colors duration-200"
          >
            Blog
          </Link>
          <Link
            href="/about"
            // className={`text-sm ${activePage === 'about' // activePage logic removed for now
            //   ? 'text-purple-600 font-medium border-b-2 border-purple-600 pb-1'
            //   : 'text-gray-600 hover:text-purple-700 transition-colors duration-200'
            //   }`}
            className="text-sm text-gray-600 hover:text-purple-700 transition-colors duration-200"
          >
            About
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-600 hover:text-purple-700 focus:outline-none"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 px-4 pb-4 shadow-sm">
          <Link
            href="/"
            className="block py-2 text-sm font-medium text-gray-700 hover:text-purple-700"
            onClick={() => setMenuOpen(false)}
          >
            Calculator
          </Link>
          {/* {activePage === 'calculator' && ( // activePage logic removed for now */}
          <Link
            href="/#faq"
            className="block py-2 text-sm font-medium text-gray-700 hover:text-purple-700"
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </Link>
          {/* )} */}
          <Link
            href="/blog"
            className="block py-2 text-sm font-medium text-gray-700 hover:text-purple-700"
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="block py-2 text-sm font-medium text-gray-700 hover:text-purple-700"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
        </nav>
      )}
    </header>
  );
}