import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    wholesalePrice: '',
    retailPrice: '',
    currentStock: '',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name,
        company: initialData.company,
        wholesalePrice: initialData.wholesalePrice.toString(),
        retailPrice: initialData.retailPrice.toString(),
        currentStock: initialData.currentStock.toString(),
      });
    } else if (isOpen && !initialData) {
      setFormData({
        name: '',
        company: '',
        wholesalePrice: '',
        retailPrice: '',
        currentStock: '',
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      name: formData.name,
      company: formData.company,
      wholesalePrice: Number(formData.wholesalePrice),
      retailPrice: Number(formData.retailPrice),
      currentStock: Number(formData.currentStock),
    };
    onSave(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-emerald-600 text-white">
          <h2 className="text-lg font-bold">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. Urea 46%"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company/Brand</label>
            <input
              required
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. IFFCO"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Wholesale Price</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                name="wholesalePrice"
                value={formData.wholesalePrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Retail Price</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                name="retailPrice"
                value={formData.retailPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {initialData ? 'Current Stock Quantity' : 'Initial Stock Quantity'}
            </label>
            <input
              required
              type="number"
              min="0"
              name="currentStock"
              value={formData.currentStock}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="0"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md active:transform active:scale-95"
            >
              {initialData ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;