import html2canvas from 'html2canvas';

/**
 * Screenshot Utility
 * Provides functions for capturing and downloading screenshots of the app
 *
 * ADMIN-ONLY: This utility should only be used by admin users
 */

/**
 * Map of routes to human-readable page names
 */
const PAGE_NAME_MAP: Record<string, string> = {
  '/': 'Home',
  '/names': 'NameList',
  '/favorites': 'Favorites',
  '/dislikes': 'Dislikes',
  '/debug': 'Debug',
  '/swipe': 'SwipeMode',
};

/**
 * Get the current page name from the URL pathname
 */
export const getCurrentPageName = (): string => {
  const pathname = window.location.pathname;
  // Remove basename if present
  const cleanPath = pathname.replace('/babyname2', '') || '/';
  return PAGE_NAME_MAP[cleanPath] || 'Unknown';
};

/**
 * Generate a filename for the screenshot
 * Format: SoulSeed_PageName_YYYYMMDD_HHMMSS.png
 */
export const generateScreenshotFilename = (): string => {
  const pageName = getCurrentPageName();
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const dateStr = `${year}${month}${day}_${hours}${minutes}${seconds}`;

  return `SoulSeed_${pageName}_${dateStr}.png`;
};

/**
 * Download a blob as a file
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Capture a screenshot of the current page
 *
 * @param element - The element to capture (defaults to document.body)
 * @returns Promise<{ success: boolean; filename?: string; error?: string }>
 */
export const captureScreenshot = async (
  element: HTMLElement = document.body
): Promise<{ success: boolean; filename?: string; error?: string }> => {
  try {
    console.log('[Screenshot] Starting capture...');

    // Capture the screenshot using html2canvas
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality (2x resolution)
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    console.log('[Screenshot] Canvas created successfully');

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    });

    console.log('[Screenshot] Blob created successfully');

    // Generate filename and download
    const filename = generateScreenshotFilename();
    downloadBlob(blob, filename);

    console.log(`[Screenshot] Downloaded successfully as ${filename}`);

    return { success: true, filename };
  } catch (error) {
    console.error('[Screenshot] Error capturing screenshot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Capture screenshot with visual feedback
 * Shows a flash effect during capture
 */
export const captureScreenshotWithFeedback = async (
  element: HTMLElement = document.body
): Promise<{ success: boolean; filename?: string; error?: string }> => {
  // Create flash overlay for visual feedback
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    opacity: 0;
    pointer-events: none;
    z-index: 999999;
    transition: opacity 0.15s ease-out;
  `;
  document.body.appendChild(flash);

  // Trigger flash animation
  requestAnimationFrame(() => {
    flash.style.opacity = '0.7';
    setTimeout(() => {
      flash.style.opacity = '0';
    }, 100);
  });

  // Capture screenshot
  const result = await captureScreenshot(element);

  // Remove flash overlay after animation
  setTimeout(() => {
    document.body.removeChild(flash);
  }, 300);

  return result;
};

export default {
  captureScreenshot,
  captureScreenshotWithFeedback,
  getCurrentPageName,
  generateScreenshotFilename,
};
