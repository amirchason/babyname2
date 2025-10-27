import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, List, Heart, ThumbsDown, Bug, Shuffle, Map, ArrowLeft, ExternalLink } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import SEOHead from '../components/SEO/SEOHead';

interface PageLink {
  path: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

/**
 * Sitemap Index Page
 * Shows all available pages in the application with live links
 * Admin-accessible navigation hub
 */
const SitemapPage: React.FC = () => {
  const navigate = useNavigate();

  const pages: PageLink[] = [
    {
      path: '/',
      title: 'Home',
      description: 'Main landing page with name search, filters, and popular names grid',
      icon: <Home className="w-5 h-5" />,
      badge: 'Main'
    },
    {
      path: '/names',
      title: 'Name List',
      description: 'Full browsable list of all names with advanced filtering and sorting',
      icon: <List className="w-5 h-5" />
    },
    {
      path: '/swipe',
      title: 'Swipe Mode',
      description: 'Tinder-style swipe interface for discovering names',
      icon: <Shuffle className="w-5 h-5" />,
      badge: 'Interactive'
    },
    {
      path: '/favorites',
      title: 'Favorites',
      description: 'Your liked names with pinning and export functionality',
      icon: <Heart className="w-5 h-5" />
    },
    {
      path: '/dislikes',
      title: 'Dislikes',
      description: 'Names you\'ve passed on with restore functionality',
      icon: <ThumbsDown className="w-5 h-5" />
    },
    {
      path: '/debug',
      title: 'Debug',
      description: 'Developer tools and system diagnostics',
      icon: <Bug className="w-5 h-5" />,
      badge: 'Dev'
    }
  ];

  return (
    <>
      <SEOHead
        title="Sitemap | SoulSeed Baby Names"
        description="Complete sitemap of SoulSeed baby name resources, including name lists, blog articles, and tools to help you choose the perfect name."
        canonical="https://soulseedbaby.com/sitemap"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* AppHeader */}
      <AppHeader title="SoulSeed" showBackButton={true} />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
            <Map className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Site Map
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Navigate to any page in the SoulSeed baby name app. All pages are listed below with descriptions.
          </p>
        </div>

        {/* Page Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {pages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl border-2 border-gray-100 hover:border-purple-300 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all duration-200">
                  {page.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {page.title}
                    </h3>
                    {page.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                        {page.badge}
                      </span>
                    )}
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors ml-auto" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {page.description}
                  </p>
                  <div className="mt-2 text-xs text-purple-600 font-mono bg-purple-50 px-2 py-1 rounded inline-block">
                    {page.path}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Application Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{pages.length}</div>
              <div className="text-xs text-gray-600">Total Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">150k+</div>
              <div className="text-xs text-gray-600">Names</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-xs text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">React 19</div>
              <div className="text-xs text-gray-600">Framework</div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-sm font-semibold text-purple-900 mb-2">ℹ️ Navigation Tips</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Click any card above to navigate to that page</li>
            <li>• Use the back button in the header to return to the previous page</li>
            <li>• All pages are fully responsive and mobile-friendly</li>
            <li>• Your favorites and dislikes sync across devices when logged in</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg border border-gray-200 hover:border-purple-300 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Previous Page
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default SitemapPage;
