import React, { useState, useMemo } from 'react';
import { products } from '../data/products';

const ProductList = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, high-protein, low-sugar

  const productList = Object.values(products);

  const filteredProducts = useMemo(() => {
    return productList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.brand.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filter === 'high-protein') return p.protein >= 20;
      if (filter === 'low-sugar') return p.sugar <= 5;
      if (filter === 'high-carb') return p.carbs >= 50;
      
      return true;
    });
  }, [search, filter, productList]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden pb-24">
      <header className="p-8 pt-16 bg-gradient-to-b from-primary/10 to-transparent">
        <h1 className="text-4xl font-headline font-black text-white tracking-tighter mb-6">Database</h1>
        
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
            <input 
              type="text" 
              placeholder="Search products or brands..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'high-protein', label: 'High Protein' },
              { id: 'low-sugar', label: 'Low Sugar' },
              { id: 'high-carb', label: 'High Carb' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all ${
                  filter === f.id ? 'bg-primary border-primary text-on-primary shadow-neon-primary' : 'bg-white/5 border-white/10 text-white/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-4 scrollbar-hide">
        {filteredProducts.length === 0 ? (
          <div className="p-12 glass-panel rounded-3xl text-center opacity-30">
            <span className="material-symbols-outlined text-5xl mb-4">inventory_2</span>
            <p className="text-sm font-bold uppercase tracking-widest">No products found</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.barcode} className="p-6 glass-card rounded-[32px] border border-white/5 flex flex-col gap-4">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{product.brand}</p>
                    <h3 className="text-xl font-bold text-white leading-tight">{product.name}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/50">
                    <span className="text-xs font-black">{product.healthScore}</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-5 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/80">{product.calories}</span>
                    <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold">kcal</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/80">{product.protein}g</span>
                    <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold">Prot</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/80">{product.carbs}g</span>
                    <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold">Carb</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/80">{product.fat}g</span>
                    <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold">Fat</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/80">{product.sugar}g</span>
                    <span className="text-[7px] uppercase tracking-widest opacity-40 font-bold">Sugar</span>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
