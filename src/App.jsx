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
  };

  const selectGoal = (goal) => {
    setUserGoal(goal);
    localStorage.setItem(GOAL_KEY, goal);
    setShowGoalPicker(false);
  };

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-background text-on-surface flex flex-col font-body">
      {/* Top Navbar */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 pt-12 pb-16 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex justify-between items-start px-8 pointer-events-none">
        <div className="flex flex-col cursor-pointer pointer-events-auto" onClick={handleLogoTap}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-neon-primary ring-1 ring-primary/30">
               <span className="material-symbols-outlined text-primary text-2xl">nutrition</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold text-white tracking-tight leading-none text-gradient drop-shadow-lg">NutriAR</h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80 mt-1">
                Goal: {userGoal.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          {isOffline && (
            <div className="w-12 h-12 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-center text-error shadow-glass">
              <span className="material-symbols-outlined text-xl">wifi_off</span>
            </div>
          )}
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-primary transition-all hover:bg-white/10 active:scale-90 shadow-glass"
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
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-secondary/20 backdrop-blur-xl rounded-full shadow-neon-secondary border border-secondary/30 flex items-center gap-3 animate-pulse">
            <span className="material-symbols-outlined text-secondary">compare_arrows</span>
            <p className="text-secondary text-xs font-bold uppercase tracking-widest">Scan item to compare</p>
          </div>
        )}

        {/* Daily Progress Dashboard (Over Scanner) */}
        {!isSheetOpen && !isHistoryOpen && !showGoalPicker && (
          <div className="absolute bottom-32 left-0 right-0 z-20 px-8 pointer-events-none">
            <div className="p-6 glass-card rounded-[40px] pointer-events-auto">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Today's Intake</p>
                <span className="badge bg-primary/20 text-primary border-primary/30 badge-sm font-bold shadow-neon-primary">{dailyStats.calories} / 2500 kcal</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Prot', val: dailyStats.protein, max: 100, color: 'primary' },
                  { label: 'Sugar', val: dailyStats.sugar, max: 50, color: 'warning' },
                  { label: 'Fat', val: dailyStats.fat, max: 70, color: 'error' },
                  { label: 'Carb', val: dailyStats.carbs, max: 300, color: 'secondary' }
                ].map(stat => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <div className={`radial-progress text-${stat.color} text-[10px] font-bold drop-shadow-md`} 
                         style={{ "--value": (stat.val/stat.max)*100, "--size": "3rem", "--thickness": "3px" }}>
                      {stat.val}g
                    </div>
                    <span className="text-[8px] font-bold uppercase mt-2 opacity-60 tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diagnostics Modal */}
        {showDiagnostics && (
          <div className="absolute inset-x-8 top-32 z-[100] p-6 glass-card rounded-3xl text-primary font-mono text-[10px]">
             <h3 className="text-primary font-bold mb-4 uppercase tracking-widest border-b border-primary/20 pb-2">Scanner Diagnostics</h3>
             <div className="space-y-3 mt-4">
                {Object.entries(getDiagnosticsReport()).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="opacity-50">{key}:</span>
                    <span className="font-bold text-white drop-shadow-lg">{val}</span>
                  </div>
                ))}
             </div>
             <button onClick={() => setShowDiagnostics(false)} className="btn btn-ghost btn-xs w-full mt-6 text-error">Close Diagnostics</button>
          </div>
        )}
      </main>

      {/* Goal Picker (Onboarding) */}
      {showGoalPicker && (
        <div className="absolute inset-0 z-[200] bg-background/95 backdrop-blur-3xl flex flex-col p-10 animate-fade-in">
          <h2 className="text-5xl font-headline font-black text-white mt-12 mb-4 leading-tight text-gradient">Define Your<br/>Journey.</h2>
          <p className="text-on-surface-variant text-lg mb-12">NutriAR will adapt its intelligence to your health goals.</p>
          
          <div className="grid gap-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {[
              { id: 'weight-loss', icon: 'weight', title: 'Weight Loss', desc: 'Prioritize low calorie & low sugar' },
              { id: 'muscle-gain', icon: 'fitness_center', title: 'Muscle Gain', desc: 'Focus on high protein intake' },
              { id: 'balanced', icon: 'balance', title: 'Balanced Diet', desc: 'General health & wellness' },
              { id: 'low-sugar', icon: 'water_drop', title: 'Low Sugar', desc: 'Reduce glycemic load' }
            ].map(goal => (
              <button 
                key={goal.id} 
                onClick={() => selectGoal(goal.id)}
                className="p-6 rounded-[32px] glass-panel flex items-center gap-5 text-left transition-all hover:bg-primary/5 hover:border-primary/30 hover:shadow-neon-primary active:scale-95 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-3xl">{goal.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{goal.title}</h3>
                  <p className="text-xs text-on-surface-variant group-hover:text-primary/70">{goal.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History Drawer */}
      {isHistoryOpen && (
        <div className="absolute inset-0 z-[120] flex flex-col animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsHistoryOpen(false)} />
          <div className="relative mt-auto bg-surface-container rounded-t-[40px] h-[85vh] flex flex-col border-t border-white/5 animate-slide-up shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-2" />
            <div className="p-8 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-headline font-bold text-white">Timeline</h2>
                <button onClick={() => setShowGoalPicker(true)} className="text-[10px] font-bold text-primary uppercase mt-2 tracking-widest hover:underline">
                  Change Goal: {userGoal.replace('-', ' ')}
                </button>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="btn btn-circle btn-ghost text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                  <span className="material-symbols-outlined text-7xl mb-4">history_toggle_off</span>
                  <p className="font-bold text-sm uppercase tracking-[0.2em]">No Timeline Data</p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.barcode} className="flex items-center gap-4 p-4 rounded-3xl bg-surface-container-high border border-white/5 hover:border-primary/30 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center">
                       <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors">qr_code_scanner</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white leading-tight">{item.name}</p>
                      <p className="text-[10px] opacity-50 uppercase mt-0.5 tracking-wider">{item.brand}</p>
                    </div>
                    <button onClick={() => removeFromHistory(item.barcode)} className="w-10 h-10 rounded-full bg-error/10 text-error opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                ))
              )}
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
      <div className="neon-bg-blobs" />
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
