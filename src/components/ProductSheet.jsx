import React, { useEffect, useRef, useMemo, memo } from 'react';
import { calculateHealthScore, getHealthColor } from '../utils/nutrition';
import { generateInsights } from '../utils/healthInsights';
import { calculateConfidence, getConfidenceColor } from '../utils/confidenceScore';

const ProductSheet = ({ product, barcode, isOpen, onClose, onCompare, userGoal = 'balanced' }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const { healthScore, insights, confidence } = useMemo(() => {
    if (!product) return { healthScore: 0, insights: null, confidence: null };
    const score = product.healthScore || calculateHealthScore(product);
    const engineResults = generateInsights(product, userGoal);
    const conf = calculateConfidence(product, product.source || 'local');
    return { healthScore: score, insights: engineResults, confidence: conf };
  }, [product, userGoal]);

  if (!product && isOpen) {
    return (
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
        <div className="modal-box glass-card border-white/10 p-8 shadow-glass">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error mb-6 shadow-glass border border-error/20">
              <span className="material-symbols-outlined text-4xl animate-pulse">barcode_error</span>
            </div>
            <h3 className="font-headline font-bold text-3xl mb-3 text-white">Product Not Recognized</h3>
            <p className="text-on-surface-variant text-sm mb-8 max-w-[280px] leading-relaxed">
              Barcode <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">{barcode}</span> isn't in our neural database yet.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button className="btn btn-primary w-full rounded-2xl h-14 text-base font-bold shadow-neon-primary text-on-primary border-none" onClick={onClose}>Retry Scan</button>
              <button className="btn btn-outline border-white/20 text-white/50 w-full rounded-2xl h-14 font-bold hover:bg-white/5">Save for Expansion</button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-md">
          <button>close</button>
        </form>
      </dialog>
    );
  }

  if (!product) return null;

  return (
    <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box p-0 bg-surface-container/95 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-glass rounded-t-[40px] sm:rounded-[40px]">
        {/* Header */}
        <div className="relative p-8 pb-6 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1.5">
               <div className={`px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest inline-block w-max ${getConfidenceColor(confidence.quality)}`}>
                 {confidence.label}
               </div>
               <p className="text-[10px] font-mono text-on-surface-variant/70 uppercase tracking-widest">{product.brand} • {product.source || 'Verified Core'}</p>
            </div>
            <form method="dialog">
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors" onClick={onClose}>✕</button>
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div className={`radial-progress ${getHealthColor(healthScore)} bg-black/40 border-[6px] border-black/40 shadow-glass`} 
                 style={{ "--value": healthScore, "--size": "6rem", "--thickness": "6px" }}
                 role="progressbar">
              <span className="text-3xl font-black font-headline tracking-tighter drop-shadow-md text-white">{healthScore}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline text-3xl font-black text-white leading-tight truncate drop-shadow-sm">{product.name}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {insights?.badges.map((badge, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                    badge.type === 'error' ? 'bg-error/10 border-error/30 text-error shadow-neon-error' :
                    badge.type === 'warning' ? 'bg-warning/10 border-warning/30 text-warning' : 'bg-success/10 border-success/30 text-success shadow-[0_0_10px_rgba(0,230,118,0.2)]'
                  }`}>
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[55vh] overflow-y-auto scrollbar-hide">
          {/* Daily Tracker Stat */}
          <div className="p-5 glass-panel rounded-3xl flex items-center justify-between border-primary/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
             <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase text-primary tracking-widest drop-shadow-md">Added to Today's Sync</p>
                <p className="text-sm font-bold text-white mt-1">Impact: <span className="text-primary">{product.calories} kcal</span></p>
             </div>
             <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-neon-primary relative z-10">
                <span className="material-symbols-outlined text-2xl">add_task</span>
             </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
             <div className="glass-panel p-4 rounded-3xl flex flex-col items-center text-center">
                <span className="text-[10px] font-bold uppercase text-on-surface-variant/70 mb-1 tracking-widest">Protein</span>
                <span className="text-xl font-bold text-primary drop-shadow-md">{product.protein}g</span>
                <progress className="progress progress-primary h-1.5 mt-3 bg-black/50" value={product.protein} max="20"></progress>
             </div>
             <div className="glass-panel p-4 rounded-3xl flex flex-col items-center text-center">
                <span className="text-[10px] font-bold uppercase text-on-surface-variant/70 mb-1 tracking-widest">Sugar</span>
                <span className="text-xl font-bold text-warning drop-shadow-md">{product.sugar}g</span>
                <progress className="progress progress-warning h-1.5 mt-3 bg-black/50" value={product.sugar} max="50"></progress>
             </div>
             <div className="glass-panel p-4 rounded-3xl flex flex-col items-center text-center">
                <span className="text-[10px] font-bold uppercase text-on-surface-variant/70 mb-1 tracking-widest">Fat</span>
                <span className="text-xl font-bold text-error drop-shadow-md">{product.fat}g</span>
                <progress className="progress progress-error h-1.5 mt-3 bg-black/50" value={product.fat} max="40"></progress>
             </div>
          </div>

          {/* Insights List */}
          {(insights?.warnings.length > 0 || insights?.suggestions.length > 0) && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 px-1 border-b border-white/5 pb-2">Analysis for {userGoal.replace('-', ' ')}</p>
              <div className="space-y-3">
                {insights.warnings.map((w, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-3xl bg-error/10 border border-error/20 text-error shadow-glass">
                    <span className="material-symbols-outlined text-2xl drop-shadow-md">report</span>
                    <p className="text-sm font-medium leading-relaxed">{w}</p>
                  </div>
                ))}
                {insights.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-glass">
                    <span className="material-symbols-outlined text-2xl drop-shadow-md">tips_and_updates</span>
                    <p className="text-sm font-medium leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {insights?.alternatives.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/70 mb-4 px-1 border-b border-white/5 pb-2">Healthier Alternatives</p>
              <div className="flex flex-wrap gap-3">
                {insights.alternatives.map((alt, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2.5 bg-secondary/10 rounded-xl border border-secondary/20 text-xs font-bold text-secondary shadow-glass">
                    <span className="material-symbols-outlined text-secondary drop-shadow-md text-base">auto_awesome</span>
                    {alt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col gap-4">
          <button 
            className="btn glass-panel btn-block border-white/10 rounded-2xl h-14 flex items-center gap-2 font-bold text-white hover:bg-white/10"
            onClick={() => onCompare(product)}
          >
            <span className="material-symbols-outlined text-xl text-primary drop-shadow-md">compare_arrows</span>
            Run Comparison Matrix
          </button>
          <button className="btn btn-primary btn-block rounded-2xl h-14 text-base font-bold shadow-neon-primary border-none text-on-primary" onClick={onClose}>
            Acknowledge & Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-md">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default memo(ProductSheet);
