import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NameCacheProvider } from './contexts/NameCacheContext';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load pages for code splitting (reduces initial bundle size)
const NameListPage = lazy(() => import('./pages/NameListPage'));
const BabyNameListsPage = lazy(() => import('./pages/BabyNameListsPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const DislikesPage = lazy(() => import('./pages/DislikesPage'));
const DebugPage = lazy(() => import('./pages/DebugPage'));
const SwipeModePage = lazy(() => import('./pages/SwipeModePage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

/**
 * Component to manage admin text selection
 * Adds/removes 'admin-mode' class to body element based on admin status
 */
const AdminTextSelectionManager: React.FC = () => {
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-mode');
      console.log('[Admin] Text selection enabled for admin user');
    } else {
      document.body.classList.remove('admin-mode');
    }

    return () => {
      document.body.classList.remove('admin-mode');
    };
  }, [isAdmin]);

  return null;
};

function App() {
  // Use basename only for production (GitHub Pages)
  const basename = process.env.NODE_ENV === 'production' ? '/babyname2' : '/babyname2';

  return (
    <HelmetProvider>
      <ToastProvider>
        <AuthProvider>
          <NameCacheProvider>
            <AdminTextSelectionManager />
            <Router basename={basename}>
              <div className="App min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/babynamelists" element={<BabyNameListsPage />} />
                    <Route path="/names" element={<NameListPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/dislikes" element={<DislikesPage />} />
                    <Route path="/debug" element={<DebugPage />} />
                    <Route path="/swipe" element={<SwipeModePage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/sitemap" element={<SitemapPage />} />
                    <Route path="/blog" element={<BlogListPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </NameCacheProvider>
        </AuthProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;