import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Mail, Lock, Eye, Download, Trash2 } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600 mt-1">Last updated: January 20, 2025</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          
          {/* Introduction */}
          <div className="prose prose-purple max-w-none mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              At SoulSeed, your privacy is our top priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our baby name discovery application. Please read this policy carefully.
            </p>
          </div>

          {/* Your Rights Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl mb-8">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-blue-900 mb-2">🔒 Your Privacy Rights</p>
                <p className="text-blue-800 text-sm mb-3">
                  You have the right to access, correct, delete, or export your data at any time under GDPR and CCPA laws.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <Eye className="w-3 h-3 mr-1" /> Access
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <Download className="w-3 h-3 mr-1" /> Export
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </span>
                </div>
                <p className="text-blue-800 text-sm mt-3">
                  Contact: <a href="mailto:888soulseed888@gmail.com" className="underline font-medium">888soulseed888@gmail.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-purple-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Information We Collect',
                'How We Use Information',
                'Third-Party Services',
                'Data Storage & Security',
                'Your Privacy Rights',
                'Children\'s Privacy',
                'Cookies & Tracking',
                'Data Retention',
                'International Transfers',
                'California Privacy Rights',
                'Changes to Policy',
                'Contact Us'
              ].map((item, idx) => (
                <a key={idx} href={`#section-${idx + 1}`} className="text-purple-600 hover:text-purple-700 hover:underline text-sm transition-colors">
                  {idx + 1}. {item}
                </a>
              ))}
            </div>
          </div>

          {/* Section 1: Information We Collect */}
          <section id="section-1" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Information We Collect
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p className="mb-4"><strong>Personal Information:</strong></p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Google Account Data:</strong> Email address, name, and profile picture (via Google OAuth 2.0)</li>
                <li><strong>Firebase UID:</strong> Unique identifier for your account (NOT your Google OAuth ID)</li>
                <li><strong>User Preferences:</strong> Favorite names, disliked names, filter settings</li>
              </ul>
              
              <p className="mb-4"><strong>Automatically Collected:</strong></p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Browser type and version</li>
                <li>Device information (mobile/desktop)</li>
                <li>IP address (for security purposes only)</li>
                <li>Usage data (pages visited, features used)</li>
              </ul>

              <p className="bg-green-50 border-l-4 border-green-400 p-4 my-4">
                <strong>✅ We Do NOT Collect:</strong> Payment information (app is free), browsing history outside our app, or contact lists.
              </p>
            </div>
          </section>

          {/* Section 2: How We Use Information */}
          <section id="section-2" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              How We Use Your Information
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p>We use collected information for:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Service Provision:</strong> To provide and maintain SoulSeed features</li>
                <li><strong>Cloud Sync:</strong> To synchronize your favorites across devices</li>
                <li><strong>Authentication:</strong> To verify your identity and prevent unauthorized access</li>
                <li><strong>Service Improvement:</strong> To understand usage patterns and improve features</li>
                <li><strong>Communication:</strong> To respond to your inquiries and provide support</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, or security issues</li>
              </ul>
              
              <p className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
                <strong>❌ We Do NOT:</strong> Sell your data, use it for advertising, or share it with third parties for their marketing purposes.
              </p>
            </div>
          </section>

          {/* Section 3: Third-Party Services */}
          <section id="section-3" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              Third-Party Services
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p>We use the following trusted third-party services:</p>
              
              <div className="space-y-4 my-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">🔐 Google OAuth 2.0</p>
                  <p className="text-sm text-gray-600">Used for secure authentication. <a href="https://policies.google.com/privacy" className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">🔥 Firebase/Firestore (Google Cloud)</p>
                  <p className="text-sm text-gray-600">Database and authentication backend. Data encrypted in transit and at rest. <a href="https://firebase.google.com/support/privacy" className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">Firebase Privacy</a></p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">▲ Vercel</p>
                  <p className="text-sm text-gray-600">Web hosting platform. <a href="https://vercel.com/legal/privacy-policy" className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a></p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">🤖 OpenAI & Google Gemini</p>
                  <p className="text-sm text-gray-600">AI name enrichment (meanings, origins). <strong>NO user data is sent to these services</strong> - only name strings from our database.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Data Storage & Security */}
          <section id="section-4" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
              Data Storage & Security
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p><strong>Where Your Data Is Stored:</strong></p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Firebase Cloud Firestore (Google Cloud Platform servers globally)</li>
                <li>Local browser storage (IndexedDB for offline access, localStorage for preferences)</li>
              </ul>
              
              <p><strong>Security Measures:</strong></p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>✅ HTTPS encryption for all data in transit</li>
                <li>✅ Firebase encryption at rest</li>
                <li>✅ Google OAuth 2.0 secure authentication</li>
                <li>✅ Firebase Security Rules to prevent unauthorized access</li>
                <li>✅ Regular security audits and updates</li>
              </ul>
              
              <p className="text-sm text-gray-600 italic mt-4">
                While we implement industry-standard security measures, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Section 5: Your Privacy Rights (GDPR & CCPA) */}
          <section id="section-5" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
              Your Privacy Rights (GDPR & CCPA)
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p>Under GDPR (EU) and CCPA (California), you have the following rights:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Right to Access
                  </p>
                  <p className="text-sm text-purple-800">Request a copy of all data we have about you</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5" /> Right to Portability
                  </p>
                  <p className="text-sm text-purple-800">Export your favorites list in JSON format</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" /> Right to Deletion
                  </p>
                  <p className="text-sm text-purple-800">Request complete deletion of your account and data</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Right to Opt-Out
                  </p>
                  <p className="text-sm text-purple-800">Stop data collection (California residents)</p>
                </div>
              </div>
              
              <p className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
                <strong>To exercise these rights:</strong> Email <a href="mailto:888soulseed888@gmail.com" className="text-blue-600 underline font-medium">888soulseed888@gmail.com</a> with your request. We will respond within 30 days.
              </p>
            </div>
          </section>

          {/* Section 6: Children's Privacy (COPPA) */}
          <section id="section-6" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
              Children's Privacy (COPPA Compliance)
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p className="mb-4">
                SoulSeed is intended for users aged <strong>13 years and older</strong>. We do not knowingly collect personal information from children under 13.
              </p>
              
              <p className="mb-4">
                If you are a parent or guardian and believe your child under 13 has provided us with personal information, please contact us immediately at <a href="mailto:888soulseed888@gmail.com" className="text-purple-600 underline">888soulseed888@gmail.com</a>. We will delete such information within 30 days.
              </p>
            </div>
          </section>

          {/* Section 7: Cookies & Tracking */}
          <section id="section-7" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
              Cookies & Tracking Technologies
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p>We use the following types of cookies:</p>
              
              <ul className="list-disc pl-6 space-y-3 my-4">
                <li>
                  <strong>Essential Cookies (Required):</strong> Firebase authentication tokens, session management
                </li>
                <li>
                  <strong>Preference Cookies:</strong> LocalStorage for favorites, theme settings, user preferences
                </li>
                <li>
                  <strong>Analytics Cookies (Currently NOT used):</strong> We do not currently use Google Analytics or similar services
                </li>
              </ul>
              
              <p className="mt-4">
                Learn more in our <Link to="/cookie-policy" className="text-purple-600 underline">Cookie Policy</Link>.
              </p>
            </div>
          </section>

          {/* Section 8: Data Retention */}
          <section id="section-8" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
              Data Retention
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Active Accounts:</strong> Retained indefinitely while you use the service</li>
                <li><strong>Inactive Accounts:</strong> Retained for 3 years of inactivity, then deleted</li>
                <li><strong>Deleted Accounts:</strong> Permanently removed within 30 days of deletion request</li>
                <li><strong>Backup Data:</strong> May persist in backups for up to 90 days after deletion</li>
              </ul>
            </div>
          </section>

          {/* Section 9: International Data Transfers */}
          <section id="section-9" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">9</span>
              International Data Transfers
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p>
                Your data may be transferred to and stored on servers located outside your country, including the United States and other countries where Google Cloud Platform operates.
              </p>
              <p className="mt-4">
                <strong>GDPR Safeguards:</strong> We rely on Google's EU-US Data Privacy Framework certification and Standard Contractual Clauses approved by the European Commission.
              </p>
            </div>
          </section>

          {/* Section 10: California Privacy Rights (CCPA) */}
          <section id="section-10" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">10</span>
              California Privacy Rights (CCPA)
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p className="font-semibold mb-4">California Residents:</p>
              
              <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <strong>"Do Not Sell My Personal Information":</strong> We do NOT sell your personal information to third parties. We have not sold personal information in the past 12 months.
              </p>
              
              <p><strong>Categories of Personal Information Collected (last 12 months):</strong></p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Identifiers (email, Firebase UID)</li>
                <li>Internet/network activity (usage data)</li>
                <li>Preferences (favorite names, filters)</li>
              </ul>
              
              <p><strong>Business Purpose:</strong> Service provision, cloud sync, authentication, service improvement</p>
              
              <p className="mt-4">
                To exercise your CCPA rights, contact: <a href="mailto:888soulseed888@gmail.com" className="text-purple-600 underline">888soulseed888@gmail.com</a>
              </p>
            </div>
          </section>

          {/* Section 11: Changes to Privacy Policy */}
          <section id="section-11" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">11</span>
              Changes to This Privacy Policy
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Updating the "Last updated" date at the top of this page</li>
                <li>Posting a prominent notice on our homepage</li>
                <li>Sending an email notification (if you have an account)</li>
              </ul>
              <p className="mt-4">
                Your continued use after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Section 12: Contact Us */}
          <section id="section-12" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">12</span>
              Contact Us
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700">
              <p>For privacy-related questions, concerns, or requests:</p>
              
              <div className="bg-purple-50 rounded-xl p-6 my-4">
                <p className="mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <strong>Privacy Email:</strong> <a href="mailto:888soulseed888@gmail.com" className="text-purple-600 hover:text-purple-700 underline ml-1">888soulseed888@gmail.com</a>
                </p>
                <p className="mb-2"><strong>General Contact:</strong> <a href="mailto:888soulseed888@gmail.com" className="text-purple-600 hover:text-purple-700 underline">888soulseed888@gmail.com</a></p>
                <p><strong>Website:</strong> <a href="https://soulseedbaby.com" className="text-purple-600 hover:text-purple-700 underline">soulseedbaby.com</a></p>
                
                <p className="text-sm text-gray-600 mt-4">
                  We typically respond to privacy requests within 30 days as required by GDPR and CCPA.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              This Privacy Policy is compliant with GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act).
            </p>
            <p className="text-sm text-gray-600 text-center">
              <Link to="/terms-of-service" className="text-purple-600 hover:text-purple-700 underline">Terms of Service</Link>
              <span className="mx-2">•</span>
              <Link to="/cookie-policy" className="text-purple-600 hover:text-purple-700 underline">Cookie Policy</Link>
              <span className="mx-2">•</span>
              <Link to="/contact" className="text-purple-600 hover:text-purple-700 underline">Contact Us</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
