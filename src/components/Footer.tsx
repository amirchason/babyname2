import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-900 via-pink-900 to-blue-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6" fill="currentColor" />
              <h3 className="text-xl font-bold">SoulSeed</h3>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Where your baby name blooms. Discover 224,000+ unique baby names with meanings and origins.
            </p>
            <a
              href="mailto:888soulseed888@gmail.com"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 text-sm"
            >
              <Mail className="w-4 h-4" />
              888soulseed888@gmail.com
            </a>
          </div>

          {/* Discover Names */}
          <div>
            <h4 className="font-bold text-lg mb-4">Discover Names</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/names" className="text-white/80 hover:text-white transition-colors text-sm">
                  Browse All Names
                </Link>
              </li>
              <li>
                <Link to="/swipe" className="text-white/80 hover:text-white transition-colors text-sm">
                  Swipe Mode
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-white/80 hover:text-white transition-colors text-sm">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-white/80 hover:text-white transition-colors text-sm">
                  Search Names
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-lg mb-4">Features</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/votes" className="text-white/80 hover:text-white transition-colors text-sm">
                  Vote with Partner
                </Link>
              </li>
              <li>
                <Link to="/create-vote" className="text-white/80 hover:text-white transition-colors text-sm">
                  Create Name Vote
                </Link>
              </li>
              <li>
                <Link to="/babynamelists" className="text-white/80 hover:text-white transition-colors text-sm">
                  Baby Name Lists
                </Link>
              </li>
              <li>
                <span className="text-white/60 text-sm">AI Suggestions</span>
              </li>
              <li>
                <span className="text-white/60 text-sm">Cloud Sync</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-white/80 hover:text-white transition-colors text-sm">
                  Sitemap
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/amirchason/babyname2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
                >
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} SoulSeed. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/about" className="text-white/60 hover:text-white text-sm transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-white/60 hover:text-white text-sm transition-colors">
              Contact
            </Link>
            <Link to="/sitemap" className="text-white/60 hover:text-white text-sm transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
