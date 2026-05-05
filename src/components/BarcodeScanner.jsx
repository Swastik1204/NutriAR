import React, { useState, useEffect } from 'react';
import Quagga from '@ericblade/quagga2';

const BarcodeScanner = ({ isInitializing, error, isSearching, detectedBarcode }) => {
  const [torchOn, setTorchOn] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (detectedBarcode) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [detectedBarcode]);

  const toggleTorch = async () => {
    const track = Quagga.CameraAccess.getActiveTrack();
    if (track && typeof track.getCapabilities === 'function') {
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } else {
        alert('Torch not supported on this device.');
      }
    }
  };

  const getStatusMessage = () => {
    if (isSearching) return "Detecting Product...";
    if (detectedBarcode) return "Product Found!";
    return "Align barcode in frame";
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Quagga Target Container */}
      <div id="scanner" className="absolute inset-0 w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />

      {/* Detection Flash Overlay */}
      {showFlash && <div className="absolute inset-0 bg-white/40 z-40 pointer-events-none animate-fade-out" />}

      {/* Overlay UI */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between pointer-events-none p-8 py-12">
        {/* Top Status */}
        <div className={`transition-all duration-300 px-6 py-3 rounded-full border flex items-center gap-2 glass-panel shadow-glass ${
          detectedBarcode ? 'border-success text-success shadow-neon-tertiary' : 'border-primary/30 text-primary shadow-neon-primary'
        }`}>
          <span className={`material-symbols-outlined text-lg ${!detectedBarcode && 'animate-pulse'}`}>
            {isSearching ? 'database' : detectedBarcode ? 'check_circle' : 'center_focus_strong'}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{getStatusMessage()}</p>
        </div>

        {/* Scanning Frame */}
        <div className={`transition-all duration-500 w-64 h-64 border-2 rounded-[40px] relative overflow-hidden flex items-center justify-center ${
          detectedBarcode ? 'border-success scale-105 shadow-neon-tertiary' : 'border-primary/40 animate-scan-glow'
        }`}>
          {/* Animated Scanning Line */}
          {!detectedBarcode && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-neon-primary animate-scan z-10" />
          )}
          
          {/* Central Hint */}
          <div className={`transition-opacity duration-300 ${detectedBarcode ? 'opacity-100' : 'opacity-20'}`}>
            <span className={`material-symbols-outlined text-6xl drop-shadow-lg ${detectedBarcode ? 'text-success' : 'text-primary/50'}`}>
              {detectedBarcode ? 'verified' : 'barcode'}
            </span>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-3xl opacity-80" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-3xl opacity-80" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-3xl opacity-80" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-3xl opacity-80" />
        </div>

        {/* Bottom Controls */}
        <div className="w-full flex flex-col items-center gap-6">
           <div className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-3">
             <span className="material-symbols-outlined text-primary/70 text-sm">sensors</span>
             <p className="text-primary/90 text-[10px] font-bold uppercase tracking-widest">Live Analysis Active</p>
           </div>
           
           <button 
             onClick={(e) => { e.preventDefault(); toggleTorch(); }}
             className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-glass ${
               torchOn ? 'bg-primary text-on-primary shadow-neon-primary' : 'glass-panel text-white/70 hover:bg-white/10'
             }`}
           >
             <span className="material-symbols-outlined text-2xl">
               {torchOn ? 'flashlight_on' : 'flashlight_off'}
             </span>
           </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-surface-container-lowest">
          <div className="w-24 h-24 relative mb-6">
            <span className="loading loading-ring loading-lg text-primary w-full h-full"></span>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="material-symbols-outlined text-primary text-2xl animate-bounce">nutrition</span>
            </div>
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">NutriAR</h2>
          <p className="mt-2 text-on-surface-variant font-bold uppercase tracking-[0.3em] text-[10px]">Initializing Hardware...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-error p-8 text-center text-on-error-container">
          <span className="material-symbols-outlined text-6xl mb-4">videocam_off</span>
          <h2 className="text-2xl font-bold mb-2 font-headline">Hardware Error</h2>
          <p className="text-sm opacity-90 max-w-xs leading-relaxed font-bold uppercase tracking-wider">
            Camera access is blocked or unavailable.
          </p>
          <button className="mt-8 btn btn-outline border-error/40 hover:bg-error/10 text-error" onClick={() => window.location.reload()}>
            Reset Hardware
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
