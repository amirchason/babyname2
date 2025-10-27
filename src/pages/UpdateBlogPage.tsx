/**
 * Temporary Admin Page to Update Blog with Fixed Links
 * Navigate to /update-blog to use this
 */

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import SEOHead from '../components/SEO/SEOHead';

export default function UpdateBlogPage() {
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const updateBlog = async () => {
    setUpdating(true);
    setStatus('Updating blog...');

    try {
      // The fixed content with proper Amazon links
      const fixedContent = await fetch('/fixed-blog-content.html').then(r => r.text());

      const blogRef = doc(db, 'blogs', 'postpartum-recovery-essentials');
      await updateDoc(blogRef, {
        content: fixedContent,
        updatedAt: Date.now()
      });

      setStatus('✅ Blog updated successfully! You can now visit the blog to see the fixed links.');
    } catch (error) {
      console.error('Error updating blog:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Update Blog | SoulSeed"
        description="Admin tool for updating blog content."
        canonical="https://soulseedbaby.com/update-blog"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Update Blog with Fixed Links
        </h1>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            <strong>Blog:</strong> New Mom Must-Haves: Postpartum Recovery Essentials
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Issue:</strong> 6 self-referencing links (href="#")
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Fix:</strong> Convert to Amazon search links
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-2">Links to be fixed:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Hospital Recovery Kit → Amazon search</li>
            <li>Cooling Pads → Amazon search</li>
            <li>Nipple Cream → Amazon search</li>
            <li>High-Waisted Leggings → Amazon search</li>
            <li>Meal Delivery Services → Amazon search</li>
            <li>Online Counseling Services → Amazon search</li>
          </ul>
        </div>

        <button
          onClick={updateBlog}
          disabled={updating}
          className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition ${
            updating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg'
          }`}
        >
          {updating ? 'Updating...' : 'Update Blog Now'}
        </button>

        {status && (
          <div className={`mt-4 p-4 rounded ${
            status.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {status}
          </div>
        )}

        {status.startsWith('✅') && (
          <div className="mt-4">
            <a
              href="/blog/postpartum-recovery-essentials"
              className="block text-center py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              View Updated Blog →
            </a>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
