"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import {
  Bike,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
  Navigation,
  IndianRupee,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface Assignment {
  _id: string;
  status: string;
  order?: {
    _id: string;
    totalAmount?: number;
    deliveryAddress?: string;
  };
  createdAt?: string;
}

function DeliveryBoyDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { data: session } = useSession();

  const fetchAssignments = async () => {
    try {
      setRefreshing(true);

      const result = await axios.get("/api/delivery/get-assignment");

      console.log("Assignments:", result.data.assignment);

      setAssignments(result.data.assignment || []);
    } catch (error) {
      console.error("Error fetching assignment:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

useEffect(() => {
  if (!session?.user?.id) return;

  fetchAssignments();
}, [session?.user?.id]);


useEffect(() => {
  console.log("🔐 Session:", session);
  console.log("👤 User ID:", session?.user?.id);

  if (!session?.user?.id) return;

  const socket = getSocket(session.user.id);

  console.log("🔌 Socket ID:", socket.id);

  const handleNewAssignment = () => {
    console.log("📦 NEW ASSIGNMENT RECEIVED!");

    fetchAssignments();
  };

  socket.on("new-assignment", handleNewAssignment);

  return () => {
    socket.off("new-assignment", handleNewAssignment);
  };
}, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-green-100 p-2 text-green-600">
                <Bike size={22} />
              </div>

              <span className="font-medium text-green-600">
                Delivery Partner
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Delivery Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your delivery assignments
            </p>
          </div>

          {/* ONLINE STATUS */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>

            <span className="text-sm font-semibold text-green-700">
              Online
            </span>
          </motion.div>
        </motion.div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border bg-white p-4"
          >
            <Package className="mb-3 text-blue-500" size={24} />

            <p className="text-sm text-slate-500">
              New Assignments
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {assignments.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border bg-white p-4"
          >
            <Clock className="mb-3 text-orange-500" size={24} />

            <p className="text-sm text-slate-500">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {assignments.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border bg-white p-4"
          >
            <CheckCircle2 className="mb-3 text-green-500" size={24} />

            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              0
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border bg-white p-4"
          >
            <IndianRupee className="mb-3 text-emerald-500" size={24} />

            <p className="text-sm text-slate-500">
              Earnings
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              ₹0
            </p>
          </motion.div>

        </div>

        {/* ASSIGNMENT SECTION */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                New Deliveries
              </h2>

              <p className="text-sm text-slate-500">
                Pick up a delivery and start earning
              </p>
            </div>

            <button
              onClick={fetchAssignments}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((item) => (
                <motion.div
                  key={item}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="h-52 rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : assignments.length === 0 ? (

            /* EMPTY STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-dashed bg-white px-6 py-14 text-center"
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, -3, 3, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600"
              >
                <Bike size={32} />
              </motion.div>

              <h3 className="text-lg font-bold text-slate-900">
                No new deliveries
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                You're all caught up! New delivery requests will
                appear here automatically.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-green-600">
                <Sparkles size={16} />
                Stay online to receive orders
              </div>
            </motion.div>

          ) : (

            /* ASSIGNMENT CARDS */
            <div className="grid gap-5 md:grid-cols-2">

              <AnimatePresence>
                {assignments.map((item, index) => (

                  <motion.div
                    key={item._id}
                    initial={{
                      opacity: 0,
                      y: 40,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.4,
                    }}
                    whileHover={{
                      y: -5,
                    }}
                    className="group overflow-hidden rounded-3xl border bg-white transition-shadow hover:shadow-xl"
                  >

                    {/* CARD TOP */}
                    <div className="flex items-center justify-between border-b px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-green-100 p-2.5 text-green-600">
                          <Package size={20} />
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Assignment
                          </p>

                          <p className="font-bold text-slate-900">
                            #{item._id.slice(-6).toUpperCase()}
                          </p>
                        </div>

                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                        {item.status}
                      </span>

                    </div>

                    {/* CARD BODY */}
                    <div className="space-y-4 p-5">

                      {/* LOCATION */}
                      <div className="flex gap-3">

                        <div className="mt-1 rounded-lg bg-blue-100 p-2 text-blue-600">
                          <MapPin size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Delivery Address
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-800">
                            {item.order?.deliveryAddress ||
                              "Address not available"}
                          </p>
                        </div>

                      </div>

                      {/* ORDER INFO */}
                      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">

                        <div>
                          <p className="text-xs text-slate-400">
                            Order Total
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            ₹{item.order?.totalAmount || 0}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            Delivery
                          </p>

                          <p className="mt-1 font-semibold text-green-600">
                            Available
                          </p>
                        </div>

                      </div>

                      {/* BUTTON */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                      >
                        <Navigation size={18} />

                        Accept Delivery
                      </motion.button>

                    </div>

                  </motion.div>

                ))}
              </AnimatePresence>

            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;