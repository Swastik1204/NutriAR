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
        <div className={`transition-all duration-300 px-6 py-3 rounded-full border flex items-center gap-2 shadow-xl backdrop-blur-xl ${
          detectedBarcode ? 'bg-success/20 border-success/30 text-success' : 'bg-black/40 border-white/10 text-white'
        }`}>
          <span className={`material-symbols-outlined text-lg ${!detectedBarcode && 'animate-pulse'}`}>
            {isSearching ? 'database' : detectedBarcode ? 'check_circle' : 'center_focus_strong'}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{getStatusMessage()}</p>
        </div>

        {/* Scanning Frame */}
        <div className={`transition-all duration-500 w-64 h-64 border-2 rounded-[40px] relative overflow-hidden flex items-center justify-center ${
          detectedBarcode ? 'border-success scale-105' : 'border-primary/30'
        }`}>
          {/* Animated Scanning Line */}
          {!detectedBarcode && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(var(--p),0.8)] animate-scan z-10" />
          )}
          
          {/* Central Hint */}
          <div className={`transition-opacity duration-300 ${detectedBarcode ? 'opacity-100' : 'opacity-20'}`}>
            <span className={`material-symbols-outlined text-6xl ${detectedBarcode ? 'text-success' : 'text-white'}`}>
              {detectedBarcode ? 'verified' : 'barcode'}
            </span>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-3xl opacity-50" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-3xl opacity-50" />
        </div>

        {/* Bottom Controls */}
        <div className="w-full flex flex-col items-center gap-6">
           <div className="bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/5">
             <span className="material-symbols-outlined text-white/50 text-sm">sensors</span>
             <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Live Analysis Active</p>
           </div>
           
           <button 
             onClick={(e) => { e.preventDefault(); toggleTorch(); }}
             className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl ${
               torchOn ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-black/60 text-white/70 border border-white/20'
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
        <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-error p-8 text-center text-white">
          <span className="material-symbols-outlined text-6xl mb-4">videocam_off</span>
          <h2 className="text-2xl font-bold mb-2 font-headline">Hardware Error</h2>
          <p className="text-sm opacity-90 max-w-xs leading-relaxed font-bold uppercase tracking-wider">
            Camera access is blocked or unavailable.
          </p>
          <button className="mt-8 btn btn-outline text-white border-white/40 hover:bg-white/10" onClick={() => window.location.reload()}>
            Reset Hardware
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
