import { useState, useEffect, useCallback } from 'react';

const ANALYTICS_KEY = 'nutriar_analytics_v1';

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
    if (saved) setStats(JSON.parse(saved));
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
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  return { stats, trackScan };
};
