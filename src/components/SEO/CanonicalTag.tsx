import React from 'react';
import { Helmet } from 'react-helmet-async';

interface CanonicalTagProps {
  path: string;
}

/**
 * CanonicalTag Component
 *
 * Adds a canonical URL tag to prevent duplicate content issues.
 * Critical for SEO - tells search engines the preferred version of a page.
 *
 * @param path - The URL path (e.g., '/' or '/blog/best-strollers-2026')
 */
const CanonicalTag: React.FC<CanonicalTagProps> = ({ path }) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Build full canonical URL
  const canonicalUrl = `https://soulseedbaby.com${normalizedPath}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default CanonicalTag;
