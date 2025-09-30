import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import HomePage from './pages/HomePage';
import NameListPage from './pages/NameListPage';
import FavoritesPage from './pages/FavoritesPage';
import DislikesPage from './pages/DislikesPage';
import './App.css';

function App() {
  // Use basename only for production (GitHub Pages)
  const basename = process.env.NODE_ENV === 'production' ? '/babyname2' : '/babyname2';

  return (
    <ToastProvider>
      <AuthProvider>
        <Router basename={basename}>
          <div className="App min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/names" element={<NameListPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/dislikes" element={<DislikesPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;