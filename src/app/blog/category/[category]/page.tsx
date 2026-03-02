import type { Metadata } from "next";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { blogPosts } from "@/data/blogPosts";
import { BLOG_CATEGORIES, ALL_CATEGORIES } from "@/constants/blogCategories";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/jsonld";
import { Section } from "@/components/semantic/Section";
import { Header } from "@/components/Layout/Header";
import type { BlogCategory } from "@/types/blog";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";

export const dynamicParams = false;

export function generateStaticParams(): { category: string }[] {
  return ALL_CATEGORIES.map((cat) => ({ category: cat }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const info = BLOG_CATEGORIES[category as BlogCategory];
  if (!info) return { title: "Category Not Found" };

  const title = `${info.label} Articles | Planetary Hours Calculator Blog`;
  const description = info.description;
  const url = `${SITE_URL}/blog/category/${category}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const info = BLOG_CATEGORIES[category as BlogCategory];
  if (!info) notFound();

  const filtered = blogPosts.filter((p) => p.category === category);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: info.label, url: `/blog/category/${category}` },
  ];

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: info.label, url: `${SITE_URL}/blog/category/${category}` },
        ])}
      />

      <Header activePage="blog" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Section className="py-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
              {info.label}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              {info.description}
            </p>

            {filtered.length === 0 ? (
              <p className="text-center text-gray-500">
                No articles in this category yet.
              </p>
            ) : (
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
                        {formatDistanceToNow(new Date(post.date), {
                          addSuffix: true,
                        })}
                        {post.readingTime !== undefined &&
                          ` · ${post.readingTime} min read`}
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
            )}
          </div>
        </Section>
      </div>
    </>
  );
}
