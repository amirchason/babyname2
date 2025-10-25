import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600 mt-1">Last updated: January 20, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Table of Contents */}
          <div className="bg-purple-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
            <nav className="space-y-2">
              {[
                'Acceptance of Terms',
                'Description of Service',
                'User Accounts',
                'User Responsibilities',
                'Intellectual Property',
                'Privacy',
                'Disclaimers',
                'Limitation of Liability',
                'Termination',
                'Changes to Terms',
                'Governing Law',
                'Contact Information'
              ].map((item, index) => (
                <a
                  key={index}
                  href={`#section-${index + 1}`}
                  className="block text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                >
                  {index + 1}. {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Section 1 */}
          <section id="section-1" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Acceptance of Terms
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                Welcome to SoulSeed! By accessing or using our baby name discovery application ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and SoulSeed ("we," "us," or "our"). Your use of the Service signifies your acceptance of these Terms and our Privacy Policy.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Description of Service
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                SoulSeed is a baby name discovery platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>A comprehensive database of over 174,000 baby names</li>
                <li>AI-powered name suggestions and enrichment</li>
                <li>Swipe-based name discovery (similar to dating apps)</li>
                <li>Cloud synchronization of favorites across devices</li>
                <li>Name filtering, search, and organization tools</li>
                <li>Cultural, historical, and meaning information for names</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              User Accounts
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                To access certain features of the Service, you may need to create an account using Google OAuth authentication.
              </p>
              <p><strong>Account Security:</strong></p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to accept responsibility for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>We will not be liable for any loss or damage arising from unauthorized account access</li>
              </ul>
              <p><strong>Account Eligibility:</strong></p>
              <p>
                You must be at least 13 years old to use our Service. By creating an account, you represent that you meet this age requirement.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
              User Responsibilities
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
                <li>Use automated scripts, bots, or scrapers to access the Service</li>
                <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
                <li>Remove or modify any copyright, trademark, or other proprietary notices</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
              Intellectual Property
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                All content, features, and functionality of the Service, including but not limited to text, graphics, logos, icons, images, audio clips, data compilations, and software, are the exclusive property of SoulSeed or its licensors and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p><strong>User Data:</strong></p>
              <p>
                You retain all rights to the data you create using our Service (such as your favorite names list). By using our Service, you grant us a limited, non-exclusive license to store and process your data to provide the Service.
              </p>
              <p><strong>Name Database:</strong></p>
              <p>
                Our name database is compiled from public domain sources and our own research. While individual names cannot be copyrighted, our specific collection, organization, enrichment, and presentation of this data is proprietary.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
              Privacy
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                Your privacy is important to us. Our collection and use of personal information is described in our{' '}
                <Link to="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">
                  Privacy Policy
                </Link>, which is incorporated into these Terms by reference.
              </p>
              <p>
                By using the Service, you consent to our collection and use of your information as described in the Privacy Policy.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
              Disclaimers
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong>
              </p>
              <p>We disclaim all warranties, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                <li>Warranties regarding the accuracy, reliability, or completeness of name information</li>
                <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
                <li>Warranties regarding the results that may be obtained from using the Service</li>
              </ul>
              <p><strong>Name Information:</strong></p>
              <p>
                While we strive to provide accurate information about baby names, including meanings, origins, and cultural significance, we do not guarantee the accuracy or completeness of this information. Name meanings and cultural associations may vary by region and time period. Always conduct your own research before making important decisions about baby names.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">8</span>
              Limitation of Liability
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOULSEED SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.</strong>
              </p>
              <p>
                Our total liability to you for all claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months prior to the claim, or $100 if you have not made any payments to us.
              </p>
              <p>
                Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so some of the above limitations may not apply to you.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">9</span>
              Termination
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                We reserve the right to suspend or terminate your account and access to the Service at any time, with or without notice, for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Technical or security reasons</li>
              </ul>
              <p>
                You may terminate your account at any time by discontinuing use of the Service and requesting account deletion through our contact email.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">10</span>
              Changes to Terms
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Updating the "Last updated" date at the top of this page</li>
                <li>Posting a notice on our website</li>
                <li>Sending an email notification (if you have provided your email address)</li>
              </ul>
              <p>
                Your continued use of the Service after changes to these Terms constitutes your acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the Service.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="section-11" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">11</span>
              Governing Law
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
              <p>
                Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in the United States, and you hereby consent to personal jurisdiction and venue therein.
              </p>
              <p><strong>Dispute Resolution:</strong></p>
              <p>
                For any dispute you have with SoulSeed, you agree to first contact us and attempt to resolve the dispute informally. If a dispute is not resolved within 30 days, you may pursue remedies through the courts as described above.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section id="section-12" className="mb-8 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">12</span>
              Contact Information
            </h2>
            <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-purple-50 rounded-xl p-6 my-4">
                <p className="mb-2"><strong>Email:</strong> <a href="mailto:legal@soulseedbaby.com" className="text-purple-600 hover:text-purple-700 underline">legal@soulseedbaby.com</a></p>
                <p className="mb-2"><strong>General Inquiries:</strong> <a href="mailto:contact@soulseedbaby.com" className="text-purple-600 hover:text-purple-700 underline">contact@soulseedbaby.com</a></p>
                <p><strong>Website:</strong> <a href="https://soulseedbaby.com" className="text-purple-600 hover:text-purple-700 underline">soulseedbaby.com</a></p>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              By using SoulSeed, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="text-sm text-gray-600 text-center mt-4">
              <span className="inline-block mx-2">•</span>
              <Link to="/privacy-policy" className="text-purple-600 hover:text-purple-700 underline">Privacy Policy</Link>
              <span className="inline-block mx-2">•</span>
              <Link to="/cookie-policy" className="text-purple-600 hover:text-purple-700 underline">Cookie Policy</Link>
              <span className="inline-block mx-2">•</span>
              <Link to="/contact" className="text-purple-600 hover:text-purple-700 underline">Contact Us</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
