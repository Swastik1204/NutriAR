/**
 * Open Food Facts API Service
 */
const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';

export const fetchProductFromOFF = async (barcode) => {
  try {
    const response = await fetch(`${BASE_URL}/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      return {
        name: p.product_name || 'Unknown Product',
        calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        protein: p.nutriments?.protein_100g || 0,
        carbs: p.nutriments?.carbohydrates_100g || 0,
        fat: p.nutriments?.fat_100g || 0,
        ingredients: p.ingredients_text ? p.ingredients_text.split(',').slice(0, 8).map(i => i.trim()) : [],
        healthNote: p.nutrition_grades_tags?.[0] ? `Nutri-Score Grade: ${p.nutrition_grades_tags[0].toUpperCase()}` : 'No health note available for this product.',
        source: 'Open Food Facts'
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching from Open Food Facts:', error);
    return null;
  }
};
