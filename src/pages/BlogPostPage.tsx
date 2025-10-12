/**
 * Blog Post Page
 * Displays a single blog post
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BlogPost } from '../types/blog';
import { Clock, Calendar, Tag, User, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-lg text-gray-600">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">Sorry, we couldn't find that blog post.</p>
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{post.seo.metaTitle} | SoulSeed Blog</title>
        <meta name="description" content={post.seo.metaDescription} />
        <meta name="keywords" content={post.seo.keywords.join(', ')} />

        {/* Open Graph */}
        <meta property="og:title" content={post.seo.metaTitle} />
        <meta property="og:description" content={post.seo.metaDescription} />
        <meta property="og:type" content="article" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo.metaTitle} />
        <meta name="twitter:description" content={post.seo.metaDescription} />

        {/* JSON-LD Schema */}
        {post.seo.schema && (
          <script type="application/ld+json">
            {JSON.stringify(post.seo.schema)}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
        <article className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            {/* Category */}
            <div className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
              {post.category}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {post.stats.readingTime} min read
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                {post.author.name}, {post.author.credentials}
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    <Tag size={14} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Bio */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-l-4 border-purple-600">
              <p className="text-sm text-gray-700">
                <strong>{post.author.name}</strong> — {post.author.bio}
              </p>
            </div>
          </header>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none bg-white rounded-lg shadow-md p-8 md:p-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              // Custom prose styles for baby name blog
              '--tw-prose-headings': '#1f2937',
              '--tw-prose-links': '#9333ea',
              '--tw-prose-bold': '#1f2937',
              '--tw-prose-quotes': '#4b5563',
            } as React.CSSProperties}
          />

          {/* Share & Navigation */}
          <footer className="mt-12 border-t pt-8">
            <div className="flex justify-between items-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                <ArrowLeft size={20} />
                More Articles
              </Link>

              <Link
                to="/"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Explore Names →
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}
