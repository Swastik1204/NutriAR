/**
 * Dataset Expansion Pipeline
 * This utility normalizes external data into the NutriAR products.js format.
 */

export const normalizeExternalProduct = (data) => {
  return {
    barcode: String(data.barcode || data.id || ''),
    name: data.name || data.product_name || 'Unknown',
    brand: data.brand || data.brands || 'Generic',
    calories: Math.round(data.calories || data.energy || 0),
    protein: Number(data.protein || 0),
    carbs: Number(data.carbs || data.carbohydrates || 0),
    fat: Number(data.fat || 0),
    sugar: Number(data.sugar || data.sugars || 0),
    ingredients: Array.isArray(data.ingredients) 
      ? data.ingredients 
      : (data.ingredients_text || '').split(',').map(i => i.trim()),
    healthScore: Number(data.healthScore || 0),
    tags: Array.isArray(data.tags) ? data.tags : []
  };
};

export const batchImport = (jsonArray) => {
  const normalized = {};
  jsonArray.forEach(item => {
    const product = normalizeExternalProduct(item);
    if (product.barcode) {
      normalized[product.barcode] = product;
    }
  });
  return normalized;
};
