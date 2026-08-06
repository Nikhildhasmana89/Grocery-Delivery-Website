"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  User,
  MapPin,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Truck,
  Copy,
  Check,
  CreditCard,
  ImageIcon,
} from "lucide-react";

// --- Types ---
export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface AdminOrderCardProps {
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string | { fullAddress?: string };
  orderDate?: string;
  status?: OrderStatus;
  paymentMethod?: string;
  items?: OrderItem[];
  totalAmount?: number;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

// --- Default Mock Data ---
const defaultItems: OrderItem[] = [
  {
    id: "1",
    name: "Wireless Mechanical Keyboard",
    quantity: 1,
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Ergonomic Mouse",
    quantity: 2,
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=80",
  },
];

// Status badge styling map
const statusStyles: Record<
  OrderStatus,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  Pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    icon: <Clock className="w-3.5 h-3.5 mr-1" />,
  },
  Processing: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    icon: <Package className="w-3.5 h-3.5 mr-1" />,
  },
  Shipped: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    icon: <Truck className="w-3.5 h-3.5 mr-1" />,
  },
  Delivered: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
  },
  Cancelled: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
  },
};

export default function AdminOrderCard({
  orderId = "ORD-8942-XJ",
  customerName = "Sarah Jenkins",
  customerEmail = "sarah.j@example.com",
  shippingAddress = "742 Evergreen Terrace, Springfield, OR 97477",
  orderDate = "Oct 24, 2026 • 14:32",
  status = "Processing",
  paymentMethod = "Credit Card (•••• 4242)",
  items = defaultItems,
  totalAmount = 229.97,
  onStatusChange,
}: AdminOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setCurrentStatus(newStatus);
    if (onStatusChange) onStatusChange(newStatus);
  };

  const currentStatusStyle =
    statusStyles[currentStatus as OrderStatus] ?? statusStyles.Pending;

  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden font-sans"
    >
      {/* --- Card Header --- */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {orderId}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                title="Copy Order ID"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
              <Clock className="w-3 h-3 mr-1" />
              {orderDate}
            </p>
          </div>
        </div>

        {/* Status Badge & Dropdown Selector */}
        <div className="flex items-center space-x-2">
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}
          >
            {currentStatusStyle.icon}
            {currentStatus}
          </div>
          <select
            value={currentStatus}
            onChange={handleStatusSelect}
            className="text-xs font-medium bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <option value="Pending">Set Pending</option>
            <option value="Processing">Set Processing</option>
            <option value="Shipped">Set Shipped</option>
            <option value="Delivered">Set Delivered</option>
            <option value="Cancelled">Set Cancelled</option>
          </select>
        </div>
      </div>

      {/* --- Main Info Section --- */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Customer Details */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Customer
          </span>
          <div className="flex items-center text-slate-800 dark:text-slate-200 font-medium">
            <User className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
            <span>{customerName}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
            {customerEmail}
          </p>
        </div>

        {/* Delivery Details */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Shipping To
          </span>
          <div className="flex items-start text-slate-800 dark:text-slate-200 font-medium">
            <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {typeof shippingAddress === "string"
                ? shippingAddress
                : shippingAddress?.fullAddress}
            </span>
          </div>
        </div>
      </div>

      {/* --- Quick-Glance Product Visual Preview --- */}
      <div className="px-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Products:
          </span>
          <div className="flex items-center -space-x-2 overflow-hidden">
            {items.slice(0, 3).map((item, idx) => (
              <div
                key={item.id || idx}
                className="relative z-10 w-9 h-9 rounded-lg border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-sm"
                title={`${(
  Number(item.price || 0) * Number(item.quantity || 0)
).toFixed(2)}`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Package className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {items.length > 3 && (
              <div className="relative z-20 w-9 h-9 rounded-lg border-2 border-white dark:border-slate-900 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                +{items.length - 3}
              </div>
            )}
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"} Total
        </span>
      </div>

      {/* --- Collapsible Order Items Section --- */}
      <div className="border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span className="flex items-center font-semibold">
            {isExpanded ? "Hide Details" : "View Detailed Item List"}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden bg-slate-50/50 dark:bg-slate-950/30"
            >
              <div className="px-5 py-3 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 flex items-center justify-between text-xs gap-3"
                  >
                    {/* Item Thumbnail Image & Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-slate-400 mt-0.5">
                          ${Number(item.price || 0).toFixed(2)} × {Number(item.quantity || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                     ${(
  Number(item.price || 0) * Number(item.quantity || 0)
).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Card Footer --- */}
      <div className="p-5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          <span>{paymentMethod}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">
            Total
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            ${Number(totalAmount || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}