"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserInterface } from "./Nav";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

/* =========================================================
   MOCK DATA
========================================================= */

const STATS = [
  {
    title: "Total Revenue",
    value: "₹1,28,450",
    change: "+14.2%",
    isPositive: true,
    icon: DollarSign,
    color: "emerald",
    description: "vs. previous period",
  },
  {
    title: "Active Orders",
    value: "42",
    change: "+8.5%",
    isPositive: true,
    icon: ShoppingBag,
    color: "cyan",
    description: "orders in progress",
  },
  {
    title: "Grocery Items",
    value: "318",
    change: "-2 items low stock",
    isPositive: false,
    icon: Package,
    color: "amber",
    description: "inventory available",
  },
  {
    title: "Total Customers",
    value: "1,420",
    change: "+22.4%",
    isPositive: true,
    icon: Users,
    color: "purple",
    description: "registered customers",
  },
];

const RECENT_ORDERS = [
  {
    id: "ORD-9842",
    customer: "Aarav Sharma",
    items: "Fresh Organic Apples, Whole Milk",
    amount: "₹420",
    status: "Pending",
    time: "5 mins ago",
  },
  {
    id: "ORD-9841",
    customer: "Priya Patel",
    items: "Basmati Rice 5kg, Cooking Oil",
    amount: "₹1,150",
    status: "Delivered",
    time: "22 mins ago",
  },
  {
    id: "ORD-9840",
    customer: "Rohan Gupta",
    items: "Greek Yogurt, Brown Bread",
    amount: "₹280",
    status: "Out for Delivery",
    time: "1 hr ago",
  },
  {
    id: "ORD-9839",
    customer: "Ananya Verma",
    items: "Avocado Pack, Chia Seeds",
    amount: "₹640",
    status: "Delivered",
    time: "2 hrs ago",
  },
];

const LOW_STOCK_ITEMS = [
  {
    name: "Organic Honey (500g)",
    category: "Pantry",
    stock: 3,
    min: 10,
  },
  {
    name: "Fresh Farm Eggs (12 pcs)",
    category: "Dairy",
    stock: 5,
    min: 15,
  },
  {
    name: "Almond Milk 1L",
    category: "Beverages",
    stock: 2,
    min: 8,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Delivered":
      return {
        wrapper:
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        dot: "bg-emerald-400",
        icon: CheckCircle2,
      };

    case "Out for Delivery":
      return {
        wrapper:
          "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
        dot: "bg-cyan-400",
        icon: Truck,
      };

    default:
      return {
        wrapper:
          "bg-amber-500/10 border-amber-500/20 text-amber-400",
        dot: "bg-amber-400",
        icon: AlertTriangle,
      };
  }
};

