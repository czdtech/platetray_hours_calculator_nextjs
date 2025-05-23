import { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo";

// 导入博客文章数据
// 注意：这里需要根据实际的博客数据源进行调整
const getBlogPosts = async () => {
  // 这里应该从实际的数据源获取博客文章
  // 暂时返回一个示例数组
  return [
    {
      slug: "introduction",
      date: "2024-01-15",
      lastModified: "2024-01-15",
    },
    {
      slug: "whatareplanetaryhours",
      date: "2024-01-20",
      lastModified: "2024-01-20",
    },
    {
      slug: "usingplanetaryhours",
      date: "2024-01-25",
      lastModified: "2024-01-25",
    },
    {
      slug: "algorithmbehindcalculator",
      date: "2024-02-01",
      lastModified: "2024-02-01",
    },
  ];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  // 静态页面配置
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  // 获取博客文章并生成sitemap条目
  const blogPosts = await getBlogPosts();
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // 合并所有页面
  return [...staticPages, ...blogPages];
}
