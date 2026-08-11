"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Filter,
} from "lucide-react";
import AdminOrderCard, { OrderStatus } from "../../../components/AdminOrderCard";
import { IOrder } from "../../../models/order.model";
import { getSocket } from "@/lib/socket";

// Filter Tab Options
type FilterTab = "All" | OrderStatus;

export default function ManageOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // --- Fetch Orders ---
  const fetchOrders = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const response = await axios.get("/api/admin/get-orders");
     setOrders(response.data.orders);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);


  useEffect(() => {
  const socket = getSocket();

  if (!socket) return;

  const handleNewOrder = (newOrder: IOrder) => {
  console.log("🛒 New order received:", newOrder);

    setOrders((prev) => [newOrder, ...prev]);
  };

  socket.on("new-order", handleNewOrder);

  return () => {
    socket.off("new-order", handleNewOrder);
  };
}, []);

  // --- Handle Status Update from Child Card ---
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((order: any) =>
        (order._id || order.id || order.orderId) === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );

    try {
      await axios.post(
  `/api/admin/update-order-status/${orderId}`,
  {
    status: newStatus,
  }
);
    } catch (err) {
      console.error("Failed to update status on server:", err);
      // Revert/refresh on error
      fetchOrders();
    }
  };

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o: any) => o.status === "Pending").length;
    const processing = orders.filter((o: any) => o.status === "Processing").length;
    const delivered = orders.filter((o: any) => o.status === "Delivered").length;
    const revenue = orders.reduce((acc, o: any) => acc + (o.totalAmount || o.total || 0), 0);

    return { total, pending, processing, delivered, revenue };
  }, [orders]);

  // --- Filter & Search Logic ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const id = (order._id || order.id || order.orderId || "").toLowerCase();
      const customer = (order.customerName || order.user?.name || "").toLowerCase();
      const email = (order.customerEmail || order.user?.email || "").toLowerCase();
      const matchesSearch =
        id.includes(searchQuery.toLowerCase()) ||
        customer.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === "All" || order.status === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [orders, searchQuery, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- Header & Title Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Order Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor, filter, and process customer orders in real-time.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchOrders}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-sm transition-colors duration-200 disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
          </motion.button>
        </div>

        {/* --- Key Metrics / Stats Bar --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Orders"
            value={stats.total}
            icon={<Package className="w-5 h-5 text-indigo-500" />}
            bgColor="bg-indigo-500/10"
            delay={0.1}
          />
          <StatCard
            title="Pending Approval"
            value={stats.pending}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            bgColor="bg-amber-500/10"
            delay={0.2}
          />
          <StatCard
            title="Processing"
            value={stats.processing}
            icon={<RefreshCw className="w-5 h-5 text-blue-500" />}
            bgColor="bg-blue-500/10"
            delay={0.3}
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.revenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}`}
            icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
            bgColor="bg-emerald-500/10"
            delay={0.4}
          />
        </div>

        {/* --- Controls: Search Bar & Status Tabs --- */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-slate-200/50 dark:bg-slate-900/60 p-1 rounded-xl">
              {(
                ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as FilterTab[]
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Orders Grid Area --- */}
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-3 text-xs underline text-rose-600 dark:text-rose-400 font-semibold"
            >
              Try Reloading
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
          >
            <Filter className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No orders found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or status filter.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
          >
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order: any) => {
                const orderId = order._id || order.id || order.orderId;
                return (
                  <motion.div
                    key={orderId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AdminOrderCard
                      orderId={orderId}
                      customerName={order.customerName || order.user?.name}
                      customerEmail={order.customerEmail || order.user?.email}
                      shippingAddress={order.shippingAddress || order.address}
                      orderDate={
                        order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : order.orderDate
                      }
                      status={order.status}
                      paymentMethod={order.paymentMethod}
                      items={order.items || order.orderItems}
                      totalAmount={order.totalAmount || order.total}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(orderId, newStatus)
                      }
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Helper Component: Stats Card ---
function StatCard({
  title,
  value,
  icon,
  bgColor,
  delay,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3"
    >
      <div className={`p-3 rounded-xl ${bgColor}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {title}
        </p>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// --- Helper Component: Skeleton Loading State ---
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-full h-56 bg-slate-200/60 dark:bg-slate-800/50 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}