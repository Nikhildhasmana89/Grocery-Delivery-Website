'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  PlusCircle,
  LayoutGrid,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

// Framer Motion Stagger Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
  },
};

// Mock Data matching your FreshKart Admin Workflow
const STATS = [
  {
    title: 'Total Revenue',
    value: '₹1,28,450',
    change: '+14.2%',
    isPositive: true,
    icon: DollarSign,
    color: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    title: 'Active Orders',
    value: '42',
    change: '+8.5%',
    isPositive: true,
    icon: ShoppingBag,
    color: 'from-cyan-500/20 to-blue-500/10',
    borderColor: 'border-cyan-500/30',
    iconColor: 'text-cyan-400',
  },
  {
    title: 'Grocery Items',
    value: '318',
    change: '-2 items low stock',
    isPositive: false,
    icon: Package,
    color: 'from-amber-500/20 to-yellow-500/10',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  {
    title: 'Total Customers',
    value: '1,420',
    change: '+22.4%',
    isPositive: true,
    icon: Users,
    color: 'from-purple-500/20 to-indigo-500/10',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
  },
];

const RECENT_ORDERS = [
  {
    id: 'ORD-9842',
    customer: 'Aarav Sharma',
    items: 'Fresh Organic Apples, Whole Milk',
    amount: '₹420',
    status: 'Pending',
    time: '5 mins ago',
  },
  {
    id: 'ORD-9841',
    customer: 'Priya Patel',
    items: 'Basmati Rice 5kg, Cooking Oil',
    amount: '₹1,150',
    status: 'Delivered',
    time: '22 mins ago',
  },
  {
    id: 'ORD-9840',
    customer: 'Rohan Gupta',
    items: 'Greek Yogurt, Brown Bread',
    amount: '₹280',
    status: 'Out for Delivery',
    time: '1 hr ago',
  },
  {
    id: 'ORD-9839',
    customer: 'Ananya Verma',
    items: 'Avocado Pack, Chia Seeds',
    amount: '₹640',
    status: 'Delivered',
    time: '2 hrs ago',
  },
];

const LOW_STOCK_ITEMS = [
  { name: 'Organic Honey (500g)', category: 'Pantry', stock: 3, min: 10 },
  { name: 'Fresh Farm Eggs (12 pcs)', category: 'Dairy', stock: 5, min: 15 },
  { name: 'Almond Milk 1L', category: 'Beverages', stock: 2, min: 8 },
];

export default function AdminDashboard() {
  const [filter, setFilter] = useState('Today');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Banner */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full w-fit border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> FreshKart Control Panel
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Admin Overview Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Manage inventory, monitor real-time orders, and track revenue growth.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2 relative z-10">
            <Link
              href="/admin/add-grocery"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-xs hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Add Item
            </Link>
            <Link
              href="/admin/view-grocery"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all active:scale-95"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              View Stock
            </Link>
            <Link
              href="/admin/manage-orders"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all active:scale-95"
            >
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              Orders
            </Link>
          </div>
        </motion.div>

        {/* Analytics Key Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} bg-slate-900/80 border ${stat.borderColor} backdrop-blur-md relative overflow-hidden shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={`p-2 rounded-xl bg-slate-950/60 ${stat.iconColor} border border-slate-800`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h2 className="text-2xl font-black text-white">{stat.value}</h2>
                  <span
                    className={`text-[11px] font-bold flex items-center gap-0.5 ${
                      stat.isPositive ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {stat.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid: Orders + Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders Table (2 Columns wide) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-slate-400">Live order status and dispatch updates</p>
              </div>
              <Link
                href="/admin/manage-orders"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                Manage All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Items</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {RECENT_ORDERS.map((order) => (
                    <motion.tr
                      key={order.id}
                      whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                      className="transition-colors group"
                    >
                      <td className="py-3.5 px-2 font-mono font-bold text-slate-200">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-2 font-medium text-slate-300">
                        {order.customer}
                      </td>
                      <td className="py-3.5 px-2 text-slate-400 max-w-[180px] truncate">
                        {order.items}
                      </td>
                      <td className="py-3.5 px-2 font-bold text-emerald-400">
                        {order.amount}
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : order.status === 'Out for Delivery'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'Out for Delivery' && <Clock className="w-3 h-3" />}
                          {order.status === 'Pending' && <AlertTriangle className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Low Stock Alerts & Quick Admin Actions */}
          <motion.div variants={itemVariants} className="space-y-6">
            
            {/* Low Stock Widget */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Low Stock Inventory
                </h3>
                <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Action Needed
                </span>
              </div>

              <div className="space-y-3">
                {LOW_STOCK_ITEMS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400">
                        {item.stock} left
                      </span>
                      <p className="text-[9px] text-slate-500">Min threshold: {item.min}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/admin/view-grocery"
                className="w-full mt-2 block text-center py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700"
              >
                Restock Items
              </Link>
            </div>

            {/* Quick Admin Actions Box */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/20 p-5 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Store Status
              </h3>
              <p className="text-xs text-slate-400">
                FreshKart ordering system is operating normally with high performance.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-300 border-t border-slate-800">
                <span>System Health</span>
                <span className="text-emerald-400 font-mono font-bold">100% Operational</span>
              </div>
            </div>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}