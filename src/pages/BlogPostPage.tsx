/**
 * Blog Post Page
 * Displays a single blog post with inline interactive names
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BlogPost } from '../types/blog';
import { Clock, Calendar, Tag, User, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import InlineNameWithHeart from '../components/InlineNameWithHeart';
import BlogNameList from '../components/BlogNameList';
import CompactBlogNameList from '../components/CompactBlogNameList';
import AppHeader from '../components/AppHeader';
import { BlogNameMentionProvider } from '../contexts/BlogNameMentionContext';
import StructuredData from '../components/SEO/StructuredData';

// Check if content mentions baby names
const hasBabyNameContent = (content: string): boolean => {
  if (!content) return false;

  const lowerContent = content.toLowerCase();

  // Check for baby name indicators
  const indicators = [
    'baby name',
    'baby names',
    'name for baby',
    'name meaning',
    'name origin',
    'popular names',
    'unique names',
    'girl names',
    'boy names',
    'gender-neutral names',
    'unisex names',
    'biblical names',
    'modern names',
    'traditional names',
    'vintage names',
    'trendy names'
  ];

  return indicators.some(indicator => lowerContent.includes(indicator));
};

// Extract featured names from blog content
const extractFeaturedNames = (html: string): string[] => {
  const names: string[] = [];
  // Match pattern: <strong>1. Name</strong> or just <strong>Name</strong>
  const strongMatches = html.matchAll(/<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g);

  for (const match of strongMatches) {
    const name = match[1].trim();
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }

  return names;
};

// Process text with inline name components
const processTextWithNames = (text: string, names: string[]): React.ReactNode[] => {
  if (names.length === 0) {
    return [text];
  }

  // Remove HTML tags to get plain text
  const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  // Create regex pattern to match any of the names as whole words
  const namePattern = new RegExp(`\\b(${names.join('|')})\\b`, 'g');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let matchCount = 0;

  while ((match = namePattern.exec(plainText)) !== null) {
    // Add text before the name
    if (match.index > lastIndex) {
      const textBefore = plainText.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push(<span key={`text-${matchCount}`}>{textBefore}</span>);
      }
    }

    // Add the name with heart button
    parts.push(
      <InlineNameWithHeart key={`name-${matchCount}-${match.index}`} name={match[1]} />
    );

    lastIndex = match.index + match[1].length;
    matchCount++;
  }

  // Add remaining text
  if (lastIndex < plainText.length) {
    const remainingText = plainText.substring(lastIndex);
    if (remainingText.trim()) {
      parts.push(<span key={`text-end`}>{remainingText}</span>);
    }
  }

  return parts.length > 0 ? parts : [plainText];
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      const q = query(
        collection(db, 'blogs'),
        where('slug', '==', postSlug),
        where('status', '==', 'published')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError(true);
      } else {
        setPost(snapshot.docs[0].data() as BlogPost);
      }
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Render blog content - names have heart buttons but are not clickable links
  const renderContent = (html: string) => {
    const parts: React.ReactNode[] = [];

    // Detect if this post has baby name content (check category OR content indicators)
    const isBabyNamesPost = post?.category === 'Baby Names' || hasBabyNameContent(html);

    // Check if there's a BlogNameList placeholder
    const hasPlaceholder = html.includes('<!-- BLOG_NAME_LIST_COMPONENT -->');

    if (hasPlaceholder && isBabyNamesPost) {
      // Split content by placeholder
      const [contentBeforePlaceholder, contentAfterPlaceholder] = html.split('<!-- BLOG_NAME_LIST_COMPONENT -->');

      // Process content before placeholder - replace names with heart buttons
      if (contentBeforePlaceholder.trim()) {
        parts.push(
          <div key="html-before">
            {processContentWithHearts(contentBeforePlaceholder)}
          </div>
        );
      }

      // Add CompactBlogNameList component (compact name cards at bottom)
      parts.push(<CompactBlogNameList key="compact-blog-name-list" content={html} />);

      // Process content after placeholder
      if (contentAfterPlaceholder && contentAfterPlaceholder.trim()) {
        parts.push(
          <div key="html-after">
            {processContentWithHearts(contentAfterPlaceholder)}
          </div>
        );
      }
    } else if (isBabyNamesPost) {
      // No placeholder BUT it's a baby names post - add content with hearts + BlogNameList at end
      parts.push(
        <div key="html-content">
          {processContentWithHearts(html)}
        </div>
      );

      // Automatically add CompactBlogNameList at the bottom for ALL baby name posts
      parts.push(<CompactBlogNameList key="compact-blog-name-list" content={html} />);
    } else {
      // Not a baby names post - just render content normally
      parts.push(
        <div key="html-content">
          {processContentWithHearts(html)}
        </div>
      );
    }

    return parts;
  };

  // Process HTML content and replace <strong>Name</strong> with bold name + heart button
  const processContentWithHearts = (htmlContent: string) => {
    // Detect if this post has baby name content (check category OR content indicators)
    const isBabyNamesPost = post?.category === 'Baby Names' || hasBabyNameContent(htmlContent);

    // Extract featured names from the content
    const featuredNames = extractFeaturedNames(htmlContent);

    if (featuredNames.length === 0 || !isBabyNamesPost) {
      // No names found OR not a Baby Names post - just render HTML as-is
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    // Split HTML by <strong> tags and process
    const parts: React.ReactNode[] = [];
    const strongRegex = /<strong>(?:\d+\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)<\/strong>/g;

    let lastIndex = 0;
    let match;
    let matchCount = 0;
    const seenNames = new Set<string>();

    while ((match = strongRegex.exec(htmlContent)) !== null) {
      const nameMatch = match[1].trim();

      // Add HTML before this match
      if (match.index > lastIndex) {
        const htmlBefore = htmlContent.substring(lastIndex, match.index);
        parts.push(
          <span key={`html-${matchCount}`} dangerouslySetInnerHTML={{ __html: htmlBefore }} />
        );
      }

      // Check if this is a featured name (appears in our extracted list)
      if (featuredNames.includes(nameMatch)) {
        // Check if this is the first mention of this name
        const isFirstMention = !seenNames.has(nameMatch);
        seenNames.add(nameMatch);

        // Add name with heart button (only on first mention, only for Baby Names posts)
        parts.push(
          <InlineNameWithHeart
            key={`name-${matchCount}-${match.index}`}
            name={nameMatch}
            showHeart={isFirstMention}
          />
        );
      } else {
        // Not a featured name, just bold text
        parts.push(
          <strong key={`strong-${matchCount}`}>{nameMatch}</strong>
        );
      }

      lastIndex = match.index + match[0].length;
      matchCount++;
    }

    // Add remaining HTML
    if (lastIndex < htmlContent.length) {
      const remainingHtml = htmlContent.substring(lastIndex);
      parts.push(
        <span key="html-end" dangerouslySetInnerHTML={{ __html: remainingHtml }} />
      );
    }

    return <>{parts}</>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-lg text-gray-600">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Post Not Found</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Sorry, we couldn't find that blog post.</p>
          <Link
            to="/blog"
            className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white text-sm sm:text-base rounded-lg hover:bg-purple-700"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <BlogNameMentionProvider>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{post.seo?.metaTitle || post.title} | SoulSeed Blog</title>
        <meta name="description" content={post.seo?.metaDescription || post.excerpt || ''} />
        {post.seo?.keywords && <meta name="keywords" content={post.seo.keywords.join(', ')} />}

        {/* Open Graph */}
        <meta property="og:title" content={post.seo?.metaTitle || post.title} />
        <meta property="og:description" content={post.seo?.metaDescription || post.excerpt || ''} />
        <meta property="og:type" content="article" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo?.metaTitle || post.title} />
        <meta name="twitter:description" content={post.seo?.metaDescription || post.excerpt || ''} />

        {/* Canonical URL */}
        <link rel="canonical" href={`https://soulseedbaby.com/blog/${slug}`} />

        {/* JSON-LD Schema */}
        {post.seo?.schema && (
          <script type="application/ld+json">
            {JSON.stringify(post.seo.schema)}
          </script>
        )}
      </Helmet>

      {/* Article Schema - Fallback if not in post.seo.schema */}
      {!post.seo?.schema && (
        <StructuredData
          type="article"
          data={{
            headline: post.title,
            description: post.excerpt || '',
            image: post.featuredImage || 'https://soulseedbaby.com/og-image.png',
            datePublished: new Date(post.createdAt).toISOString(),
            dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.createdAt).toISOString(),
            author: post.author || 'SoulSeed',
            url: `https://soulseedbaby.com/blog/${slug}`
          }}
        />
      )}

      {/* Sticky Header - same as homepage */}
      <AppHeader title="SoulSeed" showBackButton={false} />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-6 sm:py-10 md:py-12 px-3 sm:px-4">
        <article className="max-w-4xl mx-auto">
          {/* Back Button - Mobile Optimized */}
          <Link
            to="/blog"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-purple-600 hover:text-purple-700 mb-4 sm:mb-6 font-medium text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
            Back to Blog
          </Link>

          {/* Article Header - Mobile Optimized */}
          <header className="mb-6 sm:mb-8">
            {/* Category */}
            <div className="text-xs sm:text-sm font-semibold text-purple-600 mb-2 sm:mb-3 uppercase tracking-wide">
              {post.category}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info - Mobile Optimized */}
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              <div className="flex items-center gap-1 sm:gap-2">
                <Calendar size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="inline sm:hidden">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock size={14} className="sm:w-4 sm:h-4" />
                {post.stats?.readingTime || 5} min read
              </div>
              {post.author && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <User size={14} className="sm:w-4 sm:h-4" />
                  <span className="truncate max-w-[200px]">
                    {post.author.name}{post.author.credentials && `, ${post.author.credentials}`}
                  </span>
                </div>
              )}
            </div>

            {/* Tags - Mobile Optimized */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm"
                  >
                    <Tag size={12} className="sm:w-3.5 sm:h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Bio - Mobile Optimized */}
            {post.author && post.author.bio && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 sm:p-4 border-l-4 border-purple-600">
                <p className="text-xs sm:text-sm text-gray-700">
                  <strong>{post.author.name}</strong> — {post.author.bio}
                </p>
              </div>
            )}
          </header>

          {/* Article Content - Mobile-first, left-aligned, readable */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="prose prose-base sm:prose-lg max-w-none blog-content">
              {renderContent(post.content)}
            </div>
          </div>


          <style>{`
            /* Blog content styling - enhanced formatting */
            .blog-content {
              color: #1f2937;
              line-height: 1.8;
              font-size: 1.0625rem;
            }

            /* H1 - Main Title (Extra Bold) */
            .blog-content h1 {
              color: #111827;
              font-size: 2rem;
              font-weight: 900;
              margin-top: 2.5rem;
              margin-bottom: 1.5rem;
              padding-bottom: 0.75rem;
              border-bottom: 3px solid #9333ea;
              text-align: left;
              letter-spacing: -0.025em;
            }

            /* H2 - Major Sections (Bold with Background) */
            .blog-content h2 {
              color: #111827;
              font-size: 1.75rem;
              font-weight: 800;
              margin-top: 3rem;
              margin-bottom: 1.25rem;
              padding: 1rem 1.25rem;
              background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
              border-left: 5px solid #9333ea;
              border-radius: 0.5rem;
              text-align: left;
              letter-spacing: -0.015em;
            }

            /* H3 - Subsections (Bold with Icon) */
            .blog-content h3 {
              color: #4b5563;
              font-size: 1.375rem;
              font-weight: 700;
              margin-top: 2rem;
              margin-bottom: 1rem;
              padding-left: 1rem;
              border-left: 4px solid #ec4899;
              text-align: left;
            }

            /* Paragraphs - Better Spacing & Indentation */
            .blog-content p {
              margin-bottom: 1.5rem;
              text-align: left;
              padding-left: 0.5rem;
              line-height: 1.85;
            }

            /* First paragraph after header - no indent */
            .blog-content h1 + p,
            .blog-content h2 + p,
            .blog-content h3 + p {
              padding-left: 0;
              margin-top: 1rem;
            }

            /* Strong text (names) - Enhanced */
            .blog-content strong {
              color: #9333ea;
              font-weight: 700;
              font-size: 1.05em;
            }

            /* Text Blocks / Quotes */
            .blog-content blockquote {
              border-left: 4px solid #9333ea;
              padding: 1rem 1.5rem;
              margin: 1.5rem 0;
              background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
              border-radius: 0.5rem;
              font-style: italic;
              color: #374151;
            }

            /* Lists - Better Spacing */
            .blog-content ul {
              list-style-type: disc;
              padding-left: 2rem;
              margin-bottom: 1.5rem;
              margin-top: 1rem;
              text-align: left;
            }

            .blog-content li {
              margin-bottom: 0.75rem;
              padding-left: 0.5rem;
              line-height: 1.7;
            }

            /* Links - More Visible */
            .blog-content a {
              color: #9333ea;
              text-decoration: underline;
              text-decoration-thickness: 2px;
              text-underline-offset: 3px;
              font-weight: 600;
              transition: all 0.2s;
            }

            .blog-content a:hover {
              color: #7e22ce;
              text-decoration-color: #ec4899;
            }

            /* Emoji support in headers */
            .blog-content h1 span,
            .blog-content h2 span,
            .blog-content h3 span {
              display: inline-block;
              margin-left: 0.5rem;
            }

            /* Dividers between sections */
            .blog-content hr {
              border: none;
              height: 2px;
              background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
              margin: 2.5rem 0;
            }

            /* FAQ Section - Beautiful Card-Based Layout */
            .blog-content .faq-item {
              background: linear-gradient(135deg, #faf5ff 0%, #fce7f3 100%);
              border-radius: 1rem;
              padding: 1.5rem;
              margin-bottom: 1.5rem;
              border: 2px solid #e9d5ff;
              box-shadow: 0 2px 8px rgba(147, 51, 234, 0.08);
              transition: all 0.3s ease;
            }

            .blog-content .faq-item:hover {
              box-shadow: 0 4px 16px rgba(147, 51, 234, 0.15);
              border-color: #c084fc;
              transform: translateY(-2px);
            }

            .blog-content .faq-question {
              color: #7e22ce;
              font-size: 1.125rem;
              font-weight: 700;
              margin: 0 0 0.75rem 0;
              padding: 0;
              border: none;
              text-align: left;
              line-height: 1.4;
            }

            .blog-content .faq-answer {
              color: #374151;
              font-size: 1rem;
              line-height: 1.7;
              margin: 0;
              padding: 0;
              text-align: left;
            }

            /* Responsive typography */
            @media (min-width: 640px) {
              .blog-content {
                font-size: 1.125rem;
              }

              .blog-content h1 {
                font-size: 2.5rem;
              }

              .blog-content h2 {
                font-size: 2rem;
                padding: 1.25rem 1.5rem;
              }

              .blog-content h3 {
                font-size: 1.5rem;
              }

              .blog-content p {
                padding-left: 1rem;
              }
            }

            @media (min-width: 1024px) {
              .blog-content {
                font-size: 1.1875rem;
              }

              .blog-content h1 {
                font-size: 3rem;
              }

              .blog-content h2 {
                font-size: 2.25rem;
              }

              .blog-content h3 {
                font-size: 1.75rem;
              }
            }

            /* Mobile optimization */
            @media (max-width: 639px) {
              .blog-content h2 {
                padding: 0.875rem 1rem;
                font-size: 1.5rem;
              }

              .blog-content p {
                padding-left: 0.25rem;
              }
            }
          `}</style>

          {/* Share & Navigation - Mobile Optimized */}
          <footer className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <Link
                to="/blog"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:shadow-lg transition w-full sm:w-auto justify-center sm:justify-start"
              >
                <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
                More Articles
              </Link>

              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm sm:text-base"
              >
                Explore Names →
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </BlogNameMentionProvider>
  );
}
