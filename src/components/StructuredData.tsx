import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'organization' | 'webapp' | 'contact' | 'breadcrumb';
  data?: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getSchema = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'SoulSeed',
          alternateName: 'SoulSeed Baby Names',
          url: 'https://soulseedbaby.com',
          logo: 'https://soulseedbaby.com/logo.png',
          description: 'Discover 174,000+ baby names with AI-powered suggestions, meanings, and origins. Find your perfect baby name with our beautiful Tinder-style swipe interface.',
          email: '888soulseed888@gmail.com',
          telephone: '+34666229393',
          foundingDate: '2025',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'C. Miguel Delibes, 2',
            addressLocality: 'Suances',
            addressRegion: 'Cantabria',
            postalCode: '39340',
            addressCountry: 'ES'
          },
          sameAs: [
            'https://github.com/amirchason/babyname2'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            email: '888soulseed888@gmail.com',
            telephone: '+34666229393',
            contactType: 'customer service',
            availableLanguage: ['English', 'Spanish']
          }
        };

      case 'webapp':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'SoulSeed Baby Name App',
          url: 'https://soulseedbaby.com',
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1250',
            bestRating: '5'
          },
          author: {
            '@type': 'Organization',
            name: 'SoulSeed'
          },
          description: 'Find your perfect baby name from 174,000+ options with AI-powered suggestions, meanings, origins, and a unique Tinder-style swipe interface.',
          screenshot: 'https://soulseedbaby.com/screenshot.png',
          featureList: [
            '174,000+ baby names database',
            'AI-powered name suggestions',
            'Tinder-style swipe interface',
            'Cloud sync across devices',
            'Name meanings and origins',
            'Favorite names list',
            'Partner voting system',
            'Multi-language support'
          ]
        };

      case 'contact':
        return {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          url: 'https://soulseedbaby.com/contact',
          mainEntity: {
            '@type': 'Organization',
            name: 'SoulSeed',
            email: '888soulseed888@gmail.com',
            telephone: '+34666229393',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'C. Miguel Delibes, 2',
              addressLocality: 'Suances',
              addressRegion: 'Cantabria',
              postalCode: '39340',
              addressCountry: 'ES'
            },
            contactPoint: [
              {
                '@type': 'ContactPoint',
                email: '888soulseed888@gmail.com',
                telephone: '+34666229393',
                contactType: 'customer service',
                availableLanguage: ['English', 'Spanish']
              },
              {
                '@type': 'ContactPoint',
                email: '888soulseed888@gmail.com',
                telephone: '+34666229393',
                contactType: 'technical support',
                availableLanguage: ['English', 'Spanish']
              }
            ]
          }
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data?.items || []
        };

      default:
        return null;
    }
  };

  const schema = getSchema();
  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
