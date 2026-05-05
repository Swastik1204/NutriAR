/**
 * Smart Health Insights Engine
 */

export const generateInsights = (product, goal = 'balanced') => {
  const warnings = [];
  const suggestions = [];
  const badges = [];

  const { calories, protein, fat, sugar } = product;

  // Analysis with Goal Context
  if (sugar > 15 || (goal === 'weight-loss' && sugar > 8)) {
    warnings.push(goal === 'weight-loss' ? "High sugar for your weight loss goal." : "High sugar content detected.");
    badges.push({ text: "High Sugar", type: "error" });
  }

  if (calories > 300 || (goal === 'weight-loss' && calories > 200)) {
    warnings.push("Calorie dense serving.");
    suggestions.push(goal === 'weight-loss' ? "Choose a lower calorie alternative." : "Consider a smaller portion.");
  }

  if (protein > 10) {
    badges.push({ text: "Protein Rich", type: "success" });
    if (goal === 'muscle-gain') suggestions.push("Excellent choice for your muscle gain goal.");
  } else if (goal === 'muscle-gain' && protein < 5) {
    suggestions.push("Look for higher protein alternatives to meet your goal.");
  }

  if (fat > 15 && goal !== 'muscle-gain') {
    warnings.push("High fat content.");
    badges.push({ text: "High Fat", type: "error" });
  }

  // General Suggestions
  if (warnings.length > 1) {
    suggestions.push("Avoid frequent consumption of this item.");
  } else if (warnings.length === 0) {
    suggestions.push("Great fit for a " + goal.replace('-', ' ') + " diet.");
  }

  // Better Alternatives (Static Mapping)
  const alternatives = getAlternatives(product.name);

  return { warnings, suggestions, badges, alternatives };
};

const getAlternatives = (productName) => {
  const name = productName.toLowerCase();
  if (name.includes('chips')) return ['Air-popped Popcorn', 'Kale Chips', 'Roasted Chickpeas'];
  if (name.includes('chocolate') || name.includes('sweet') || name.includes('fantasy')) return ['Dark Chocolate (70%+)', 'Fresh Berries', 'Dried Apricots'];
  if (name.includes('drink') || name.includes('cola') || name.includes('bournvita')) return ['Sparkling Water', 'Unsweetened Iced Tea', 'Kombucha'];
  if (name.includes('biscuit') || name.includes('cookie')) return ['Oatcakes', 'Rice Cakes', 'Greek Yogurt'];
  if (name.includes('noodle')) return ['Zucchini Noodles', 'Whole Wheat Pasta', 'Soba Noodles'];
  return ['Fresh Fruit', 'Handful of Nuts', 'Carrot Sticks'];
};
