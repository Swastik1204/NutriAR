import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { saveUserProduct } from '../utils/userProducts';

const AddProduct = () => {
  const { barcode } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    barcode: barcode || '',
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    sugar: '',
    ingredients: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    
    const calories = Number(formData.calories);
    if (isNaN(calories) || calories < 0) newErrors.calories = 'Valid calorie count required';
    if (calories > 10000) newErrors.calories = 'Calories seem too high';
    
    const protein = Number(formData.protein);
    if (isNaN(protein) || protein < 0) newErrors.protein = 'Valid protein amount required';
    if (protein > 1000) newErrors.protein = 'Protein amount seems too high';
    
    const carbs = Number(formData.carbs);
    if (isNaN(carbs) || carbs < 0) newErrors.carbs = 'Valid carbs amount required';
    if (carbs > 1000) newErrors.carbs = 'Carbs amount seems too high';
    
    const fat = Number(formData.fat);
    if (isNaN(fat) || fat < 0) newErrors.fat = 'Valid fat amount required';
    if (fat > 500) newErrors.fat = 'Fat amount seems too high';
    
    const sugar = Number(formData.sugar);
    if (isNaN(sugar) || sugar < 0) newErrors.sugar = 'Valid sugar amount required';
    if (sugar > 500) newErrors.sugar = 'Sugar amount seems too high';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const product = {
      ...formData,
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fat: Number(formData.fat),
      sugar: Number(formData.sugar),
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0)
    };

    saveUserProduct(product);
    
    // Feedback
    alert('Product added successfully!');
    
    // Navigate back to scan with the barcode to trigger the sheet
    navigate('/scan');
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-y-auto pb-24 scrollbar-hide">
      <header className="p-8 pt-16 bg-gradient-to-b from-primary/10 to-transparent">
        <button onClick={() => navigate(-1)} className="mb-4 text-primary flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </button>
        <h1 className="text-4xl font-headline font-black text-white tracking-tighter">Add Product</h1>
        <p className="text-on-surface-variant text-sm mt-2">Contribute to the NutriAR neural database.</p>
      </header>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Barcode</span></label>
            <input type="text" name="barcode" value={formData.barcode} disabled className="input bg-white/5 border-white/10 rounded-2xl text-white/50" />
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Product Name</span></label>
            <input 
              type="text" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              className={`input bg-white/5 rounded-2xl text-white ${errors.name ? 'border-error' : 'border-white/10'}`} 
              placeholder="e.g. Greek Yogurt" 
            />
            {errors.name && <label className="label"><span className="label-text-alt text-error text-xs">{errors.name}</span></label>}
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Brand</span></label>
            <input 
              type="text" 
              name="brand" 
              required 
              value={formData.brand} 
              onChange={handleChange} 
              className={`input bg-white/5 rounded-2xl text-white ${errors.brand ? 'border-error' : 'border-white/10'}`} 
              placeholder="e.g. Chobani" 
            />
            {errors.brand && <label className="label"><span className="label-text-alt text-error text-xs">{errors.brand}</span></label>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Calories</span></label>
              <input 
                type="number" 
                name="calories" 
                required 
                min="0" 
                max="10000"
                value={formData.calories} 
                onChange={handleChange} 
                className={`input bg-white/5 rounded-2xl text-white ${errors.calories ? 'border-error' : 'border-white/10'}`} 
                placeholder="kcal" 
              />
              {errors.calories && <label className="label"><span className="label-text-alt text-error text-xs">{errors.calories}</span></label>}
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Protein (g)</span></label>
              <input 
                type="number" 
                step="0.1" 
                name="protein" 
                required 
                min="0" 
                max="1000"
                value={formData.protein} 
                onChange={handleChange} 
                className={`input bg-white/5 rounded-2xl text-white ${errors.protein ? 'border-error' : 'border-white/10'}`} 
                placeholder="g" 
              />
              {errors.protein && <label className="label"><span className="label-text-alt text-error text-xs">{errors.protein}</span></label>}
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Carbs (g)</span></label>
              <input 
                type="number" 
                step="0.1" 
                name="carbs" 
                required 
                min="0" 
                max="1000"
                value={formData.carbs} 
                onChange={handleChange} 
                className={`input bg-white/5 rounded-2xl text-white ${errors.carbs ? 'border-error' : 'border-white/10'}`} 
                placeholder="g" 
              />
              {errors.carbs && <label className="label"><span className="label-text-alt text-error text-xs">{errors.carbs}</span></label>}
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Fat (g)</span></label>
              <input 
                type="number" 
                step="0.1" 
                name="fat" 
                required 
                min="0" 
                max="500"
                value={formData.fat} 
                onChange={handleChange} 
                className={`input bg-white/5 rounded-2xl text-white ${errors.fat ? 'border-error' : 'border-white/10'}`} 
                placeholder="g" 
              />
              {errors.fat && <label className="label"><span className="label-text-alt text-error text-xs">{errors.fat}</span></label>}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Sugar (g)</span></label>
            <input 
              type="number" 
              step="0.1" 
              name="sugar" 
              required 
              min="0" 
              max="500"
              value={formData.sugar} 
              onChange={handleChange} 
              className={`input bg-white/5 rounded-2xl text-white ${errors.sugar ? 'border-error' : 'border-white/10'}`} 
              placeholder="g" 
            />
            {errors.sugar && <label className="label"><span className="label-text-alt text-error text-xs">{errors.sugar}</span></label>}
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Ingredients (comma separated)</span></label>
            <textarea name="ingredients" value={formData.ingredients} onChange={handleChange} className="textarea bg-white/5 border-white/10 rounded-2xl text-white h-24" placeholder="Milk, Culture, Fruit..."></textarea>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full rounded-2xl h-16 text-lg font-bold shadow-neon-primary border-none text-on-primary">
          Save Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
