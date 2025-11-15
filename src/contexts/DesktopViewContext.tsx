/**
 * Desktop View Context
 * Manages desktop-specific UI state: view modes, selections, sidebar state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ViewMode = 'grid' | 'table' | 'split';

interface DesktopViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedNameId: string | null;
  setSelectedNameId: (id: string | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectedNames: string[];
  toggleNameSelection: (nameId: string) => void;
  clearSelection: () => void;
}

const DesktopViewContext = createContext<DesktopViewState | undefined>(undefined);

interface DesktopViewProviderProps {
  children: ReactNode;
}

export const DesktopViewProvider: React.FC<DesktopViewProviderProps> = ({ children }) => {
  // View mode (grid/table/split) - persisted in localStorage
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('desktop_viewMode');
    return (saved as ViewMode) || 'grid';
  });

  // Selected name for split-view detail panel
  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('desktop_sidebarCollapsed');
    return saved === 'true';
  });

  // Multi-selection for bulk actions
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  // Persist view mode to localStorage
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('desktop_viewMode', mode);
  };

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('desktop_sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Toggle name selection for bulk actions
  const toggleNameSelection = (nameId: string) => {
    setSelectedNames(prev =>
      prev.includes(nameId)
        ? prev.filter(id => id !== nameId)
        : [...prev, nameId]
    );
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedNames([]);
  };

  const value: DesktopViewState = {
    viewMode,
    setViewMode,
    selectedNameId,
    setSelectedNameId,
    sidebarCollapsed,
    setSidebarCollapsed,
    selectedNames,
    toggleNameSelection,
    clearSelection,
  };

  return (
    <DesktopViewContext.Provider value={value}>
      {children}
    </DesktopViewContext.Provider>
  );
};

export const useDesktopView = (): DesktopViewState => {
  const context = useContext(DesktopViewContext);
  if (!context) {
    throw new Error('useDesktopView must be used within DesktopViewProvider');
  }
  return context;
};
