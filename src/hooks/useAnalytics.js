import { useState, useEffect, useCallback } from 'react';

const ANALYTICS_KEY = 'nutriar_analytics_v1';

const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded, attempting to clear old data');
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('Failed to save to localStorage even after clearing:', retryError);
        return false;
      }
    }
    console.error('Failed to save to localStorage:', e);
    return false;
  }
};

export const useAnalytics = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    apiSuccess: 0,
    apiFail: 0,
    averageHealthScore: 0,
    offlineScans: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem(ANALYTICS_KEY);
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse analytics data', e);
      }
    }
  }, []);

  const trackScan = useCallback((score, source, isOffline) => {
    setStats(prev => {
      const newStats = {
        totalScans: prev.totalScans + 1,
        apiSuccess: source === 'api' ? prev.apiSuccess + 1 : prev.apiSuccess,
        apiFail: source === 'fail' ? prev.apiFail + 1 : prev.apiFail,
        offlineScans: isOffline ? prev.offlineScans + 1 : prev.offlineScans,
        averageHealthScore: Math.round(((prev.averageHealthScore * prev.totalScans) + score) / (prev.totalScans + 1))
      };
      safeLocalStorageSet(ANALYTICS_KEY, newStats);
      return newStats;
    });
  }, []);

  return { stats, trackScan };
};
