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
                    <strong>Email:</strong> <a href="mailto:888soulseed888@gmail.com" className="text-purple-600 underline">888soulseed888@gmail.com</a>
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
