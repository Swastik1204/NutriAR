/**
 * Open Food Facts API Service
 */
const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';

const normalizeProductData = (p, barcode) => {
  if (!p) return null;

  const nutrients = p.nutriments || {};
  
  // Clean ingredients
  const rawIngredients = p.ingredients_text || '';
  const ingredientsArray = rawIngredients
    ? rawIngredients.split(/[;,(]/).map(i => i.trim().replace(/[.)]/g, '')).filter(i => i.length > 2).slice(0, 10)
    : [];

  return {
    barcode: barcode,
    name: p.product_name || 'Unknown Product',
    brand: p.brands || 'Generic',
    calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy-kcal_serving'] || 0),
    protein: nutrients.protein_100g || nutrients.protein_serving || 0,
    carbs: nutrients.carbohydrates_100g || nutrients.carbohydrates_serving || 0,
    fat: nutrients.fat_100g || nutrients.fat_serving || 0,
    sugar: nutrients.sugars_100g || nutrients.sugars_serving || 0,
    ingredients: ingredientsArray,
    healthScore: 0, // Will be calculated by utility
    tags: p.nutrition_grades_tags?.[0] ? [`score-${p.nutrition_grades_tags[0]}`] : [],
    source: 'Open Food Facts'
  };
};

export const fetchProductFromOFF = async (barcode) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/${barcode}.json`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NutriAR/1.0 (nutrition-scanner-app)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Product ${barcode} not found in Open Food Facts`);
        return null;
      }
      if (response.status === 429) {
        console.warn('Open Food Facts rate limit exceeded');
        return null;
      }
      throw new Error(`Open Food Facts API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 1 && data.product) {
      return normalizeProductData(data.product, barcode);
    }
    return null;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Open Food Facts request timeout:', barcode);
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error fetching from Open Food Facts:', error);
    } else {
      console.error('Error fetching from Open Food Facts:', error);
    }
    return null;
  }
};
