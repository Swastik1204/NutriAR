import { useState, useEffect, useCallback, useMemo } from 'react';

const DAILY_KEY = 'nutriar_daily_v2';

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

export const useDailyNutrition = () => {
  const [dailyStats, setDailyStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    items: [],
    date: new Date().toDateString()
  });

  useEffect(() => {
    const saved = localStorage.getItem(DAILY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date !== new Date().toDateString()) {
          const reset = { 
            calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, 
            items: [], date: new Date().toDateString() 
          };
          safeLocalStorageSet(DAILY_KEY, reset);
          setDailyStats(reset);
        } else {
          setDailyStats(parsed);
        }
      } catch (e) {
        console.error('Failed to parse daily nutrition data', e);
      }
    }
  }, []);

  const addConsumption = useCallback((product) => {
    setDailyStats(prev => {
      const newStats = {
        ...prev,
        calories: prev.calories + (product.calories || 0),
        protein: prev.protein + (product.protein || 0),
        carbs: prev.carbs + (product.carbs || 0),
        fat: prev.fat + (product.fat || 0),
        sugar: prev.sugar + (product.sugar || 0),
        items: [...prev.items, { name: product.name, timestamp: Date.now() }]
      };
      safeLocalStorageSet(DAILY_KEY, newStats);
      return newStats;
    });
  }, []);

  const dailyInsights = useMemo(() => {
    const insights = [];
    if (dailyStats.sugar > 25) insights.push("You've exceeded your recommended sugar intake today.");
    if (dailyStats.calories > 2000) insights.push("Approaching daily calorie limit.");
    if (dailyStats.protein < 30 && dailyStats.items.length > 3) insights.push("Protein intake is relatively low today.");
    if (dailyStats.fat > 60) insights.push("High fat intake detected today.");
    
    return insights;
  }, [dailyStats]);

  return { dailyStats, addConsumption, dailyInsights };
};
