/**
 * Web Lookup Service
 * Simulates fetching from a structured generic web API or search extraction.
 */

// Simulates a web fetch request (in a real scenario, this would call a backend proxy or an API like Edamam/Spoonacular)
export const fetchFromWeb = async (barcode) => {
  console.log(`[WebLookup] Initiating web search for barcode: ${barcode}`);
  
  // Simulate network delay (1.5 - 2.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Mocking a successful extraction for demonstration purposes
  // In a real scenario, we might parse JSON-LD or meta tags from a search result
  const mockRawData = {
    title: `Generic Product ${barcode.substring(0, 4)}`,
    manufacturer: 'Web Brand Inc.',
    nutrition_facts: {
      energy: '250 kcal',
      proteins: '5g',
      carbohydrates: '30g',
      lipids: '12g',
      sugars: '15g'
    },
    ingredients_list: 'Wheat flour, Sugar, Palm oil, Salt, Artificial flavors'
  };

  // Add a 20% chance to fail the web search to show the error fallback
  if (Math.random() > 0.8) {
    console.warn(`[WebLookup] No reliable data found for ${barcode} on the web.`);
    return null;
  }

  return extractProductData(mockRawData, barcode);
};

/**
 * Extracts and normalizes raw web data into the standard NutriAR schema.
 * Handles missing values and inconsistent formats.
 */
const extractProductData = (raw, barcode) => {
  if (!raw) return null;

  // Helper to parse numeric values from strings (e.g. "250 kcal" -> 250)
  const parseNum = (str) => {
    if (!str) return 0;
    const match = String(str).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const ingredients = raw.ingredients_list 
    ? raw.ingredients_list.split(',').map(i => i.trim()).filter(i => i.length > 0)
    : [];

  return {
    barcode: barcode,
    name: raw.title || 'Unknown Web Product',
    brand: raw.manufacturer || 'Generic Brand',
    calories: parseNum(raw.nutrition_facts?.energy || raw.calories),
    protein: parseNum(raw.nutrition_facts?.proteins || raw.protein),
    carbs: parseNum(raw.nutrition_facts?.carbohydrates || raw.carbs),
    fat: parseNum(raw.nutrition_facts?.lipids || raw.fat),
    sugar: parseNum(raw.nutrition_facts?.sugars || raw.sugar),
    ingredients: ingredients.slice(0, 10), // Limit to top 10 ingredients
    source: 'web'
  };
};
