import React, { useState, useCallback, useEffect, useRef } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import ProductSheet from './components/ProductSheet';
import ComparisonSheet from './components/ComparisonSheet';
import ErrorBoundary from './components/ErrorBoundary';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { useScanHistory } from './hooks/useScanHistory';
import { useDailyNutrition } from './hooks/useDailyNutrition';
import { useAnalytics } from './hooks/useAnalytics';
import { products } from './data/products';
import { fetchProductFromOFF } from './services/foodApi';
import { getDiagnosticsReport, startScanTimer, recordScanSuccess, recordScanFail } from './utils/scannerDiagnostics';

const GOAL_KEY = 'nutriar_user_goal_v1';

function AppContent() {
  const [detectedBarcode, setDetectedBarcode] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // New States
  const [userGoal, setUserGoal] = useState(localStorage.getItem(GOAL_KEY) || 'balanced');
  const [showGoalPicker, setShowGoalPicker] = useState(!localStorage.getItem(GOAL_KEY));
  const [comparisonTarget, setComparisonTarget] = useState(null); // Product A for comparison
  const [isComparing, setIsComparing] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const logoTapCount = useRef(0);

  const { history, saveToHistory, removeFromHistory, clearHistory } = useScanHistory(15);
  const { dailyStats, addConsumption } = useDailyNutrition();
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

  const handleLogoTap = () => {
    logoTapCount.current++;
    if (logoTapCount.current >= 5) {
      setShowDiagnostics(prev => !prev);
      logoTapCount.current = 0;
    }
    setTimeout(() => { logoTapCount.current = 0; }, 2000);
  };

  const handleDetected = useCallback(async (barcode) => {
    if (isSearching || isSheetOpen || isComparing) return;
    
    startScanTimer();
    setDetectedBarcode(barcode);
    setScannerEnabled(false);
    setIsSearching(true);
    
    let product = products[barcode];
    let source = 'local';
    
    if (!product && !isOffline) {
      product = await fetchProductFromOFF(barcode);
      source = product ? 'api' : 'fail';
    }
    
    if (product) {
      recordScanSuccess();
      setActiveProduct(product);
      saveToHistory(product);
      addConsumption(product);
      trackScan(product.healthScore || 50, source, isOffline);
      
      if (comparisonTarget) {
        setIsComparing(true);
      } else {
        setIsSheetOpen(true);
      }
    } else {
      recordScanFail();
      setActiveProduct(null);
      setIsSheetOpen(true);
    }
    
    setIsSearching(false);
  }, [saveToHistory, addConsumption, trackScan, isSearching, isSheetOpen, isComparing, isOffline, comparisonTarget]);

  const { isInitializing, error } = useBarcodeScanner({
    onDetected: handleDetected,
    scannerEnabled: scannerEnabled && !isHistoryOpen && !showGoalPicker,
  });

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    setIsComparing(false);
    setComparisonTarget(null);
    setScannerEnabled(true);
    setDetectedBarcode(null);
    setActiveProduct(null);
  }, []);

  const startComparison = (product) => {
    setComparisonTarget(product);
    setIsSheetOpen(false);
    setScannerEnabled(true);
    // UI Notification for comparison mode would be nice here
  };

  const selectGoal = (goal) => {
    setUserGoal(goal);
    localStorage.setItem(GOAL_KEY, goal);
    setShowGoalPicker(false);
  };

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-black text-on-surface flex flex-col font-body">
      {/* Top Navbar */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 pt-12 pb-16 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex justify-between items-start px-8">
        <div className="flex flex-col cursor-pointer" onClick={handleLogoTap}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 ring-4 ring-white/10">
               <span className="material-symbols-outlined text-white text-2xl">nutrition</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold text-white tracking-tight leading-none">NutriAR</h1>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-primary mt-1 opacity-80">
                Goal: {userGoal.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isOffline && (
            <div className="w-10 h-10 rounded-2xl bg-error/20 backdrop-blur-xl border border-error/30 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-xl">wifi_off</span>
            </div>
          )}
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white/20 active:scale-90 pointer-events-auto"
          >
            <span className="material-symbols-outlined">history</span>
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 relative">
        <BarcodeScanner 
          isInitializing={isInitializing} 
          error={error} 
          isSearching={isSearching}
          detectedBarcode={detectedBarcode}
        />

        {/* Comparison Mode Indicator */}
        {comparisonTarget && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-primary/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined text-white">compare_arrows</span>
            <p className="text-white text-xs font-bold uppercase tracking-widest">Scan item to compare</p>
          </div>
        )}

        {/* Daily Progress Dashboard (Over Scanner) */}
        {!isSheetOpen && !isHistoryOpen && !showGoalPicker && (
          <div className="absolute bottom-32 left-0 right-0 z-20 px-8 pointer-events-none">
            <div className="p-6 bg-surface-container-lowest/80 backdrop-blur-2xl rounded-[40px] border border-outline-variant/20 shadow-terra-lg pointer-events-auto">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Today's Intake</p>
                <span className="badge badge-primary badge-sm font-bold">{dailyStats.calories} / 2500 kcal</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Prot', val: dailyStats.protein, max: 100, color: 'primary' },
                  { label: 'Sugar', val: dailyStats.sugar, max: 50, color: 'warning' },
                  { label: 'Fat', val: dailyStats.fat, max: 70, color: 'error' },
                  { label: 'Carb', val: dailyStats.carbs, max: 300, color: 'info' }
                ].map(stat => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <div className={`radial-progress text-${stat.color} text-[10px] font-bold`} 
                         style={{ "--value": (stat.val/stat.max)*100, "--size": "3rem", "--thickness": "3px" }}>
                      {stat.val}g
                    </div>
                    <span className="text-[8px] font-bold uppercase mt-1 opacity-50">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diagnostics Modal */}
        {showDiagnostics && (
          <div className="absolute inset-x-8 top-32 z-[100] p-6 bg-black/90 backdrop-blur-3xl rounded-3xl border border-white/10 text-white font-mono text-[10px]">
             <h3 className="text-primary font-bold mb-4 uppercase tracking-widest">Scanner Diagnostics</h3>
             <div className="space-y-2">
                {Object.entries(getDiagnosticsReport()).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="opacity-50">{key}:</span>
                    <span>{val}</span>
                  </div>
                ))}
             </div>
             <button onClick={() => setShowDiagnostics(false)} className="btn btn-ghost btn-xs w-full mt-4 text-primary">Close</button>
          </div>
        )}
      </main>

      {/* Goal Picker (Onboarding) */}
      {showGoalPicker && (
        <div className="absolute inset-0 z-[200] bg-surface-container-lowest flex flex-col p-10 animate-fade-in">
          <h2 className="text-5xl font-headline font-bold text-on-surface mt-12 mb-4 leading-tight">Define Your Journey</h2>
          <p className="text-on-surface-variant text-lg mb-12">NutriAR will adapt its intelligence to your health goals.</p>
          
          <div className="grid gap-4 flex-1 overflow-y-auto pr-2">
            {[
              { id: 'weight-loss', icon: 'weight', title: 'Weight Loss', desc: 'Prioritize low calorie & low sugar' },
              { id: 'muscle-gain', icon: 'fitness_center', title: 'Muscle Gain', desc: 'Focus on high protein intake' },
              { id: 'balanced', icon: 'balance', title: 'Balanced Diet', desc: 'General health & wellness' },
              { id: 'low-sugar', icon: 'sugar_cane', title: 'Low Sugar', desc: 'Reduce glycemic load' }
            ].map(goal => (
              <button 
                key={goal.id} 
                onClick={() => selectGoal(goal.id)}
                className="p-6 rounded-[32px] bg-surface-container-low border border-outline-variant/20 flex items-center gap-5 text-left transition-all hover:bg-primary/5 active:scale-95"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">{goal.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{goal.title}</h3>
                  <p className="text-xs text-on-surface-variant">{goal.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History Drawer */}
      {isHistoryOpen && (
        <div className="absolute inset-0 z-[120] flex flex-col animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsHistoryOpen(false)} />
          <div className="relative mt-auto bg-surface-container-lowest rounded-t-[40px] h-[85vh] flex flex-col border-t border-outline-variant/30 animate-slide-up">
            <div className="p-8 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-headline font-bold">Timeline</h2>
                <button onClick={() => setShowGoalPicker(true)} className="text-[10px] font-bold text-primary uppercase mt-2">Change Goal: {userGoal}</button>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="btn btn-circle btn-ghost">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* History items mapping here... */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.map(item => (
                <div key={item.barcode} className="flex items-center gap-4 p-4 rounded-3xl bg-surface-container-low border border-outline-variant/10">
                   <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-[10px] opacity-50 uppercase">{item.brand}</p>
                   </div>
                   <button onClick={() => removeFromHistory(item.barcode)} className="text-error opacity-50 hover:opacity-100">
                      <span className="material-symbols-outlined text-xl">delete</span>
                   </button>
                </div>
              ))}
            </div>
          </div>
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
      />

      {/* Comparison Sheet */}
      <ComparisonSheet 
        productA={comparisonTarget}
        productB={activeProduct}
        isOpen={isComparing}
        onClose={handleCloseSheet}
      />

      {/* Aesthetic Blobs */}
      <div className="terra-bg-blobs opacity-10 pointer-events-none" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
