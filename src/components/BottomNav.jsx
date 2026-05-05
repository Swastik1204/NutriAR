import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  return (
    <div className="btm-nav btm-nav-md glass-panel border-t border-white/10 z-50">
      <NavLink to="/" className={({ isActive }) => isActive ? 'active text-primary' : 'text-white/50'}>
        <span className="material-symbols-outlined">home</span>
        <span className="btm-nav-label text-[10px] font-bold uppercase tracking-widest">Home</span>
      </NavLink>
      <NavLink to="/scan" className={({ isActive }) => isActive ? 'active text-primary' : 'text-white/50'}>
        <span className="material-symbols-outlined">qr_code_scanner</span>
        <span className="btm-nav-label text-[10px] font-bold uppercase tracking-widest">Scan</span>
      </NavLink>
      <NavLink to="/products" className={({ isActive }) => isActive ? 'active text-primary' : 'text-white/50'}>
        <span className="material-symbols-outlined">database</span>
        <span className="btm-nav-label text-[10px] font-bold uppercase tracking-widest">Products</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
