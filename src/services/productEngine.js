import { products } from '../data/products';
import { fetchProductFromOFF } from './foodApi';
import { fetchFromWeb } from './webLookup';
import { calculateHealthScore } from '../utils/nutrition';
import { generateInsights } from '../utils/healthInsights';
import { calculateConfidence } from '../utils/confidenceScore';
import { getDecision } from '../utils/decisionEngine';

/**
 * Intelligent Product Detection Pipeline
 */

const CACHE = new Map();

export const processBarcode = async (barcode, userGoal = 'balanced', options = { useWebFallback: false }) => {
  // 0. Check Cache
  if (CACHE.has(barcode)) {
    console.log('Serving from cache:', barcode);
    return CACHE.get(barcode);
  }

  let product = null;
  let source = 'local';

  // 1. Check Local Dataset
  if (products[barcode]) {
    product = { ...products[barcode] };
    source = 'local';
  }

  // 2. Fallback to Open Food Facts API
  if (!product) {
    product = await fetchProductFromOFF(barcode);
    if (product) source = 'api';
  }

  // 3. Manual Web Fallback Trigger
  if (!product && options.useWebFallback) {
    product = await fetchFromWeb(barcode);
    if (product) source = 'web';
  }

  if (!product) return null;

  // 4. Enrich Data
  const healthScore = product.healthScore || calculateHealthScore(product);
  const insights = generateInsights(product, userGoal);
  const confidence = calculateConfidence(product, source);

  const enrichedProduct = {
    ...product,
    healthScore,
    insights,
    confidence,
    source: product.source || source,
    timestamp: Date.now()
  };

  // 5. Cache Result (Only cache if we actually found something)
  CACHE.set(barcode, enrichedProduct);

  return enrichedProduct;
};
