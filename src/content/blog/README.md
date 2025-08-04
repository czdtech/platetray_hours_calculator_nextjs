# Blog Content Management

This directory contains all blog articles for the Planetary Hours Calculator website.

## How It Works

### 1. Article Structure

Each blog article is a Markdown file with frontmatter containing metadata:

```markdown
---
title: "Article Title"
excerpt: "Brief description of the article"
date: "2025-01-01T10:00:00+08:00"
author: "Planetary Hours Team"
---

# Article Content

Your article content goes here...
```

**Important**: Keep the frontmatter simple with only the 4 required fields. Additional metadata like keywords, images, categories, and reading time are handled automatically by the system or through other configuration files.

### 2. Automatic Metadata Generation

The system automatically generates `blogDates.json` and `blogRead.json` files based on the frontmatter and content of your articles:

- **Date**: Extracted from the `date` field in frontmatter
- **Reading Time**: Calculated automatically based on content length (200 words/minute for English, 300 characters/minute for Chinese)

### 3. Adding New Articles

To add a new blog article:

1. Create a new `.md` file in this directory
2. Add proper frontmatter with all required fields
3. Write your article content
4. Run `npm run generate:blog-metadata` to update the metadata files
5. The article will automatically appear in the blog list

### 4. Scripts

- `npm run generate:blog-metadata` - Regenerate blog metadata from markdown files
- `npm run compress:blog-images` - Optimize blog images
- `npm run clean:blog-image-artifacts` - Clean up image artifacts

### 5. Build Process

The metadata files are automatically regenerated during the build process via the `prebuild` script, ensuring they're always up to date.

## File Structure

```
src/content/blog/
├── README.md                                    # This file
├── introduction.md                              # Calculator introduction
├── what-are-planetary-hours.md                  # Beginner's guide
├── using-planetary-hours.md                     # Practical usage guide
├── algorithm-behind-calculator.md               # Technical deep dive
├── mobile-planetary-hours-guide.md              # Mobile usage guide
├── planetary-hours-business-success.md          # Business applications
├── planetary-hours-faq.md                       # Frequently asked questions
├── planetary-hours-history-culture.md           # Historical background
└── 2025-astronomical-events-planetary-hours.md  # 2025 astronomical events
```

## Best Practices

1. **Consistent Naming**: Use kebab-case for file names
2. **Simple Frontmatter**: Only use the 4 required fields (title, excerpt, date, author)
3. **SEO Optimization**: Include relevant keywords in title and excerpt
4. **Image Optimization**: Images are configured in `src/data/blogPosts.ts`
5. **Internal Linking**: Use markdown links to reference other articles
6. **Reading Time**: Automatically calculated by the system
7. **Date Format**: Use ISO 8601 format with timezone for dates
8. **No Breadcrumbs**: Don't include breadcrumb navigation in article content - it's handled by the layout

## Troubleshooting

If articles don't appear in the blog list:

1. Check that the markdown file is properly formatted
2. Ensure frontmatter is valid YAML
3. Run `npm run generate:blog-metadata` to regenerate metadata
4. Check that the article slug matches the filename (without .md extension)