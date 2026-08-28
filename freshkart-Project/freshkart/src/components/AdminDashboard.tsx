"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { UserInterface } from "./Nav";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "@/lib/socket";
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
  ChevronRight,
  Sparkles,
  Activity,
  Zap,
  CircleDot,
  Truck,
  Boxes,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface StatMetric {
  value: string | number;
  change: string;
  isPositive: boolean;
  hasPrev?: boolean;
}

interface GroceryStatMetric extends StatMetric {
  lowStockCount: number;
}

interface DashboardData {
  period: string;
  stats: {
    revenue: StatMetric;
    activeOrders: StatMetric;
    groceryItems: GroceryStatMetric;
    totalCustomers: StatMetric;
  };
  recentOrders: {
    id: string;
    _id: string;
    customer: string;
    items: string;
    amount: string;
    status: string;
    time: string;
  }[];
  lowStockItems: {
    _id: string;
    name: string;
    category: string;
    stock: number;
    min: number;
  }[];
  storeStatus: {
    isDbConnected: boolean;
    dbStatusText: string;
    apiStatusText: string;
    systemHealthText: string;
  };
}

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* =========================================================
   HELPERS
========================================================= */

const getStatusStyle = (status: string) => {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
    case "delivered":
      return {
        wrapper: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        dot: "bg-emerald-400",
        icon: CheckCircle2,
      };
    case "out of delivery":
    case "out_for_delivery":
      return {
        wrapper: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
        dot: "bg-cyan-400",
        icon: Truck,
      };
    default:
      return {
        wrapper: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        dot: "bg-amber-400",
        icon: AlertTriangle,
      };
  }
};

