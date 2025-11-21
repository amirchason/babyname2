/**
 * Featured Blogs Component
 * Displays 3 random blog posts with stunning animations and design
 * Automatically randomizes on each page load
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BlogPost } from '../types/blog';

const FeaturedBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomBlogs();
  }, []);

  const fetchRandomBlogs = async () => {
    try {
      // Fetch all published blogs
      const q = query(
        collection(db, 'blogs'),
        where('status', '==', 'published')
      );

      const snapshot = await getDocs(q);
      const allBlogs = snapshot.docs.map((doc) => doc.data() as BlogPost);

      // Shuffle and take 3 random blogs
      const shuffled = [...allBlogs].sort(() => Math.random() - 0.5);
      setBlogs(shuffled.slice(0, 3));
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get gradient based on category
  const getCategoryGradient = (category: string): string => {
    const normalized = category.toLowerCase();
    if (normalized.includes('name')) return 'from-purple-500 via-pink-500 to-purple-600';
    if (normalized.includes('pregnan')) return 'from-pink-500 via-rose-500 to-pink-600';
    if (normalized.includes('milestone')) return 'from-blue-500 via-cyan-500 to-blue-600';
    if (normalized.includes('gear')) return 'from-green-500 via-emerald-500 to-green-600';
    if (normalized.includes('postpartum')) return 'from-violet-500 via-purple-500 to-violet-600';
    return 'from-indigo-500 via-blue-500 to-indigo-600';
  };

  // Get category icon color
  const getCategoryColor = (category: string): string => {
    const normalized = category.toLowerCase();
    if (normalized.includes('name')) return 'text-purple-600 bg-purple-100';
    if (normalized.includes('pregnan')) return 'text-pink-600 bg-pink-100';
    if (normalized.includes('milestone')) return 'text-blue-600 bg-blue-100';
    if (normalized.includes('gear')) return 'text-green-600 bg-green-100';
    if (normalized.includes('postpartum')) return 'text-violet-600 bg-violet-100';
    return 'text-indigo-600 bg-indigo-100';
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <section className="py-6 sm:py-16 px-3 sm:px-4 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-32 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
                <div className="p-3 sm:p-6 space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 sm:h-6 bg-gray-300 rounded w-full" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null; // Don't show section if no blogs
  }

  return (
    <section className="py-6 sm:py-16 px-3 sm:px-4 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/30 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - Compact on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-12"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-2 sm:mb-4 shadow-lg">
            <Sparkles className="w-3 sm:w-4 h-3 sm:h-4" />
            <span>From Our Blog</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
            Expert Parenting Insights
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Discover helpful tips, guides, and inspiration for your parenting journey
          </p>
        </motion.div>

        {/* Blog Cards Grid - Compact on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/blog/${blog.slug}`}
                className="group block h-full"
              >
                <div className="relative h-full bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
                  {/* Gradient Header with Category - Compact on Mobile */}
                  <div className={`relative h-32 sm:h-48 bg-gradient-to-br ${getCategoryGradient(blog.category || 'General')} overflow-hidden`}>
                    {/* Animated Gradient Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />

                    {/* Floating Sparkles - Fewer on Mobile */}
                    <div className="absolute inset-0 hidden sm:block">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: `${20 + Math.random() * 60}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </div>
                    {/* Mobile Sparkles - Just 2 */}
                    <div className="absolute inset-0 sm:hidden">
                      {[...Array(2)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          style={{
                            top: `${30 + i * 40}%`,
                            left: `${30 + i * 40}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        />
                      ))}
                    </div>

                    {/* Category Badge - Compact on Mobile */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <div className={`${getCategoryColor(blog.category || 'General')} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-md`}>
                        {blog.category || 'General'}
                      </div>
                    </div>

                    {/* Reading Time - Compact on Mobile */}
                    {blog.stats?.readingTime && (
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                        <div className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-gray-700 shadow-md flex items-center gap-0.5 sm:gap-1">
                          <Clock className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                          {blog.stats.readingTime} min
                        </div>
                      </div>
                    )}

                    {/* Decorative Icon - Smaller on Mobile */}
                    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-20">
                      <BookOpen className="w-10 sm:w-16 h-10 sm:h-16 text-white" />
                    </div>
                  </div>

                  {/* Content - Compact on Mobile */}
                  <div className="p-3 sm:p-6 flex-1 flex flex-col">
                    {/* Title - Smaller on Mobile */}
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {blog.title || 'Untitled Post'}
                    </h3>

                    {/* Excerpt - Smaller on Mobile */}
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
                      {blog.excerpt || 'No preview available...'}
                    </p>

                    {/* Footer - Compact on Mobile */}
                    <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-gray-100">
                      {/* Date - Smaller on Mobile */}
                      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                        <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        <span className="hidden sm:inline">{blog.publishedAt ? formatDate(blog.publishedAt) : 'Recently'}</span>
                        <span className="sm:hidden">{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}</span>
                      </div>

                      {/* Read More Arrow - Smaller on Mobile */}
                      <motion.div
                        className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-semibold text-purple-600"
                        whileHover={{ x: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover Gradient Border Effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getCategoryGradient(blog.category || 'General')} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Blogs Button - Compact on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-4 sm:mt-12"
        >
          <Link to="/blog">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-5 sm:px-8 py-2.5 sm:py-4 rounded-full font-bold text-sm sm:text-lg shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedBlogs;
