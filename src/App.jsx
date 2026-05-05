import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Scan from './pages/Scan';
import ProductList from './pages/ProductList';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';

const GOAL_KEY = 'nutriar_user_goal_v2';

function AppContent() {
  const [userGoal, setUserGoal] = useState(localStorage.getItem(GOAL_KEY) || 'balanced');
  const [showGoalPicker, setShowGoalPicker] = useState(!localStorage.getItem(GOAL_KEY));

  const selectGoal = (goal) => {
    setUserGoal(goal);
    localStorage.setItem(GOAL_KEY, goal);
    setShowGoalPicker(false);
  };

  if (showGoalPicker) {
    return (
      <div className="absolute inset-0 z-[200] bg-background flex flex-col p-10 animate-fade-in overflow-hidden">
        <h2 className="text-5xl font-headline font-black text-white mt-12 mb-4 leading-tight text-gradient">Set Your Goal.</h2>
        <p className="text-on-surface-variant text-lg mb-12">NutriAR will adapt its intelligence to your health priorities.</p>
        
        <div className="grid gap-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
          {[
            { id: 'weight-loss', icon: 'weight', title: 'Weight Loss', desc: 'Prioritize low calorie & low sugar' },
            { id: 'muscle-gain', icon: 'fitness_center', title: 'Muscle Gain', desc: 'Focus on high protein intake' },
            { id: 'balanced', icon: 'balance', title: 'Balanced Diet', desc: 'General health & wellness' },
            { id: 'low-sugar', icon: 'water_drop', title: 'Low Sugar', desc: 'Reduce glycemic load' }
          ].map(goal => (
            <button 
              key={goal.id} 
              onClick={() => selectGoal(goal.id)}
              className="p-6 rounded-[32px] glass-panel flex items-center gap-5 text-left transition-all hover:bg-primary/5 hover:border-primary/30 active:scale-95 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">{goal.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{goal.title}</h3>
                <p className="text-xs text-on-surface-variant">{goal.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="relative h-[100dvh] w-screen overflow-hidden bg-background text-on-surface flex flex-col font-body">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Home userGoal={userGoal} onOpenGoalPicker={() => setShowGoalPicker(true)} />} />
            <Route path="/scan" element={<Scan userGoal={userGoal} />} />
            <Route path="/products" element={<ProductList />} />
          </Routes>
        </div>

        <BottomNav />
        
        {/* Aesthetic Blobs */}
        <div className="neon-bg-blobs" />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
