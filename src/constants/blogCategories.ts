import type { BlogCategory } from "@/types/blog";

export const BLOG_CATEGORIES: Record<BlogCategory, { label: string; description: string }> = {
  "planet-hours": {
    label: "Planet Hours",
    description: "In-depth guides to each of the seven planetary hours",
  },
  "planet-days": {
    label: "Planet Days",
    description: "Understanding the planetary rulers of each day of the week",
  },
  "practical-use": {
    label: "Practical Use",
    description: "How to apply planetary hours to everyday activities",
  },
  education: {
    label: "Education",
    description: "Foundational knowledge about planetary hours and astrology",
  },
  news: {
    label: "News & Events",
    description: "Astronomical events and updates related to planetary hours",
  },
};

export const ALL_CATEGORIES = Object.keys(BLOG_CATEGORIES) as BlogCategory[];
