#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src/content/blog');
const dataDirectory = path.join(process.cwd(), 'src/data');

interface BlogMetadata {
  slug: string;
  date: string;
  readingTime: number;
}

/**
 * 计算阅读时间（基于平均阅读速度200字/分钟）
 */
function calculateReadingTime(content: string): number {
  // 移除markdown语法和HTML标签
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]*`/g, '') // 移除行内代码
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/[#*_~`]/g, '') // 移除markdown标记
    .replace(/\s+/g, ' ') // 标准化空白字符
    .trim();

  // 计算字数（英文按单词计算，中文按字符计算）
  const englishWords = plainText.match(/[a-zA-Z]+/g)?.length || 0;
  const chineseChars = plainText.match(/[\u4e00-\u9fff]/g)?.length || 0;
  
  // 英文200词/分钟，中文300字/分钟
  const totalMinutes = (englishWords / 200) + (chineseChars / 300);
  
  // 至少1分钟，四舍五入
  return Math.max(1, Math.round(totalMinutes));
}

/**
 * 获取所有博客文章的元数据
 */
function getAllBlogMetadata(): BlogMetadata[] {
  const files = fs.readdirSync(contentDirectory);
  const blogMetadata: BlogMetadata[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    if (file === 'README.md') continue; // 排除README文件

    const slug = file.replace('.md', '');
    const filePath = path.join(contentDirectory, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      const { data, content } = matter(fileContent);
      
      // 从frontmatter获取日期，如果没有则使用文件修改时间
      let date = data.date;
      if (!date) {
        const stats = fs.statSync(filePath);
        date = stats.mtime.toISOString();
      }

      // 计算阅读时间，优先使用frontmatter中的readingTime
      let readingTime: number;
      if (data.readingTime) {
        // 如果frontmatter中有readingTime，解析数字
        if (typeof data.readingTime === 'string') {
          const match = data.readingTime.match(/(\d+)/);
          readingTime = match ? parseInt(match[1]) : calculateReadingTime(content);
        } else {
          readingTime = data.readingTime;
        }
      } else {
        readingTime = calculateReadingTime(content);
      }

      blogMetadata.push({
        slug,
        date: typeof date === 'string' ? date : date.toISOString(),
        readingTime
      });

      console.log(`✓ Processed ${slug}: ${readingTime} min read`);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error);
    }
  }

  return blogMetadata;
}

/**
 * 生成JSON文件
 */
function generateJsonFiles(metadata: BlogMetadata[]) {
  // 生成blogDates.json
  const dates: Record<string, string> = {};
  metadata.forEach(({ slug, date }) => {
    dates[slug] = date;
  });

  // 生成blogRead.json
  const readingTimes: Record<string, number> = {};
  metadata.forEach(({ slug, readingTime }) => {
    readingTimes[slug] = readingTime;
  });

  // 写入文件
  fs.writeFileSync(
    path.join(dataDirectory, 'blogDates.json'),
    JSON.stringify(dates, null, 2)
  );

  fs.writeFileSync(
    path.join(dataDirectory, 'blogRead.json'),
    JSON.stringify(readingTimes, null, 2)
  );

  console.log('\n✓ Generated blogDates.json');
  console.log('✓ Generated blogRead.json');
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 Generating blog metadata...\n');

  try {
    const metadata = getAllBlogMetadata();
    generateJsonFiles(metadata);
    
    console.log(`\n✅ Successfully processed ${metadata.length} blog posts`);
  } catch (error) {
    console.error('❌ Error generating blog metadata:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { main as generateBlogMetadata };