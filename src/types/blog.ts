export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    imageUrl: string | import("next/image").StaticImageData;
    date: string;
    author?: string;
    readingTime?: number;
}

export interface MarkdownContent {
    title: string;
    excerpt: string;
    date: string;
    author?: string;
    contentHtml: string;
}

export interface BlogMetadata {
    title: string;
    description: string;
    slug: string;
    publishedTime: string;
    modifiedTime?: string;
    author: string;
    image?: string;
    keywords?: string[];
} 