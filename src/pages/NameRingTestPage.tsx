import React from 'react';
import NameParticleRing from '../components/NameParticleRing';
import SEOHead from '../components/SEO/SEOHead';

const NameRingTestPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Name Ring Test | SoulSeed"
        description="Test page for name ring visualization feature."
        canonical="https://soulseedbaby.com/name-ring-test"
        noindex={true}
      />
      <div className="w-full h-screen">
        <h1 className="sr-only">Name Ring Test</h1>
        <NameParticleRing />
      </div>
    </>
  );
};

export default NameRingTestPage;
