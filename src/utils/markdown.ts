import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "src/content");

export interface MarkdownContent {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  contentHtml: string;
}

export async function getMarkdownContent(
  slug: string,
  folder: string = "blog",
): Promise<MarkdownContent | null> {
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
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: data.title || "",
      excerpt: data.excerpt || "",
      date: data.date || "",
      author: data.author || "Planetary Hours Team",
      contentHtml,
    };
  } catch (error) {
    console.error(`Error reading markdown file for slug ${slug}:`, error);
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
