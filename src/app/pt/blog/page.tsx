import type { Metadata } from "next";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { formatDistanceToNow } from "date-fns";
import { blogPostsPt } from "@/data/blogPosts-pt";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getBreadcrumbSchema } from "@/utils/seo/jsonld";
import { Section } from "@/components/semantic/Section";
import { Header } from "@/components/Layout/Header";
import { BlogCategoryFilter } from "@/components/Blog/BlogCategoryFilter";
import { getMessagesSync } from "@/i18n/getMessages";
import { siteConfig } from "@/config/seo";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "pt";
const messages = getMessagesSync(locale);
const hreflang = getHreflangTags("/blog");

export const metadata: Metadata = {
  title: messages.blog.title,
  description: messages.blog.description,
  alternates: {
    canonical: `${siteConfig.url}/pt/blog`,
    languages: hreflang,
  },
  openGraph: {
    title: `${messages.blog.title} | ${siteConfig.name}`,
    description: messages.blog.description,
    url: `${siteConfig.url}/pt/blog`,
    type: "article",
  },
};

export default function PortugueseBlogPage() {
  const breadcrumbItems = [
    { name: messages.common.home, url: "/pt" },
    { name: messages.common.blog, url: "/pt/blog" },
  ];

  return (
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: messages.common.home, url: siteConfig.url },
          { name: messages.common.blog, url: `${siteConfig.url}/pt/blog` },
        ])}
      />

      <Header activePage="blog" />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Section className="py-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
              {messages.blog.title}
            </h1>

            {blogPostsPt.length > 0 && (
              <div className="mb-16">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 h-64 md:h-auto md:w-1/3 relative">
                      <Image
                        src={blogPostsPt[0].imageUrl as string | StaticImageData}
                        alt={blogPostsPt[0].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        placeholder="blur"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-between md:w-2/3">
                      <div>
                        <div className="text-sm text-indigo-600 mb-2">
                          {formatDistanceToNow(new Date(blogPostsPt[0].date), {
                            addSuffix: true,
                          })}
                        </div>
                        <Link
                          href={`/pt/blog/${blogPostsPt[0].slug}`}
                          className="block mt-2 mb-3"
                        >
                          <h2 className="text-2xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
                            {blogPostsPt[0].title}
                          </h2>
                        </Link>
                        <p className="text-gray-600 text-base">
                          {blogPostsPt[0].excerpt}
                        </p>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={`/pt/blog/${blogPostsPt[0].slug}`}
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

            <BlogCategoryFilter posts={blogPostsPt.slice(1)} />
          </div>
        </Section>
      </div>
    </>
  );
}
