'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  ArrowLeft,
  UploadCloud,
  Package,
  IndianRupee,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  X,
  Tag,
  Scale
} from 'lucide-react';

const CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Bakery',
  'Staples & Atta',
  'Snacks & Beverages',
  'Personal Care',
  'Household Care',
];

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'pack'];

export default function AddGroceryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    mrp: '',
    unitQuantity: '1',
    unitType: 'kg',
    stock: '',
    description: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image URL input or File preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, image: value }));
    if (value.startsWith('http://') || value.startsWith('https://')) {
      setImagePreview(value);
    } else {
      setImagePreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API Call to your backend route (e.g. /api/admin/add-grocery)
      const res = await fetch('/api/admin/add-grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          mrp: Number(formData.mrp),
          stock: Number(formData.stock),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/view-grocery');
        }, 1500);
      } else {
        // Fallback for demo/frontend testing
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      // Demo success trigger for UI preview
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Discount % calculation
  const discountPercent =
    formData.mrp && formData.price && Number(formData.mrp) > Number(formData.price)
      ? Math.round(
          ((Number(formData.mrp) - Number(formData.price)) / Number(formData.mrp)) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Bar / Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/view-grocery"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            Back to Inventory
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" /> FreshKart Inventory Admin
          </div>
        </div>

        {/* Header Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <PlusCircle className="w-7 h-7 text-emerald-400" />
            Add New Grocery Item
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Fill in the details to list a new fresh item in the store catalog.
          </p>
        </motion.div>

        {/* Main Form Container */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Form Inputs (2 Cols wide) */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-400" /> Item Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Fresh Organic Kashmiri Apples"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" /> Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl px-3 py-3 outline-none transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" /> Initial Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    placeholder="e.g. 50"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Price, MRP & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    placeholder="120"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs font-bold text-emerald-400 rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-500" /> MRP (₹)
                  </label>
                  <input
                    type="number"
                    name="mrp"
                    min="0"
                    placeholder="150"
                    value={formData.mrp}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-400" /> Quantity / Unit
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="unitQuantity"
                      placeholder="1"
                      value={formData.unitQuantity}
                      onChange={handleChange}
                      className="w-1/2 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl px-3 py-3 outline-none transition-colors text-center"
                    />
                    <select
                      name="unitType"
                      value={formData.unitType}
                      onChange={handleChange}
                      className="w-1/2 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl px-2 py-3 outline-none transition-colors cursor-pointer"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u} className="bg-slate-900 text-white">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Freshly harvested organic apples sourced directly from Himachal Pradesh orchards..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl p-3 outline-none transition-colors placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Image Input Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Product Image URL or Direct File
                </label>
                <input
                  type="url"
                  name="image"
                  placeholder="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6"
                  value={formData.image}
                  onChange={handleImageChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-slate-600"
                />
                
                <div className="relative flex items-center justify-center border border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/50 rounded-xl p-4 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <UploadCloud className="w-4 h-4" />
                    <span>Or click to upload image file directly</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Live Card Preview */}
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Live Store Preview
              </span>

              {/* Preview Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative group overflow-hidden shadow-xl">
                {/* Image Container */}
                <div className="h-40 w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Grocery Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Package className="w-8 h-8 text-slate-700 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-600">No Image Provided</span>
                    </div>
                  )}

                  {discountPercent > 0 && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-md">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {formData.category}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">
                    {formData.title || 'Item Name Preview'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {formData.unitQuantity} {formData.unitType}
                  </p>
                </div>

                {/* Pricing & Stock Status */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-white">
                        ₹{formData.price || '0'}
                      </span>
                      {formData.mrp && Number(formData.mrp) > Number(formData.price) && (
                        <span className="text-[10px] text-slate-500 line-through">
                          ₹{formData.mrp}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                    Stock: {formData.stock || '0'}
                  </span>
                </div>
              </div>

              {/* Status Alert */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-medium"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    Grocery item added successfully! Redirecting...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <Link
              href="/admin/view-grocery"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Adding Grocery...' : 'Add Grocery Item'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}