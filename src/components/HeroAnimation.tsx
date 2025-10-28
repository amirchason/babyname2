import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/openai-flowers.json';

const HeroAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '800px',
            maxHeight: '800px'
          }}
        />
      </div>
    </div>
  );
};

export default HeroAnimation;
