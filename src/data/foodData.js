import FOOD_CATALOG from './foodCatalog';

export const foodData = Object.fromEntries(FOOD_CATALOG.map((food) => [food.slug, food]));

export default foodData;
