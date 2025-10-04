import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load pages for code splitting (reduces initial bundle size)
const NameListPage = lazy(() => import('./pages/NameListPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const DislikesPage = lazy(() => import('./pages/DislikesPage'));
const DebugPage = lazy(() => import('./pages/DebugPage'));
const SwipeModePage = lazy(() => import('./pages/SwipeModePage'));

function App() {
  // Use basename only for production (GitHub Pages)
  const basename = process.env.NODE_ENV === 'production' ? '/babyname2' : '/babyname2';

  return (
    <ToastProvider>
      <AuthProvider>
        <Router basename={basename}>
          <div className="App min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/names" element={<NameListPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/dislikes" element={<DislikesPage />} />
                <Route path="/debug" element={<DebugPage />} />
                <Route path="/swipe" element={<SwipeModePage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;