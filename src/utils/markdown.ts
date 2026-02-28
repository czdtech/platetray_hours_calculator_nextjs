import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

import { createLogger } from '@/utils/unified-logger';
const contentDirectory = path.join(process.cwd(), "src/content");

type ContentLocale = "en" | "es" | "pt";

function localizeBlogHrefs(contentHtml: string, locale: ContentLocale): string {
  if (locale === "en") {
    return contentHtml;
  }

  return contentHtml.replace(/href=(["'])\/blog\//g, `href=$1/${locale}/blog/`);
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface MarkdownContent {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  contentHtml: string;
  keywords?: string[];
  faqs?: FAQItem[];
}

export async function getMarkdownContent(
  slug: string,
  folder: string = "blog",
  locale: ContentLocale = "en",
): Promise<MarkdownContent | null> {
  const logger = createLogger('Markdown');

  try {
    const fullPath = path.join(contentDirectory, folder, `${slug}.md`);

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");

    // 使用gray-matter解析Markdown文件的前置元数据
    const { data, content } = matter(fileContents);

    // 使用remark将Markdown转换为HTML
    const processedContent = await remark().use(html).process(content);
    const contentHtml = localizeBlogHrefs(processedContent.toString(), locale);

    const faqs: FAQItem[] | undefined = Array.isArray(data.faqs)
      ? data.faqs.map((f: { q?: string; question?: string; a?: string; answer?: string }) => ({
          question: f.q || f.question || "",
          answer: f.a || f.answer || "",
        })).filter((f: FAQItem) => f.question && f.answer)
      : undefined;

    return {
      slug,
      title: data.title || "",
      excerpt: data.excerpt || "",
      date: data.date || "",
      author: data.author || "Planetary Hours Team",
      contentHtml,
      keywords: Array.isArray(data.keywords) ? data.keywords : undefined,
      faqs: faqs && faqs.length > 0 ? faqs : undefined,
    };
  } catch (error) {
      const err = error instanceof Error ? error : new Error(`Unknown error reading markdown file for slug ${slug}`);
      logger.error(`Error reading markdown file for slug ${slug}:`, err);
    return null;
  }
}

export async function getAllMarkdownFiles(
  folder: string = "blog",
): Promise<string[]> {
  const folderPath = path.join(contentDirectory, folder);

  // 检查目录是否存在
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const fileNames = fs.readdirSync(folderPath);

  // 只返回.md文件的文件名（不带扩展名）
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}
