import React, { useEffect, useRef, useMemo } from 'react';
import { calculateHealthScore, getHealthColor, getHealthBg, generateInsights, getAlternatives } from '../utils/nutrition';

const ProductSheet = ({ product, barcode, isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const healthScore = useMemo(() => product ? calculateHealthScore(product) : 0, [product]);
  const insights = useMemo(() => product ? generateInsights(product) : [], [product]);
  const alternatives = useMemo(() => product ? getAlternatives(product.name) : [], [product]);

  if (!product && isOpen) {
    return (
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
        <div className="modal-box bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/30">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-4">
              <span className="material-symbols-outlined text-3xl">barcode_reader</span>
            </div>
            <h3 className="font-bold text-2xl mb-2">Unknown Product</h3>
            <p className="text-on-surface-variant text-sm mb-6">
              Barcode <span className="font-mono text-primary">{barcode}</span> not found.
            </p>
            <form method="dialog" className="w-full">
              <button className="btn btn-primary w-full rounded-2xl" onClick={onClose}>Try Another Scan</button>
            </form>
          </div>
        </div>
      </dialog>
    );
  }

  if (!product) return null;

  return (
    <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box p-0 bg-surface-container-lowest/95 backdrop-blur-2xl border border-outline-variant/30 overflow-hidden shadow-2xl">
        {/* Header with Health Score */}
        <div className="relative p-6 pb-4 border-b border-outline-variant/10 bg-gradient-to-br from-surface to-surface-container-low">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">Analysis Complete</span>
               <p className="text-[10px] font-mono text-on-surface-variant/50 mt-0.5">Source: {product.source || 'NutriAR Dataset'}</p>
            </div>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div className={`radial-progress ${getHealthColor(healthScore)} bg-surface-container-high border-4 border-transparent`} 
                 style={{ "--value": healthScore, "--size": "5rem", "--thickness": "6px" }}
                 role="progressbar">
              <span className="text-xl font-bold font-headline">{healthScore}</span>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold text-on-surface leading-tight">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${getHealthBg(healthScore)}`}></div>
                <span className={`text-xs font-bold uppercase tracking-wider ${getHealthColor(healthScore)}`}>
                  {healthScore >= 70 ? 'Excellent Choice' : healthScore >= 40 ? 'Average' : 'High Risk'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Macros Visualization */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">Macro Composition (per serving)</p>
            <div className="grid gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold px-1">
                  <span className="text-on-surface-variant">Protein</span>
                  <span className="text-on-surface">{product.protein}g</span>
                </div>
                <progress className="progress progress-primary w-full h-2.5" value={product.protein} max="30"></progress>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold px-1">
                  <span className="text-on-surface-variant">Carbs</span>
                  <span className="text-on-surface">{product.carbs}g</span>
                </div>
                <progress className="progress progress-warning w-full h-2.5" value={product.carbs} max="100"></progress>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold px-1">
                  <span className="text-on-surface-variant">Fat</span>
                  <span className="text-on-surface">{product.fat}g</span>
                </div>
                <progress className="progress progress-error w-full h-2.5" value={product.fat} max="50"></progress>
              </div>
            </div>
          </div>

          {/* Dynamic Insights */}
          <div className="grid gap-3">
            {insights.map((insight, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl border ${
                insight.type === 'error' ? 'bg-error/5 border-error/20 text-error' :
                insight.type === 'warning' ? 'bg-warning/5 border-warning/20 text-warning' :
                'bg-success/5 border-success/20 text-success'
              }`}>
                <span className="material-symbols-outlined text-xl">{
                  insight.type === 'error' ? 'report' : 
                  insight.type === 'warning' ? 'warning' : 'check_circle'
                }</span>
                <p className="text-sm font-medium">{insight.text}</p>
              </div>
            ))}
          </div>

          {/* Better Alternatives */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-3">Healthier Alternatives</p>
            <div className="flex flex-wrap gap-2">
              {alternatives.map((alt, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-xs font-bold text-primary">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  {alt}
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-3 px-1">Key Ingredients</p>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.length > 0 ? product.ingredients.map((ing) => (
                <span key={ing} className="px-3 py-1.5 bg-surface-container-high rounded-full text-[10px] font-bold text-on-surface border border-outline-variant/10 uppercase tracking-tighter">
                  {ing}
                </span>
              )) : <span className="text-xs text-on-surface-variant/50 italic px-1">Ingredient list unavailable</span>}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10">
          <form method="dialog">
            <button className="btn btn-primary btn-block rounded-2xl h-14 text-base font-bold shadow-terra" onClick={onClose}>
              Got it, continue scanning
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default ProductSheet;
