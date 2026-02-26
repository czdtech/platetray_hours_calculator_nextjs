"use client";

import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const article = document.querySelector(".prose");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    const items: TOCItem[] = [];

    elements.forEach((el) => {
      const text = el.textContent || "";
      let id = el.id;
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        el.id = id;
      }
      items.push({
        id,
        text,
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);
  }, []);

  if (headings.length < 3) return null;

  return (
    <nav className="my-8 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          Table of Contents
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ol className="mt-4 space-y-1.5 text-sm">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
              <a
                href={`#${h.id}`}
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => {
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
