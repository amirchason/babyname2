#!/bin/bash
# Script to create all remaining legal pages

echo "🚀 Creating remaining legal pages..."

# About Page
cat > src/pages/AboutPage.tsx << 'ABOUT_EOF'
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Database, Sparkles, Cloud, ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
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
  );
};

export default AboutPage;
ABOUT_EOF

echo "✅ About page created"

# Contact Page (simplified - form functionality requires backend)
cat > src/pages/ContactPage.tsx << 'CONTACT_EOF'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, ArrowLeft, MessageCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success message and open email client
    const mailtoLink = `mailto:contact@soulseedbaby.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
              <p className="text-gray-600 mt-1">We'd love to hear from you</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl">
                <p className="font-semibold text-green-900 mb-2">✅ Message Sent!</p>
                <p className="text-green-800 text-sm">Your email client should open. We'll respond within 24-48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="privacy">Privacy Question</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">General Inquiries</p>
                    <a href="mailto:contact@soulseedbaby.com" className="text-purple-600 hover:text-purple-700 text-sm">contact@soulseedbaby.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Technical Support</p>
                    <a href="mailto:support@soulseedbaby.com" className="text-purple-600 hover:text-purple-700 text-sm">support@soulseedbaby.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Privacy Matters</p>
                    <a href="mailto:privacy@soulseedbaby.com" className="text-purple-600 hover:text-purple-700 text-sm">privacy@soulseedbaby.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">📧 Response Time</h3>
              <p className="text-gray-700 text-sm">
                We typically respond to all inquiries within <strong>24-48 hours</strong> during business days.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">💡 Before You Contact</h3>
              <p className="text-gray-700 text-sm mb-3">
                Check our <Link to="/faq" className="text-purple-600 underline">FAQ page</Link> for quick answers to common questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
CONTACT_EOF

echo "✅ Contact page created"

# Cookie Policy Page
cat > src/pages/CookiePolicyPage.tsx << 'COOKIE_EOF'
import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
              <p className="text-gray-600 mt-1">Last updated: January 20, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          
          <div className="prose prose-purple max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              This Cookie Policy explains how SoulSeed uses cookies and similar technologies to recognize you when you visit our application.
            </p>

            {/* What Are Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your experience.
              </p>
            </section>

            {/* Types of Cookies We Use */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies We Use</h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                  <h3 className="font-bold text-green-900 mb-2">✅ Essential Cookies (Required)</h3>
                  <p className="text-green-800 text-sm mb-2">These cookies are necessary for the app to function:</p>
                  <ul className="list-disc pl-6 text-green-800 text-sm space-y-1">
                    <li>Firebase authentication tokens</li>
                    <li>Session management</li>
                    <li>Security and fraud prevention</li>
                  </ul>
                  <p className="text-green-800 text-xs mt-2 italic">You cannot disable these cookies.</p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                  <h3 className="font-bold text-blue-900 mb-2">📝 Preference Cookies</h3>
                  <p className="text-blue-800 text-sm mb-2">These remember your preferences:</p>
                  <ul className="list-disc pl-6 text-blue-800 text-sm space-y-1">
                    <li>Favorite names list (localStorage)</li>
                    <li>Disliked names (localStorage)</li>
                    <li>Filter settings</li>
                    <li>Theme preferences</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-xl">
                  <h3 className="font-bold text-gray-900 mb-2">📊 Analytics Cookies (Currently NOT Used)</h3>
                  <p className="text-gray-800 text-sm">
                    We do not currently use Google Analytics or similar tracking services.
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                When you use Google OAuth to sign in, Google may set cookies on your device. These are governed by Google's privacy policy.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Google OAuth:</strong> Authentication and account management</li>
                <li><strong>Firebase:</strong> Cloud sync and data storage</li>
              </ul>
            </section>

            {/* How to Manage Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Manage Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in your browser settings:
              </p>
              
              <div className="bg-purple-50 rounded-xl p-6 space-y-3">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Chrome</p>
                  <p className="text-sm text-gray-600">Settings → Privacy and security → Cookies and other site data</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Firefox</p>
                  <p className="text-sm text-gray-600">Settings → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Safari</p>
                  <p className="text-sm text-gray-600">Preferences → Privacy → Manage Website Data</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Edge</p>
                  <p className="text-sm text-gray-600">Settings → Cookies and site permissions → Manage cookies</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4 italic">
                Note: Disabling essential cookies will prevent you from using certain features like cloud sync.
              </p>
            </section>

            {/* Updates */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
              <p className="text-gray-700">
                If you have questions about our use of cookies, contact us at <a href="mailto:privacy@soulseedbaby.com" className="text-purple-600 underline">privacy@soulseedbaby.com</a>
              </p>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              <Link to="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">Privacy Policy</Link>
              <span className="mx-2">•</span>
              <Link to="/terms-of-service" className="text-purple-600 hover:text-purple-700 underline">Terms of Service</Link>
              <span className="mx-2">•</span>
              <Link to="/contact" className="text-purple-600 hover:text-purple-700 underline">Contact Us</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
COOKIE_EOF

echo "✅ Cookie Policy created"

# Accessibility Page
cat > src/pages/AccessibilityPage.tsx << 'ACCESS_EOF'
import React from 'react';
import { Link } from 'react-router-dom';
import { Accessibility, ArrowLeft, Keyboard, Eye, Volume2 } from 'lucide-react';

const AccessibilityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-xl flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accessibility Statement</h1>
              <p className="text-gray-600 mt-1">Our commitment to accessibility</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          
          <div className="prose prose-purple max-w-none">
            {/* Commitment */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
              <p className="text-gray-700 leading-relaxed">
                SoulSeed is committed to ensuring digital accessibility for all users, including those with disabilities. We are continually improving the user experience and applying relevant accessibility standards to ensure our application is usable by everyone.
              </p>
            </section>

            {/* Standards */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Standards</h2>
              <p className="text-gray-700 mb-4">
                We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards. These guidelines explain how to make web content more accessible for people with disabilities.
              </p>
            </section>

            {/* Features */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Keyboard className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900">Keyboard Navigation</h3>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Full keyboard navigation support. All interactive elements are accessible via Tab, Enter, and Arrow keys.
                  </p>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-purple-900">Screen Reader Support</h3>
                  </div>
                  <p className="text-purple-800 text-sm">
                    Compatible with NVDA, JAWS, and VoiceOver. ARIA labels and semantic HTML throughout.
                  </p>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-green-900">Visual Accessibility</h3>
                  </div>
                  <p className="text-green-800 text-sm">
                    High contrast mode support, clear focus indicators, and WCAG AA compliant color contrast ratios (4.5:1).
                  </p>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Accessibility className="w-5 h-5 text-orange-600" />
                    <h3 className="font-bold text-orange-900">Responsive Design</h3>
                  </div>
                  <p className="text-orange-800 text-sm">
                    Mobile-first design with touch targets >44x44px. Works on all device sizes and orientations.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-gray-700">
                <p>✅ <strong>Alt text</strong> for all meaningful images</p>
                <p>✅ <strong>Proper heading hierarchy</strong> (h1 → h2 → h3)</p>
                <p>✅ <strong>Form labels</strong> for all input fields</p>
                <p>✅ <strong>Skip links</strong> for keyboard users</p>
                <p>✅ <strong>No keyboard traps</strong></p>
                <p>✅ <strong>Readable fonts</strong> with adjustable sizes</p>
              </div>
            </section>

            {/* Known Limitations */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Known Limitations</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                <p className="text-yellow-900 text-sm mb-2">
                  We are continuously working to improve accessibility. Currently known limitations:
                </p>
                <ul className="list-disc pl-6 text-yellow-800 text-sm space-y-1">
                  <li>Some swipe gestures in Swipe Mode may be difficult for users with motor impairments (alternative button controls are available)</li>
                  <li>Third-party content (Google OAuth) accessibility is managed by Google</li>
                </ul>
              </div>
            </section>

            {/* Feedback */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback & Support</h2>
              <div className="bg-purple-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  We welcome your feedback on the accessibility of SoulSeed. If you encounter any accessibility barriers, please let us know:
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Email:</strong> <a href="mailto:accessibility@soulseedbaby.com" className="text-purple-600 underline">accessibility@soulseedbaby.com</a>
                  </p>
                  <p className="text-sm">
                    <strong>Response Time:</strong> We aim to respond within 5 business days
                  </p>
                </div>
              </div>
            </section>

            {/* Continuous Improvement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Continuous Improvement</h2>
              <p className="text-gray-700">
                Accessibility is an ongoing effort. We regularly:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 my-4">
                <li>Test with assistive technologies</li>
                <li>Audit our code for WCAG compliance</li>
                <li>Gather user feedback</li>
                <li>Update our practices based on new standards</li>
                <li>Train our team on accessibility best practices</li>
              </ul>
              <p className="text-sm text-gray-600 italic">
                Last accessibility audit: January 2025
              </p>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              <Link to="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">Privacy Policy</Link>
              <span className="mx-2">•</span>
              <Link to="/terms-of-service" className="text-purple-600 hover:text-purple-700 underline">Terms of Service</Link>
              <span className="mx-2">•</span>
              <Link to="/contact" className="text-purple-600 hover:text-purple-700 underline">Contact Us</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPage;
ACCESS_EOF

echo "✅ Accessibility page created"
echo "✅ All legal pages created successfully!"
