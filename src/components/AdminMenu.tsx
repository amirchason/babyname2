import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Shield, Settings, Database, Users, BarChart3, FileText, AlertCircle, ChevronDown, Camera, Map, RefreshCw, LucideIcon, Bug, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { captureScreenshotWithFeedback } from '../utils/screenshotUtils';
import { useToast } from '../contexts/ToastContext';
import { useListCrawler } from '../hooks/useListCrawler';

// Lazy load the debug page content (only loads when clicked)
const DebugPageContent = lazy(() => import('../pages/DebugPage'));
const BlogPostEditor = lazy(() => import('./BlogPostEditor'));

/**
 * Admin menu item type
 */
interface AdminMenuItem {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  loading?: boolean;
}

/**
 * Admin Menu Component
 * Secure admin-only dropdown menu with administrative functions
 *
 * SECURITY NOTES:
 * - Client-side protection: Only renders if user has isAdmin flag
 * - isAdmin flag set based on email whitelist in adminConfig.ts
 * - Backend protection: All admin endpoints MUST have Firestore security rules
 * - This is UI-level security; server-side validation is REQUIRED for all admin actions
 *
 * FEATURES:
 * - Screenshot capture: Captures and downloads current page as PNG
 * - Data management: Admin tools for database operations (coming soon)
 * - Analytics: User and name statistics (coming soon)
 */
const AdminMenu: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // List crawler hook
  const { startCrawler, isRunning, status, latestReport } = useListCrawler();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // SECURITY: Early return if not admin
  if (!isAdmin || !user) {
    return null;
  }

  /**
   * Handle screenshot capture
   */
  const handleScreenshot = async () => {
    setIsCapturingScreenshot(true);
    setIsOpen(false); // Close menu before capturing

    try {
      console.log('[ADMIN] Screenshot capture initiated');

      // Wait a brief moment for menu to close
      await new Promise(resolve => setTimeout(resolve, 150));

      const result = await captureScreenshotWithFeedback();

      if (result.success) {
        showToast(`Screenshot saved: ${result.filename}`, 'success');
        console.log(`[ADMIN] Screenshot saved successfully: ${result.filename}`);
      } else {
        showToast(`Screenshot failed: ${result.error}`, 'error');
        console.error('[ADMIN] Screenshot failed:', result.error);
      }
    } catch (error) {
      showToast('Screenshot failed: Unexpected error', 'error');
      console.error('[ADMIN] Screenshot error:', error);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  /**
   * Handle list crawler start
   */
  const handleStartCrawler = async () => {
    setIsOpen(false);

    try {
      console.log('[ADMIN] List crawler start initiated');
      showToast('Starting list crawler...', 'info');

      const report = await startCrawler();

      showToast(
        `Crawler complete! Added ${report.namesAdded} names, enriched ${report.namesEnriched}`,
        'success'
      );
      console.log('[ADMIN] List crawler completed:', report);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Crawler failed: ${errorMsg}`, 'error');
      console.error('[ADMIN] Crawler error:', error);
    }
  };

  const menuItems: AdminMenuItem[] = [
    {
      icon: Map,
      label: 'Site Map',
      description: 'View all app pages',
      onClick: () => {
        console.log('[ADMIN] Site Map clicked');
        navigate('/sitemap');
        setIsOpen(false);
      }
    },
    {
      icon: Edit3,
      label: 'Blog Post Editor',
      description: 'Edit blog posts with AI',
      onClick: () => {
        console.log('[ADMIN] Blog Post Editor clicked');
        setShowBlogEditor(true);
        setIsOpen(false);
      }
    },
    {
      icon: RefreshCw,
      label: isRunning ? 'Crawler Running...' : 'Run List Crawler',
      description: isRunning
        ? `${status.progress}% - ${status.currentList}`
        : latestReport
        ? `Last: ${latestReport.namesAdded} names added`
        : 'Curate themed lists',
      onClick: handleStartCrawler,
      loading: isRunning,
    },
    {
      icon: Camera,
      label: 'Take Screenshot',
      description: 'Capture current page',
      onClick: handleScreenshot,
      loading: isCapturingScreenshot,
    },
    {
      icon: Bug,
      label: 'Database Viewer',
      description: 'View debug & storage info',
      onClick: () => {
        console.log('[ADMIN] Database Viewer clicked');
        setShowDebugModal(true);
        setIsOpen(false);
      }
    },
    {
      icon: Database,
      label: 'Data Management',
      description: 'Manage names database',
      onClick: () => {
        console.log('[ADMIN] Data Management clicked');
        // TODO: Navigate to admin data management page
        alert('Admin Data Management - Coming Soon');
        setIsOpen(false);
      }
    },
    {
      icon: Users,
      label: 'User Analytics',
      description: 'View user statistics',
      onClick: () => {
        console.log('[ADMIN] User Analytics clicked');
        // TODO: Navigate to admin analytics page
        alert('Admin User Analytics - Coming Soon');
        setIsOpen(false);
      }
    },
    {
      icon: BarChart3,
      label: 'Popular Names',
      description: 'View trending names',
      onClick: () => {
        console.log('[ADMIN] Popular Names clicked');
        // TODO: Navigate to admin popular names page
        alert('Admin Popular Names Report - Coming Soon');
        setIsOpen(false);
      }
    },
    {
      icon: FileText,
      label: 'System Logs',
      description: 'View application logs',
      onClick: () => {
        console.log('[ADMIN] System Logs clicked');
        // TODO: Navigate to admin logs page
        alert('Admin System Logs - Coming Soon');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Admin configuration',
      onClick: () => {
        console.log('[ADMIN] Settings clicked');
        // TODO: Navigate to admin settings page
        alert('Admin Settings - Coming Soon');
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Admin Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xs font-semibold rounded-full shadow-sm hover:shadow-md transition-all"
          title="Admin Menu"
        >
          <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="hidden sm:inline">Admin</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">Admin Panel</h3>
                  <p className="text-[10px] text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-yellow-800 leading-tight">
                  Admin actions are logged and require backend authorization
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isLoading = item.loading || false;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 flex items-start gap-3 transition-colors text-left group ${
                      isLoading
                        ? 'bg-purple-50 cursor-wait opacity-70'
                        : 'hover:bg-purple-50 cursor-pointer'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        isLoading
                          ? 'text-purple-500 animate-pulse'
                          : 'text-gray-500 group-hover:text-purple-600'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          isLoading
                            ? 'text-purple-600'
                            : 'text-gray-900 group-hover:text-purple-600'
                        }`}
                      >
                        {isLoading ? 'Capturing...' : item.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-[10px] text-gray-500 text-center">
                All admin actions are monitored for security
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Database Viewer Modal - Lazy Loaded */}
      {showDebugModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDebugModal(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-6xl max-h-[90vh] mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bug className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Database Viewer</h2>
                  <p className="text-sm text-purple-100">Debug & Storage Information</p>
                </div>
              </div>
              <button
                onClick={() => setShowDebugModal(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>

            {/* Lazy Loaded Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-600">Loading database viewer...</p>
                    </div>
                  </div>
                }
              >
                <DebugPageContent embedded={true} />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Blog Post Editor Modal - Lazy Loaded */}
      {showBlogEditor && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-lg font-medium">Loading Blog Editor...</p>
              </div>
            </div>
          }
        >
          <BlogPostEditor onClose={() => setShowBlogEditor(false)} />
        </Suspense>
      )}
    </>
  );
};

export default AdminMenu;
