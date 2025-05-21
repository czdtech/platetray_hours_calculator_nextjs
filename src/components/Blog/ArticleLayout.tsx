interface ArticleLayoutProps {
  hero?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 统一的文章布局组件。
 * 包含 hero 和主要内容区域的样式包装。
 */
export function ArticleLayout({ hero, children }: ArticleLayoutProps) {
  return (
    <>
      {hero}
      <main className="container mx-auto px-4 py-12 flex-grow max-w-3xl">
        {children}
      </main>
    </>
  );
} 