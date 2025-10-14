/**
 * Blog List Page
 * Displays all published blog posts
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BlogPost } from '../types/blog';
import { Clock, Calendar, Tag } from 'lucide-react';
import AppHeader from '../components/AppHeader';

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Simplified query - using orderBy only to avoid composite index requirement
      // Filter by status in client-side code below
      const q = query(
        collection(db, 'blogs'),
        orderBy('publishedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const blogPosts = snapshot.docs
        .map((doc) => doc.data() as BlogPost)
        .filter((post) => post.status === 'published'); // Filter published posts client-side
      setPosts(blogPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || [])));

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags && post.tags.includes(selectedTag))
    : posts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-lg text-gray-600">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Sticky Header */}
      <AppHeader showBackButton={true} />

      <div className="py-6 sm:py-12 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
            SoulSeed Blog
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Expert insights on baby names, parenting, and pregnancy
          </p>
        </div>

        {/* Tag Filter - Mobile Optimized */}
        {allTags.length > 0 && (
          <div className="mb-6 sm:mb-8 flex flex-wrap gap-1.5 sm:gap-2 justify-center px-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                selectedTag === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-100'
              }`}
            >
              All Posts
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Blog Posts Grid - Mobile First */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-600 text-base sm:text-lg px-4">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                {/* Featured Badge */}
                {post.featured && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-3 py-1">
                    ⭐ Featured
                  </div>
                )}

                <div className="p-4 sm:p-6">
                  {/* Category */}
                  <div className="text-[10px] sm:text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                    {post.category}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 group-hover:text-purple-600 transition line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">{post.excerpt}</p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">{new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span className="inline sm:hidden">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                      {post.stats?.readingTime || 5} min
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded text-[10px] sm:text-xs"
                        >
                          <Tag size={10} className="sm:w-3 sm:h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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

        {/* Back to Home - Mobile Optimized */}
        <div className="text-center mt-8 sm:mt-12 px-4">
          <Link
            to="/"
            className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:shadow-lg transition"
          >
            ← Back to Name Explorer
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
