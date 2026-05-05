/**
 * Proactive Decision Engine
 * Evaluates a product against user goals and daily intake state.
 */

export const getDecision = (product, userGoal, dailyStats) => {
  const { calories, protein, fat, sugar } = product;
  
  // Define thresholds based on goals
  const thresholds = {
    'weight-loss': { sugar: 8, calories: 200, fat: 10 },
    'muscle-gain': { protein: 10, sugar: 15, calories: 400 },
    'low-sugar': { sugar: 5, carbs: 15 },
    'balanced': { sugar: 12, calories: 300, fat: 15 }
  };

  const limit = thresholds[userGoal] || thresholds['balanced'];
  
  // 1. Critical "Avoid" checks
  if (sugar > limit.sugar) {
    return {
      verdict: "avoid",
      reason: "High sugar content exceeding your goal threshold.",
      action: "Swap for a low-sugar alternative."
    };
  }

  if (dailyStats.calories + calories > 2500 && userGoal === 'weight-loss') {
    return {
      verdict: "avoid",
      reason: "This will push you over your daily calorie limit.",
      action: "Try a lighter snack instead."
    };
  }

  // 2. "Good" checks
  if (userGoal === 'muscle-gain' && protein >= limit.protein) {
    return {
      verdict: "good",
      reason: "Excellent protein source for muscle recovery.",
      action: "Perfect post-workout fuel."
    };
  }

  if (sugar <= 2 && calories < 100) {
    return {
      verdict: "good",
      reason: "Very clean nutritional profile.",
      action: "Safe for frequent consumption."
    };
  }

  // 3. "Moderate" fallback
  return {
    verdict: "moderate",
    reason: "A balanced choice but monitor your portions.",
    action: "Enjoy in moderation as part of your day."
  };
};

export const getVerdictColor = (verdict) => {
  switch (verdict) {
    case 'good': return 'text-success bg-success/10 border-success/20';
    case 'moderate': return 'text-warning bg-warning/10 border-warning/20';
    case 'avoid': return 'text-error bg-error/10 border-error/20';
    default: return 'text-white/50 bg-white/5 border-white/10';
  }
};
