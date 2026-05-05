import React, { useRef, useEffect, memo } from 'react';
import { calculateHealthScore, getHealthColor } from '../utils/nutrition';

const ComparisonSheet = ({ productA, productB, isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) modalRef.current?.showModal();
    else modalRef.current?.close();
  }, [isOpen]);

  if (!productA || !productB) return null;

  const scoreA = calculateHealthScore(productA);
  const scoreB = calculateHealthScore(productB);

  const getWinner = (valA, valB, lowerIsBetter = true) => {
    if (valA === valB) return null;
    return lowerIsBetter ? (valA < valB ? 'A' : 'B') : (valA > valB ? 'A' : 'B');
  };

  const rows = [
    { label: 'Calories', key: 'calories', lower: true, unit: 'kcal' },
    { label: 'Sugar', key: 'sugar', lower: true, unit: 'g' },
    { label: 'Protein', key: 'protein', lower: false, unit: 'g' },
    { label: 'Fat', key: 'fat', lower: true, unit: 'g' },
  ];

  return (
    <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box p-0 bg-surface-container/95 backdrop-blur-3xl border border-white/10 overflow-hidden shadow-glass rounded-t-[40px] sm:rounded-[40px] max-w-2xl">
        <div className="p-8 pb-6 bg-gradient-to-br from-secondary/10 via-transparent to-transparent border-b border-white/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-4xl font-headline font-black text-white tracking-tight drop-shadow-md">Matrix<br/><span className="text-secondary">Analysis.</span></h2>
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors" onClick={onClose}>✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="text-center p-5 glass-panel rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <span className="text-[9px] font-bold uppercase text-primary/70 mb-2 block tracking-widest">Subject Alpha</span>
              <p className="font-bold text-base truncate text-white drop-shadow-sm">{productA.name}</p>
              <p className={`text-3xl font-black mt-2 drop-shadow-md ${getHealthColor(scoreA)}`}>{scoreA}</p>
            </div>
            <div className="text-center p-5 glass-panel rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <span className="text-[9px] font-bold uppercase text-secondary/70 mb-2 block tracking-widest">Subject Beta</span>
              <p className="font-bold text-base truncate text-white drop-shadow-sm">{productB.name}</p>
              <p className={`text-3xl font-black mt-2 drop-shadow-md ${getHealthColor(scoreB)}`}>{scoreB}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-5">
          {rows.map(row => {
            const win = getWinner(productA[row.key], productB[row.key], row.lower);
            return (
              <div key={row.key} className="flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 px-2">{row.label}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-3xl flex justify-between items-center transition-colors ${win === 'A' ? 'bg-primary/10 border border-primary/30 shadow-neon-primary text-white' : 'glass-panel text-white/70'}`}>
                    <span className="font-bold text-lg">{productA[row.key]}<span className="text-xs opacity-70 ml-0.5">{row.unit}</span></span>
                    {win === 'A' && <span className="material-symbols-outlined text-primary text-xl drop-shadow-md">check_circle</span>}
                  </div>
                  <div className={`p-4 rounded-3xl flex justify-between items-center transition-colors ${win === 'B' ? 'bg-secondary/10 border border-secondary/30 shadow-neon-secondary text-white' : 'glass-panel text-white/70'}`}>
                    <span className="font-bold text-lg">{productB[row.key]}<span className="text-xs opacity-70 ml-0.5">{row.unit}</span></span>
                    {win === 'B' && <span className="material-symbols-outlined text-secondary text-xl drop-shadow-md">check_circle</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-8 bg-black/40 border-t border-white/5">
          <button className="btn btn-secondary btn-block rounded-2xl h-14 text-base font-bold shadow-neon-secondary border-none text-on-secondary" onClick={onClose}>Terminate Analysis</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60 backdrop-blur-md">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default memo(ComparisonSheet);