const getStockPercentage = (stock: number, min: number) => {
  if (!min || min <= 0) return stock > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, (stock / min) * 100));
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminDashboard({ user }: { user?: UserInterface }) {
  const [filter, setFilter] = useState<"Today" | "Week" | "Month">("Today");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restockingId, setRestockingId] = useState<string | null>(null);

  /* =======================================================
     FETCH REAL DASHBOARD ANALYTICS FROM MONGODB
  ======================================================= */
  const fetchDashboard = useCallback(
    async (selectedPeriod: string, isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setRefreshing(true);
        } else if (!data) {
          setLoading(true);
        }
        setError(null);

        const res = await axios.get(`/api/admin/dashboard?period=${selectedPeriod}`, {
          timeout: 10000,
        });

        if (res.data?.success) {
          setData(res.data);
        } else {
          setError(res.data?.message || "Failed to load dashboard data");
        }
      } catch (err: any) {
        console.error("❌ Fetch Dashboard Error:", err);
        const serverError =
          err.response?.data?.message ||
          (err.code === "ECONNABORTED" ? "Dashboard backend request timed out." : err.message);
        setError(serverError || "Unable to connect to dashboard backend. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [data]
  );

  useEffect(() => {
    fetchDashboard(filter);
  }, [filter, fetchDashboard]);

  /* =======================================================
     REAL-TIME SOCKET UPDATES
  ======================================================= */
  useEffect(() => {
    const adminId = user?._id ? String(user._id) : "admin";
    const socket = getSocket(adminId);

    const handleRealtimeUpdate = () => {
      console.log("⚡ Real-time dashboard update received");
      fetchDashboard(filter, true);
    };

    socket.on("new-order", handleRealtimeUpdate);
    socket.on("order-updated", handleRealtimeUpdate);
    socket.on("order-cancelled", handleRealtimeUpdate);
    socket.on("inventory-updated", handleRealtimeUpdate);
    socket.on("product-created", handleRealtimeUpdate);
    socket.on("product-updated", handleRealtimeUpdate);

    return () => {
      socket.off("new-order", handleRealtimeUpdate);
      socket.off("order-updated", handleRealtimeUpdate);
      socket.off("order-cancelled", handleRealtimeUpdate);
      socket.off("inventory-updated", handleRealtimeUpdate);
      socket.off("product-created", handleRealtimeUpdate);
      socket.off("product-updated", handleRealtimeUpdate);
    };
  }, [filter, fetchDashboard, user?._id]);

  /* =======================================================
     RESTOCK ITEM HANDLER
  ======================================================= */
  const handleRestock = async (groceryId: string) => {
    try {
      setRestockingId(groceryId);
      const res = await axios.post("/api/admin/restock", {
        groceryId,
        amount: 20,
      });
      if (res.data?.success) {
        await fetchDashboard(filter, true);
      }
    } catch (err) {
      console.error("Restock Error:", err);
    } finally {
      setRestockingId(null);
    }
  };

  /* =======================================================
     PREPARE STAT CARDS DATA
  ======================================================= */
  const statCards = [
    {
      title: "Total Revenue",
      value: data?.stats?.revenue?.value ?? "₹0",
      change: data?.stats?.revenue?.change ?? "No previous data",
      isPositive: data?.stats?.revenue?.isPositive ?? true,
      icon: DollarSign,
      color: "emerald",
      description: `vs. previous ${filter.toLowerCase()}`,
    },
    {
      title: "Active Orders",
      value: data?.stats?.activeOrders?.value ?? 0,
      change: data?.stats?.activeOrders?.change ?? "Orders in progress",
      isPositive: data?.stats?.activeOrders?.isPositive ?? true,
      icon: ShoppingBag,
      color: "cyan",
      description: "currently processing",
    },
    {
      title: "Grocery Items",
      value: data?.stats?.groceryItems?.value ?? 0,
      change: data?.stats?.groceryItems?.change ?? "Total active products",
      isPositive: data?.stats?.groceryItems?.isPositive ?? true,
      icon: Package,
      color: "amber",
      description: "total inventory items",
    },
    {
      title: "Total Customers",
      value: data?.stats?.totalCustomers?.value ?? "0",
      change: data?.stats?.totalCustomers?.change ?? "Registered users",
      isPositive: true,
      icon: Users,
      color: "purple",
      description: "registered customer accounts",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-5 text-slate-100 selection:bg-emerald-400 selection:text-slate-950 md:px-8 md:py-8 font-sans">
      {/* Background Decor */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 40, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-[20%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[130px]"
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl space-y-7"
      >
        {/* HEADER SECTION */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
        >
          <div className="relative flex flex-col justify-between gap-7 p-6 md:p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                FreshKart Control Center
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Admin Overview
                <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Live Production Dashboard
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Real-time MongoDB analytics, inventory alerts, revenue tracking, and order fulfillment.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {data?.storeStatus?.isDbConnected ? "MongoDB Connected" : "Connecting to Database..."}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <button
                  type="button"
                  onClick={() => fetchDashboard(filter, true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
                  <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
              <Link
                href="/admin/add-grocery"
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-xs font-black text-slate-950 shadow-[0_10px_30px_rgba(16,185,129,0.18)] transition hover:shadow-[0_15px_40px_rgba(16,185,129,0.28)] active:scale-95"
              >
                <PlusCircle className="relative h-4 w-4" />
                <span className="relative">Add Item</span>
              </Link>
              <Link
                href="/admin/view-grocery"
                className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/30 hover:bg-slate-700 active:scale-95"
              >
                <LayoutGrid className="h-4 w-4 text-emerald-400" />
                View Stock
              </Link>
              <Link
                href="/admin/manage-orders"
                className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/30 hover:bg-slate-700 active:scale-95"
              >
                <ClipboardList className="h-4 w-4 text-cyan-400" />
                Manage Orders
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchDashboard(filter, true)}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg font-bold text-red-300 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* FILTER BAR */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Real Performance Analytics
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">
              Database Metrics ({filter})
            </h2>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/70 p-1 backdrop-blur">
            {(["Today", "Week", "Month"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilter(period)}
                className={`relative rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                  filter === period ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {filter === period && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 rounded-lg bg-slate-800"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{period}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* STATS CARDS GRID */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colorMap: Record<string, string> = {
              emerald: "from-emerald-500/[0.12] via-slate-900 to-slate-950 border-emerald-500/20 text-emerald-400",
              cyan: "from-cyan-500/[0.12] via-slate-900 to-slate-950 border-cyan-500/20 text-cyan-400",
              amber: "from-amber-500/[0.12] via-slate-900 to-slate-950 border-amber-500/20 text-amber-400",
              purple: "from-purple-500/[0.12] via-slate-900 to-slate-950 border-purple-500/20 text-purple-400",
            };

            return (
              <motion.div
                key={stat.title}
                variants={cardVariants}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-xl ${colorMap[stat.color]}`}
              >
                <div className="relative flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    {stat.title}
                  </span>
                  <div className="rounded-xl border border-slate-700/80 bg-slate-950/70 p-2.5">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="relative mt-5">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {loading ? (
                      <span className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                      </span>
                    ) : (
                      stat.value
                    )}
                  </h2>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span
                      className={`flex items-center gap-0.5 text-[10px] font-bold ${
                        stat.isPositive ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {stat.isPositive ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {stat.change}
                    </span>

                    <span className="text-[9px] text-slate-600">{stat.description}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* RECENT CUSTOMER ORDERS */}
          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 shadow-xl backdrop-blur-xl lg:col-span-2"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 p-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Recent Customer Orders</h3>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    LIVE DATA
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Real customer order history from MongoDB
                </p>
              </div>

              <Link
                href="/admin/manage-orders"
                className="group flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                <span>Manage All Orders</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* ORDERS TABLE OR EMPTY STATE */}
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                <span>Loading real customer orders...</span>
              </div>
            ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <ShoppingBag className="h-10 w-10 text-slate-700 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No Orders Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Customer orders will automatically appear here in real-time as soon as they are placed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
                      <th className="px-5 py-3">Order ID</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Items</th>
                      <th className="px-3 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => {
                      const status = getStatusStyle(order.status);
                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={order._id}
                          className="group border-b border-slate-800/50 transition-colors last:border-0 hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-slate-800 p-1.5 text-slate-400">
                                <Package className="h-full w-full" />
                              </div>
                              <div>
                                <p className="font-mono text-xs font-bold text-slate-200">
                                  {order.id}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-500">
                                  <Clock className="h-2.5 w-2.5" />
                                  {order.time}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <p className="text-xs font-semibold text-slate-300">{order.customer}</p>
                          </td>

                          <td className="max-w-[200px] px-3 py-4">
                            <p className="truncate text-[11px] text-slate-400">{order.items}</p>
                          </td>

                          <td className="px-3 py-4">
                            <span className="font-bold text-emerald-400">{order.amount}</span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize ${status.wrapper}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                              <StatusIcon className="h-3 w-3" />
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-800/70 bg-slate-950/30 px-5 py-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                Real-time MongoDB sync enabled
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {data?.recentOrders?.length || 0} recent order(s)
              </span>
            </div>
          </motion.section>

          {/* RIGHT COLUMN — LOW STOCK & SYSTEM HEALTH */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* LOW STOCK ALERTS */}
            <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Low Stock Inventory</h3>
                    <p className="text-[9px] text-slate-500">Automatic stock thresholds</p>
                  </div>
                </div>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] font-black text-amber-400">
                  {data?.lowStockItems?.length || 0} ALERTS
                </span>
              </div>

              <div className="relative mt-5 space-y-3">
                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Checking inventory levels...
                  </div>
                ) : !data?.lowStockItems || data.lowStockItems.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">Inventory Well Stocked</p>
                    <p className="text-[10px] text-slate-500">
                      No grocery items currently require restocking.
                    </p>
                  </div>
                ) : (
                  data.lowStockItems.map((item) => {
                    const percentage = getStockPercentage(item.stock, item.min);
                    return (
                      <div
                        key={item._id}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold text-slate-200">
                              {item.name}
                            </p>
                            <p className="text-[9px] uppercase tracking-wider text-slate-500">
                              {item.category}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[11px] font-black text-amber-400">
                              {item.stock} left
                            </p>
                            <p className="text-[8px] text-slate-500">Min threshold: {item.min}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex-1 h-1 overflow-hidden rounded-full bg-slate-800">
                            <div
                              style={{ width: `${percentage}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-amber-300"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={restockingId === item._id}
                            onClick={() => handleRestock(item._id)}
                            className="text-[9px] font-bold text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {restockingId === item._id ? "Restocking..." : "+ Restock"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Link
                href="/admin/view-grocery"
                className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-amber-500/30 hover:bg-slate-700"
              >
                <Boxes className="h-3.5 w-3.5 text-amber-400" />
                <span>View Full Inventory</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </section>

            {/* SYSTEM HEALTH */}
            <section className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 p-5 shadow-xl">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Store Infrastructure</h3>
                  </div>
                  <Zap className="h-4 w-4 text-emerald-400" />
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Real-time database connectivity and backend service status.
                </p>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">System Health</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <CircleDot className="h-3 w-3" />
                      {data?.storeStatus?.systemHealthText || "100% Operational"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[9px] text-slate-500">API</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-emerald-400">
                      {data?.storeStatus?.apiStatusText || "Healthy"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-[9px] text-slate-500">Database</span>
                    </div>
                    <p
                      className={`mt-1 text-xs font-bold ${
                        data?.storeStatus?.isDbConnected ? "text-cyan-400" : "text-amber-400"
                      }`}
                    >
                      {data?.storeStatus?.dbStatusText || "Connected"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        </div>

        {/* BOTTOM QUICK NAVIGATION */}
        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Quick Navigation</h3>
              <p className="mt-1 text-[10px] text-slate-500">
                Jump directly to admin management areas
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href="/admin/add-grocery"
              className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Add Grocery</p>
                  <p className="text-[9px] text-slate-500">Add new product</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
            </Link>

            <Link
              href="/admin/view-grocery"
              className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Inventory Stock</p>
                  <p className="text-[9px] text-slate-500">Manage products</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
            </Link>

            <Link
              href="/admin/manage-orders"
              className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-purple-500/30 hover:bg-purple-500/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Manage Orders</p>
                  <p className="text-[9px] text-slate-500">Fulfill & assign</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-purple-400" />
            </Link>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}