import blogDates from "./blogDates.json";
import blogRead from "./blogRead.json";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  author?: string;
  readingTime?: number;
}

/**
 * 博客文章数据
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "introduction",
    title: "Introducing the Planetary Hours Calculator",
    excerpt:
      "Learn how our modern, lightning-fast planetary hours calculator works and why it stands out.",
    imageUrl: "/images/blog/planetary-hours-intro.jpg",
    date: blogDates["introduction"],
    readingTime: blogRead["introduction"],
  },
  {
    slug: "what-are-planetary-hours",
    title: "What Are Planetary Hours? A Beginner\'s Guide",
    excerpt:
      "Understand the ancient timing system that fuels our calculator and discover its historical roots.",
    imageUrl: "/images/blog/what-are-planetary-hours.jpg",
    date: blogDates["what-are-planetary-hours"],
    readingTime: blogRead["what-are-planetary-hours"],
  },
  {
    slug: "using-planetary-hours",
    title: "How to Use Planetary Hours for Daily Planning",
    excerpt:
      "Practical strategies to align your schedule with the cosmic clock for productivity and harmony.",
    imageUrl: "/images/blog/using-planetary-hours.jpg",
    date: blogDates["using-planetary-hours"],
    readingTime: blogRead["using-planetary-hours"],
  },
  {
    slug: "algorithm-behind-calculator",
    title: "The Algorithm Behind Our Planetary Hours Calculator",
    excerpt:
      "A technical deep-dive into the TypeScript code and astronomical data that power instant results.",
    imageUrl: "/images/blog/algorithm-behind-calculator.jpg",
    date: blogDates["algorithm-behind-calculator"],
    readingTime: blogRead["algorithm-behind-calculator"],
  },
];
