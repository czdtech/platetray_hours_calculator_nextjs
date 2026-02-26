import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import type { StaticImageData } from "next/image";
import { blogPostsEs } from "@/data/blogPosts-es";
import { getMarkdownContent } from "@/utils/markdown";
import { ArticleLayout } from "@/components/Blog/ArticleLayout";
import { ArticleHero } from "@/components/Blog/ArticleHero";
import { ArticleMeta } from "@/components/Blog/ArticleMeta";
import { ArticleShare } from "@/components/Blog/ArticleShare";
import { RelatedArticles } from "@/components/Blog/RelatedArticles";
import { BlogBackToTop } from "@/components/Blog/BlogBackToTop";
import { JsonLd } from "@/components/SEO/JsonLd";
import {
  getArticleSchema,
  getBreadcrumbSchema,
  getFAQPageSchema,
} from "@/utils/seo/jsonld";
import { FAQSection } from "@/components/FAQ/FAQSection";
import { TableOfContents } from "@/components/Blog/TableOfContents";
import { getMessagesSync } from "@/i18n/getMessages";
import { siteConfig } from "@/config/seo";
import { getHreflangTags } from "@/utils/seo/hreflang";

const locale = "es";
const messages = getMessagesSync(locale);

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const contentDir = path.join(process.cwd(), "src/content/blog/es");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  return files.map((f) => ({ slug: f.replace(/\.md$/, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const markdownContent =
    (await getMarkdownContent(slug, "blog/es")) ||
    (await getMarkdownContent(slug, "blog"));
  const post = blogPostsEs.find((p) => p.slug === slug);

  if (!markdownContent && !post) {
    return {
      title: "Artículo No Encontrado | Calculadora de Horas Planetarias",
      description: "El artículo solicitado no pudo ser encontrado.",
    };
  }

  const title = markdownContent?.title || post?.title || "";
  const description = markdownContent?.excerpt || post?.excerpt || "";
  const rawImage = post?.imageUrl || "/images/blog-default.jpg";
  const imageUrl =
    typeof rawImage === "string" ? rawImage : (rawImage as StaticImageData).src;
  const articleUrl = `${siteConfig.url}/es/blog/${slug}`;
  const fullImageUrl = imageUrl.startsWith("/")
    ? `${siteConfig.url}${imageUrl}`
    : imageUrl;

  const hreflang = getHreflangTags(`/blog/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: articleUrl,
      languages: hreflang,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: articleUrl,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImageUrl],
    },
    ...(markdownContent?.keywords && markdownContent.keywords.length > 0
      ? { keywords: markdownContent.keywords }
      : {}),
  };
}

export default async function SpanishBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const markdownContent =
    (await getMarkdownContent(slug, "blog/es")) ||
    (await getMarkdownContent(slug, "blog"));
  const post = blogPostsEs.find((p) => p.slug === slug);

  if (!markdownContent && !post) {
    notFound();
  }

  const title = markdownContent?.title || post?.title || "";
  const excerpt = markdownContent?.excerpt || post?.excerpt || "";
  const date = markdownContent?.date || post?.date || "";
  const author =
    markdownContent?.author || post?.author || "Planetary Hours Team";
  const readingTime = post?.readingTime || 5;
  const rawImage = post?.imageUrl || "/images/blog-default.jpg";
  const imageUrl =
    typeof rawImage === "string" ? rawImage : (rawImage as StaticImageData).src;

  const articleUrl = `${siteConfig.url}/es/blog/${slug}`;
  const faqs = markdownContent?.faqs;

  const articleSchema = getArticleSchema({
    title,
    description: excerpt,
    authorName: author,
    datePublished: date,
    url: articleUrl,
    imageUrl: imageUrl.startsWith("/") ? `${siteConfig.url}${imageUrl}` : imageUrl,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: messages.common.home, url: siteConfig.url },
    { name: messages.common.blog, url: `${siteConfig.url}/es/blog` },
    { name: title, url: articleUrl },
  ]);

  const faqSchema = faqs && faqs.length > 0 ? getFAQPageSchema(faqs) : null;

  const breadcrumbItems = [
    { name: messages.common.home, url: "/es" },
    { name: messages.common.blog, url: "/es/blog" },
    { name: title, url: `/es/blog/${slug}` },
  ];

  return (
    <ArticleLayout
      hero={<ArticleHero title={title} imageUrl={rawImage} />}
      breadcrumbItems={breadcrumbItems}
    >
      <JsonLd
        data={
          faqSchema
            ? [articleSchema, breadcrumbSchema, faqSchema]
            : [articleSchema, breadcrumbSchema]
        }
      />

      <ArticleMeta
        date={date}
        author={author}
        readingTime={readingTime}
        className="mb-8"
      />

      <TableOfContents />

      <div className="prose dark:prose-invert max-w-none">
        {markdownContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: markdownContent.contentHtml }}
          />
        ) : (
          <>
            <p>{excerpt}</p>
            <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <p className="font-bold">Nota:</p>
              <p>
                Este artículo aún no tiene traducción al español. Se muestra el
                contenido en inglés.
              </p>
            </div>
          </>
        )}
      </div>

      {faqs && faqs.length > 0 && (
        <div className="mt-12">
          <FAQSection faqs={faqs} />
        </div>
      )}

      <div className="my-10 border-t border-gray-200 dark:border-gray-700"></div>

      <ArticleShare title={title} url={articleUrl} />

      <div className="mt-12">
        <RelatedArticles articles={blogPostsEs} currentSlug={slug} />
      </div>

      <BlogBackToTop title={title} url={articleUrl} />
    </ArticleLayout>
  );
}
