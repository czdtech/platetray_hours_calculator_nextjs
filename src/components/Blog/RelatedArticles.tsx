import Link from "next/link";

interface ArticleEntry {
  slug: string;
  title: string;
  excerpt: string;
}

interface RelatedArticlesProps {
  articles: ArticleEntry[];
  currentSlug: string;
}

export function RelatedArticles({
  articles,
  currentSlug,
}: RelatedArticlesProps) {
  const filteredArticles = articles
    .filter((article) => article.slug !== currentSlug)
    .slice(0, 3);

  if (filteredArticles.length === 0) return null;

  return (
    <section>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Related Articles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map((article) => (
          <article
            key={article.slug}
            className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <Link
              href={`/blog/${article.slug}`}
              className="block hover:no-underline"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3">
                {article.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                {article.excerpt}
              </p>
              <span className="inline-flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Read more
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
