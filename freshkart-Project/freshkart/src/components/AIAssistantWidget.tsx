"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Loader2,
  ShoppingBag,
  Plus,
  Minus,
  MessageSquare,
  RefreshCw,
  ChevronRight,
  HelpCircle,
  Utensils,
  Receipt,
  Truck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addToCart, decreaseQuantity } from "@/redux/CardSlice";

interface RecommendedProduct {
  _id: string;
  name: string;
  category: string;
  price: string | number;
  unit: string;
  image: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  recommendedProducts?: RecommendedProduct[];
  timestamp: string;
}

const PRESET_QUICK_PROMPTS = [
  { label: "Suggest dinner groceries", icon: Utensils, prompt: "Can you suggest groceries and a quick recipe for a healthy dinner?" },
  { label: "₹500 Budget List", icon: Receipt, prompt: "Create a ₹500 budget shopping list of daily essentials." },
  { label: "Order Status Help", icon: Truck, prompt: "What is the status of my recent order?" },
  { label: "Refund & Support Policy", icon: HelpCircle, prompt: "How do refund and cancellation requests work on FreshKart?" },
];

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! 👋 I'm **FreshBot**, your personal AI Grocery & Support Assistant. Ask me for recipe ideas, budget shopping lists, product recommendations, or order help!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to get response from AI assistant");
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply || "Here is what I found for you:",
        recommendedProducts: data.recommendedProducts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI Assistant Chat Error:", err);
      setError(err.message || "Unable to reach AI Assistant");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="font-sans">
      {/* FLOATING TRIGGER BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-slate-900 px-4 py-3 text-white shadow-2xl shadow-emerald-500/20 backdrop-blur-xl transition-all cursor-pointer group hover:border-emerald-400"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 font-black">
              <Bot className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                FreshBot AI <Sparkles className="w-3 h-3 text-emerald-400" />
              </p>
              <p className="text-[10px] text-slate-400">Grocery & Support</p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* CHAT DIALOG WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-[580px] w-[calc(100vw-32px)] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl shadow-slate-950 backdrop-blur-2xl"
          >
            {/* CHAT HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 font-black shadow-md shadow-emerald-500/20">
                  <Bot className="h-5 w-5" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    FreshBot AI
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold text-emerald-400 border border-emerald-500/20">
                      ONLINE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Grocery & Customer Support</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                aria-label="Close AI Assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MESSAGES CONTAINER */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "rounded-br-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-md"
                        : "rounded-bl-xs bg-slate-900 border border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <span
                      className={`mt-1.5 block text-[9px] font-medium text-right ${
                        msg.sender === "user" ? "text-emerald-100" : "text-slate-500"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* RECOMMENDED PRODUCTS CAROUSEL / GRID */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-3 w-full space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> Recommended Products ({msg.recommendedProducts.length})
                      </p>

                      <div className="grid grid-cols-2 gap-2.5">
                        {msg.recommendedProducts.map((product) => (
                          <ProductItemCard key={product._id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* LOADING INDICATOR */}
              {loading && (
                <div className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-slate-400 w-fit">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>FreshBot is thinking...</span>
                </div>
              )}

              {/* ERROR ALERT */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
                  <span>{error}</span>
                  <button
                    onClick={() => handleSendMessage()}
                    className="text-[10px] font-bold text-red-300 underline ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* PRESET CHIPS */}
            {messages.length <= 3 && !loading && (
              <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/80">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_QUICK_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <Icon className="w-3 h-3 text-emerald-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* INPUT BAR */}
            <div className="border-t border-slate-800/80 bg-slate-900/90 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about recipes, budget list, or orders..."
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 transition-all hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  aria-label="Send Message"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  ) : (
                    <Send className="h-4 w-4 stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   SUB-COMPONENT: RECOMMENDED PRODUCT CARD WITH REDUX CART ADD
========================================================= */
function ProductItemCard({ product }: { product: RecommendedProduct }) {
  const dispatch = useDispatch<AppDispatch>();

  const quantity = useSelector((state: RootState) => {
    if (!product._id) return 0;
    const cartList = state.cart?.cartData || (state as any).card?.cardData || [];
    let count = 0;
    for (let i = 0; i < cartList.length; i++) {
      if (String(cartList[i]._id) === String(product._id)) count++;
    }
    return count;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 space-y-2 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ShoppingBag className="w-5 h-5 text-slate-600" />
          )}
        </div>

        <h4 className="text-[11px] font-bold text-white line-clamp-1">{product.name}</h4>
        <p className="text-[10px] text-emerald-400 font-black">
          ₹{product.price} <span className="text-slate-500 font-normal">/ {product.unit}</span>
        </p>
      </div>

      {quantity === 0 ? (
        <button
          type="button"
          onClick={() =>
            dispatch(
              addToCart({
                _id: product._id,
                name: product.name,
                category: product.category,
                price: product.price,
                unit: product.unit,
                image: product.image,
              })
            )
          }
          className="flex items-center justify-center gap-1 w-full py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] hover:bg-emerald-500/20 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      ) : (
        <div className="flex items-center justify-between px-1.5 py-0.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
          <button
            type="button"
            onClick={() => product._id && dispatch(decreaseQuantity(product._id))}
            className="hover:text-emerald-300 cursor-pointer"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            onClick={() =>
              dispatch(
                addToCart({
                  _id: product._id,
                  name: product.name,
                  category: product.category,
                  price: product.price,
                  unit: product.unit,
                  image: product.image,
                })
              )
            }
            className="hover:text-emerald-300 cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
