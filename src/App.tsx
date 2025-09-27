import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <Router basename="/babyname2">
      <div className="App min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;