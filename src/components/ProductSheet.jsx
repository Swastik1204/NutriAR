import React, { useEffect, useRef, useMemo, memo } from 'react';
import { calculateHealthScore, getHealthColor, getHealthBg } from '../utils/nutrition';
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
        <div className="modal-box bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/30">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-4">
              <span className="material-symbols-outlined text-3xl">barcode_reader</span>
            </div>
            <h3 className="font-bold text-2xl mb-2">Product Not Recognized</h3>
            <p className="text-on-surface-variant text-sm mb-6 max-w-[250px]">
              Barcode <span className="font-mono text-primary">{barcode}</span> isn't in our database yet.
            </p>
            <div className="flex flex-col gap-2 w-full">
              <button className="btn btn-primary w-full rounded-2xl" onClick={onClose}>Retry Scan</button>
              <button className="btn btn-ghost w-full rounded-2xl text-xs opacity-50">Save for Expansion</button>
            </div>
          </div>
        </div>
      </dialog>
    );
  }

  if (!product) return null;

  return (
    <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box p-0 bg-surface-container-lowest/95 backdrop-blur-2xl border border-outline-variant/30 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-outline-variant/10 bg-gradient-to-br from-surface to-surface-container-low">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
               <div className={`px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-widest inline-block ${getConfidenceColor(confidence.quality)}`}>
                 {confidence.label}
               </div>
               <p className="text-[10px] font-mono text-on-surface-variant/50">{product.brand} • {product.source || 'Verified Source'}</p>
            </div>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div className={`radial-progress ${getHealthColor(healthScore)} bg-surface-container-high border-4 border-transparent shadow-sm`} 
                 style={{ "--value": healthScore, "--size": "5.5rem", "--thickness": "8px" }}
                 role="progressbar">
              <span className="text-2xl font-bold font-headline">{healthScore}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-headline text-2xl font-bold text-on-surface leading-tight truncate">{product.name}</h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {insights?.badges.map((badge, i) => (
                  <span key={i} className={`badge badge-sm font-bold uppercase tracking-tighter border-none px-2 h-5 ${
                    badge.type === 'error' ? 'bg-error/10 text-error' :
                    badge.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto scrollbar-hide">
          {/* Daily Tracker Stat */}
          <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-between">
             <div>
                <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Added to Today</p>
                <p className="text-xs font-medium text-on-surface-variant">Daily quota: {product.calories} kcal</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">add_task</span>
             </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-2">
             <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5 flex flex-col items-center text-center">
                <span className="text-[9px] font-bold uppercase text-on-surface-variant/60 mb-1">Protein</span>
                <span className="text-base font-bold text-primary">{product.protein}g</span>
                <progress className="progress progress-primary h-1 mt-2" value={product.protein} max="20"></progress>
             </div>
             <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5 flex flex-col items-center text-center">
                <span className="text-[9px] font-bold uppercase text-on-surface-variant/60 mb-1">Sugar</span>
                <span className="text-base font-bold text-warning">{product.sugar}g</span>
                <progress className="progress progress-warning h-1 mt-2" value={product.sugar} max="50"></progress>
             </div>
             <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5 flex flex-col items-center text-center">
                <span className="text-[9px] font-bold uppercase text-on-surface-variant/60 mb-1">Fat</span>
                <span className="text-base font-bold text-error">{product.fat}g</span>
                <progress className="progress progress-error h-1 mt-2" value={product.fat} max="40"></progress>
             </div>
          </div>

          {/* Insights List */}
          {(insights?.warnings.length > 0 || insights?.suggestions.length > 0) && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 px-1">Goal: {userGoal.replace('-', ' ')}</p>
              <div className="space-y-2">
                {insights.warnings.map((w, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-2xl bg-error/5 border border-error/10 text-error">
                    <span className="material-symbols-outlined text-xl">report_problem</span>
                    <p className="text-xs font-bold leading-relaxed">{w}</p>
                  </div>
                ))}
                {insights.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 text-primary">
                    <span className="material-symbols-outlined text-xl">lightbulb</span>
                    <p className="text-xs font-bold leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {insights?.alternatives.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-3 px-1">Healthier Alternatives</p>
              <div className="flex flex-wrap gap-2">
                {insights.alternatives.map((alt, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant/10 text-xs font-bold text-on-surface">
                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                    {alt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 flex flex-col gap-3">
          <button 
            className="btn btn-outline btn-block border-outline-variant/20 rounded-2xl flex items-center gap-2 font-bold"
            onClick={() => onCompare(product)}
          >
            <span className="material-symbols-outlined text-xl">compare_arrows</span>
            Compare with another
          </button>
          <button className="btn btn-primary btn-block rounded-2xl h-14 text-base font-bold shadow-lg" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default memo(ProductSheet);
