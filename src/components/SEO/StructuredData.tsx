import React from 'react';
import { Helmet } from 'react-helmet-async';

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactEmail?: string;
}

interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

type StructuredDataProps = {
  type: 'organization';
  data?: OrganizationSchemaProps;
} | {
  type: 'website';
  data?: WebSiteSchemaProps;
} | {
  type: 'article';
  data: ArticleSchemaProps;
} | {
  type: 'breadcrumb';
  data: BreadcrumbSchemaProps;
} | {
  type: 'webapp';
  data?: Record<string, never>;
};

/**
 * StructuredData Component
 * Adds Schema.org JSON-LD structured data to pages for better SEO
 *
 * Usage:
 * <StructuredData type="organization" />
 * <StructuredData type="website" />
 * <StructuredData type="article" data={{ headline: "...", ... }} />
 * <StructuredData type="breadcrumb" data={{ items: [...] }} />
 */
const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getOrganizationSchema = (props?: OrganizationSchemaProps) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": props?.name || "SoulSeed",
    "url": props?.url || "https://soulseedbaby.com",
    "logo": props?.logo || "https://soulseedbaby.com/logo512.png",
    "description": props?.description || "SoulSeed helps parents discover the perfect baby name with AI-powered suggestions, swipe mode, and 174,000+ names from diverse cultures worldwide.",
    "sameAs": props?.sameAs || [
      "https://facebook.com/soulseedbaby",
      "https://twitter.com/soulseedbaby",
      "https://instagram.com/soulseedbaby"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": props?.contactEmail || "888soulseed888@gmail.com",
      "contactType": "Customer Support"
    }
  });

  const getWebSiteSchema = (props?: WebSiteSchemaProps) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": props?.name || "SoulSeed",
    "url": props?.url || "https://soulseedbaby.com",
    "description": props?.description || "Discover meaningful baby names with AI-powered suggestions. Search through 174,000+ names from diverse cultures.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://soulseedbaby.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  });

  const getWebApplicationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SoulSeed Baby Names",
    "url": "https://soulseedbaby.com",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Find your baby's perfect name with AI-powered suggestions, swipe mode, and cloud sync. Browse 174,000+ names from diverse cultures.",
    "featureList": [
      "AI-powered name suggestions",
      "Tinder-style swipe mode",
      "Cloud sync across devices",
      "174,000+ baby names",
      "Advanced filtering by origin, meaning, popularity",
      "Favorites management"
    ]
  });

  const getArticleSchema = (props: ArticleSchemaProps) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": props.headline,
    "description": props.description,
    "image": props.image,
    "datePublished": props.datePublished,
    "dateModified": props.dateModified || props.datePublished,
    "author": {
      "@type": "Organization",
      "name": props.author || "SoulSeed"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SoulSeed",
      "logo": {
        "@type": "ImageObject",
        "url": "https://soulseedbaby.com/logo512.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": props.url
    }
  });

  const getBreadcrumbSchema = (props: BreadcrumbSchemaProps) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": props.items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  });

  let schema;
  switch (type) {
    case 'organization':
      schema = getOrganizationSchema(data);
      break;
    case 'website':
      schema = getWebSiteSchema(data);
      break;
    case 'webapp':
      schema = getWebApplicationSchema();
      break;
    case 'article':
      schema = getArticleSchema(data);
      break;
    case 'breadcrumb':
      schema = getBreadcrumbSchema(data);
      break;
    default:
      return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
