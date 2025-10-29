/**
 * Blog Category Page
 * SEO-optimized landing pages for each blog category/pillar
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BlogPost } from '../types/blog';
import { Clock, Calendar } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import SEOHead from '../components/SEO/SEOHead';

// Category configuration for SEO metadata
const categoryConfig: Record<string, {
  title: string;
  description: string;
  h1: string;
  intro: string;
}> = {
  'baby-names': {
    title: 'Baby Name Ideas & Meanings | Expert Name Guide | SoulSeed',
    description: 'Discover unique baby names with meanings, origins, and trends. Expert guides on popular, rare, and culturally rich names for your baby.',
    h1: 'Baby Names Blog',
    intro: 'Explore the world of baby names with expert guides on meanings, origins, trends, and inspiration for finding the perfect name for your little one.',
  },
  'baby-milestones': {
    title: 'Baby Milestones Guide | Development Tracking | SoulSeed',
    description: 'Expert guide to baby milestones from newborn to toddler. Track development, understand growth stages, and celebrate your baby\'s achievements.',
    h1: 'Baby Milestones',
    intro: 'Track your baby\'s development with our comprehensive milestone guides. From first smiles to first steps, celebrate every achievement.',
  },
  'baby-gear': {
    title: 'Baby Gear Reviews & Guides | Best Products | SoulSeed',
    description: 'Honest reviews and buying guides for baby gear, nursery essentials, and parenting products. Find the best items for your baby.',
    h1: 'Baby Gear & Product Reviews',
    intro: 'Find the best baby products with our honest reviews and comprehensive buying guides. From strollers to nursery essentials.',
  },
  'pregnancy': {
    title: 'Pregnancy Tips & Guides | Week-by-Week | SoulSeed',
    description: 'Complete pregnancy guide with week-by-week updates, health tips, preparation advice, and support for expecting mothers.',
    h1: 'Pregnancy Guide',
    intro: 'Navigate your pregnancy journey with expert advice, week-by-week guides, health tips, and preparation resources for expecting mothers.',
  },
  'postpartum': {
    title: 'Postpartum Recovery Guide | New Mom Support | SoulSeed',
    description: 'Postpartum recovery tips, mental health support, and practical advice for new mothers. Navigate the fourth trimester with confidence.',
    h1: 'Postpartum & New Mom Support',
    intro: 'Support for your postpartum journey. Recovery tips, mental health resources, and practical advice for navigating life with a newborn.',
  },
  'personal-blogs': {
    title: 'Personal Parenting Stories | Real Mom & Dad Blogs | SoulSeed',
    description: 'Authentic parenting stories and personal experiences from real moms and dads. Find comfort and connection in shared experiences.',
    h1: 'Personal Parenting Blogs',
    intro: 'Read authentic stories from real parents. Personal experiences, lessons learned, and the joys and challenges of parenting.',
  },
};

export default function BlogCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Validate category
  const validCategories = Object.keys(categoryConfig);
  if (!category || !validCategories.includes(category)) {
    return <Navigate to="/blog" replace />;
  }

  const config = categoryConfig[category];

  useEffect(() => {
    fetchCategoryPosts();
  }, [category]);

  // Map category slug to database category names
  const getCategoryFilter = (slug: string): string[] => {
    const map: Record<string, string[]> = {
      'baby-names': ['baby-names', 'Baby Names', 'Names'],
      'baby-milestones': ['baby-milestones', 'Baby Milestones', 'Milestones'],
      'baby-gear': ['baby-gear', 'Baby Gear', 'Gear'],
      'pregnancy': ['pregnancy', 'Pregnancy'],
      'postpartum': ['postpartum', 'Postpartum'],
      'personal-blogs': ['personal-blogs', 'Personal Blogs', 'Personal', 'Dad Blog'],
    };
    return map[slug] || [slug];
  };

  const fetchCategoryPosts = async () => {
    try {
      setLoading(true);

      // Get all published posts and filter client-side
      // (Firestore doesn't support OR queries easily)
      const q = query(
        collection(db, 'blogs'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const categoryFilters = getCategoryFilter(category!);

      const blogPosts = snapshot.docs
        .map((doc) => doc.data() as BlogPost)
        .filter((post) => {
          const postCategory = post.category.toLowerCase();
          return categoryFilters.some(filter =>
            postCategory.includes(filter.toLowerCase())
          );
        });

      setPosts(blogPosts);
    } catch (error) {
      console.error('Error fetching category posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-lg text-gray-600">Loading {config.h1}...</div>
      </div>
    );
  }

  // Generate breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://soulseedbaby.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://soulseedbaby.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": config.h1,
        "item": `https://soulseedbaby.com/blog/${category}`
      }
    ]
  };

  // Generate collection page structured data
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": config.h1,
    "description": config.description,
    "url": `https://soulseedbaby.com/blog/${category}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.slice(0, 20).map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://soulseedbaby.com/blog/${post.slug}`,
        "name": post.title,
        "description": post.excerpt
      }))
    }
  };

  return (
    <>
      <SEOHead
        title={config.title}
        description={config.description}
        canonical={`https://soulseedbaby.com/blog/${category}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <AppHeader showBackButton={true} />

        <div className="py-6 sm:py-12 px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb Navigation */}
            <nav className="mb-4 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-gray-600">
                <li><Link to="/" className="hover:text-purple-600">Home</Link></li>
                <li>/</li>
                <li><Link to="/blog" className="hover:text-purple-600">Blog</Link></li>
                <li>/</li>
                <li className="text-gray-800 font-medium">{config.h1}</li>
              </ol>
            </nav>

            {/* Category Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
                {config.h1}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                {config.intro}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                {posts.length} {posts.length === 1 ? 'article' : 'articles'}
              </div>
            </div>

            {/* Blog Posts Grid */}
            {posts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-600 text-base sm:text-lg px-4">
                  No articles in this category yet. Check back soon!
                </p>
                <Link
                  to="/blog"
                  className="mt-4 inline-block text-purple-600 hover:underline"
                >
                  ← View all blog posts
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                  >
                    {post.featured && (
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1">
                        ⭐ Featured
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {/* Category Badge */}
                      <div className="text-[10px] sm:text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                        {post.category}
                      </div>

                      {/* Title */}
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 group-hover:text-purple-600 transition line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="inline sm:hidden">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                          {post.stats?.readingTime || 5} min
                        </div>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                      <span className="text-purple-600 font-medium text-xs sm:text-sm group-hover:underline">
                        Read More →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Back to All Posts */}
            <div className="text-center mt-8 sm:mt-12 px-4">
              <Link
                to="/blog"
                className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:shadow-lg transition"
              >
                ← View All Blog Posts
              </Link>
            </div>
          </div>
        </div>

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(collectionSchema)}
        </script>
      </div>
    </>
  );
}
