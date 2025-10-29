import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NameCacheProvider } from './contexts/NameCacheContext';
import { LoadingProvider } from './contexts/LoadingContext';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/LoadingSpinner';
import LoadingAnimation from './components/LoadingAnimation';
import Footer from './components/Footer';
import AppHeader from './components/AppHeader';
import DebugOverlay from './components/DebugOverlay';
import './App.css';

// Lazy load pages for code splitting (reduces initial bundle size)
const BabyNameListsPage = lazy(() => import('./pages/BabyNameListsPage'));
const NameListPage = lazy(() => import('./pages/NameListPage'));
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
const NameRingTestPage = lazy(() => import('./pages/NameRingTestPage'));

// Legal & Compliance Pages (Google Requirements)
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

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

/**
 * Header Visibility Controller - Uses CSS to hide header on voting pages
 * This component NEVER re-renders, ensuring logo animation persistence
 */
const HeaderVisibilityController: React.FC = () => {
  const location = useLocation();
  const isVotingPage = location.pathname.startsWith('/vote/');

  // Update CSS class on document to control header visibility
  React.useEffect(() => {
    if (isVotingPage) {
      document.body.classList.add('hide-header-footer');
    } else {
      document.body.classList.remove('hide-header-footer');
    }
  }, [isVotingPage]);

  return null; // This component renders nothing
};

/**
 * Query Parameter Navigator - Handles ?goto=route redirects
 * Used to preserve navigation when static files redirect to root
 */
const QueryParamNavigator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const gotoParam = searchParams.get('goto');
    if (gotoParam && location.pathname === '/') {
      // Navigate to the requested route
      navigate(`/${gotoParam}`, { replace: true });
    }
  }, [searchParams, navigate, location]);

  return null;
};

/**
 * Layout wrapper for main content
 * Simplified - no longer handles header/footer rendering
 */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isFullPageExperience = location.pathname.startsWith('/vote/');

  return (
    <div className="App min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      {/* WCAG Accessibility: Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        style={{ position: 'absolute', left: '-9999px' }}
        onFocus={(e) => {
          e.currentTarget.style.position = 'static';
          e.currentTarget.style.left = '0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.position = 'absolute';
          e.currentTarget.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>

      <Suspense fallback={<LoadingAnimation fullScreen message="Loading page..." />}>
        {/* Main content - add padding-top only when header is shown */}
        <main id="main-content" className={`flex-grow ${!isFullPageExperience ? 'pt-20' : ''}`}>
          {children}
        </main>
      </Suspense>
    </div>
  );
};

function App() {
  // Vercel deployment - use root path (no basename needed)
  const basename = '/';

  return (
    <HelmetProvider>
      <ToastProvider>
        <LoadingProvider>
          <AuthProvider>
            <NameCacheProvider>
              <AdminTextSelectionManager />
              <Router basename={basename}>
                {/* Visibility controller - manages CSS classes, renders nothing */}
                <HeaderVisibilityController />

                {/* Query param navigator - handles ?goto= redirects from static files */}
                <QueryParamNavigator />

                {/* Static Header - NEVER re-renders, stays mounted across all navigation */}
                <AppHeader title="SoulSeed" />

                <AppLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/names" element={<NameListPage />} />
                    <Route path="/babynamelists" element={<BabyNameListsPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/dislikes" element={<DislikesPage />} />
                    <Route path="/debug" element={<DebugPage />} />
                    <Route path="/name-ring-test" element={<NameRingTestPage />} />
                    <Route path="/swipe" element={<SwipeModePage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/sitemap" element={<SitemapPage />} />

                    {/* Legal & Compliance Pages (Google Requirements) */}
                    <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                    <Route path="/accessibility" element={<AccessibilityPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    {/* Legacy routes (keep for backwards compatibility) */}
                    <Route path="/about-us" element={<AboutUsPage />} />
                    <Route path="/contact-us" element={<ContactUsPage />} />

                    <Route path="/blog" element={<BlogListPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/update-blog" element={<UpdateBlogPage />} />
                    <Route path="/votes" element={<VotesListPage />} />
                    <Route path="/create-vote" element={<CreateVotePage />} />
                    <Route path="/vote/:voteId" element={<VotingPage />} />

                    {/* 404 Catch-All Route - Must be last */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AppLayout>

                {/* Static Footer - NEVER re-renders, stays mounted across all navigation */}
                <Footer />
              </Router>
            </NameCacheProvider>
          </AuthProvider>
        </LoadingProvider>

        {/* Debug Overlay - Shows console logs on screen for mobile debugging */}
        <DebugOverlay />
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;