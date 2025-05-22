import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPosts, BlogPost } from '@/data/blogPosts';
import { ArticleLayout } from '@/components/Blog/ArticleLayout';
import { ArticleHero } from '@/components/Blog/ArticleHero';
import { ArticleMeta } from '@/components/Blog/ArticleMeta';
import { ArticleShare } from '@/components/Blog/ArticleShare';
import { RelatedArticles } from '@/components/Blog/RelatedArticles';
import { JsonLd } from '@/components/SEO/JsonLd';
import { getArticleSchema, getBreadcrumbSchema } from '@/utils/seo/jsonld';
import { getMarkdownContent, getAllMarkdownFiles } from '@/utils/markdown';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetaryhours.org';

// 省略generateStaticParams和generateMetadata函数...
// Blog Post Page Component
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // 获取文章数据的代码保持不变...
  const markdownContent = await getMarkdownContent(params.slug);
  const post = blogPosts.find(post => post.slug === params.slug);
  
  if (!markdownContent && !post) {
    notFound();
  }
  
  const title = markdownContent?.title || post?.title || '';
  const excerpt = markdownContent?.excerpt || post?.excerpt || '';
  const date = markdownContent?.date || post?.date || '';
  const author = markdownContent?.author || post?.author || 'Planetary Hours Team';
  const readingTime = post?.readingTime || 5;
  const imageUrl = post?.imageUrl || '/images/blog-default.jpg';
  
  const articleUrl = `${SITE_URL}/blog/${params.slug}`;

  // JSON-LD Schemas
  const articleSchema = getArticleSchema({
    title,
    description: excerpt,
    authorName: author,
    datePublished: date,
    url: articleUrl,
    imageUrl: imageUrl.startsWith('/') ? `${SITE_URL}${imageUrl}` : imageUrl,
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
    { name: title, url: articleUrl },
  ]);

  // 定义面包屑项
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: title, url: articleUrl }
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
          <div dangerouslySetInnerHTML={{ __html: markdownContent.contentHtml }} />
        ) : (
          <>
            <p>{excerpt}</p>
            <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <p className="font-bold">Note to Developer:</p>
              <p>This page currently displays the excerpt as the main content. The full blog post content needs to be sourced and rendered here if available.</p>
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
        <RelatedArticles articles={blogPosts} currentSlug={params.slug} />
      </div>
    </ArticleLayout>
  );
}