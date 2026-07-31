"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addToCart, decreaseQuantity, clearCart, IGrocery } from "@/redux/CardSlice";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = React.useState(false);

  // Safely grab cart items array from Redux
  const cartData: IGrocery[] = useSelector(
    (state: RootState) => state.cart?.cartData || (state as any).card?.cardData
  ) || [];

  // Group items by _id to aggregate quantities and prices easily
  const groupedCart = React.useMemo(() => {
    const map = new Map<string, { item: IGrocery; count: number }>();
    cartData.forEach((item) => {
      const key = item._id || item.name;
      if (map.has(key)) {
        map.get(key)!.count += 1;
      } else {
        map.set(key, { item, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [cartData]);

  // Calculate pricing metrics
  const subtotal = React.useMemo(() => {
    return cartData.reduce((acc, item) => {
      const numericPrice = typeof item.price === "number" 
        ? item.price 
        : parseFloat(item.price) || 0;
      return acc + numericPrice;
    }, 0);
  }, [cartData]);

  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + deliveryFee + tax;

  const handleProceedToCheckout = () => {
    if (loading) return;
    setLoading(true);
    // Explicit root-relative path targeting Option B
    router.push("/user/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Dynamic Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* Header / Back Link */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors group"
          >
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span>Continue Shopping</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-white tracking-tight">
                Your <span className="text-emerald-400">Cart</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {cartData.length} {cartData.length === 1 ? "item" : "items"} selected
              </p>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        {groupedCart.length === 0 ? (
          /* EMPTY CART STATE */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/60 text-center backdrop-blur-xl"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-10 h-10 text-emerald-400 opacity-80" />
              </div>
              <Sparkles className="w-6 h-6 text-emerald-400 absolute top-0 right-0 animate-pulse" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-md mb-8">
              Looks like you haven't added any fresh groceries to your cart yet. Explore our fresh collection and start shopping!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explore Groceries</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          /* CART WITH ITEMS GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Items Column (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Items List
                </span>
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              </div>

              {/* Items Cards Stream */}
              <AnimatePresence mode="popLayout">
                {groupedCart.map(({ item, count }) => {
                  const itemPrice = typeof item.price === "number" 
                    ? item.price 
                    : parseFloat(item.price) || 0;
                  return (
                    <motion.div
                      key={item._id || item.name}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="group flex flex-col sm:flex-row items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 shadow-md shadow-slate-950/40 backdrop-blur-md gap-4"
                    >
                      {/* Left Item Details */}
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-slate-700" />
                          )}
                        </div>
                        <div className="space-y-1">
                          {item.category && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.category}
                            </span>
                          )}
                          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                            {item.name}
                          </h3>
                          {item.unit && (
                            <p className="text-[11px] text-slate-400 font-medium">
                              {item.unit}
                            </p>
                          )}
                          <p className="text-xs font-black text-emerald-400 sm:hidden pt-0.5">
                            ₹{itemPrice * count}
                          </p>
                        </div>
                      </div>

                      {/* Right Quantity Controls & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2.5 px-2 py-1 rounded-xl bg-slate-950 border border-slate-800">
                          <button
                            onClick={() => item._id && dispatch(decreaseQuantity(item._id))}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors cursor-pointer"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-white min-w-[16px] text-center">
                            {count}
                          </span>
                          <button
                            onClick={() => dispatch(addToCart(item))}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors cursor-pointer"
                            aria-label="Increase"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Total Price for this item */}
                        <div className="hidden sm:block text-right min-w-[70px]">
                          <p className="text-xs text-slate-500 font-medium">Total</p>
                          <p className="text-sm font-black text-emerald-400">
                            ₹{itemPrice * count}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right Order Summary Column (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="p-5 md:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl shadow-slate-950/60 backdrop-blur-xl space-y-5">
                  <h2 className="text-base font-black text-white tracking-tight border-b border-slate-800 pb-3 flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      FreshKart Express
                    </span>
                  </h2>

                  {/* Summary Rows */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-white">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Estimated Taxes (GST 5%)</span>
                      <span className="font-bold text-white">₹{tax}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Delivery Partner Fee</span>
                      {deliveryFee === 0 ? (
                        <span className="font-bold text-emerald-400">FREE</span>
                      ) : (
                        <span className="font-bold text-white">₹{deliveryFee}</span>
                      )}
                    </div>
                    {subtotal > 0 && subtotal < 500 && (
                      <p className="text-[10px] text-amber-400 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        💡 Add ₹{500 - subtotal} more items to get <b>FREE Delivery</b>!
                      </p>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div className="border-t border-slate-800/80 pt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400">Grand Total</p>
                      <p className="text-[10px] text-slate-500">Includes all applicable taxes</p>
                    </div>
                    <p className="text-xl font-black text-emerald-400 tracking-tight">
                      ₹{grandTotal}
                    </p>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={loading}
                    className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <motion.div
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Checkout</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.div>
                  </button>

                  {/* Trust Badges */}
                  <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>100% Safe Payments</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>10 Min Instant Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}