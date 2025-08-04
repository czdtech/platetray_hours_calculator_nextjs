import blogDates from "./blogDates.json";
import blogRead from "./blogRead.json";

import type { BlogPost } from "@/types/blog";
import type { StaticImageData } from "next/image";

// 静态导入博客配图，便于 Next.js 在构建时预生成各尺寸/占位图
import introImg from "../../public/images/blog/planetary-hours-intro.jpg";
import whatIsImg from "../../public/images/blog/what-are-planetary-hours.jpg";
import usingImg from "../../public/images/blog/using-planetary-hours.jpg";
import algoImg from "../../public/images/blog/algorithm-behind-calculator.jpg";
import mobileImg from "../../public/images/blog/mobile-planetary-hours.jpg";
import businessImg from "../../public/images/blog/business-planetary-hours.jpg";
import faqImg from "../../public/images/blog/planetary-hours-faq.jpg";
import historyImg from "../../public/images/blog/planetary-hours-history.jpg";
import astronomicalImg from "../../public/images/blog/2025-planetary-alignment.jpg";

/**
 * 博客文章数据 - 按发布日期倒序排列（最新的在前）
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "planetary-hours-faq",
    title: "Planetary Hours FAQ: Expert Answers to Your Most Important Questions",
    excerpt:
      "Get comprehensive answers to the 20 most frequently asked questions about Planetary Hours. From basic concepts to practical applications, our experts provide clear, accurate answers and actionable advice.",
    imageUrl: faqImg as StaticImageData,
    date: blogDates["planetary-hours-faq"],
    readingTime: blogRead["planetary-hours-faq"],
  },
  {
    slug: "mobile-planetary-hours-guide",
    title: "Mobile Planetary Hours: Master Cosmic Timing Anywhere, Anytime",
    excerpt:
      "Access cosmic timing on your mobile device. Learn how to install and use the Planetary Hours Calculator as a Progressive Web App for convenient celestial guidance wherever you are.",
    imageUrl: mobileImg as StaticImageData,
    date: blogDates["mobile-planetary-hours-guide"],
    readingTime: blogRead["mobile-planetary-hours-guide"],
  },
  {
    slug: "planetary-hours-history-culture",
    title: "From Ancient Babylon to Modern Times: The Historical and Cultural Journey of Planetary Hours",
    excerpt:
      "Explore the fascinating evolution of planetary hours from ancient Babylonian astronomy to contemporary practice, discovering how different cultures shaped this timeless system of cosmic timekeeping.",
    imageUrl: historyImg as StaticImageData,
    date: blogDates["planetary-hours-history-culture"],
    readingTime: blogRead["planetary-hours-history-culture"],
  },
  {
    slug: "planetary-hours-business-success",
    title: "The Business Professional's Secret Weapon: How Planetary Hours Can Boost Your Work Efficiency",
    excerpt:
      "Discover how successful entrepreneurs and executives use planetary hours to optimize meetings, negotiations, and strategic decisions. Transform your business timing with this ancient wisdom.",
    imageUrl: businessImg as StaticImageData,
    date: blogDates["planetary-hours-business-success"],
    readingTime: blogRead["planetary-hours-business-success"],
  },
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
  {
    slug: "2025-astronomical-events-planetary-hours",
    title: "2025 Astronomical Spectacle: How Planetary Alignments Transform Your Planetary Hours",
    excerpt:
      "Discover the profound significance of January 2025's rare planetary parade and learn how these celestial alignments amplify the energies of your planetary hours for enhanced timing and spiritual practice.",
    imageUrl: astronomicalImg as StaticImageData,
    date: blogDates["2025-astronomical-events-planetary-hours"],
    readingTime: blogRead["2025-astronomical-events-planetary-hours"],
  },
];
