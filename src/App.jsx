import React, { useState, useCallback, useEffect } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import ProductSheet from './components/ProductSheet';
import ErrorBoundary from './components/ErrorBoundary';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { useScanHistory } from './hooks/useScanHistory';
import { products } from './data/products';
import { fetchProductFromOFF } from './services/foodApi';

function AppContent() {
  const [detectedBarcode, setDetectedBarcode] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const { history, saveToHistory, removeFromHistory, clearHistory } = useScanHistory(15);

  // Monitor online status
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
    if (isSearching || isSheetOpen) return;
    
    console.log('Barcode detected:', barcode);
    setDetectedBarcode(barcode);
    setScannerEnabled(false);
    setIsSearching(true);
    
    // 1. Try local dataset first (instant)
    let product = products[barcode];
    
    // 2. Try Open Food Facts API if not found locally and online
    if (!product && !isOffline) {
      console.log('Not found locally, fetching from API...');
      product = await fetchProductFromOFF(barcode);
    }
    
    if (product) {
      setActiveProduct(product);
      saveToHistory(product);
    } else {
      setActiveProduct(null);
    }
    
    setIsSearching(false);
    setIsSheetOpen(true);
  }, [saveToHistory, isSearching, isSheetOpen, isOffline]);

  const { isInitializing, error } = useBarcodeScanner({
    onDetected: handleDetected,
    scannerEnabled: scannerEnabled && !isHistoryOpen,
  });

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    // Instant re-enable for better feel, but keep barcode ref for UI feedback
    setScannerEnabled(true);
    setDetectedBarcode(null);
    setActiveProduct(null);
  }, []);

  const openFromHistory = useCallback((item) => {
    setDetectedBarcode(item.barcode);
    setActiveProduct(item);
    setIsHistoryOpen(false);
    setScannerEnabled(false);
    setIsSheetOpen(true);
  }, []);

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-black text-on-surface flex flex-col">
      {/* Top Navbar */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 pt-12 pb-16 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex justify-between items-start px-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 ring-4 ring-white/10">
               <span className="material-symbols-outlined text-white text-2xl">nutrition</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold text-white tracking-tight leading-none">NutriAR</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-error animate-pulse' : 'bg-success'}`}></span>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {isOffline ? 'Offline Mode' : 'Engine Online'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white/20 active:scale-90 pointer-events-auto shadow-2xl"
        >
          <span className="material-symbols-outlined">history</span>
        </button>
      </header>

      {/* Main Scanner View */}
      <main className="flex-1 relative">
        <BarcodeScanner 
          isInitializing={isInitializing} 
          error={error} 
          isSearching={isSearching}
          detectedBarcode={detectedBarcode}
        />
        
        {isOffline && !isSheetOpen && !isHistoryOpen && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-error/20 backdrop-blur-md rounded-full border border-error/30 flex items-center gap-2 animate-fade-in">
             <span className="material-symbols-outlined text-error text-sm">wifi_off</span>
             <p className="text-white text-[9px] font-bold uppercase tracking-wider">Limited to offline data</p>
          </div>
        )}
      </main>

      {/* History Drawer */}
      {isHistoryOpen && (
        <div className="absolute inset-0 z-[120] flex flex-col animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsHistoryOpen(false)} />
          <div className="relative mt-auto bg-surface-container-lowest rounded-t-[40px] h-[85vh] flex flex-col border-t border-outline-variant/30 animate-slide-up overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            {/* Drawer Handle */}
            <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mt-4 mb-2" />
            
            <div className="p-8 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-headline font-bold text-on-surface">Timeline</h2>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Recent Insights</p>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                  <span className="material-symbols-outlined text-7xl mb-4">history_toggle_off</span>
                  <p className="font-bold text-sm uppercase tracking-[0.2em]">No Timeline Data</p>
                  <p className="text-xs mt-2 normal-case max-w-[200px]">Scan products to build your personal nutrition history.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.barcode} className="group relative">
                    <button 
                      onClick={() => openFromHistory(item)}
                      className="w-full flex items-center gap-4 p-4 rounded-3xl bg-surface-container-low border border-outline-variant/10 transition-all hover:bg-surface-container-high hover:border-primary/20 active:scale-[0.98] text-left shadow-sm"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-inner overflow-hidden border border-outline-variant/10">
                         <span className="material-symbols-outlined text-primary/40 text-3xl">barcode</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary/60 uppercase tracking-tighter mb-0.5">{item.brand}</p>
                        <p className="font-headline font-bold text-on-surface truncate text-lg leading-tight">{item.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono mt-1 opacity-60">ID: {item.barcode}</p>
                      </div>
                      <div className="text-right flex flex-col items-end pr-8">
                         <span className="text-[10px] text-on-surface-variant font-bold opacity-40 uppercase mb-1">{new Date(item.timestamp).toLocaleDateString()}</span>
                         <span className="badge badge-primary badge-sm font-bold">{item.calories} kcal</span>
                      </div>
                    </button>
                    
                    {/* Delete Individual Item */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromHistory(item.barcode); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-8 pt-4">
               <button 
                 onClick={clearHistory}
                 className="btn btn-ghost btn-block text-error text-xs font-bold uppercase tracking-widest gap-2"
                 disabled={history.length === 0}
               >
                 <span className="material-symbols-outlined text-sm">delete_sweep</span>
                 Purge History
               </button>
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
