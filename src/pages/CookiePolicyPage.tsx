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
                If you have questions about our use of cookies, contact us at <a href="mailto:888soulseed888@gmail.com" className="text-purple-600 underline">888soulseed888@gmail.com</a>
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
