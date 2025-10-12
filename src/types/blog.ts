/**
 * Blog Post Types
 * Shared with SEO Blog Generator
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML
  markdown: string;
  author: {
    name: string;
    credentials: string;
    bio: string;
  };
  publishedAt: number;
  updatedAt: number;
  tags: string[];
  category: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    schema: any; // JSON-LD
  };
  stats: {
    wordCount: number;
    readingTime: number;
  };
  featured: boolean;
  status: 'published' | 'draft';
}
