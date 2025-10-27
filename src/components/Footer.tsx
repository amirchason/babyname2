import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Shield, FileText, Cookie, Accessibility } from 'lucide-react';

const Footer: React.FC = () => {
  // Scroll to top when footer links are clicked
  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-r from-purple-900 via-pink-900 to-blue-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-5 h-5" fill="currentColor" />
              <h3 className="text-lg font-bold">SoulSeed</h3>
            </div>
            <p className="text-white/80 text-sm mb-1">
              Where your baby name blooms 🌱
            </p>
            <p className="text-white/60 text-xs mb-1">
              174,000+ names • AI-powered
            </p>
            <a
              href="mailto:888soulseed888@gmail.com"
              className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 text-xs break-all"
            >
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="hidden sm:inline">888soulseed888@gmail.com</span>
              <span className="sm:hidden">Email</span>
            </a>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-sm mb-1">Product</h4>
            <ul className="space-y-0.5">
              <li>
                <Link to="/" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/names" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm">
                  Browse All Names
                </Link>
              </li>
              <li>
                <Link to="/swipe" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm">
                  Swipe Mode
                </Link>
              </li>
              <li>
                <Link to="/favorites" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - PROMINENT */}
          <div>
            <h4 className="font-bold text-sm mb-1">Legal</h4>
            <ul className="space-y-0.5">
              <li>
                <Link to="/terms-of-service" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
                  <Cookie className="w-3 h-3" />
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1">
                  <Accessibility className="w-3 h-3" />
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm mb-1">Support</h4>
            <ul className="space-y-0.5">
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:888soulseed888@gmail.com" className="text-white/80 hover:text-white transition-colors text-sm">
                  Email Support
                </a>
              </li>
              <li>
                <Link to="/blog" onClick={handleLinkClick} className="text-white/80 hover:text-white transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
            <div>
              <p className="text-white/80 text-sm mb-1">
                © {new Date().getFullYear()} SoulSeed. Helping parents worldwide find perfect names since 2020.
              </p>
              <p className="text-white/60 text-xs mb-1">
                Data sourced from global naming registries • 174,000+ curated names with meanings and origins.
              </p>
              <p className="text-white/40 text-xs mt-2">
                C. Miguel Delibes, 2 • 39340 Suances, Cantabria, Spain
              </p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Link to="/about" onClick={handleLinkClick} className="text-white/60 hover:text-white text-sm transition-colors">
                About
              </Link>
              <Link to="/contact" onClick={handleLinkClick} className="text-white/60 hover:text-white text-sm transition-colors">
                Contact
              </Link>
              <Link to="/sitemap" onClick={handleLinkClick} className="text-white/60 hover:text-white text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center mt-2 pt-2 border-t border-white/10">
            <p className="text-xs uppercase tracking-widest text-purple-200 opacity-80">
              Let the Soul Choose.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
