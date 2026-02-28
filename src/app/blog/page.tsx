import type { Metadata } from "next";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { formatDistanceToNow } from "date-fns";
import { blogPosts } from "@/data/blogPosts";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/jsonld";
import { Section } from "@/components/semantic/Section";
import { Header } from "@/components/Layout/Header";
import { BlogCategoryFilter } from "@/components/Blog/BlogCategoryFilter";
import { getMessagesSync } from "@/i18n/getMessages";
import { getDateFnsLocale } from "@/utils/dateLocale";
import { getHreflangTags } from "@/utils/seo/hreflang";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";
const locale = "en";
const messages = getMessagesSync(locale);
const dateLocale = getDateFnsLocale(locale);
const hreflang = getHreflangTags("/blog");

export const metadata: Metadata = {
  title: messages.blog.title,
  description: messages.blog.description,
  alternates: {
    canonical: `${SITE_URL}/blog`,
    languages: hreflang,
  },
  openGraph: {
    title: `${messages.blog.title} | ${messages.home.title}`,
    description: messages.blog.description,
    url: `${SITE_URL}/blog`,
    type: "article",
  },
};

export default function BlogPage() {
  // 直接使用导入的blogPosts数据
  // blogPosts已经引用了blogDates.json和blogRead.json中的数据

  // 面包屑导航项
  const breadcrumbItems = [
    { name: messages.common.home, url: "/" },
    { name: messages.common.blog, url: "/blog" },
  ];

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <JsonLd
        data={getBreadcrumbSchema([
          { name: messages.common.home, url: SITE_URL },
          { name: messages.common.blog, url: `${SITE_URL}/blog` },
        ])}
      />

      <Header activePage="blog" locale={locale} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Section className="py-4">
          <div className="max-w-5xl mx-auto">
            {/* 面包屑导航 */}
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
              {messages.blog.title}
            </h1>

            {/* 特色文章 - 最新一篇 */}
            {blogPosts.length > 0 && (
              <div className="mb-16">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 h-64 md:h-auto md:w-1/3 relative">
                      <Image
                        src={blogPosts[0].imageUrl as string | StaticImageData}
                        alt={blogPosts[0].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-between md:w-2/3">
                      <div>
                        <div className="text-sm text-indigo-600 mb-2">
                          {formatDistanceToNow(new Date(blogPosts[0].date), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </div>
                        <Link
                          href={`/blog/${blogPosts[0].slug}`}
                          className="block mt-2 mb-3"
                        >
                          <h2 className="text-2xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
                            {blogPosts[0].title}
                          </h2>
                        </Link>
                        <p className="text-gray-600 text-base">
                          {blogPosts[0].excerpt}
                        </p>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={`/blog/${blogPosts[0].slug}`}
                          className="text-indigo-600 hover:underline font-medium"
                        >
                          {messages.blog.readFullArticle}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 其他文章 - 带分类筛选的网格布局 */}
            <BlogCategoryFilter posts={blogPosts.slice(1)} locale={locale} messages={messages} />
          </div>
        </Section>
      </div>
    </>
  );
}
