import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
const NameRingTestPage = lazy(() => import('./pages/NameRingTestPage'));

// Legal & Compliance Pages (Google Requirements)
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage'));

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
 * Layout wrapper that conditionally shows header/footer
 * Full-page squeeze experience ONLY for voting pages (viewing/participating in votes)
 * Keep header/footer for vote CREATION for easy navigation back
 */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // Hide header & footer ONLY on voting pages (squeeze page for voters)
  // Keep header/footer on create-vote page for easy navigation
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

      {/* Conditional Header */}
      {!isFullPageExperience && <AppHeader title="SoulSeed" />}

      <Suspense fallback={<LoadingSpinner />}>
        {/* Main content - add padding-top only when header is shown */}
        <main id="main-content" className={`flex-grow ${!isFullPageExperience ? 'pt-20' : ''}`}>
          {children}
        </main>

        {/* Conditional Footer */}
        {!isFullPageExperience && <Footer />}
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
        <AuthProvider>
          <NameCacheProvider>
            <AdminTextSelectionManager />
            <Router basename={basename}>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
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
                </Routes>
              </AppLayout>
            </Router>
          </NameCacheProvider>
        </AuthProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;