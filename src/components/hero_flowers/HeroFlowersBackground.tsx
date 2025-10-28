import React, { Suspense, useEffect, useState } from 'react';

// Lazy load Unicorn Studio to avoid blocking main thread
const UnicornStudio = React.lazy(() =>
  import('unicornstudio-react').then(module => ({
    default: module.default || module
  }))
);

const HeroFlowersBackground: React.FC = () => {
  const [sceneData, setSceneData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Dynamically import the scene JSON
    import('./scene.json')
      .then((data) => {
        setSceneData(data.default || data);
      })
      .catch((err) => {
        console.error('Failed to load Unicorn Studio scene:', err);
        setError(err);
      });
  }, []);

  // Show nothing if there's an error or no data yet
  if (error || !sceneData) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <Suspense fallback={<div className="absolute inset-0 bg-white" />}>
        <div className="absolute inset-0 opacity-30">
          <UnicornStudio
            scene={sceneData}
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '100%'
            }}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default HeroFlowersBackground;
