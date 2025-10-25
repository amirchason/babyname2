import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Database, Sparkles, Cloud, ArrowLeft } from 'lucide-react';
import StructuredData from '../components/StructuredData';

const AboutPage: React.FC = () => {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="webapp" />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">About SoulSeed</h1>
              <p className="text-gray-600 mt-1">Where your baby name blooms 🌱</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Finding the Perfect Name</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choosing a baby name is one of the most meaningful decisions you'll make as a parent. We're here to make that journey joyful and inspiring.
            </p>
          </div>

          {/* Our Story */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p className="mb-4">
                SoulSeed was born from a simple idea: finding a baby name should be as exciting and easy as discovering your favorite song. Traditional baby name books and websites can feel overwhelming with endless lists and confusing filters.
              </p>
              <p className="mb-4">
                We created SoulSeed to bring joy back to name discovery with our unique Tinder-style swipe interface, AI-powered suggestions, and beautiful, intuitive design. Whether you're just starting to explore or narrowing down your final choices, we're here to help your perfect name bloom.
              </p>
            </div>
          </section>

          {/* Features Grid */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">What Makes Us Unique</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <Database className="w-10 h-10 text-purple-600 mb-3" />
                <h4 className="font-bold text-lg text-gray-900 mb-2">174,000+ Names</h4>
                <p className="text-gray-600 text-sm">
                  The most comprehensive baby name database with names from cultures around the world, complete with meanings, origins, and pronunciations.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <Sparkles className="w-10 h-10 text-blue-600 mb-3" />
                <h4 className="font-bold text-lg text-gray-900 mb-2">AI-Powered</h4>
                <p className="text-gray-600 text-sm">
                  Smart suggestions based on your preferences, enriched with historical figures, cultural significance, and similar name recommendations.
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
                <Heart className="w-10 h-10 text-pink-600 mb-3" />
                <h4 className="font-bold text-lg text-gray-900 mb-2">Swipe to Discover</h4>
                <p className="text-gray-600 text-sm">
                  Our unique Tinder-style interface makes exploring names fun and intuitive. Swipe right to love, left to pass. Find favorites in minutes!
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                <Cloud className="w-10 h-10 text-indigo-600 mb-3" />
                <h4 className="font-bold text-lg text-gray-900 mb-2">Cloud Sync</h4>
                <p className="text-gray-600 text-sm">
                  Save your favorites and access them from any device. Your name journey is always with you, whether you're on mobile or desktop.
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">By the Numbers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-purple-600 mb-1">174k+</p>
                  <p className="text-sm text-gray-600">Names in Database</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-pink-600 mb-1">100+</p>
                  <p className="text-sm text-gray-600">Cultures Represented</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600 mb-1">Free</p>
                  <p className="text-sm text-gray-600">Always & Forever</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-indigo-600 mb-1">✨</p>
                  <p className="text-sm text-gray-600">AI-Enhanced</p>
                </div>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Built with Care</h3>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p>
                SoulSeed is built with modern web technologies to ensure a fast, secure, and delightful experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>React 19</strong> for a responsive, lightning-fast interface</li>
                <li><strong>Firebase</strong> for secure cloud sync and authentication</li>
                <li><strong>OpenAI & Google Gemini</strong> for intelligent name enrichment</li>
                <li><strong>Vercel</strong> for global edge hosting and instant load times</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Find Your Perfect Name?</h3>
              <p className="mb-6 text-purple-100">
                Join thousands of parents discovering their baby's name with SoulSeed
              </p>
              <Link 
                to="/" 
                className="inline-block bg-white text-purple-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Start Exploring Names
              </Link>
            </div>
          </section>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Made with ❤️ for expecting parents everywhere
            </p>
            <p className="text-sm text-gray-600 mt-4">
              <Link to="/contact" className="text-purple-600 hover:text-purple-700 underline">Contact Us</Link>
              <span className="mx-2">•</span>
              <Link to="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">Privacy</Link>
              <span className="mx-2">•</span>
              <Link to="/terms-of-service" className="text-purple-600 hover:text-purple-700 underline">Terms</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AboutPage;
