import React, { useEffect, useRef, useMemo, memo } from 'react';
import { getHealthColor } from '../utils/nutrition';
import { generateInsights } from '../utils/healthInsights';
import { calculateConfidence, getConfidenceColor } from '../utils/confidenceScore';
import { getDecision, getVerdictColor } from '../utils/decisionEngine';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { products } from '../data/products';

const ProductSheet = ({ product, barcode, isOpen, onClose, onCompare, userGoal = 'balanced' }) => {
  const modalRef = useRef(null);
  const { dailyStats } = useDailyNutrition();

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const { healthScore, insights, confidence, decision, recommendations } = useMemo(() => {
    if (!product) return { healthScore: 0, insights: null, confidence: null, decision: null, recommendations: [] };
    
    const score = product.healthScore || 50;
    const engineResults = generateInsights(product, userGoal);
    const conf = calculateConfidence(product, product.source || 'local');
    const dec = getDecision(product, userGoal, dailyStats);

    // Smart Recommendations: Find better alternatives from local dataset
    const localProducts = Object.values(products);
    const recs = localProducts
      .filter(p => p.barcode !== product.barcode && p.healthScore > score + 10)
      .slice(0, 2);

    return { healthScore: score, insights: engineResults, confidence: conf, decision: dec, recommendations: recs };
  }, [product, userGoal, dailyStats]);

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
      <div className="modal-box p-0 bg-surface-container/95 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-glass rounded-t-[40px] sm:rounded-[40px] animate-slide-up">
        {/* Header */}
        <div className="relative p-8 pb-6 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-2">
               <div className={`px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-widest inline-block w-max ${getConfidenceColor(confidence.quality)}`}>
                 {confidence.label} 
                 <span className="ml-1 opacity-50 cursor-help" title="Based on dataset completeness and source verification.">ⓘ</span>
               </div>
               <p className="text-[10px] font-mono text-on-surface-variant/70 uppercase tracking-widest">{product.brand} • {product.source || 'Verified Core'}</p>
            </div>
            <form method="dialog">
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors" onClick={onClose}>✕</button>
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div className={`radial-progress ${getHealthColor(healthScore)} bg-black/40 border-[6px] border-black/40 shadow-glass transition-all duration-1000 ease-out`} 
                 style={{ "--value": healthScore, "--size": "6rem", "--thickness": "6px" }}
                 role="progressbar">
              <span className="text-3xl font-black font-headline tracking-tighter drop-shadow-md text-white animate-fade-in">{healthScore}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline text-3xl font-black text-white leading-tight truncate drop-shadow-sm">{product.name}</h3>
              
              {/* Proactive Verdict */}
              {decision && (
                <div className={`mt-3 px-3 py-1.5 rounded-xl border flex items-center gap-2 ${getVerdictColor(decision.verdict)}`}>
                  <span className="material-symbols-outlined text-sm">
                    {decision.verdict === 'good' ? 'verified_user' : decision.verdict === 'avoid' ? 'block' : 'info'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{decision.verdict} for your goal</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[55vh] overflow-y-auto scrollbar-hide">
          {/* Decision Reason */}
          {decision && (
            <div className="p-5 glass-panel rounded-3xl border-white/5 bg-white/5">
              <p className="text-sm text-white font-medium mb-1">{decision.reason}</p>
              <p className="text-xs text-on-surface-variant italic">Suggestion: {decision.action}</p>
            </div>
          )}

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
             {[
               { label: 'Protein', val: product.protein, max: 20, color: 'primary' },
               { label: 'Sugar', val: product.sugar, max: 50, color: 'warning' },
               { label: 'Fat', val: product.fat, max: 40, color: 'error' }
             ].map(m => (
               <div key={m.label} className="glass-panel p-4 rounded-3xl flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant/70 mb-1 tracking-widest">{m.label}</span>
                  <span className="text-xl font-bold text-white drop-shadow-md">{m.val}g</span>
                  <progress className={`progress progress-${m.color} h-1.5 mt-3 bg-black/50`} value={m.val} max={m.max}></progress>
               </div>
             ))}
          </div>

          {/* Smart Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/70 mb-4 px-1 border-b border-white/5 pb-2">Smart Alternatives</p>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-secondary/10 rounded-2xl border border-secondary/20 shadow-glass">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                       <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-white truncate">{rec.name}</p>
                       <p className="text-[10px] text-secondary font-bold uppercase">Score: {rec.healthScore}</p>
                    </div>
                    <span className="material-symbols-outlined text-secondary opacity-50">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis List */}
          {(insights?.warnings.length > 0 || insights?.suggestions.length > 0) && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 px-1 border-b border-white/5 pb-2">Goal Analysis</p>
              <div className="space-y-3">
                {insights.warnings.map((w, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-3xl bg-error/10 border border-error/20 text-error shadow-glass">
                    <span className="material-symbols-outlined text-2xl">report</span>
                    <p className="text-sm font-medium leading-relaxed">{w}</p>
                  </div>
                ))}
                {insights.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-glass">
                    <span className="material-symbols-outlined text-2xl">tips_and_updates</span>
                    <p className="text-sm font-medium leading-relaxed">{s}</p>
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
            Acknowledge & Sync
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
