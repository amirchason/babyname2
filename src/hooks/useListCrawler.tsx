/**
 * useListCrawler Hook
 * React hook for managing list crawler lifecycle and state
 */

import { useState, useEffect, useCallback } from 'react';
import listCrawlerManager, { CrawlerStatus, CrawlerReport, CrawlerConfig } from '../services/listCrawlerManager';

export const useListCrawler = () => {
  const [status, setStatus] = useState<CrawlerStatus>(listCrawlerManager.getStatus());
  const [config, setConfig] = useState<CrawlerConfig>(listCrawlerManager.getConfig());
  const [latestReport, setLatestReport] = useState<CrawlerReport | null>(listCrawlerManager.getLatestReport());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize crawler on mount
   */
  useEffect(() => {
    const init = async () => {
      try {
        await listCrawlerManager.initialize();
        setIsInitialized(true);

        // Check if should auto-run
        if (listCrawlerManager.shouldAutoRun()) {
          console.log('🤖 Auto-starting list crawler...');
          // Call manager directly to avoid hook dependency
          try {
            const report = await listCrawlerManager.start();
            setLatestReport(report);
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Auto-start failed';
            setError(errorMsg);
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to initialize crawler';
        setError(errorMsg);
        console.error('Crawler initialization error:', err);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /**
   * Set up callbacks
   */
  useEffect(() => {
    listCrawlerManager.setProgressCallback((newStatus) => {
      setStatus(newStatus);
    });

    listCrawlerManager.setCompletionCallback((report) => {
      setLatestReport(report);
      setStatus(listCrawlerManager.getStatus());
    });
  }, []);

  /**
   * Start crawler
   */
  const startCrawler = useCallback(async () => {
    try {
      setError(null);
      const report = await listCrawlerManager.start();
      setLatestReport(report);
      return report;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Crawler failed';
      setError(errorMsg);
      throw err;
    }
  }, []);

  /**
   * Stop crawler
   */
  const stopCrawler = useCallback(() => {
    listCrawlerManager.stop();
    setStatus(listCrawlerManager.getStatus());
  }, []);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((newConfig: Partial<CrawlerConfig>) => {
    listCrawlerManager.updateConfig(newConfig);
    setConfig(listCrawlerManager.getConfig());
  }, []);

  /**
   * Get all reports
   */
  const getAllReports = useCallback(() => {
    return listCrawlerManager.getReports();
  }, []);

  /**
   * Clear reports
   */
  const clearReports = useCallback(() => {
    listCrawlerManager.clearReports();
    setLatestReport(null);
  }, []);

  /**
   * Get time since last run
   */
  const getTimeSinceLastRun = useCallback(() => {
    return listCrawlerManager.getTimeSinceLastRun();
  }, []);

  return {
    // State
    status,
    config,
    latestReport,
    isInitialized,
    error,

    // Actions
    startCrawler,
    stopCrawler,
    updateConfig,
    getAllReports,
    clearReports,
    getTimeSinceLastRun,

    // Computed
    isRunning: status.isRunning,
    progress: status.progress,
    canStart: isInitialized && !status.isRunning,
  };
};
