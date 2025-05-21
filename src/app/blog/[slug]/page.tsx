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
import { Section } from '@/components/semantic/Section'; // For main content wrapper

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetaryhours.org';

// Helper function to find a post by slug
function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

// Generate params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map(post => ({
    slug: post.slug,
  }));
}

// Generate metadata for each blog post page
export async function generateMetadata({
  params,
}: { 
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {}; // Or some default metadata if post not found
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  // Ensure imageUrl is absolute for OpenGraph
  const imageUrl = post.imageUrl.startsWith('/') ? `${SITE_URL}${post.imageUrl}` : post.imageUrl;

  return {
    title: `${post.title} | Planetary Hours Blog`,
    description: post.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: url,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author || 'Planetary Hours Team'],
      images: [
        {
          url: imageUrl,
          // width and height can be added if known, otherwise FB might infer
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [imageUrl], 
    },
  };
}

// Blog Post Page Component
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound(); // Triggers 404 page
  }

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;

  // JSON-LD Schemas
  const articleSchema = getArticleSchema({
    title: post.title,
    description: post.excerpt,
    authorName: post.author || 'Planetary Hours Team',
    datePublished: post.date,
    url: articleUrl,
    imageUrl: post.imageUrl.startsWith('/') ? `${SITE_URL}${post.imageUrl}` : post.imageUrl,
    // headline and dateModified can be added if available
  });

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
    { name: post.title, url: articleUrl },
  ]);

  return (
    <ArticleLayout hero={<ArticleHero title={post.title} imageUrl={post.imageUrl} />}>
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      <article className="prose prose-indigo lg:prose-xl dark:prose-invert mx-auto">
        <header className="mb-8">
          <ArticleMeta 
            date={post.date} 
            author={post.author}
            readingTime={post.readingTime} 
            className="mt-6"
          />
        </header>
        
        {/* Display excerpt as main content for now, as full content isn't in blogPosts.ts */}
        <Section>
          <p>{post.excerpt}</p>
          {
            /* 
            Placeholder for actual blog post content if it were available.
            If using Markdown, this is where you'd render the HTML output.
            e.g., <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} /> 
            */
          }
          <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-bold">Note to Developer:</p>
            <p>This page currently displays the excerpt as the main content. The full blog post content needs to be sourced and rendered here if available (e.g., from Markdown files).</p>
          </div>
        </Section>

        <ArticleShare title={post.title} url={articleUrl} />
      </article>

      <RelatedArticles articles={blogPosts} currentSlug={post.slug} />
    </ArticleLayout>
  );
} 