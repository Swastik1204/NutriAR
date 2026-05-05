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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
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
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input bg-white/5 border-white/10 rounded-2xl text-white" placeholder="e.g. Greek Yogurt" />
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Brand</span></label>
            <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="input bg-white/5 border-white/10 rounded-2xl text-white" placeholder="e.g. Chobani" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Calories</span></label>
              <input type="number" name="calories" required value={formData.calories} onChange={handleChange} className="input bg-white/5 border-white/10 rounded-2xl text-white" placeholder="kcal" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Protein (g)</span></label>
              <input type="number" step="0.1" name="protein" required value={formData.protein} onChange={handleChange} className="input bg-white/5 border-white/10 rounded-2xl text-white" placeholder="g" />
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Carbs (g)</span></label>
              <input type="number" step="0.1" name="carbs" required value={formData.carbs} onChange={handleChange} className="input bg-white/5 border-white/10 rounded-2xl text-white" placeholder="g" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Fat (g)</span></label>
              <input type="number" step="0.1" name="fat" required value={formData.fat} onChange={handleChange} className="input bg-white/5 border-white/10 rounded-2xl text-white" placeholder="g" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text text-[10px] font-bold uppercase tracking-widest opacity-50">Sugar (g)</span></label>
            <input type="number" step="0.1" name="sugar" required value={formData.sugar} onChange={handleChange} className="input bg-white/5 border-white/10 rounded-2xl text-white" placeholder="g" />
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
