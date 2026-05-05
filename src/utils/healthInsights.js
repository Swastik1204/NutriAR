/**
 * Smart Health Insights Engine
 */

export const generateInsights = (product) => {
  const warnings = [];
  const suggestions = [];
  const badges = [];

  const { calories, protein, fat, sugar } = product;

  // Analysis
  if (sugar > 20) {
    warnings.push("Very high sugar content detected.");
    badges.push({ text: "High Sugar", type: "error" });
  } else if (sugar > 10) {
    warnings.push("Moderate sugar levels.");
    badges.push({ text: "Added Sugar", type: "warning" });
  }

  if (fat > 15) {
    warnings.push("High fat content per serving.");
    badges.push({ text: "High Fat", type: "error" });
  }

  if (protein > 10) {
    badges.push({ text: "Protein Rich", type: "success" });
  }

  if (calories > 300) {
    warnings.push("Calorie dense item.");
    suggestions.push("Consider a smaller portion size.");
  }

  // Suggestions
  if (warnings.length > 1) {
    suggestions.push("Avoid frequent consumption of this ultra-processed item.");
  } else if (warnings.length === 1) {
    suggestions.push("Consume occasionally as part of a balanced diet.");
  } else {
    suggestions.push("Good nutritional profile for regular consumption.");
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
