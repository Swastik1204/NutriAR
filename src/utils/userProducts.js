const USER_PRODUCTS_KEY = 'nutriar_user_products_v1';

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
  localStorage.setItem(USER_PRODUCTS_KEY, JSON.stringify(products));
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
