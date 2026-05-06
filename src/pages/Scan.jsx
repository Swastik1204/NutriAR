import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useScanHistory } from '../hooks/useScanHistory';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { useAnalytics } from '../hooks/useAnalytics';
import { processBarcode } from '../services/productEngine';

const ProductSheet = lazy(() => import('../components/ProductSheet'));
const ComparisonSheet = lazy(() => import('../components/ComparisonSheet'));

const Scan = ({ userGoal }) => {
  const [detectedBarcode, setDetectedBarcode] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
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
    
    // 1. Haptic / Sound Feedback
    if ('vibrate' in navigator) navigator.vibrate(50);
    
    setDetectedBarcode(barcode);
    setScannerEnabled(false);
    setIsSearching(true);
    
    // 2. Intelligent Product Engine (Local + API only initially)
    const product = await processBarcode(barcode, userGoal, { useWebFallback: false });
    
    if (product) {
      setActiveProduct(product);
      saveToHistory(product);
      addConsumption(product);
      trackScan(product.healthScore, product.source, isOffline);
      
      // 3. Fast Auto-Open
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
    } else {
      // Show error state in ProductSheet (handled natively if product remains null)
    }
    setIsSearchingWeb(false);
  }, [detectedBarcode, isSearchingWeb, userGoal, saveToHistory, addConsumption, trackScan, isOffline]);

  const { 
    isInitializing, 
    error, 
    devices, 
    currentDeviceIndex, 
    switchCamera 
  } = useBarcodeScanner({
    onDetected: handleDetected,
    scannerEnabled: scannerEnabled,
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
        devices={devices}
        currentDeviceIndex={currentDeviceIndex}
        onSwitchCamera={switchCamera}
      />

      {/* Comparison Mode Indicator */}
      {comparisonTarget && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-secondary/20 backdrop-blur-xl rounded-full shadow-neon-secondary border border-secondary/30 flex items-center gap-3 animate-pulse">
          <span className="material-symbols-outlined text-secondary">compare_arrows</span>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest">Scan item to compare</p>
        </div>
      )}

      {/* Product Information Sheet */}
      <Suspense fallback={null}>
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
      </Suspense>

      {/* Comparison Sheet */}
      <Suspense fallback={null}>
        <ComparisonSheet 
          productA={comparisonTarget}
          productB={activeProduct}
          isOpen={isComparing}
          onClose={handleCloseSheet}
        />
      </Suspense>
    </div>
  );
};

export default Scan;
