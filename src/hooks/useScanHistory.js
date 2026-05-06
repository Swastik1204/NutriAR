import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'nutriar_scan_history_v3';

const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded, attempting to clear old data');
      // Try to clear old history to make space
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

export const useScanHistory = (limit = 5) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveToHistory = useCallback((product) => {
    setHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item.barcode !== product.barcode);
      const newHistory = [
        { 
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          calories: product.calories,
          healthScore: product.healthScore,
          confidence: product.confidence,
          timestamp: Date.now() 
        }, 
        ...filtered
      ].slice(0, limit);
      
      safeLocalStorageSet(HISTORY_KEY, newHistory);
      return newHistory;
    });
  }, [limit]);

  const removeFromHistory = useCallback((barcode) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.barcode !== barcode);
      safeLocalStorageSet(HISTORY_KEY, newHistory);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history from localStorage:', e);
    }
  }, []);

  return { history, saveToHistory, removeFromHistory, clearHistory };
};
