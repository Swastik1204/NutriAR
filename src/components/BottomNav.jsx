import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-16 glass-panel rounded-[32px] border border-white/10 z-50 flex items-center justify-around px-2 shadow-2xl">
      <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-white/40'}`}>
        <span className="material-symbols-outlined text-2xl">home</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
      </NavLink>
      
      <NavLink to="/scan" className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isActive ? 'bg-primary text-on-primary shadow-neon-primary -translate-y-4 scale-110' : 'bg-white/5 text-white/40 border border-white/5'}`}>
        <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
      </NavLink>
      
      <NavLink to="/products" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-white/40'}`}>
        <span className="material-symbols-outlined text-2xl">database</span>
        <span className="text-[10px] font-bold uppercase tracking-widest">Library</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
