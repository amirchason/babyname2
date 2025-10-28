import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, Heart, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Page Not Found | SoulSeed"
        description="The page you're looking for doesn't exist. Browse 150,000+ baby names, explore curated lists, or use our AI-powered search."
        canonical="https://www.soulseedbaby.com/404"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Error Code */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              404
            </h1>
            <p className="text-2xl font-light text-gray-700 mt-4">
              Oops! This page doesn't exist
            </p>
          </div>

          {/* Friendly Message */}
          <p className="text-lg text-gray-600 mb-12 max-w-md mx-auto">
            The page you're looking for might have been moved or doesn't exist.
            Let's help you find the perfect baby name instead!
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Go Home</span>
            </button>

            <button
              onClick={() => navigate('/names')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 hover:scale-105"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Browse Names</span>
            </button>
          </div>

          {/* Additional Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <button
              onClick={() => navigate('/favorites')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>View Favorites</span>
            </button>
            <button
              onClick={() => navigate('/babynamelists')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Curated Lists</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Popular Features */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Popular Features
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/swipe')}
                className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                Swipe Mode
              </button>
              <button
                onClick={() => navigate('/blog')}
                className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium"
              >
                Baby Name Blog
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                About SoulSeed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Page Not Found - 404 Error",
          "description": "The requested page could not be found. Explore SoulSeed's baby name database with 150,000+ names instead.",
          "url": "https://www.soulseedbaby.com/404",
          "isPartOf": {
            "@type": "WebApplication",
            "name": "SoulSeed Baby Names",
            "url": "https://www.soulseedbaby.com"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.soulseedbaby.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "404 Not Found"
              }
            ]
          }
        })}
      </script>
    </>
  );
};

export default NotFoundPage;
