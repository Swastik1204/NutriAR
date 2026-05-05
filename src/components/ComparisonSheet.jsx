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
      <div className="modal-box p-0 bg-surface-container-lowest/95 backdrop-blur-2xl border border-outline-variant/30 overflow-hidden shadow-2xl max-w-2xl">
        <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-b border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-headline font-bold text-on-surface">Comparison</h2>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-surface-container rounded-3xl border border-outline-variant/10">
              <span className="text-[10px] font-bold uppercase text-primary mb-1 block">Option A</span>
              <p className="font-bold text-sm truncate">{productA.name}</p>
              <p className={`text-2xl font-bold mt-2 ${getHealthColor(scoreA)}`}>{scoreA}</p>
            </div>
            <div className="text-center p-4 bg-surface-container rounded-3xl border border-outline-variant/10">
              <span className="text-[10px] font-bold uppercase text-primary mb-1 block">Option B</span>
              <p className="font-bold text-sm truncate">{productB.name}</p>
              <p className={`text-2xl font-bold mt-2 ${getHealthColor(scoreB)}`}>{scoreB}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {rows.map(row => {
            const win = getWinner(productA[row.key], productB[row.key], row.lower);
            return (
              <div key={row.key} className="flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 px-2">{row.label}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl flex justify-between items-center ${win === 'A' ? 'bg-success/10 border border-success/30' : 'bg-surface-container-low border border-transparent'}`}>
                    <span className="font-bold">{productA[row.key]}{row.unit}</span>
                    {win === 'A' && <span className="material-symbols-outlined text-success text-sm">check_circle</span>}
                  </div>
                  <div className={`p-4 rounded-2xl flex justify-between items-center ${win === 'B' ? 'bg-success/10 border border-success/30' : 'bg-surface-container-low border border-transparent'}`}>
                    <span className="font-bold">{productB[row.key]}{row.unit}</span>
                    {win === 'B' && <span className="material-symbols-outlined text-success text-sm">check_circle</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10">
          <button className="btn btn-primary btn-block rounded-2xl h-14" onClick={onClose}>Close Comparison</button>
        </div>
      </div>
    </dialog>
  );
};

export default memo(ComparisonSheet);
