import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'nutriar_scan_history_v2';

export const useScanHistory = (limit = 10) => {
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
      const newHistory = [{ ...product, timestamp: Date.now() }, ...filtered].slice(0, limit);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, [limit]);

  const removeFromHistory = useCallback((barcode) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.barcode !== barcode);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return { history, saveToHistory, removeFromHistory, clearHistory };
};
