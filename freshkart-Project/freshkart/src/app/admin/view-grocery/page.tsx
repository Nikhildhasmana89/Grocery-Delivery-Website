"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  PlusCircle,
  ArrowLeft,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";

interface IGroceryItem {
  _id: string;
  name: string;
  category: string;
  price: string | number;
  unit: string;
  image: string;
  stock?: number;
  minStock?: number;
}

export default function ViewGroceryPage() {
  const [items, setItems] = useState<IGroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/add-grocery");
      if (res.data?.groceries) {
        setItems(res.data.groceries);
      }
    } catch (err) {
      console.error("Failed to fetch groceries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRestock = async (id: string, name: string) => {
    try {
      setRestockingId(id);
      const res = await axios.post("/api/admin/restock", { groceryId: id, amount: 20 });
      if (res.data?.success) {
        setStatusMessage(`Restocked +20 units to ${name}`);
        setTimeout(() => setStatusMessage(null), 3000);
        await fetchItems();
      }
    } catch (err) {
      console.error("Restock failed:", err);
    } finally {
      setRestockingId(null);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Boxes className="w-6 h-6 text-emerald-400" />
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Inventory & Stock Control
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage all grocery items, view stock counts, and restock inventory.
              </p>
            </div>
          </div>

          <Link
            href="/admin/add-grocery"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-opacity w-fit"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Grocery Item</span>
          </Link>
        </div>

        {/* Status Toast */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search items by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 placeholder:text-slate-500"
          />
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No Grocery Items Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add products using the button above to populate your inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const currentStock = typeof item.stock === "number" ? item.stock : 20;
              const isLowStock = currentStock <= 10;

              return (
                <div
                  key={item._id}
                  className="rounded-2xl bg-slate-900 border border-slate-800/80 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {isLowStock && (
                        <span className="absolute top-2 left-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-md">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1 mt-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        ₹{item.price} <span className="text-[10px] text-slate-500">/ {item.unit}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Stock Status</p>
                      <p
                        className={`text-xs font-black ${
                          isLowStock ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {currentStock} units left
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={restockingId === item._id}
                      onClick={() => handleRestock(item._id, item.name)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {restockingId === item._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>+20 Stock</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
