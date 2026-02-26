"use client";

import { useState } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { formatDistanceToNow } from "date-fns";
import type { BlogPost, BlogCategory } from "@/types/blog";
import { BLOG_CATEGORIES } from "@/constants/blogCategories";

interface BlogCategoryFilterProps {
  posts: BlogPost[];
}

export function BlogCategoryFilter({ posts }: BlogCategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">("all");

  const usedCategories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  ) as BlogCategory[];

  const filtered = activeCategory === "all"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <>
      {usedCategories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {usedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {BLOG_CATEGORIES[cat]?.label ?? cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((post) => (
          <article
            key={post.slug}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="h-48 overflow-hidden relative">
                <Image
                  src={post.imageUrl as string | StaticImageData}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  placeholder="blur"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <div className="p-6">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                {post.readingTime !== undefined && ` · ${post.readingTime} min read`}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
              >
                Read more →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
