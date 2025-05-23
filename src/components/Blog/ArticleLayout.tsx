import { Header } from "@/components/Layout/Header";
import { Breadcrumb } from "@/components/SEO/Breadcrumb";

interface ArticleLayoutProps {
  hero?: React.ReactNode;
  children: React.ReactNode;
  breadcrumbItems?: Array<{ name: string; url: string }>;
}

/**
 * 统一的文章布局组件。
 * 更新为与旧版Vite保持一致的卡片式设计。
 */
export function ArticleLayout({
  hero,
  children,
  breadcrumbItems,
}: ArticleLayoutProps) {
  return (
    <>
      <Header activePage="blog" />
      <article className="bg-white dark:bg-gray-900">
        {hero}

        {/* 主体内容容器 - 添加了负边距和卡片式边框 */}
        <div className="container mx-auto px-4 lg:px-8 -mt-10 md:-mt-12 relative z-10">
          <main className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-6 md:px-10 pt-10 pb-16 shadow-sm">
            {/* 面包屑导航 */}
            {breadcrumbItems && (
              <nav aria-label="Breadcrumb" className="mb-6 text-sm">
                <Breadcrumb items={breadcrumbItems} />
              </nav>
            )}
            {children}
          </main>
        </div>
      </article>
    </>
  );
}
