import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, ExternalLink, Shield, FileText, Cookie, Accessibility } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-900 via-pink-900 to-blue-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6" fill="currentColor" />
              <h3 className="text-xl font-bold">SoulSeed</h3>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Where your baby name blooms 🌱
            </p>
            <p className="text-white/60 text-xs mb-4">
              174,000+ names • AI-powered • Free forever
            </p>
            <a
              href="mailto:888soulseed888@gmail.com"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 text-sm"
            >
              <Mail className="w-4 h-4" />
              888soulseed888@gmail.com
            </a>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-lg mb-4">Product</h4>
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
                <Link to="/swipe-mode" className="text-white/80 hover:text-white transition-colors text-sm">
                  Swipe Mode
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-white/80 hover:text-white transition-colors text-sm">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - PROMINENT */}
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms-of-service" className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
                  <Cookie className="w-3 h-3" />
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
                  <Accessibility className="w-3 h-3" />
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-white/80 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:888soulseed888@gmail.com" className="text-white/80 hover:text-white transition-colors text-sm">
                  Email Support
                </a>
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
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <p className="text-white/60 text-sm mb-2">
                © {new Date().getFullYear()} SoulSeed. All rights reserved.
              </p>
              <p className="text-white/40 text-xs">
                C. Miguel Delibes, 2 • 39340 Suances, Cantabria, Spain
              </p>
            </div>
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
      </div>
    </footer>
  );
};

export default Footer;
