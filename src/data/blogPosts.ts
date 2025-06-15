import blogDates from "./blogDates.json";
import blogRead from "./blogRead.json";

import type { BlogPost } from "@/types/blog";
import type { StaticImageData } from "next/image";

// 静态导入博客配图，便于 Next.js 在构建时预生成各尺寸/占位图
import introImg from "../../public/images/blog/planetary-hours-intro.jpg";
import whatIsImg from "../../public/images/blog/what-are-planetary-hours.jpg";
import usingImg from "../../public/images/blog/using-planetary-hours.jpg";
import algoImg from "../../public/images/blog/algorithm-behind-calculator.jpg";

/**
 * 博客文章数据
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "introduction",
    title: "Introducing the Planetary Hours Calculator",
    excerpt:
      "Learn how our modern, lightning-fast planetary hours calculator works and why it stands out.",
    imageUrl: introImg as StaticImageData,
    date: blogDates["introduction"],
    readingTime: blogRead["introduction"],
  },
  {
    slug: "what-are-planetary-hours",
    title: "What Are Planetary Hours? A Beginner's Guide",
    excerpt:
      "Understand the ancient timing system that fuels our calculator and discover its historical roots.",
    imageUrl: whatIsImg as StaticImageData,
    date: blogDates["what-are-planetary-hours"],
    readingTime: blogRead["what-are-planetary-hours"],
  },
  {
    slug: "using-planetary-hours",
    title: "How to Use Planetary Hours for Daily Planning",
    excerpt:
      "Practical strategies to align your schedule with the cosmic clock for productivity and harmony.",
    imageUrl: usingImg as StaticImageData,
    date: blogDates["using-planetary-hours"],
    readingTime: blogRead["using-planetary-hours"],
  },
  {
    slug: "algorithm-behind-calculator",
    title: "The Algorithm Behind Our Planetary Hours Calculator",
    excerpt:
      "A technical deep-dive into the TypeScript code and astronomical data that power instant results.",
    imageUrl: algoImg as StaticImageData,
    date: blogDates["algorithm-behind-calculator"],
    readingTime: blogRead["algorithm-behind-calculator"],
  },
];
