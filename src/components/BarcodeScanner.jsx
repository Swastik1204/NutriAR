import React, { useState, useEffect } from 'react';
import Quagga from '@ericblade/quagga2';

const BarcodeScanner = ({ isInitializing, error }) => {
  const [torchOn, setTorchOn] = useState(false);

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
        alert('Torch not supported on this device/camera.');
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Quagga Target Container */}
      <div id="scanner" className="absolute inset-0 w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />

      {/* Overlay UI */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between pointer-events-none p-8 py-12">
        {/* Top Instructions */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-primary text-lg animate-pulse">center_focus_strong</span>
          <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Center barcode in frame</p>
        </div>

        {/* Scanning Frame */}
        <div className="w-64 h-64 border-2 border-primary/30 rounded-[40px] relative overflow-hidden flex items-center justify-center">
          {/* Animated Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(var(--p),0.8)] animate-scan z-10" />
          
          {/* Central Hint */}
          <div className="opacity-20 flex flex-col items-center">
            <span className="material-symbols-outlined text-white text-6xl">barcode</span>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-3xl" />
        </div>

        {/* Bottom Controls & Hints */}
        <div className="w-full flex flex-col items-center gap-6">
           <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-3">
             <span className="material-symbols-outlined text-white/50 text-sm">info</span>
             <p className="text-white/70 text-[10px] font-medium tracking-wide">Hold steady for 1-2 seconds</p>
           </div>
           
           <button 
             onClick={(e) => { e.preventDefault(); toggleTorch(); }}
             className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-all ${
               torchOn ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--p),0.4)]' : 'bg-black/60 text-white/70 border border-white/20'
             }`}
           >
             <span className="material-symbols-outlined text-2xl">
               {torchOn ? 'flashlight_on' : 'flashlight_off'}
             </span>
           </button>
        </div>
      </div>

      {/* Loading State */}
      {isInitializing && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-opacity">
          <div className="relative">
            <span className="loading loading-spinner loading-lg text-primary scale-125"></span>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="material-symbols-outlined text-primary text-xs">nutrition</span>
            </div>
          </div>
          <p className="mt-6 text-white/70 font-bold uppercase tracking-widest text-[10px]">Initializing NutriAR...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-error/90 backdrop-blur-lg p-8 text-center text-white">
          <span className="material-symbols-outlined text-6xl mb-4">no_photography</span>
          <h2 className="text-2xl font-bold mb-2 font-headline">Camera Access Required</h2>
          <p className="text-sm opacity-90 max-w-xs leading-relaxed">
            NutriAR needs camera access to scan barcodes. Please check your browser permissions.
          </p>
          <button className="mt-8 btn btn-ghost border-white/20 text-white" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
