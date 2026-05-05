import { useState, useEffect, useCallback, useMemo } from 'react';

const DAILY_KEY = 'nutriar_daily_v2';

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
      const parsed = JSON.parse(saved);
      if (parsed.date !== new Date().toDateString()) {
        const reset = { 
          calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, 
          items: [], date: new Date().toDateString() 
        };
        localStorage.setItem(DAILY_KEY, JSON.stringify(reset));
        setDailyStats(reset);
      } else {
        setDailyStats(parsed);
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
      localStorage.setItem(DAILY_KEY, JSON.stringify(newStats));
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
