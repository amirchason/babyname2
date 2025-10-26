import React from 'react';
import UnicornScene from 'unicornstudio-react';

/**
 * UnicornStudio Flower Background Animation
 * Loads the OpenAI Flowers animation from local JSON file
 * Includes tulip images, blur, noise, depth, ASCII overlay, and caustics effects
 */

const UnicornFlowerBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <UnicornScene
        jsonFilePath="/flower-animation.json"
        width="100%"
        height="100%"
        scale={1}
        dpi={1.5}
        fps={60}
        lazyLoad={false}
        production={true}
        altText="Animated flower background with tulips and dreamy effects"
        className="w-full h-full"
        onError={(error) => {
          console.error('UnicornStudio animation failed to load:', error);
        }}
      />
    </div>
  );
};

export default UnicornFlowerBackground;
