import React, { useState, useEffect } from 'react';
import UnicornScene from 'unicornstudio-react';

/**
 * UnicornStudio Flower Background Animation
 * Loads the OpenAI Flowers Remix animation with tulips, blur, noise, depth, ASCII overlay, and caustics
 *
 * Features:
 * - Clean white background while loading
 * - Smooth fade-in transition
 * - Graceful error handling with white fallback
 */

const UnicornFlowerBackground: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Set loaded after animation initializes
    const timer = setTimeout(() => {
      if (!hasError) {
        setIsLoaded(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasError]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* White loading background - shows while loading and as fallback */}
      <div
        className="absolute inset-0 bg-white"
        style={{
          opacity: isLoaded && !hasError ? 0 : 1,
          transition: 'opacity 1.5s ease-in-out'
        }}
      />

      {/* UnicornStudio Animation */}
      {!hasError && (
        <div
          className="absolute inset-0"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        >
          <UnicornScene
            jsonFilePath="/tulips-dreamy-animation.json"
            width="100%"
            height="100%"
            scale={1}
            dpi={1.5}
            fps={60}
            lazyLoad={false}
            production={true}
            altText="Dreamy tulips in light blue sky with blur and caustics effects"
            className="w-full h-full"
            onError={(error) => {
              console.error('UnicornStudio animation failed to load:', error);
              setHasError(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UnicornFlowerBackground;
