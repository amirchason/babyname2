/**
 * Mega Menu Component
 * Rich dropdown menus with content previews and categories
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Baby,
  Users,
  TrendingUp,
  Star,
  Sparkles,
  Layers,
  BookOpen,
  Heart,
  Globe,
  Crown
} from 'lucide-react';

interface MegaMenuProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ label, icon, children, isActive = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }

    const timeout = setTimeout(() => {
      setIsOpen(true);
    }, 150); // 150ms delay before showing

    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 300); // 300ms delay before hiding

    setLeaveTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      if (leaveTimeout) clearTimeout(leaveTimeout);
    };
  }, [hoverTimeout, leaveTimeout]);

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Menu Button */}
      <button
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive || isOpen
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
        }`}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{label}</span>
        <motion.svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden min-w-[720px]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mega Menu Section Component
interface MegaMenuSectionProps {
  title: string;
  children: React.ReactNode;
}

export const MegaMenuSection: React.FC<MegaMenuSectionProps> = ({ title, children }) => {
  return (
    <div className="p-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

// Mega Menu Item Component
interface MegaMenuItemProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  count?: string;
  onClick: () => void;
}

export const MegaMenuItem: React.FC<MegaMenuItemProps> = ({
  icon,
  label,
  description,
  count,
  onClick
}) => {
  return (
    <motion.button
      onClick={onClick}
      className="w-full px-3 py-2.5 flex items-center gap-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all text-left group"
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
          {label}
        </div>
        {description && (
          <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        )}
      </div>
      {count && (
        <div className="text-xs font-semibold text-gray-400 group-hover:text-purple-600 transition-colors">
          {count}
        </div>
      )}
    </motion.button>
  );
};

// Pre-built Mega Menu Content: Browse Names
export const BrowseNamesMegaMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      <MegaMenuSection title="By Gender">
        <MegaMenuItem
          icon={<Baby className="w-4 h-4" />}
          label="Boy Names"
          count="87k+"
          onClick={() => navigate('/names?gender=male')}
        />
        <MegaMenuItem
          icon={<Baby className="w-4 h-4" />}
          label="Girl Names"
          count="87k+"
          onClick={() => navigate('/names?gender=female')}
        />
        <MegaMenuItem
          icon={<Users className="w-4 h-4" />}
          label="Unisex Names"
          count="12k+"
          onClick={() => navigate('/names?gender=unisex')}
        />
      </MegaMenuSection>

      <MegaMenuSection title="By Popularity">
        <MegaMenuItem
          icon={<TrendingUp className="w-4 h-4" />}
          label="Top 100 Names"
          description="Most popular in 2024"
          onClick={() => navigate('/names?rank=top100')}
        />
        <MegaMenuItem
          icon={<Star className="w-4 h-4" />}
          label="Rising Stars"
          description="Trending upward"
          onClick={() => navigate('/names?trending=rising')}
        />
        <MegaMenuItem
          icon={<Sparkles className="w-4 h-4" />}
          label="Unique Names"
          description="Rare & distinctive"
          onClick={() => navigate('/names?rarity=unique')}
        />
      </MegaMenuSection>

      <MegaMenuSection title="By Origin">
        <MegaMenuItem
          icon={<Globe className="w-4 h-4" />}
          label="Arabic Names"
          count="15k+"
          onClick={() => navigate('/names?origin=Arabic')}
        />
        <MegaMenuItem
          icon={<Globe className="w-4 h-4" />}
          label="Hebrew Names"
          count="8k+"
          onClick={() => navigate('/names?origin=Hebrew')}
        />
        <MegaMenuItem
          icon={<Globe className="w-4 h-4" />}
          label="Greek Names"
          count="6k+"
          onClick={() => navigate('/names?origin=Greek')}
        />
        <MegaMenuItem
          icon={<Globe className="w-4 h-4" />}
          label="Latin Names"
          count="5k+"
          onClick={() => navigate('/names?origin=Latin')}
        />
      </MegaMenuSection>
    </div>
  );
};

// Pre-built Mega Menu Content: Curated Lists
export const CuratedListsMegaMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      <MegaMenuSection title="Themed Collections">
        <MegaMenuItem
          icon={<Crown className="w-4 h-4" />}
          label="Royal Names"
          description="Fit for a prince or princess"
          onClick={() => navigate('/babynamelists?theme=royal')}
        />
        <MegaMenuItem
          icon={<Sparkles className="w-4 h-4" />}
          label="Nature-Inspired"
          description="Earth, sky, and flora"
          onClick={() => navigate('/babynamelists?theme=nature')}
        />
        <MegaMenuItem
          icon={<BookOpen className="w-4 h-4" />}
          label="Literary Names"
          description="From classic literature"
          onClick={() => navigate('/babynamelists?theme=literary')}
        />
      </MegaMenuSection>

      <MegaMenuSection title="Popular Lists">
        <MegaMenuItem
          icon={<Heart className="w-4 h-4" />}
          label="Most Loved"
          description="Community favorites"
          onClick={() => navigate('/babynamelists?sort=loved')}
        />
        <MegaMenuItem
          icon={<TrendingUp className="w-4 h-4" />}
          label="Trending Now"
          description="Hot picks this month"
          onClick={() => navigate('/babynamelists?sort=trending')}
        />
        <MegaMenuItem
          icon={<Layers className="w-4 h-4" />}
          label="All Collections"
          description="Browse all curated lists"
          onClick={() => navigate('/babynamelists')}
        />
      </MegaMenuSection>
    </div>
  );
};

export default MegaMenu;
