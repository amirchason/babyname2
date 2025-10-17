import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NameCacheProvider } from './contexts/NameCacheContext';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import AppHeader from './components/AppHeader';
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
const UpdateBlogPage = lazy(() => import('./pages/UpdateBlogPage'));
const VotingPage = lazy(() => import('./pages/VotingPage'));
const VotesListPage = lazy(() => import('./pages/VotesListPage'));
const CreateVotePage = lazy(() => import('./pages/CreateVotePage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));

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
  // Vercel deployment - use root path (no basename needed)
  const basename = '/';

  return (
    <HelmetProvider>
      <ToastProvider>
        <AuthProvider>
          <NameCacheProvider>
            <AdminTextSelectionManager />
            <Router basename={basename}>
              <div className="App min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
                {/* Global Sticky Header on ALL pages */}
                <AppHeader title="SoulSeed" />

                <Suspense fallback={<LoadingSpinner />}>
                  {/* Main content with padding-top for sticky header (80px) */}
                  <div className="flex-grow pt-20">
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
                      <Route path="/about" element={<AboutUsPage />} />
                      <Route path="/contact" element={<ContactUsPage />} />
                      <Route path="/blog" element={<BlogListPage />} />
                      <Route path="/blog/:slug" element={<BlogPostPage />} />
                      <Route path="/update-blog" element={<UpdateBlogPage />} />
                      <Route path="/votes" element={<VotesListPage />} />
                      <Route path="/create-vote" element={<CreateVotePage />} />
                      <Route path="/vote/:voteId" element={<VotingPage />} />
                    </Routes>
                  </div>
                  <Footer />
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