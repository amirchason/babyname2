/**
 * Blog Pillar Navigation Component
 * Mobile-first pill-based navigation for 5 blog pillars
 */

import React from 'react';
import { Heart, Baby, ShoppingBag, Flower, Sparkles } from 'lucide-react';

export type BlogPillar = 'all' | 'baby-names' | 'baby-milestones' | 'baby-gear' | 'pregnancy' | 'postpartum';

interface BlogPillarNavProps {
  activePillar: BlogPillar;
  onPillarChange: (pillar: BlogPillar) => void;
  postCounts?: Record<BlogPillar, number>;
}

const pillarConfig = [
  {
    id: 'all' as BlogPillar,
    label: 'All Posts',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50',
    activeColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
  },
  {
    id: 'baby-names' as BlogPillar,
    label: 'Baby Names',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    activeColor: 'bg-gradient-to-r from-pink-600 to-rose-600',
  },
  {
    id: 'baby-milestones' as BlogPillar,
    label: 'Milestones',
    icon: Baby,
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    activeColor: 'bg-gradient-to-r from-blue-600 to-cyan-600',
  },
  {
    id: 'baby-gear' as BlogPillar,
    label: 'Baby Gear',
    icon: ShoppingBag,
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    activeColor: 'bg-gradient-to-r from-green-600 to-emerald-600',
  },
  {
    id: 'pregnancy' as BlogPillar,
    label: 'Pregnancy',
    icon: Flower,
    gradient: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    activeColor: 'bg-gradient-to-r from-purple-600 to-violet-600',
  },
  {
    id: 'postpartum' as BlogPillar,
    label: 'Postpartum',
    icon: Heart,
    gradient: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50',
    activeColor: 'bg-gradient-to-r from-rose-600 to-pink-600',
  },
];

export default function BlogPillarNav({ activePillar, onPillarChange, postCounts }: BlogPillarNavProps) {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: Horizontal scrollable pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-2 sm:px-0 hide-scrollbar snap-x snap-mandatory">
        {pillarConfig.map((pillar) => {
          const Icon = pillar.icon;
          const isActive = activePillar === pillar.id;
          const count = postCounts?.[pillar.id] || 0;

          return (
            <button
              key={pillar.id}
              onClick={() => onPillarChange(pillar.id)}
              className={`
                flex-shrink-0 snap-center
                flex items-center gap-1.5 sm:gap-2
                px-3 sm:px-4 py-2 sm:py-2.5
                rounded-full
                text-xs sm:text-sm font-semibold
                transition-all duration-300
                ${
                  isActive
                    ? `${pillar.activeColor} text-white shadow-lg scale-105`
                    : `${pillar.bgColor} text-gray-700 hover:shadow-md hover:scale-102`
                }
                whitespace-nowrap
                min-w-[100px] sm:min-w-0
              `}
            >
              <Icon
                size={14}
                className={`sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-gray-600'}`}
                strokeWidth={2.5}
              />
              <span>{pillar.label}</span>
              {postCounts && (
                <span
                  className={`
                    ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                    ${isActive ? 'bg-white/30 text-white' : 'bg-white text-gray-600'}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        /* Hide scrollbar but keep functionality */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Smooth snap scrolling */
        .snap-x {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
