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

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(
        collection(db, 'blogs'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const blogPosts = snapshot.docs.map((doc) => doc.data() as BlogPost);
      setPosts(blogPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-lg text-gray-600">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            SoulSeed Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert insights on baby names, naming traditions, and the art of choosing the perfect name
          </p>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
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

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <div className="p-6">
                  {/* Category */}
                  <div className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                    {post.category}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.stats.readingTime} min read
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Read More */}
                <div className="px-6 pb-4">
                  <span className="text-purple-600 font-medium text-sm group-hover:underline">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            ← Back to Name Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}
