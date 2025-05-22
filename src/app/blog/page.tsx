import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { blogPosts } from '@/data/blogPosts';
import { Breadcrumb } from '@/components/SEO/Breadcrumb';
import { JsonLd } from '@/components/SEO/JsonLd';
import { getBreadcrumbSchema } from '@/utils/seo/jsonld';
import { Section } from '@/components/semantic/Section';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://planetaryhours.org';

export const metadata: Metadata = {
  title: 'Blog | Planetary Hours Calculator',
  description: 'Read the latest updates, guides and announcements about the Planetary Hours Calculator.',
  openGraph: {
    title: 'Blog | Planetary Hours Calculator',
    description: 'Read the latest updates, guides and announcements about the Planetary Hours Calculator.',
    url: `${SITE_URL}/blog`,
    type: 'article',
  },
};

export default function BlogPage() {
  // 直接使用导入的blogPosts数据
  // blogPosts已经引用了blogDates.json和blogRead.json中的数据
  
  // 面包屑导航项
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* JSON-LD 结构化数据 */}
      <JsonLd 
        data={getBreadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Blog', url: `${SITE_URL}/blog` },
        ])} 
      />
      
      <Header activePage="blog" />
      <main className="flex-grow">
        <Section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* 面包屑导航 */}
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">
              Planetary Hours Calculator Blog
            </h1>

            {/* 特色文章 - 最新一篇 */}
            {blogPosts.length > 0 && (
              <div className="mb-16">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 h-64 md:h-auto md:w-1/3 relative">
                      <Image 
                        src={blogPosts[0].imageUrl}
                        alt={blogPosts[0].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-between md:w-2/3">
                      <div>
                        <div className="text-sm text-indigo-600 mb-2">
                          {formatDistanceToNow(new Date(blogPosts[0].date), { addSuffix: true })}
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
                          Read full article →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 其他文章 - 网格布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map(post => (
                <article key={post.slug} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-shadow">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="h-48 overflow-hidden relative">
                      <Image 
                        src={post.imageUrl} 
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="text-xs text-gray-500 mb-2">
                      {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                      {post.readingTime !== undefined && ` • ${post.readingTime} min read`}
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
      </main>
      <Footer />
    </div>
  );
}