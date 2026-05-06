const USER_PRODUCTS_KEY = 'nutriar_user_products_v1';

const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded, attempting to clear old data');
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('Failed to save to localStorage even after clearing:', retryError);
        return false;
      }
    }
    console.error('Failed to save to localStorage:', e);
    return false;
  }
};

export const getUserProduct = (barcode) => {
  const products = getAllUserProducts();
  return products[barcode] || null;
};

export const saveUserProduct = (product) => {
  const products = getAllUserProducts();
  products[product.barcode] = {
    ...product,
    source: 'User Contributed',
    timestamp: Date.now()
  };
  safeLocalStorageSet(USER_PRODUCTS_KEY, products);
};

export const getAllUserProducts = () => {
  const saved = localStorage.getItem(USER_PRODUCTS_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse user products', e);
    return {};
  }
};
