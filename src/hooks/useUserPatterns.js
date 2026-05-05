import { useState, useEffect, useMemo } from 'react';

const PATTERNS_KEY = 'nutriar_user_patterns_v1';

export const useUserPatterns = (history = []) => {
  const [patterns, setPatterns] = useState({
    scanCount: 0,
    healthyRatio: 0,
    peakScanHour: null,
    categories: {}
  });

  useEffect(() => {
    if (history.length === 0) return;

    const hours = history.map(h => new Date(h.timestamp).getHours());
    const hourCounts = hours.reduce((acc, h) => {
      acc[h] = (acc[h] || 0) + 1;
      return acc;
    }, {});
    
    const peakHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b, 0);

    const healthyCount = history.filter(h => h.healthScore >= 70).length;
    const ratio = Math.round((healthyCount / history.length) * 100);

    setPatterns({
      scanCount: history.length,
      healthyRatio: ratio,
      peakScanHour: peakHour,
      categories: {} // Placeholder for category analysis
    });
  }, [history]);

  const behaviorInsights = useMemo(() => {
    const insights = [];
    
    if (patterns.healthyRatio < 40 && patterns.scanCount > 3) {
      insights.push("You're scanning mostly low-scoring items lately.");
    }
    
    if (patterns.peakScanHour >= 21 || patterns.peakScanHour <= 4) {
      insights.push("Late night scanning detected—try to plan meals earlier.");
    }

    if (patterns.healthyRatio > 70) {
      insights.push("Fantastic! Your choices are consistently high-quality.");
    }

    return insights;
  }, [patterns]);

  return { patterns, behaviorInsights };
};
