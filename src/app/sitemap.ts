import { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo";
import { blogPosts } from "@/data/blogPosts"; // 导入实际的博客文章数据
import staticPageDates from "@/data/staticPageDates.json"; // 导入静态页面日期
// blogDates.json is implicitly used by blogPosts.ts, so no direct import needed here if blogPosts already processes it.
// However, if blogPosts only contains slugs and we need to fetch dates separately:
import blogActualDates from "@/data/blogDates.json"; // Explicitly import for clarity if needed for direct use
import { createLogger } from '@/utils/unified-logger';

const logger = createLogger('Sitemap');

// 语义化常量，替代 new Date(0) 反模式
const EPOCH_DATE = new Date('1970-01-01T00:00:00Z');

// Helper function to get the latest blog post date
const getLatestBlogPostDate = (): Date => {
  if (!blogPosts || blogPosts.length === 0) {
    return new Date(staticPageDates.home); // Fallback to home page date or site launch date
  }
  // Assuming blogPosts are sorted by date descending, or we find the max date
  // Dates in blogActualDates are like "2025-05-19T17:39:49+08:00"
  const latestDate = blogPosts.reduce((latest, post) => {
    const postDate = new Date(blogActualDates[post.slug as keyof typeof blogActualDates] || post.date);
    return postDate > latest ? postDate : latest;
  }, EPOCH_DATE);
  return latestDate > EPOCH_DATE ? latestDate : new Date(staticPageDates.home);
};


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const siteLaunchDate = new Date(staticPageDates.home); // Use home date as a general fallback or site launch

  // 静态页面配置
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(staticPageDates.home),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(staticPageDates.about),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`, // 博客列表页
      lastModified: getLatestBlogPostDate(), // 使用最新博客文章的日期
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(staticPageDates.privacy),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(staticPageDates.terms),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  // 从导入的 blogPosts (它会使用 blogActualDates) 生成 sitemap 条目
  const blogPostEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    // Ensure post.slug exists in blogActualDates or post.date is a valid fallback
    const postDateString = blogActualDates[post.slug as keyof typeof blogActualDates] || post.date;
    const postDate = new Date(postDateString);

    // Add a check for invalid dates
    if (isNaN(postDate.getTime())) {
      logger.warn(`Invalid date for blog post slug "${post.slug}": ${postDateString}. Falling back to site launch date.`);
      return {
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: siteLaunchDate, // Fallback for invalid dates
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    }

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: postDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  // 合并所有页面
  return [...staticPages, ...blogPostEntries];
}
