import React, { useState, useCallback } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import ProductSheet from './components/ProductSheet';
import ErrorBoundary from './components/ErrorBoundary';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { products } from './data/products';

function AppContent() {
  const [detectedBarcode, setDetectedBarcode] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleDetected = useCallback((barcode) => {
    console.log('Barcode detected:', barcode);
    setDetectedBarcode(barcode);
    
    // Lookup product
    const product = products[barcode];
    setActiveProduct(product || null);
    
    // Lock scanner and open sheet
    setScannerEnabled(false);
    setIsSheetOpen(true);
  }, []);

  const { isInitializing, error } = useBarcodeScanner({
    onDetected: handleDetected,
    scannerEnabled: scannerEnabled,
  });

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    // Add a small delay before re-enabling the scanner to prevent immediate re-scan
    setTimeout(() => {
      setScannerEnabled(true);
      setDetectedBarcode(null);
      setActiveProduct(null);
    }, 2000);
  }, []);

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-black text-on-surface flex flex-col">
      {/* Top Navbar */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 pt-8 pb-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">nutrition</span>
            <h1 className="text-3xl font-headline font-bold text-white tracking-tight">NutriAR</h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Scan. Know. Eat Better.</p>
        </div>
      </header>

      {/* Main Scanner View */}
      <main className="flex-1 relative">
        <BarcodeScanner isInitializing={isInitializing} error={error} />
      </main>

      {/* Product Information Sheet */}
      <ProductSheet 
        product={activeProduct} 
        barcode={detectedBarcode}
        isOpen={isSheetOpen} 
        onClose={handleCloseSheet} 
      />

      {/* Background Blobs for Aesthetic */}
      <div className="terra-bg-blobs opacity-20" />
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
