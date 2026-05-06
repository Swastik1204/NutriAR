/**
 * Calculates a health score from 0-100 based on nutritional data.
 * Weights:
 * - Calories: Penalty for high density
 * - Protein: Bonus
 * - Fat: Penalty (especially saturated, but we use total for now)
 * - Carbs: Penalty if very high (sugar proxy)
 */
export const calculateHealthScore = (nutrients) => {
  if (!nutrients) return 50;

  const { calories = 0, protein = 0, fat = 0, carbs = 0 } = nutrients;
  
  let score = 70; // Base score

  // Protein bonus (+5 per 5g, max 15)
  score += Math.min((protein / 5) * 5, 15);

  // Calorie penalty (-5 per 100kcal above 150 per serving, max -20)
  if (calories > 150) {
    score -= Math.min(((calories - 150) / 100) * 5, 20);
  }

  // Fat penalty (-5 per 5g above 5g, max -20)
  if (fat > 5) {
    score -= Math.min(((fat - 5) / 5) * 5, 20);
  }

  // Carb penalty (-5 per 10g above 20g, max -15)
  if (carbs > 20) {
    score -= Math.min(((carbs - 20) / 10) * 5, 15);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getHealthColor = (score) => {
  if (score >= 70) return 'text-success';
  if (score >= 40) return 'text-warning';
  return 'text-error';
};

export const getHealthBg = (score) => {
  if (score >= 70) return 'bg-success';
  if (score >= 40) return 'bg-warning';
  return 'bg-error';
};

export const generateBasicInsights = (nutrients) => {
  const insights = [];
  const { calories, protein, fat, carbs } = nutrients;

  if (protein > 10) insights.push({ type: 'success', text: 'High in muscle-building protein.' });
  if (fat > 15) insights.push({ type: 'error', text: 'High fat content detected.' });
  if (carbs > 30) insights.push({ type: 'warning', text: 'Significant carbohydrate load.' });
  if (calories > 300) insights.push({ type: 'error', text: 'Calorie dense serving.' });
  
  if (insights.length === 0) insights.push({ type: 'info', text: 'Balanced nutritional profile.' });

  return insights;
};

export const getAlternatives = (productName) => {
  const name = productName.toLowerCase();
  if (name.includes('chips')) return ['Air-popped Popcorn', 'Kale Chips', 'Roasted Chickpeas'];
  if (name.includes('chocolate') || name.includes('sweet')) return ['Dark Chocolate (70%+)', 'Fresh Berries', 'Dried Apricots'];
  if (name.includes('drink') || name.includes('cola')) return ['Sparkling Water with Lemon', 'Unsweetened Iced Tea', 'Kombucha'];
  if (name.includes('biscuit')) return ['Oatcakes', 'Rice Cakes with Nut Butter', 'Greek Yogurt'];
  return ['Fresh Fruit', 'Handful of Nuts', 'Carrot Sticks'];
};
