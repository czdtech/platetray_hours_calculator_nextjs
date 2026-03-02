import type { Metadata } from "next";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { blogPostsEs } from "@/data/blogPosts-es";
import { ALL_CATEGORIES } from "@/constants/blogCategories";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/jsonld";
import { Section } from "@/components/semantic/Section";
import { Header } from "@/components/Layout/Header";
import type { BlogCategory } from "@/types/blog";
import { getMessagesSync } from "@/i18n/getMessages";
import { getDateFnsLocale } from "@/utils/dateLocale";
import { siteConfig } from "@/config/seo";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "es";
const messages = getMessagesSync(locale);
const dateLocale = getDateFnsLocale(locale);

const isBlogCategory = (value: string): value is BlogCategory =>
  ALL_CATEGORIES.includes(value as BlogCategory);

export const dynamicParams = false;

export function generateStaticParams(): { category: BlogCategory }[] {
  return ALL_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;

  if (!isBlogCategory(category)) {
    return { title: messages.blog.title };
  }

  const label = messages.categories[category];
  const description = messages.blog.categoryDescriptions[category];
  const canonical = `${siteConfig.url}/es/blog/category/${category}`;
  const hreflang = getHreflangTags(`/blog/category/${category}`);

  return {
    title: `${label} | ${messages.blog.title}`,
    description,
    alternates: {
      canonical,
      languages: hreflang,
    },
    openGraph: {
      title: `${label} | ${messages.blog.title}`,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function SpanishBlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!isBlogCategory(category)) {
    notFound();
  }

  const label = messages.categories[category];
  const description = messages.blog.categoryDescriptions[category];
  const filtered = blogPostsEs.filter((post) => post.category === category);

  const breadcrumbItems = [
    { name: messages.common.home, url: "/es" },
    { name: messages.common.blog, url: "/es/blog" },
    { name: label, url: `/es/blog/category/${category}` },
  ];

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: messages.common.home, url: siteConfig.url },
          { name: messages.common.blog, url: `${siteConfig.url}/es/blog` },
          { name: label, url: `${siteConfig.url}/es/blog/category/${category}` },
        ])}
      />

      <Header activePage="blog" locale={locale} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Section className="py-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
              {label}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              {description}
            </p>

            {filtered.length === 0 ? (
              <p className="text-center text-gray-500">{messages.blog.noArticlesInCategory}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((post) => (
                  <article
                    key={post.slug}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow"
                  >
                    <Link href={`/es/blog/${post.slug}`} className="block">
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
                        {formatDistanceToNow(new Date(post.date), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                        {post.readingTime !== undefined &&
                          ` · ${post.readingTime} ${messages.blog.minRead}`}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        <Link
                          href={`/es/blog/${post.slug}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <Link
                        href={`/es/blog/${post.slug}`}
                        className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
                      >
                        {messages.blog.readMore}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </Section>
      </div>
    </>
  );
}
