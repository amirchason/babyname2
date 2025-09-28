import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import DislikesPage from './pages/DislikesPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router basename="/babyname2">
        <div className="App min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/dislikes" element={<DislikesPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;