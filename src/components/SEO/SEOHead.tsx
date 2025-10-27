import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  twitterCard?: 'summary' | 'summary_large_image';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

/**
 * SEOHead - Reusable SEO component for consistent meta tags across all pages
 *
 * Includes:
 * - Page title
 * - Meta description
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URL
 * - Noindex option for non-public pages
 *
 * @example
 * <SEOHead
 *   title="About Us"
 *   description="Learn about SoulSeed..."
 *   canonical="https://soulseedbaby.com/about"
 *   ogImage="https://soulseedbaby.com/og-image.png"
 * />
 */
export default function SEOHead({
  title,
  description,
  canonical,
  ogImage = 'https://soulseedbaby.com/og-image.png',
  ogType = 'website',
  noindex = false,
  twitterCard = 'summary_large_image',
  article,
}: SEOHeadProps) {
  const fullTitle = title.includes('SoulSeed') ? title : `${title} | SoulSeed`;
  const siteUrl = 'https://soulseedbaby.com';
  const finalCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={finalCanonical} />

      {/* Noindex for admin/debug pages */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Tags for Social Sharing */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="SoulSeed" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific OG tags */}
      {article && ogType === 'article' && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@soulseedbaby" />
      <meta name="twitter:creator" content="@soulseedbaby" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />
    </Helmet>
  );
}
