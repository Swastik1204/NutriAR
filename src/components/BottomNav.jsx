import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] pb-safe">
      <div className="mx-6 mb-6 h-18 glass-panel rounded-[28px] flex items-center justify-around px-4 border border-white/10 shadow-2xl">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 transition-all duration-300 ${isActive ? 'text-primary' : 'text-white/40 hover:text-white/60'}`}
        >
          <span className="material-symbols-outlined text-[26px]">home</span>
          <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none">Home</span>
        </NavLink>

        <NavLink 
          to="/scan" 
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-20 h-14 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary text-on-primary shadow-neon-primary scale-110' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
        >
          <span className="material-symbols-outlined text-[28px] font-bold">qr_code_scanner</span>
          <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none">Scan</span>
        </NavLink>

        <NavLink 
          to="/products" 
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-16 transition-all duration-300 ${isActive ? 'text-primary' : 'text-white/40 hover:text-white/60'}`}
        >
          <span className="material-symbols-outlined text-[26px]">database</span>
          <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none">Data</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
