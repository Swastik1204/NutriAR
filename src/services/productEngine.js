import { products } from '../data/products';
import { fetchProductFromOFF } from './foodApi';
import { calculateHealthScore } from '../utils/nutrition';
import { generateInsights } from '../utils/healthInsights';
import { calculateConfidence } from '../utils/confidenceScore';

/**
 * Intelligent Product Detection Pipeline
 */

const CACHE = new Map();

export const processBarcode = async (barcode, userGoal = 'balanced') => {
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
    source = 'api';
  }

  // 3. Fallback to Web Search (Controlled Mock)
  if (!product) {
    product = await fetchFromWeb(barcode);
    source = 'web';
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

  // 5. Cache Result
  CACHE.set(barcode, enrichedProduct);

  return enrichedProduct;
};

const fetchFromWeb = async (barcode) => {
  // Placeholder for a web search fallback
  // In a real app, this might call a Google Search API or similar
  console.log('Web fallback for:', barcode);
  return null; // Keep it null for now as per "Controlled" requirement
};