const getStockPercentage = (
  stock: number,
  min: number
) => {
  if (!min) return 0;

  return Math.min(
    100,
    Math.max(0, (stock / min) * 100)
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminDashboard({ user }: { user?: UserInterface }) {
  const [filter, setFilter] =
    useState("Today");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-5 text-slate-100 selection:bg-emerald-400 selection:text-slate-950 md:px-8 md:py-8">

      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 40, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-40 top-[20%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[130px]"
        />

        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          className="absolute bottom-0 left-[40%] h-[400px] w-[400px] rounded-full bg-purple-500/[0.04] blur-[120px]"
        />

        {/* Grid */}

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl space-y-7"
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
        >
          {/* animated glow */}

          <motion.div
            animate={{
              opacity: [0.3, 0.65, 0.3],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[90px]"
          />

          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "linear",
            }}
            className="pointer-events-none absolute left-0 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
          />

          <div className="relative flex flex-col justify-between gap-7 p-6 md:p-8 lg:flex-row lg:items-center">

            {/* LEFT */}

            <div className="max-w-2xl">

              <motion.div
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.25,
                }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-400"
              >
                <motion.span
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>

                FreshKart Control Center

                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                }}
                className="text-3xl font-black tracking-tight text-white md:text-4xl"
              >
                Admin Overview
                <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.45,
                }}
                className="mt-3 max-w-xl text-sm leading-6 text-slate-400"
              >
                Manage inventory, monitor real-time
                orders, track customers and keep your
                FreshKart operation running smoothly.
              </motion.p>

              {/* Live indicator */}

              <div className="mt-5 flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <span className="text-xs font-medium text-slate-400">
                  All systems operational
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-700" />

                <span className="text-xs text-slate-500">
                  Live monitoring enabled
                </span>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">

              <Link
                href="/admin/add-grocery"
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-xs font-black text-slate-950 shadow-[0_10px_30px_rgba(16,185,129,0.18)] transition hover:shadow-[0_15px_40px_rgba(16,185,129,0.28)] active:scale-95"
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{
                    x: "-100%",
                  }}
                  whileHover={{
                    x: "100%",
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                />

                <PlusCircle className="relative h-4 w-4" />

                <span className="relative">
                  Add Item
                </span>
              </Link>

              <Link
                href="/admin/view-grocery"
                className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/30 hover:bg-slate-700 active:scale-95"
              >
                <LayoutGrid className="h-4 w-4 text-emerald-400 transition-transform group-hover:rotate-6" />
                View Stock
              </Link>

              <Link
                href="/admin/manage-orders"
                className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/30 hover:bg-slate-700 active:scale-95"
              >
                <ClipboardList className="h-4 w-4 text-cyan-400 transition-transform group-hover:scale-110" />
                Orders
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ===================================================
            FILTER BAR
        =================================================== */}

        <motion.div
          variants={itemVariants}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Performance
            </p>

            <h2 className="mt-1 text-lg font-bold text-white">
              Store Analytics
            </h2>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/70 p-1 backdrop-blur">
            {["Today", "Week", "Month"].map(
              (period) => (
                <button
                  key={period}
                  onClick={() =>
                    setFilter(period)
                  }
                  className={`relative rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    filter === period
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {filter === period && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 rounded-lg bg-slate-800"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  <span className="relative z-10">
                    {period}
                  </span>
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* ===================================================
            STATS
        =================================================== */}

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map(
            (stat, index) => {
              const Icon = stat.icon;

              const colorMap: Record<
                string,
                string
              > = {
                emerald:
                  "from-emerald-500/[0.12] via-slate-900 to-slate-950 border-emerald-500/20 text-emerald-400",
                cyan:
                  "from-cyan-500/[0.12] via-slate-900 to-slate-950 border-cyan-500/20 text-cyan-400",
                amber:
                  "from-amber-500/[0.12] via-slate-900 to-slate-950 border-amber-500/20 text-amber-400",
                purple:
                  "from-purple-500/[0.12] via-slate-900 to-slate-950 border-purple-500/20 text-purple-400",
              };

              return (
                <motion.div
                  key={stat.title}
                  variants={cardVariants}
                  whileHover={{
                    y: -7,
                    scale: 1.015,
                    transition: {
                      duration: 0.25,
                    },
                  }}
                  className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-xl ${colorMap[stat.color]}`}
                >
                  {/* Card shine */}

                  <motion.div
                    className="absolute -left-20 top-0 h-full w-20 skew-x-[-20deg] bg-white/[0.04]"
                    animate={{
                      x: [
                        0,
                        350,
                      ],
                    }}
                    transition={{
                      duration: 4,
                      delay:
                        index * 0.6,
                      repeat: Infinity,
                      repeatDelay: 5,
                      ease: "easeInOut",
                    }}
                  />

                  <div className="relative flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                      {stat.title}
                    </span>

                    <motion.div
                      whileHover={{
                        rotate: 8,
                        scale: 1.08,
                      }}
                      className="rounded-xl border border-slate-700/80 bg-slate-950/70 p-2.5"
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                  </div>

                  <div className="relative mt-5">
                    <motion.h2
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          0.35 +
                          index *
                            0.08,
                      }}
                      className="text-2xl font-black tracking-tight text-white"
                    >
                      {stat.value}
                    </motion.h2>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`flex items-center gap-0.5 text-[10px] font-bold ${
                          stat.isPositive
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {stat.isPositive ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}

                        {stat.change}
                      </span>

                      <span className="text-[9px] text-slate-600">
                        {stat.description}
                      </span>
                    </div>
                  </div>

                  {/* Bottom indicator */}

                  <motion.div
                    initial={{
                      scaleX: 0,
                    }}
                    animate={{
                      scaleX: 1,
                    }}
                    transition={{
                      duration: 0.8,
                      delay:
                        0.4 +
                        index * 0.08,
                    }}
                    className={`absolute bottom-0 left-0 h-[2px] w-full origin-left ${
                      stat.color ===
                      "emerald"
                        ? "bg-emerald-400"
                        : stat.color ===
                          "cyan"
                        ? "bg-cyan-400"
                        : stat.color ===
                          "amber"
                        ? "bg-amber-400"
                        : "bg-purple-400"
                    }`}
                  />
                </motion.div>
              );
            }
          )}
        </motion.div>

        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* =================================================
              RECENT ORDERS
          ================================================= */}

          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 shadow-xl backdrop-blur-xl lg:col-span-2"
          >
            {/* top glow */}

            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 p-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: [
                        1,
                        1.08,
                        1,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat:
                        Infinity,
                    }}
                    className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </motion.div>

                  <h3 className="text-base font-bold text-white">
                    Recent Customer Orders
                  </h3>

                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    LIVE
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Live order status and dispatch updates
                </p>
              </div>

              <Link
                href="/admin/manage-orders"
                className="group flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                Manage All

                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    <th className="px-5 py-3">
                      Order
                    </th>

                    <th className="px-3 py-3">
                      Customer
                    </th>

                    <th className="px-3 py-3">
                      Items
                    </th>

                    <th className="px-3 py-3">
                      Amount
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>
                    {RECENT_ORDERS.map(
                      (
                        order,
                        index
                      ) => {
                        const status =
                          getStatusStyle(
                            order.status
                          );

                        const StatusIcon =
                          status.icon;

                        return (
                          <motion.tr
                            key={order.id}
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay:
                                0.15 +
                                index *
                                  0.07,
                            }}
                            whileHover={{
                              backgroundColor:
                                "rgba(30,41,59,0.45)",
                            }}
                            className="group border-b border-slate-800/50 transition-colors last:border-0"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-slate-800 p-1.5 text-slate-400 transition group-hover:bg-emerald-500/10 group-hover:text-emerald-400">
                                  <Package className="h-full w-full" />
                                </div>

                                <div>
                                  <p className="font-mono text-xs font-bold text-slate-200">
                                    {order.id}
                                  </p>

                                  <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-600">
                                    <Clock className="h-2.5 w-2.5" />
                                    {order.time}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-4">
                              <p className="text-xs font-semibold text-slate-300">
                                {order.customer}
                              </p>
                            </td>

                            <td className="max-w-[180px] px-3 py-4">
                              <p className="truncate text-[11px] text-slate-500">
                                {order.items}
                              </p>
                            </td>

                            <td className="px-3 py-4">
                              <span className="font-bold text-emerald-400">
                                {order.amount}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <motion.span
                                whileHover={{
                                  scale: 1.04,
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold ${status.wrapper}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                />

                                <StatusIcon className="h-3 w-3" />

                                {order.status}
                              </motion.span>
                            </td>
                          </motion.tr>
                        );
                      }
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* footer */}

            <div className="flex items-center justify-between border-t border-slate-800/70 bg-slate-950/30 px-5 py-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />

                Monitoring order activity
              </div>

              <span className="text-[10px] font-semibold text-slate-600">
                {RECENT_ORDERS.length} recent orders
              </span>
            </div>
          </motion.section>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >

            {/* =================================================
                LOW STOCK
            ================================================= */}

            <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl">

              <motion.div
                animate={{
                  opacity: [
                    0.3,
                    0.7,
                    0.3,
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat:
                    Infinity,
                }}
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl"
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Low Stock
                    </h3>

                    <p className="text-[9px] text-slate-500">
                      Inventory alerts
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] font-black text-amber-400">
                  {LOW_STOCK_ITEMS.length} ALERTS
                </span>
              </div>

              <div className="relative mt-5 space-y-3">
                {LOW_STOCK_ITEMS.map(
                  (
                    item,
                    index
                  ) => {
                    const percentage =
                      getStockPercentage(
                        item.stock,
                        item.min
                      );

                    return (
                      <motion.div
                        key={item.name}
                        initial={{
                          opacity: 0,
                          x: 15,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            0.25 +
                            index *
                              0.08,
                        }}
                        whileHover={{
                          x: 3,
                        }}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold text-slate-200">
                              {item.name}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-600">
                              {item.category}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-[11px] font-black text-amber-400">
                              {item.stock} left
                            </p>

                            <p className="text-[8px] text-slate-600">
                              Min {item.min}
                            </p>
                          </div>
                        </div>

                        {/* progress */}

                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${percentage}%`,
                            }}
                            transition={{
                              duration: 0.8,
                              delay:
                                0.3 +
                                index *
                                  0.1,
                              ease: "easeOut",
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-amber-300"
                          />
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>

              <Link
                href="/admin/view-grocery"
                className="group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-amber-500/30 hover:bg-slate-700"
              >
                <Boxes className="h-3.5 w-3.5 text-amber-400" />

                Restock Items

                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </section>

            {/* =================================================
                SYSTEM HEALTH
            ================================================= */}

            <section className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 p-5 shadow-xl">

              <motion.div
                animate={{
                  scale: [
                    1,
                    1.15,
                    1,
                  ],
                  opacity: [
                    0.2,
                    0.45,
                    0.2,
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat:
                    Infinity,
                }}
                className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl"
              />

              <div className="relative">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      Store Status
                    </h3>
                  </div>

                  <motion.div
                    animate={{
                      rotate: [
                        0,
                        360,
                      ],
                    }}
                    transition={{
                      duration: 12,
                      repeat:
                        Infinity,
                      ease: "linear",
                    }}
                  >
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  FreshKart ordering system is
                  operating normally with high
                  performance.
                </p>

                {/* health */}

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">
                      System Health
                    </span>

                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <CircleDot className="h-3 w-3" />

                      100% Operational
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: "100%",
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut",
                      }}
                      className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    >
                      <motion.div
                        animate={{
                          x: [
                            "-100%",
                            "200%",
                          ],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat:
                            Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-y-0 w-1/3 bg-white/30 blur-sm"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* metrics */}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-emerald-400" />

                      <span className="text-[9px] text-slate-600">
                        API
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-bold text-emerald-400">
                      Healthy
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />

                      <span className="text-[9px] text-slate-600">
                        Database
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-bold text-cyan-400">
                      Connected
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        </div>

        {/* ===================================================
            BOTTOM QUICK ACTIONS
        =================================================== */}

        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Quick Navigation
              </h3>

              <p className="mt-1 text-[10px] text-slate-600">
                Jump directly to important admin areas
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
                  <p className="text-xs font-bold text-slate-200">
                    Add Grocery
                  </p>

                  <p className="text-[9px] text-slate-600">
                    Add new inventory
                  </p>
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
                  <p className="text-xs font-bold text-slate-200">
                    Inventory
                  </p>

                  <p className="text-[9px] text-slate-600">
                    Manage products
                  </p>
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
                  <p className="text-xs font-bold text-slate-200">
                    Manage Orders
                  </p>

                  <p className="text-[9px] text-slate-600">
                    Track deliveries
                  </p>
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