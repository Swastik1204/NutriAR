/**
 * Product Data Confidence Scoring
 */

export const calculateConfidence = (product, source) => {
  if (source === 'local') {
    return {
      score: 98,
      quality: "verified",
      label: "Verified Data"
    };
  }

  if (source === 'web') {
    return {
      score: 60, // 50-70 range
      quality: "estimated",
      label: "Estimated from web data"
    };
  }

  // API Logic
  let score = 85;
  let quality = "verified";
  
  if (!product.ingredients || product.ingredients.length === 0) {
    score -= 15;
    quality = "partial";
  }
  
  if (product.sugar === 0 && product.carbs === 0 && product.calories > 0) {
    score -= 20; // Likely missing macro data
    quality = "estimated";
  }

  if (score < 60) quality = "partial";
  else if (score < 80) quality = "estimated";

  const label = quality === "verified" ? "High Confidence" : 
                quality === "estimated" ? "Estimated Nutrition" : "Partial Data";

  return { score, quality, label };
};

export const getConfidenceColor = (quality) => {
  switch (quality) {
    case 'verified': return 'text-success bg-success/10 border-success/20';
    case 'estimated': return 'text-warning bg-warning/10 border-warning/20';
    case 'partial': return 'text-error bg-error/10 border-error/20';
    default: return 'text-on-surface-variant bg-surface-container-high border-outline-variant/20';
  }
};
