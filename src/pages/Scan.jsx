import React, { useState, useCallback, useEffect } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductSheet from '../components/ProductSheet';
import ComparisonSheet from '../components/ComparisonSheet';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useScanHistory } from '../hooks/useScanHistory';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { useAnalytics } from '../hooks/useAnalytics';
import { processBarcode } from '../services/productEngine';

const Scan = ({ userGoal }) => {
  const [detectedBarcode, setDetectedBarcode] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState('environment'); // default to rear camera
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [comparisonTarget, setComparisonTarget] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  const { saveToHistory } = useScanHistory(5);
  const { addConsumption } = useDailyNutrition();
  const { trackScan } = useAnalytics();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDetected = useCallback(async (barcode) => {
    if (isSearching || isSheetOpen || isComparing) return;
    if ('vibrate' in navigator) navigator.vibrate(50);
    
    setDetectedBarcode(barcode);
    setScannerEnabled(false);
    setIsSearching(true);
    
    const product = await processBarcode(barcode, userGoal, { useWebFallback: false });
    
    if (product) {
      setActiveProduct(product);
      saveToHistory(product);
      addConsumption(product);
      trackScan(product.healthScore, product.source, isOffline);
      
      if (comparisonTarget) {
        setIsComparing(true);
      } else {
        setIsSheetOpen(true);
      }
    } else {
      setActiveProduct(null);
      setIsSheetOpen(true);
    }
    
    setIsSearching(false);
  }, [saveToHistory, addConsumption, trackScan, isSearching, isSheetOpen, isComparing, isOffline, comparisonTarget, userGoal]);

  const handleWebSearch = useCallback(async () => {
    if (!detectedBarcode || isSearchingWeb) return;
    setIsSearchingWeb(true);
    const product = await processBarcode(detectedBarcode, userGoal, { useWebFallback: true });
    if (product) {
      setActiveProduct(product);
      saveToHistory(product);
      addConsumption(product);
      trackScan(product.healthScore, product.source, isOffline);
    }
    setIsSearchingWeb(false);
  }, [detectedBarcode, isSearchingWeb, userGoal, saveToHistory, addConsumption, trackScan, isOffline]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const { isInitializing, error } = useBarcodeScanner({
    onDetected: handleDetected,
    scannerEnabled: scannerEnabled,
    facingMode: facingMode
  });

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    setIsComparing(false);
    setComparisonTarget(null);
    setScannerEnabled(true);
    setDetectedBarcode(null);
    setActiveProduct(null);
    setIsSearchingWeb(false);
  }, []);

  const startComparison = (product) => {
    setComparisonTarget(product);
    setIsSheetOpen(false);
    setScannerEnabled(true);
  };

  return (
    <div className="flex-1 relative flex flex-col bg-black">
      <BarcodeScanner 
        isInitializing={isInitializing} 
        error={error} 
        isSearching={isSearching}
        detectedBarcode={detectedBarcode}
      />

      {/* Floating Camera Toggle */}
      <div className="absolute top-12 right-6 z-40 flex flex-col gap-4">
        <button 
          onClick={toggleCamera}
          className="w-12 h-12 rounded-full glass-panel border border-white/10 flex items-center justify-center text-white/70 hover:text-primary transition-colors shadow-2xl"
        >
          <span className="material-symbols-outlined">{facingMode === 'environment' ? 'flip_camera_ios' : 'camera_front'}</span>
        </button>
      </div>

      {/* Comparison Mode Indicator */}
      {comparisonTarget && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-secondary/20 backdrop-blur-xl rounded-full shadow-neon-secondary border border-secondary/30 flex items-center gap-3 animate-pulse">
          <span className="material-symbols-outlined text-secondary">compare_arrows</span>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest">Scan item to compare</p>
        </div>
      )}

      {/* Product Information Sheet */}
      <ProductSheet 
        product={activeProduct} 
        barcode={detectedBarcode}
        isOpen={isSheetOpen} 
        onClose={handleCloseSheet}
        onCompare={startComparison}
        userGoal={userGoal}
        isSearchingWeb={isSearchingWeb}
        onWebSearch={handleWebSearch}
      />

      {/* Comparison Sheet */}
      <ComparisonSheet 
        productA={comparisonTarget}
        productB={activeProduct}
        isOpen={isComparing}
        onClose={handleCloseSheet}
      />
    </div>
  );
};

export default Scan;
