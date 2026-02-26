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
    slug: "planetary-days-of-the-week",
    title: "Planetary Days of the Week: Complete Guide to Daily Planetary Rulers",
    excerpt:
      "Discover which planet rules each day of the week and how planetary days influence your daily energy. A comprehensive guide to the seven planetary days from Sunday to Saturday.",
    imageUrl: whatIsImg as StaticImageData,
    date: blogDates["planetary-days-of-the-week"],
    readingTime: blogRead["planetary-days-of-the-week"],
    category: "planet-days",
    tags: ["planetary days", "astrology", "weekly planning"],
  },
  {
    slug: "sunday-sun-day",
    title: "Sunday: Day of the Sun — Meaning, Energy & Best Activities",
    excerpt:
      "Sunday is ruled by the Sun, bringing energy of leadership, vitality, and success. Learn the best activities for the Sun's day and how to harness solar energy.",
    imageUrl: introImg as StaticImageData,
    date: blogDates["sunday-sun-day"],
    readingTime: blogRead["sunday-sun-day"],
    category: "planet-days",
    tags: ["sunday", "sun", "planetary days", "leadership"],
  },
  {
    slug: "monday-moon-day",
    title: "Monday: Day of the Moon — Meaning, Energy & Best Activities",
    excerpt:
      "Monday is ruled by the Moon, governing emotions, intuition, and domestic life. Discover the best activities for the Moon's day and how to work with lunar energy.",
    imageUrl: mobileImg as StaticImageData,
    date: blogDates["monday-moon-day"],
    readingTime: blogRead["monday-moon-day"],
    category: "planet-days",
    tags: ["monday", "moon", "planetary days", "intuition"],
  },
  {
    slug: "tuesday-mars-day",
    title: "Tuesday: Day of Mars — Meaning, Energy & Best Activities",
    excerpt:
      "Tuesday is ruled by Mars, the planet of action, courage, and energy. Learn the best activities for Mars day and how to channel warrior energy productively.",
    imageUrl: astronomicalImg as StaticImageData,
    date: blogDates["tuesday-mars-day"],
    readingTime: blogRead["tuesday-mars-day"],
    category: "planet-days",
    tags: ["tuesday", "mars", "planetary days", "action"],
  },
  {
    slug: "wednesday-mercury-day",
    title: "Wednesday: Day of Mercury — Meaning, Energy & Best Activities",
    excerpt:
      "Wednesday is ruled by Mercury, the planet of communication and intellect. Discover the best activities for Mercury's day and how to maximize mental clarity.",
    imageUrl: algoImg as StaticImageData,
    date: blogDates["wednesday-mercury-day"],
    readingTime: blogRead["wednesday-mercury-day"],
    category: "planet-days",
    tags: ["wednesday", "mercury", "planetary days", "communication"],
  },
  {
    slug: "thursday-jupiter-day",
    title: "Thursday: Day of Jupiter — Meaning, Energy & Best Activities",
    excerpt:
      "Thursday is ruled by Jupiter, the Greater Benefic of abundance and growth. Learn the best activities for Jupiter's day and how to attract opportunity and prosperity.",
    imageUrl: businessImg as StaticImageData,
    date: blogDates["thursday-jupiter-day"],
    readingTime: blogRead["thursday-jupiter-day"],
    category: "planet-days",
    tags: ["thursday", "jupiter", "planetary days", "abundance"],
  },
  {
    slug: "friday-venus-day",
    title: "Friday: Day of Venus — Meaning, Energy & Best Activities",
    excerpt:
      "Friday is ruled by Venus, the planet of love, beauty, and pleasure. Discover the best activities for Venus day and why Friday is the ultimate day for romance and art.",
    imageUrl: usingImg as StaticImageData,
    date: blogDates["friday-venus-day"],
    readingTime: blogRead["friday-venus-day"],
    category: "planet-days",
    tags: ["friday", "venus", "planetary days", "love"],
  },
  {
    slug: "saturday-saturn-day",
    title: "Saturday: Day of Saturn — Meaning, Energy & Best Activities",
    excerpt:
      "Saturday is ruled by Saturn, the planet of discipline, structure, and long-term achievement. Learn the best activities for Saturn's day and how to use its focused energy.",
    imageUrl: historyImg as StaticImageData,
    date: blogDates["saturday-saturn-day"],
    readingTime: blogRead["saturday-saturn-day"],
    category: "planet-days",
    tags: ["saturday", "saturn", "planetary days", "discipline"],
  },
  {
    slug: "venus-hour-guide",
    title: "Venus Hour in Astrology: Meaning, Best Activities & Today's Times",
    excerpt:
      "Discover the Venus hour meaning in astrology, the best activities during Venus planetary hours, and why Friday amplifies Venus energy. Learn how to find your next Venus hour today.",
    imageUrl: usingImg as StaticImageData,
    date: blogDates["venus-hour-guide"],
    readingTime: blogRead["venus-hour-guide"],
    category: "planet-hours",
    tags: ["venus", "planetary hours", "love", "beauty"],
  },
  {
    slug: "jupiter-hour-guide",
    title: "Jupiter Hour in Astrology: Growth, Abundance & Opportunity Timing",
    excerpt:
      "Learn about Jupiter hour meaning in astrology — the Greater Benefic's most auspicious time for growth, wealth, legal matters, and expansion. Discover why Thursday amplifies Jupiter's power.",
    imageUrl: businessImg as StaticImageData,
    date: blogDates["jupiter-hour-guide"],
    readingTime: blogRead["jupiter-hour-guide"],
    category: "planet-hours",
    tags: ["jupiter", "planetary hours", "abundance", "growth"],
  },
  {
    slug: "saturn-hour-guide",
    title: "Saturn Hour in Astrology: Discipline, Structure & Strategic Timing",
    excerpt:
      "Understand Saturn hour meaning and activities in astrology. Learn why Saturn's planetary hours favor discipline, long-term planning, and serious work — especially on Saturday.",
    imageUrl: historyImg as StaticImageData,
    date: blogDates["saturn-hour-guide"],
    readingTime: blogRead["saturn-hour-guide"],
    category: "planet-hours",
    tags: ["saturn", "planetary hours", "discipline", "structure"],
  },
  {
    slug: "mercury-hour-guide",
    title: "Mercury Hour in Astrology: Communication, Learning & Mental Clarity",
    excerpt:
      "Explore Mercury hour meaning in astrology. Discover the best activities for Mercury's planetary hours — from writing and studying to negotiations and travel planning.",
    imageUrl: algoImg as StaticImageData,
    date: blogDates["mercury-hour-guide"],
    readingTime: blogRead["mercury-hour-guide"],
    category: "planet-hours",
    tags: ["mercury", "planetary hours", "communication", "learning"],
  },
  {
    slug: "mars-hour-guide",
    title: "Mars Hour in Astrology: Energy, Courage & the Power of Action",
    excerpt:
      "Learn about Mars hour meaning in astrology — the warrior planet's time for action, courage, competition, and physical energy. Discover why Tuesday amplifies Mars power.",
    imageUrl: astronomicalImg as StaticImageData,
    date: blogDates["mars-hour-guide"],
    readingTime: blogRead["mars-hour-guide"],
    category: "planet-hours",
    tags: ["mars", "planetary hours", "action", "courage"],
  },
  {
    slug: "sun-hour-guide",
    title: "Sun Hour in Astrology: Leadership, Vitality & Success Timing",
    excerpt:
      "Discover Sun hour meaning in astrology — the most radiant planetary hour for leadership, success, vitality, and seeking favor from authorities.",
    imageUrl: introImg as StaticImageData,
    date: blogDates["sun-hour-guide"],
    readingTime: blogRead["sun-hour-guide"],
    category: "planet-hours",
    tags: ["sun", "planetary hours", "leadership", "success"],
  },
  {
    slug: "moon-hour-guide",
    title: "Moon Hour in Astrology: Intuition, Emotions & Lunar Timing",
    excerpt:
      "Explore Moon hour meaning in astrology — the lunar planetary hour for intuition, emotions, domestic matters, and public engagement.",
    imageUrl: mobileImg as StaticImageData,
    date: blogDates["moon-hour-guide"],
    readingTime: blogRead["moon-hour-guide"],
    category: "planet-hours",
    tags: ["moon", "planetary hours", "intuition", "emotions"],
  },
  {
    slug: "planetary-hours-faq",
    title: "Planetary Hours FAQ: Expert Answers to Your Most Important Questions",
    excerpt:
      "Get comprehensive answers to the 20 most frequently asked questions about Planetary Hours. From basic concepts to practical applications, our experts provide clear, accurate answers and actionable advice.",
    imageUrl: faqImg as StaticImageData,
    date: blogDates["planetary-hours-faq"],
    readingTime: blogRead["planetary-hours-faq"],
    category: "education",
    tags: ["faq", "beginner", "planetary hours"],
  },
  {
    slug: "mobile-planetary-hours-guide",
    title: "Mobile Planetary Hours: Master Cosmic Timing Anywhere, Anytime",
    excerpt:
      "Access cosmic timing on your mobile device. Learn how to install and use the Planetary Hours Calculator as a Progressive Web App for convenient celestial guidance wherever you are.",
    imageUrl: mobileImg as StaticImageData,
    date: blogDates["mobile-planetary-hours-guide"],
    readingTime: blogRead["mobile-planetary-hours-guide"],
    category: "practical-use",
    tags: ["mobile", "pwa", "guide"],
  },
  {
    slug: "planetary-hours-history-culture",
    title: "From Ancient Babylon to Modern Times: The Historical and Cultural Journey of Planetary Hours",
    excerpt:
      "Explore the fascinating evolution of planetary hours from ancient Babylonian astronomy to contemporary practice, discovering how different cultures shaped this timeless system of cosmic timekeeping.",
    imageUrl: historyImg as StaticImageData,
    date: blogDates["planetary-hours-history-culture"],
    readingTime: blogRead["planetary-hours-history-culture"],
    category: "education",
    tags: ["history", "culture", "babylon"],
  },
  {
    slug: "planetary-hours-business-success",
    title: "The Business Professional's Secret Weapon: How Planetary Hours Can Boost Your Work Efficiency",
    excerpt:
      "Discover how successful entrepreneurs and executives use planetary hours to optimize meetings, negotiations, and strategic decisions. Transform your business timing with this ancient wisdom.",
    imageUrl: businessImg as StaticImageData,
    date: blogDates["planetary-hours-business-success"],
    readingTime: blogRead["planetary-hours-business-success"],
    category: "practical-use",
    tags: ["business", "productivity", "timing"],
  },
  {
    slug: "introduction",
    title: "Introducing the Planetary Hours Calculator",
    excerpt:
      "Learn how our modern, lightning-fast planetary hours calculator works and why it stands out.",
    imageUrl: introImg as StaticImageData,
    date: blogDates["introduction"],
    readingTime: blogRead["introduction"],
    category: "education",
    tags: ["introduction", "calculator", "guide"],
  },
  {
    slug: "what-are-planetary-hours",
    title: "What Are Planetary Hours? A Beginner's Guide",
    excerpt:
      "Understand the ancient timing system that fuels our calculator and discover its historical roots.",
    imageUrl: whatIsImg as StaticImageData,
    date: blogDates["what-are-planetary-hours"],
    readingTime: blogRead["what-are-planetary-hours"],
    category: "education",
    tags: ["beginner", "explained", "planetary hours"],
  },
  {
    slug: "using-planetary-hours",
    title: "How to Use Planetary Hours for Daily Planning",
    excerpt:
      "Practical strategies to align your schedule with the cosmic clock for productivity and harmony.",
    imageUrl: usingImg as StaticImageData,
    date: blogDates["using-planetary-hours"],
    readingTime: blogRead["using-planetary-hours"],
    category: "practical-use",
    tags: ["how-to", "daily planning", "guide"],
  },
  {
    slug: "algorithm-behind-calculator",
    title: "The Algorithm Behind Our Planetary Hours Calculator",
    excerpt:
      "A technical deep-dive into the TypeScript code and astronomical data that power instant results.",
    imageUrl: algoImg as StaticImageData,
    date: blogDates["algorithm-behind-calculator"],
    readingTime: blogRead["algorithm-behind-calculator"],
    category: "education",
    tags: ["algorithm", "technical", "suncalc"],
  },
  {
    slug: "2025-astronomical-events-planetary-hours",
    title: "2025 Astronomical Spectacle: How Planetary Alignments Transform Your Planetary Hours",
    excerpt:
      "Discover the profound significance of January 2025's rare planetary parade and learn how these celestial alignments amplify the energies of your planetary hours for enhanced timing and spiritual practice.",
    imageUrl: astronomicalImg as StaticImageData,
    date: blogDates["2025-astronomical-events-planetary-hours"],
    readingTime: blogRead["2025-astronomical-events-planetary-hours"],
    category: "news",
    tags: ["2025", "planetary alignment", "astronomy"],
  },
];
