import React, { useState, useCallback, useEffect } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import ProductSheet from './components/ProductSheet';
import ErrorBoundary from './components/ErrorBoundary';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { products } from './data/products';
import { fetchProductFromOFF } from './services/foodApi';

const HISTORY_KEY = 'nutriar_scan_history_v1';

function AppContent() {
  const [detectedBarcode, setDetectedBarcode] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setScanHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const addToHistory = useCallback((product, barcode) => {
    setScanHistory(prev => {
      // Remove if already exists (to move to top)
      const filtered = prev.filter(item => item.barcode !== barcode);
      const newHistory = [{ 
        barcode, 
        name: product.name, 
        timestamp: Date.now(),
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
        ingredients: product.ingredients,
        healthNote: product.healthNote,
        source: product.source
      }, ...filtered].slice(0, 20); // Keep last 20
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const handleDetected = useCallback(async (barcode) => {
    if (isSearching) return;
    
    console.log('Barcode detected:', barcode);
    setDetectedBarcode(barcode);
    setScannerEnabled(false);
    setIsSearching(true);
    
    // 1. Try local dataset
    let product = products[barcode];
    
    // 2. Try Open Food Facts API if not found locally
    if (!product) {
      console.log('Not found in local dataset, trying API...');
      product = await fetchProductFromOFF(barcode);
    }
    
    if (product) {
      setActiveProduct(product);
      addToHistory(product, barcode);
    } else {
      setActiveProduct(null);
    }
    
    setIsSearching(false);
    setIsSheetOpen(true);
  }, [addToHistory, isSearching]);

  const { isInitializing, error } = useBarcodeScanner({
    onDetected: handleDetected,
    scannerEnabled: scannerEnabled && !isHistoryOpen,
  });

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setScannerEnabled(true);
      setDetectedBarcode(null);
      setActiveProduct(null);
    }, 1500);
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
      <header className="absolute top-0 left-0 right-0 z-50 p-6 pt-10 pb-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex justify-between items-center px-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
               <span className="material-symbols-outlined text-white text-xl">nutrition</span>
            </div>
            <h1 className="text-2xl font-headline font-bold text-white tracking-tight">NutriAR</h1>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary mt-1 opacity-80">Intelligent Assistant</p>
        </div>

        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white/20 active:scale-90 pointer-events-auto"
        >
          <span className="material-symbols-outlined">history</span>
        </button>
      </header>

      {/* Main Scanner View */}
      <main className="flex-1 relative">
        <BarcodeScanner isInitializing={isInitializing} error={error} />
        
        {isSearching && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
             <div className="w-20 h-20 relative">
                <span className="loading loading-ring loading-lg text-primary w-full h-full"></span>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="material-symbols-outlined text-white text-xl animate-bounce">search</span>
                </div>
             </div>
             <p className="mt-4 text-white font-bold tracking-widest text-[10px] uppercase">Searching Database...</p>
          </div>
        )}
      </main>

      {/* History Drawer */}
      {isHistoryOpen && (
        <div className="absolute inset-0 z-[60] flex flex-col animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsHistoryOpen(false)} />
          <div className="relative mt-auto bg-surface-container-lowest rounded-t-[40px] h-[80vh] flex flex-col border-t border-outline-variant/30 animate-slide-up overflow-hidden">
            <div className="p-8 flex justify-between items-center border-b border-outline-variant/10">
              <div>
                <h2 className="text-3xl font-headline font-bold text-on-surface">History</h2>
                <p className="text-xs text-on-surface-variant mt-1">Your last {scanHistory.length} scans</p>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="btn btn-circle btn-ghost"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {scanHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                  <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
                  <p className="font-bold text-sm uppercase tracking-widest">No recent scans</p>
                  <p className="text-xs mt-2 normal-case">Scan a product to see it here.</p>
                </div>
              ) : (
                scanHistory.map((item, idx) => (
                  <button 
                    key={`${item.barcode}-${idx}`}
                    onClick={() => openFromHistory(item)}
                    className="w-full flex items-center gap-4 p-4 rounded-3xl bg-surface-container-low border border-outline-variant/10 transition-all hover:bg-surface-container-high active:scale-[0.98] text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                       <span className="material-symbols-outlined text-2xl">barcode</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface truncate">{item.name}</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{item.barcode}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <span className="text-[10px] text-on-surface-variant font-bold uppercase">{new Date(item.timestamp).toLocaleDateString()}</span>
                       <span className="text-xs font-bold text-primary">{item.calories} kcal</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="p-8 pt-0">
               <button 
                 onClick={() => { localStorage.removeItem(HISTORY_KEY); setScanHistory([]); }}
                 className="btn btn-ghost btn-block text-error text-xs font-bold uppercase tracking-widest"
                 disabled={scanHistory.length === 0}
               >
                 Clear History
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
