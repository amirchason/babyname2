/**
 * Desktop Toolbar Component
 * View mode toggles, sort options, and display controls
 */

import React from 'react';
import { Grid3x3, Table, PanelRightClose, SlidersHorizontal } from 'lucide-react';
import { useDesktopView, ViewMode } from '../../contexts/DesktopViewContext';

interface DesktopToolbarProps {
  totalResults: number;
  currentPage: number;
  itemsPerPage: number;
}

const DesktopToolbar: React.FC<DesktopToolbarProps> = ({
  totalResults,
  currentPage,
  itemsPerPage,
}) => {
  const { viewMode, setViewMode, sidebarCollapsed, setSidebarCollapsed } = useDesktopView();

  const viewModes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'grid', icon: <Grid3x3 className="w-4 h-4" />, label: 'Grid' },
    { mode: 'table', icon: <Table className="w-4 h-4" />, label: 'Table' },
    { mode: 'split', icon: <PanelRightClose className="w-4 h-4" />, label: 'Split' },
  ];

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalResults);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Left: Results count */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold">{startIndex}-{endIndex}</span> of{' '}
        <span className="font-semibold">{totalResults}</span> names
      </div>

      {/* Center: View mode toggles */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {viewModes.map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${viewMode === mode
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
            title={label}
          >
            {icon}
            <span className="hidden xl:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Right: Sidebar toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden xl:inline">{sidebarCollapsed ? 'Show' : 'Hide'} Filters</span>
      </button>
    </div>
  );
};

export default DesktopToolbar;
