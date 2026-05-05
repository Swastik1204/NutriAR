import React from 'react';

const BarcodeScanner = ({ isInitializing, error }) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Quagga Target Container */}
      <div id="scanner" className="absolute inset-0 w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />

      {/* Overlay UI */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
        {/* Scanning Frame */}
        <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative overflow-hidden">
          {/* Animated Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(var(--p),0.8)] animate-scan" />
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary rounded-br-lg" />
        </div>

        <p className="mt-6 text-white font-medium tracking-widest uppercase text-sm animate-pulse">
          Scanning...
        </p>
      </div>

      {/* Loading State */}
      {isInitializing && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-opacity">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-white/70 font-medium">Initializing Camera...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-error/90 backdrop-blur-lg p-8 text-center text-white">
          <span className="material-symbols-outlined text-6xl mb-4">no_photography</span>
          <h2 className="text-2xl font-bold mb-2">Camera Access Denied</h2>
          <p className="text-sm opacity-90 max-w-xs">
            Please enable camera permissions in your browser settings to use the barcode scanner.
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
