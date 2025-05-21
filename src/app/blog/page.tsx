import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts, BlogPost } from '@/data/blogPosts'; // BlogPost type imported
import { formatDistanceToNow } from 'date-fns';
import { Breadcrumb } from '@/components/SEO/Breadcrumb';
import { Section } from '@/components/semantic/Section';
import { JsonLd } from '@/components/SEO/JsonLd';
import { getBreadcrumbSchema } from '@/utils/seo/jsonld';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetaryhours.org';

export const metadata: Metadata = {
  title: 'Blog | Planetary Hours Calculator',
  description: 'Read the latest updates, guides and announcements about the Planetary Hours Calculator.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog | Planetary Hours Calculator',
    description: 'Read the latest updates, guides and announcements about the Planetary Hours Calculator.',
    url: `${SITE_URL}/blog`,
    type: 'website', // Changed from article to website for blog home
  },
};

// Helper function to sort blog posts by date, newest first
const getSortedBlogPosts = (): BlogPost[] => {
  return [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function BlogHomePage() {
  const sortedPosts = getSortedBlogPosts();
  const featuredPost = sortedPosts[0];
  const otherPosts = sortedPosts.slice(1);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' }
  ];

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <Section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
            Planetary Hours Calculator Blog
          </h1>

          {featuredPost && (
            <div className="mb-16">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 h-64 md:h-auto md:w-1/3 relative"> {/* Added relative for Image fill */}
                    <Image 
                      className="object-cover" 
                      src={featuredPost.imageUrl}
                      alt={featuredPost.title}
                      fill
                      priority
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-between md:w-2/3">
                    <div>
                      <div className="text-sm text-indigo-600 mb-2">
                        {formatDistanceToNow(new Date(featuredPost.date), { addSuffix: true })}
                      </div>
                      <Link 
                        href={`/blog/${featuredPost.slug}`} 
                        className="block mt-2 mb-3"
                      >
                        <h2 className="text-2xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
                          {featuredPost.title}
                        </h2>
                      </Link>
                      <p className="text-gray-600 text-base">
                        {featuredPost.excerpt}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link 
                        href={`/blog/${featuredPost.slug}`} 
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Read full article →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map(post => (
              <article key={post.slug} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-shadow">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="h-48 overflow-hidden relative"> {/* Added relative for Image fill */}
                    <Image 
                      src={post.imageUrl} 
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Added sizes prop
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <div className="text-xs text-gray-500 mb-2">
                    {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                    {post.readingTime && ` • ${post.readingTime} min read`}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-indigo-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="text-indigo-600 font-medium text-sm hover:underline">
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
} 