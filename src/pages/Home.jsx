import React from 'react';
import { Link } from 'react-router-dom';
import { useScanHistory } from '../hooks/useScanHistory';
import { useDailyNutrition } from '../hooks/useDailyNutrition';

const Home = ({ userGoal, onOpenGoalPicker }) => {
  const { history } = useScanHistory(5);
  const { dailyStats } = useDailyNutrition();

  return (
    <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
      {/* Header Section */}
      <section className="p-8 pt-16 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-headline font-black text-white tracking-tighter">NutriAR</h1>
            <button 
              onClick={onOpenGoalPicker}
              className="flex items-center gap-2 mt-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary/30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">target</span>
              {userGoal.replace('-', ' ')}
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">account_circle</span>
          </div>
        </div>

        {/* Today's Intake Card */}
        <div className="glass-card p-6 rounded-[32px] mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-headline font-bold text-white">Daily Intake</h2>
            <span className="text-xs font-bold text-primary/70 uppercase tracking-widest">Today</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-4xl font-black text-white tracking-tighter">{dailyStats.calories}</span>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant/60 tracking-widest">kcal consumed</span>
            </div>
            <div className="flex flex-col items-end">
               <div className="radial-progress text-primary text-[10px] font-bold" 
                    style={{ "--value": (dailyStats.calories/2500)*100, "--size": "3.5rem", "--thickness": "4px" }}>
                 {Math.round((dailyStats.calories/2500)*100)}%
               </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/scan" className="p-6 rounded-[32px] bg-primary/10 border border-primary/30 flex flex-col gap-4 group hover:bg-primary/20 transition-all active:scale-95">
             <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-neon-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
             </div>
             <span className="font-bold text-white text-lg leading-tight">Start<br/>Scanning</span>
          </Link>
          <Link to="/products" className="p-6 rounded-[32px] glass-panel flex flex-col gap-4 group hover:bg-white/5 transition-all active:scale-95">
             <div className="w-12 h-12 rounded-2xl bg-white/5 text-primary flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">database</span>
             </div>
             <span className="font-bold text-white text-lg leading-tight">Browse<br/>Database</span>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="p-8 pt-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-headline font-bold text-white">Recent Scans</h2>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Top 5</span>
        </div>
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="p-8 glass-panel rounded-3xl text-center opacity-30">
               <p className="text-xs font-bold uppercase tracking-widest">No recent scans</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
                 <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/50 text-2xl">barcode</span>
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{item.name}</p>
                    <p className="text-[10px] opacity-50 uppercase mt-0.5">{item.brand}</p>
                 </div>
                 <div className={`px-2 py-1 rounded-md text-[9px] font-black ${item.healthScore >= 70 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {item.healthScore}
                 </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Smart Tip */}
      <section className="p-8 pt-0">
        <div className="p-6 rounded-[32px] bg-secondary/10 border border-secondary/20 flex gap-4 items-start">
           <span className="material-symbols-outlined text-secondary text-3xl">lightbulb</span>
           <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Smart Tip</p>
              <p className="text-sm text-white/80 leading-relaxed">
                {dailyStats.sugar > 20 
                  ? "Your sugar intake is rising today. Try swapping snacks for fresh fruit."
                  : "Excellent hydration focus! Keep up the balanced nutrient intake."}
              </p>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
