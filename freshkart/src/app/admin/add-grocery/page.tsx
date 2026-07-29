"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Tag, 
  DollarSign, 
  Scale, 
  ShoppingBag 
} from "lucide-react";
import { addGroceryAction } from "@/app/actions/addGrocery";

const CATEGORIES = [
  "fruits & vegetables",
  "dairy & eggs",
  "bakery & bread",
  "meat & seafood",
  "snacks & beverages",
  "pantry & staples",
  "frozen foods",
  "health & wellness",
  "baby care",
  "household essentials",
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Helper function to compress large camera images in the browser using HTML5 Canvas
 */
const compressImage = (file: File, maxWidth = 800, quality = 0.75): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob || file),
          "image/jpeg",
          quality
        );
      };
    };
  });
};

export default function AddGroceryPage() {
  const [formData, setFormData] = useState({
    name: "",
    category: CATEGORIES[0],
    price: "",
    unit: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Handle Text Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle File Selection and Preview
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview); // Clean memory
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Optimized Form Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ type: "error", message: "Please upload an image." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // ⚡ Step 1: Compress the image in browser (Reduces ~5MB file to ~150KB)
      const compressedBlob = await compressImage(imageFile, 800, 0.75);

      // ⚡ Step 2: Build FormData payload
      const submissionData = new FormData();
      submissionData.append("name", formData.name);
      submissionData.append("category", formData.category);
      submissionData.append("price", formData.price);
      submissionData.append("unit", formData.unit);
      submissionData.append("image", compressedBlob, "grocery.jpg");

      // ⚡ Step 3: Trigger Server Action
      const response = await addGroceryAction(submissionData);

      setLoading(false);

      if (response.success) {
        setStatus({ type: "success", message: "Grocery item added successfully!" });
        // Reset Form
        setFormData({ name: "", category: CATEGORIES[0], price: "", unit: "" });
        setImageFile(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      } else {
        setStatus({ type: "error", message: response.error || "Failed to add grocery item." });
      }
    } catch (err: any) {
      setLoading(false);
      setStatus({ type: "error", message: err.message || "An unexpected error occurred." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Add New Grocery Item</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill in the details below to list a new item in Freshkart.
          </p>
        </motion.div>

        {/* Status Alert */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              )}
              <span>{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Item Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Organic Cavendish Bananas"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </motion.div>

          {/* Category & Unit (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Tag className="w-4 h-4" />
                </span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 capitalize focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Unit */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Unit
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Scale className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 1 kg, 500 ml, 12 pcs"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </motion.div>
          </div>

          {/* Price */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Price
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </span>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                placeholder="e.g. 4.99"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </motion.div>

          {/* Animated File Dropzone */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Product Image
            </label>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 transition-colors flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 group"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imagePreview ? (
                <div className="relative flex flex-col items-center">
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl shadow-md mb-2"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Click or drag to replace image</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-emerald-500 transition-colors mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG, JPG or WEBP (Auto-optimized)</p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Optimizing & Uploading...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Add Item to Store</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}