import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import type { StaticImageData } from "next/image";

interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  imageUrl: string | StaticImageData;
  readingTime: string | number;
}

export function BlogPostCard({
  slug,
  title,
  excerpt,
  date,
  author: _author,
  imageUrl,
  readingTime,
}: BlogPostCardProps) {
  // 使用相对时间格式
  const relativeDate = formatDistanceToNow(new Date(date), { addSuffix: true });
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow">
      <Link href={`/blog/${slug}`} className="block">
        <div className="h-48 overflow-hidden relative">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-6">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {relativeDate}
          {readingTime && ` • ${readingTime}`}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          <Link
            href={`/blog/${slug}`}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {title}
          </Link>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{excerpt}</p>
        <Link
          href={`/blog/${slug}`}
          className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
