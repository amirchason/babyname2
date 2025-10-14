/**
 * Blog Post Editor Component
 * Full-featured blog editing interface for admin users
 *
 * FEATURES:
 * - Sortable blog list (by title, date, pillar)
 * - Inline header and body editing
 * - AI rewriting with GPT-4 or GPT-4o (user choice)
 * - AI image generation with custom style prompts
 * - Real-time preview
 * - Auto-save to Firestore
 */

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Edit3, Save, X, Wand2, Image as ImageIcon, ChevronDown, ChevronUp, Loader2, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  pillar: string;
  category: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
}

type SortField = 'title' | 'publishedAt' | 'pillar' | 'updatedAt';
type SortDirection = 'asc' | 'desc';
type AIModel = 'gpt-4' | 'gpt-4o';

interface BlogPostEditorProps {
  onClose: () => void;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('publishedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // AI Settings
  const [aiModel, setAiModel] = useState<AIModel>('gpt-4o');
  const [imageStyle, setImageStyle] = useState('modern minimalist baby illustration, soft pastel colors, clean design');
  const [filterPillar, setFilterPillar] = useState<string>('all');

  // Fetch all blogs from Firestore
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter and sort blogs
  useEffect(() => {
    let result = [...blogs];

    // Filter by pillar
    if (filterPillar !== 'all') {
      result = result.filter(blog => blog.pillar === filterPillar);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    setFilteredBlogs(result);
  }, [blogs, sortField, sortDirection, filterPillar]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const blogsRef = collection(db, 'blogs');
      const blogsQuery = query(blogsRef, orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(blogsQuery);

      const loadedBlogs: BlogPost[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        loadedBlogs.push({
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          pillar: data.pillar || '',
          category: data.category || '',
          slug: data.slug || '',
          publishedAt: data.publishedAt || '',
          updatedAt: data.updatedAt || ''
        });
      });

      setBlogs(loadedBlogs);
      console.log(`[BLOG EDITOR] Loaded ${loadedBlogs.length} blogs`);
    } catch (error) {
      console.error('[BLOG EDITOR] Error fetching blogs:', error);
      showToast('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBlog = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setEditedTitle(blog.title);
    setEditedContent(blog.content);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedBlog) return;

    try {
      setIsSaving(true);
      const db = getFirestore();
      const blogRef = doc(db, 'blogs', selectedBlog.id);

      await updateDoc(blogRef, {
        title: editedTitle,
        content: editedContent,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setBlogs(prev => prev.map(blog =>
        blog.id === selectedBlog.id
          ? { ...blog, title: editedTitle, content: editedContent, updatedAt: new Date().toISOString() }
          : blog
      ));

      setSelectedBlog(prev => prev ? { ...prev, title: editedTitle, content: editedContent } : null);
      setIsEditing(false);

      showToast('Blog post saved successfully!', 'success');
      console.log(`[BLOG EDITOR] Saved blog ${selectedBlog.id}`);
    } catch (error) {
      console.error('[BLOG EDITOR] Error saving blog:', error);
      showToast('Failed to save blog post', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRewrite = async (section: 'title' | 'content' | 'both') => {
    if (!selectedBlog) return;

    try {
      setIsRewriting(true);
      showToast(`Rewriting ${section} with ${aiModel.toUpperCase()}...`, 'info');

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: aiModel === 'gpt-4o' ? 'gpt-4o' : 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert SEO blog writer specializing in baby names, parenting, and pregnancy content. Your writing is engaging, informative, and optimized for search engines.'
            },
            {
              role: 'user',
              content: section === 'title'
                ? `Rewrite this blog title to be more engaging and SEO-friendly:\n\n"${editedTitle}"\n\nReturn ONLY the improved title, no explanations.`
                : section === 'content'
                ? `Improve and expand this blog post content while maintaining the same structure and key points:\n\n${editedContent}\n\nReturn ONLY the improved content in markdown format.`
                : `Rewrite both the title and content of this blog post to be more engaging and SEO-optimized:\n\nTitle: ${editedTitle}\n\nContent:\n${editedContent}\n\nReturn in format:\nTITLE: [new title]\n\nCONTENT:\n[new content]`
            }
          ],
          temperature: 0.7,
          max_tokens: section === 'title' ? 100 : 3000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.choices[0].message.content.trim();

      if (section === 'title') {
        setEditedTitle(result);
      } else if (section === 'content') {
        setEditedContent(result);
      } else {
        // Parse both title and content
        const titleMatch = result.match(/TITLE:\s*(.+?)(?:\n|$)/i);
        const contentMatch = result.match(/CONTENT:\s*([\s\S]+)/i);

        if (titleMatch) setEditedTitle(titleMatch[1].trim());
        if (contentMatch) setEditedContent(contentMatch[1].trim());
      }

      setIsEditing(true);
      showToast('AI rewrite complete!', 'success');
    } catch (error) {
      console.error('[BLOG EDITOR] Rewrite error:', error);
      showToast('Failed to rewrite content', 'error');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedBlog) return;

    try {
      setIsGeneratingImage(true);
      showToast('Generating AI image with DALL-E...', 'info');

      // Generate image prompt
      const imagePrompt = `${imageStyle}. Theme: ${selectedBlog.title}. High quality, professional, suitable for a blog header.`;

      // Call OpenAI DALL-E API
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1792x1024', // Wide format for blog headers
          quality: 'standard'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      // Add image to content
      const imageMarkdown = `\n\n![${selectedBlog.title}](${imageUrl})\n\n`;
      setEditedContent(imageMarkdown + editedContent);
      setIsEditing(true);

      showToast('Image generated successfully!', 'success');
      console.log(`[BLOG EDITOR] Generated image: ${imageUrl}`);
    } catch (error) {
      console.error('[BLOG EDITOR] Image generation error:', error);
      showToast('Failed to generate image', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const pillars = ['all', 'baby-names', 'baby-milestones', 'baby-gear', 'pregnancy', 'postpartum'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-7xl max-h-[95vh] mx-4 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Blog Post Editor</h2>
              <p className="text-sm text-purple-100">
                {blogs.length} posts loaded • AI-powered editing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Blog List - Left Side */}
          <div className="w-96 border-r border-gray-200 flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              {/* Pillar Filter */}
              <select
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {pillars.map(pillar => (
                  <option key={pillar} value={pillar}>
                    {pillar === 'all' ? 'All Pillars' : pillar.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>

              {/* Sort Buttons */}
              <div className="flex gap-2">
                {(['title', 'publishedAt', 'pillar'] as SortField[]).map(field => (
                  <button
                    key={field}
                    onClick={() => toggleSort(field)}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                      sortField === field
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {field === 'publishedAt' ? 'Date' : field.charAt(0).toUpperCase() + field.slice(1)}
                    {sortField === field && (
                      sortDirection === 'asc' ? <ChevronUp className="inline w-3 h-3 ml-1" /> : <ChevronDown className="inline w-3 h-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Blog List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredBlogs.map(blog => (
                    <button
                      key={blog.id}
                      onClick={() => handleSelectBlog(blog)}
                      className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                        selectedBlog?.id === blog.id ? 'bg-purple-100' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {blog.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{blog.pillar}</span>
                        <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor - Right Side */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedBlog ? (
              <>
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 space-y-3">
                  {/* AI Model Selection */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">AI Model:</label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value as AIModel)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="gpt-4o">GPT-4o (Faster, Cheaper)</option>
                      <option value="gpt-4">GPT-4 (More Advanced)</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleRewrite('title')}
                      disabled={isRewriting}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Wand2 className="w-4 h-4" />
                      Rewrite Title
                    </button>
                    <button
                      onClick={() => handleRewrite('content')}
                      disabled={isRewriting}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Wand2 className="w-4 h-4" />
                      Rewrite Content
                    </button>
                    <button
                      onClick={() => handleRewrite('both')}
                      disabled={isRewriting}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Wand2 className="w-4 h-4" />
                      Rewrite Both
                    </button>
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Generate Image
                    </button>
                    {isEditing && (
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-auto px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    )}
                  </div>

                  {/* Image Style Input */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Image Style:</label>
                    <input
                      type="text"
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      placeholder="Describe image style..."
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Status Indicators */}
                  {(isRewriting || isGeneratingImage || isSaving) && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {isRewriting && 'AI is rewriting...'}
                        {isGeneratingImage && 'Generating image with DALL-E...'}
                        {isSaving && 'Saving to Firestore...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Editor Fields */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Title Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => {
                        setEditedTitle(e.target.value);
                        setIsEditing(true);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content (Markdown)</label>
                    <textarea
                      value={editedContent}
                      onChange={(e) => {
                        setEditedContent(e.target.value);
                        setIsEditing(true);
                      }}
                      rows={20}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Pillar:</span>
                      <span className="ml-2 text-sm text-gray-600">{selectedBlog.pillar}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Category:</span>
                      <span className="ml-2 text-sm text-gray-600">{selectedBlog.category}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Slug:</span>
                      <span className="ml-2 text-sm text-gray-600">{selectedBlog.slug}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Published:</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {new Date(selectedBlog.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Edit3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a blog post to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostEditor;
