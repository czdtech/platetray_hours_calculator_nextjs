import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPost as _BlogPost } from "@/types/blog";
import { blogPosts } from "@/data/blogPosts";
import { getMarkdownContent } from "@/utils/markdown";
import { ArticleLayout } from "@/components/Blog/ArticleLayout";
import { ArticleHero } from "@/components/Blog/ArticleHero";
import { ArticleMeta } from "@/components/Blog/ArticleMeta";
import { ArticleShare } from "@/components/Blog/ArticleShare";
import { RelatedArticles } from "@/components/Blog/RelatedArticles";
import { JsonLd } from "@/components/SEO/JsonLd";
import { getArticleSchema, getBreadcrumbSchema } from "@/utils/seo/jsonld";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://planetaryhours.org";

// 生成静态参数
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// 生成动态元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // 获取文章数据
  const markdownContent = await getMarkdownContent(slug);
  const post = blogPosts.find((p) => p.slug === slug);

  if (!markdownContent && !post) {
    return {
      title: "Article Not Found | Planetary Hours Calculator",
      description: "The requested article could not be found.",
    };
  }

  // 优先使用 markdown 文件中的元数据，然后是 blogPosts 数据
  const title = markdownContent?.title || post?.title || "";
  const description = markdownContent?.excerpt || post?.excerpt || "";
  const imageUrl = post?.imageUrl || "/images/blog-default.jpg";
  const articleUrl = `${SITE_URL}/blog/${slug}`;

  // 确保图片URL是完整的
  const fullImageUrl = imageUrl.startsWith("/")
    ? `${SITE_URL}${imageUrl}`
    : imageUrl;

  return {
    title,
    description,
    alternates: {
      canonical: articleUrl,
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
  };
}

// Blog Post Page Component
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 获取文章数据
  const markdownContent = await getMarkdownContent(slug);
  const post = blogPosts.find((p) => p.slug === slug);

  if (!markdownContent && !post) {
    notFound();
  }

  // 优先使用 markdown 文件中的数据，然后是 blogPosts 数据
  const title = markdownContent?.title || post?.title || "";
  const excerpt = markdownContent?.excerpt || post?.excerpt || "";
  const date = markdownContent?.date || post?.date || "";
  const author =
    markdownContent?.author || post?.author || "Planetary Hours Team";
  const readingTime = post?.readingTime || 5;
  const imageUrl = post?.imageUrl || "/images/blog-default.jpg";

  const articleUrl = `${SITE_URL}/blog/${slug}`;

  // JSON-LD Schemas
  const articleSchema = getArticleSchema({
    title,
    description: excerpt,
    authorName: author,
    datePublished: date,
    url: articleUrl,
    imageUrl: imageUrl.startsWith("/") ? `${SITE_URL}${imageUrl}` : imageUrl,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: title, url: articleUrl },
  ]);

  // 定义面包屑项
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: title, url: `/blog/${slug}` },
  ];

  return (
    <ArticleLayout
      hero={<ArticleHero title={title} imageUrl={imageUrl} />}
      breadcrumbItems={breadcrumbItems}
    >
      <JsonLd data={[articleSchema, breadcrumbSchema]} />

      {/* 文章元数据 - 移至内容前 */}
      <ArticleMeta
        date={date}
        author={author}
        readingTime={readingTime}
        className="mb-8"
      />

      {/* 文章内容 - 修改样式类 */}
      <div className="prose dark:prose-invert max-w-none">
        {markdownContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: markdownContent.contentHtml }}
          />
        ) : (
          <>
            <p>{excerpt}</p>
            <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <p className="font-bold">Note to Developer:</p>
              <p>
                This page currently displays the excerpt as the main content.
                The full blog post content needs to be sourced and rendered here
                if available.
              </p>
            </div>
          </>
        )}
      </div>

      {/* 添加分隔线 */}
      <div className="my-10 border-t border-gray-200 dark:border-gray-700"></div>

      {/* 分享功能 */}
      <ArticleShare title={title} url={articleUrl} />

      {/* 相关文章 */}
      <div className="mt-12">
        <RelatedArticles articles={blogPosts} currentSlug={slug} />
      </div>
    </ArticleLayout>
  );
}