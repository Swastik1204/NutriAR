import React, { useEffect, useRef } from 'react';

const ProductSheet = ({ product, barcode, isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

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
              Barcode <span className="font-mono text-primary">{barcode}</span> not found in our database.
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
        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-outline-variant/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">Product Match Found</span>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>✕</button>
            </form>
          </div>
          <h3 className="font-headline text-3xl font-bold text-on-surface leading-tight">{product.name}</h3>
          <p className="text-xs font-mono text-on-surface-variant/60 mt-1">EAN: {barcode}</p>
        </div>

        <div className="p-6 pt-4 space-y-6">
          {/* Nutrition Summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-primary/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-primary/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-1">Calories</p>
              <p className="text-xl font-bold text-primary">{product.calories}</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-3 flex flex-col items-center justify-center border border-outline-variant/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Protein</p>
              <p className="text-lg font-bold text-on-surface">{product.protein}g</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-3 flex flex-col items-center justify-center border border-outline-variant/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Carbs</p>
              <p className="text-lg font-bold text-on-surface">{product.carbs}g</p>
            </div>
            <div className="bg-surface-container rounded-2xl p-3 flex flex-col items-center justify-center border border-outline-variant/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Fat</p>
              <p className="text-lg font-bold text-on-surface">{product.fat}g</p>
            </div>
          </div>

          {/* Health Note */}
          <div className="bg-tertiary-fixed/10 border border-tertiary/20 rounded-3xl p-4 flex gap-4 items-start">
            <span className="material-symbols-outlined text-tertiary mt-0.5">info</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-tertiary/80 mb-1">Health Insight</p>
              <p className="text-sm leading-relaxed text-on-tertiary-container">{product.healthNote}</p>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-3 px-1">Ingredients</p>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ing) => (
                <span key={ing} className="px-3 py-1.5 bg-surface-container-high rounded-full text-xs font-medium text-on-surface border border-outline-variant/20 shadow-sm">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 pt-2">
          <form method="dialog">
            <button className="btn btn-primary btn-block rounded-2xl h-14 text-base font-bold shadow-terra" onClick={onClose}>
              Dismiss
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default ProductSheet;
