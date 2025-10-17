import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Users, Target, ArrowRight } from 'lucide-react';

const AboutUsPage: React.FC = () => {
  useEffect(() => {
    // SEO: Set page title and meta description
    document.title = 'About SoulSeed - Where Your Baby Name Blooms | Our Mission';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover the story behind SoulSeed, the leading baby name app with 224,000+ unique names. Learn about our mission to help expecting parents find the perfect name for their baby.');
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg mb-8">
              <Heart className="w-10 h-10" fill="currentColor" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About SoulSeed
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Where your baby name blooms into a lifetime of meaning
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(250, 245, 255)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">

        {/* Our Story Section */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story: A Journey of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Love & Discovery</span>
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Every parent remembers the moment they chose their baby's name. That magical feeling of finding *the one* - a name that resonates with your heart, honors your heritage, and carries hopes for your child's future.
                </p>
                <p>
                  <strong className="text-purple-600">SoulSeed was born from this beautiful journey.</strong> We understand that naming your baby is one of the most meaningful decisions you'll ever make. That's why we've created more than just a baby name app - we've built a sanctuary where your baby's name can bloom.
                </p>
                <p>
                  With over <strong>224,000 unique baby names</strong> from cultures around the world, comprehensive meanings and origins, and AI-powered personalized suggestions, SoulSeed helps expecting parents discover names that truly resonate with their soul.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-1 shadow-2xl">
                <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center">
                  <div className="text-center p-8">
                    <Sparkles className="w-24 h-24 mx-auto mb-6 text-purple-500" />
                    <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      224K+
                    </p>
                    <p className="text-xl text-gray-600 mt-2">
                      Unique Baby Names
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Our Mission & Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-purple-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To empower expecting parents worldwide with the tools, insights, and inspiration they need to discover the perfect name for their baby - a name that blooms with meaning and resonates for a lifetime.
              </p>
            </div>

            {/* Inclusivity Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-pink-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Inclusivity</h3>
              <p className="text-gray-700 leading-relaxed">
                We celebrate diversity by offering names from every culture, origin, and tradition. Whether you're looking for traditional, modern, or unique names, SoulSeed welcomes all families on their naming journey.
              </p>
            </div>

            {/* Innovation Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-700 leading-relaxed">
                Combining AI-powered suggestions, Tinder-style swiping, and cloud sync across devices, we make baby name discovery modern, fun, and personalized to your unique preferences and style.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose SoulSeed */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 rounded-3xl p-1 shadow-2xl mb-20">
          <div className="bg-white rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Why Parents Choose SoulSeed
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">224,000+ Unique Names</h4>
                  <p className="text-gray-700">The most comprehensive baby name database with names from every culture and origin.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">AI-Powered Suggestions</h4>
                  <p className="text-gray-700">Get personalized name recommendations based on your preferences and style.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Tinder-Style Swiping</h4>
                  <p className="text-gray-700">Discover names in a fun, modern way - swipe right to save, left to skip.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Cloud Sync & Voting</h4>
                  <p className="text-gray-700">Sync favorites across devices and vote with your partner on baby name choices.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Detailed Meanings & Origins</h4>
                  <p className="text-gray-700">Every name comes with rich cultural context, meanings, and historical significance.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Free Forever</h4>
                  <p className="text-gray-700">All features are completely free. No hidden costs, no premium tiers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Find Your Baby's Perfect Name?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of expecting parents who have discovered their baby's name at SoulSeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Exploring Names
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-full border-2 border-purple-600 hover:bg-purple-50 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About SoulSeed - Where Your Baby Name Blooms",
          "description": "Discover the story behind SoulSeed, the leading baby name app with 224,000+ unique names. Learn about our mission to help expecting parents find the perfect name.",
          "url": "https://soulseedbaby.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "SoulSeed",
            "description": "The leading baby name discovery platform with 224,000+ unique names, AI-powered suggestions, and personalized recommendations for expecting parents.",
            "url": "https://soulseedbaby.com",
            "logo": "https://soulseedbaby.com/logo.png",
            "sameAs": [
              "https://soulseedbaby.com"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "888soulseed888@gmail.com",
              "contactType": "Customer Support"
            }
          }
        })}
      </script>
    </div>
  );
};

export default AboutUsPage;
