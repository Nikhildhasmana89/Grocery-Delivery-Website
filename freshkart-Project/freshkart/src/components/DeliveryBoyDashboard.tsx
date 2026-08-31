"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserInterface } from "./Nav";

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
  Phone,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface OrderItem {
  grocery: string;
  quantity: number;
  name: string;
  price: string;
  image: string;
  unit: string;
}

interface OrderAddress {
  fullName: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

interface Order {
  _id: string;
  orderRequestId?: string;

  user:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
      };

  items: OrderItem[];

  totalAmount: string;

  paymentMethod: "cod" | "online";

  isPaid: boolean;

  address: OrderAddress;

  assignment?: string | null;

  assignedDeliveryBoy?: string | null;

  status:
    | "pending"
    | "out of delivery"
    | "delivered";

  createdAt?: string;
  updatedAt?: string;
}

interface DeliveryAssignment {
  _id: string;

  order:
    | Order
    | null;

  broadcastedTo: string[];

  assignedTo:
    | string
    | null;

  status:
    | "broadcasted"
    | "assigned"
    | "delivered"
    | "cancelled";

  acceptedAt?: string | null;

  deliveredAt?: string | null;

  cancelledAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =========================================================
   COMPONENT
========================================================= */

function DeliveryBoyDashboard({ user }: { user?: UserInterface }) {
  const router = useRouter();
  const { data: session, status: sessionStatus, update: updateSession } =
    useSession();

  const deliveryBoyId =
    session?.user?.id;

  /* =======================================================
     STATE
  ======================================================= */

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [activeAssignments, setActiveAssignments] =
    useState<DeliveryAssignment[]>([]);

  const [activeCount, setActiveCount] =
    useState<number>(0);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [acceptingId, setAcceptingId] =
    useState<string | null>(null);

  const [rejectingId, setRejectingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [socketConnected, setSocketConnected] =
    useState(false);

  // Mobile association state for delivery boys
  const [requiresMobile, setRequiresMobile] = useState(false);
  const [deliveryBoyMobile, setDeliveryBoyMobile] = useState<string>("");
  const [inputMobile, setInputMobile] = useState<string>("");
  const [submittingMobile, setSubmittingMobile] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [mobileSuccess, setMobileSuccess] = useState("");

  /* =======================================================
     FETCH USER PROFILE FOR MOBILE NUMBER
  ======================================================= */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/me");
        if (res.data?.user?.mobile) {
          setDeliveryBoyMobile(res.data.user.mobile);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    if (deliveryBoyId) {
      fetchProfile();
    }
  }, [deliveryBoyId]);

  /* =======================================================
     FETCH ASSIGNMENTS
  ======================================================= */

  const fetchOrders = useCallback(
    async (showLoader = false) => {
      if (!deliveryBoyId) {
        return;
      }

      try {
        if (showLoader) {
          setRefreshing(true);
        }

        setError("");

        const [response, currentResponse] = await Promise.all([
          axios.get("/api/delivery/get-assignment", { timeout: 10000 }),
          axios.get("/api/delivery/current-order", { timeout: 10000 }).catch(() => null),
        ]);

        if (response.data?.requiresMobile || currentResponse?.data?.requiresMobile) {
          setRequiresMobile(true);
          setLoading(false);
          setRefreshing(false);
          return;
        }

        setRequiresMobile(false);

        if (currentResponse?.data?.success) {
          const count = currentResponse.data.activeCount ?? (currentResponse.data.active ? 1 : 0);
          setActiveCount(count);
          setActiveAssignments(
            Array.isArray(currentResponse.data.activeAssignments)
              ? currentResponse.data.activeAssignments
              : currentResponse.data.assignment
              ? [currentResponse.data.assignment]
              : []
          );
        }

        const assignments: DeliveryAssignment[] =
          Array.isArray(
            response.data?.assignment,
          )
            ? response.data.assignment
            : [];

        const availableOrders: Order[] =
          assignments
            .filter(
              (assignment) =>
                assignment.status ===
                  "broadcasted" &&
                !!assignment.order,
            )
            .map((assignment) => {
              const order =
                assignment.order as Order;

              return {
                ...order,
                assignment:
                  assignment._id,
                assignedDeliveryBoy:
                  assignment.assignedTo ??
                  null,
              };
            });

        setOrders(availableOrders);
      } catch (error: unknown) {
        console.error(
          "❌ Fetch delivery orders error:",
          error,
        );

        if (
          axios.isAxiosError(error)
        ) {
          setError(
            error.response?.data
              ?.message ||
              error.response?.data
                ?.error ||
              "Failed to load available deliveries.",
          );
        } else {
          setError(
            "Failed to load available deliveries.",
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [deliveryBoyId],
  );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (!deliveryBoyId) {
      setLoading(false);
      return;
    }

    fetchOrders();
  }, [
    deliveryBoyId,
    sessionStatus,
    fetchOrders,
  ]);

  /* =======================================================
     CONNECT MOBILE NUMBER HANDLER
  ======================================================= */

  const handleConnectMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError("");
    setMobileSuccess("");

    const trimmed = inputMobile.trim();
    const digitsOnly = trimmed.replace(/\D/g, "");

    if (!trimmed || digitsOnly.length < 10) {
      setMobileError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSubmittingMobile(true);

    try {
      await axios.post("/api/user/edit-role-mobile", {
        mobile: trimmed,
        role: "deliveryBoy",
      });

      setDeliveryBoyMobile(trimmed);
      setRequiresMobile(false);
      setMobileSuccess("Mobile number connected successfully! Loading available delivery orders...");

      if (updateSession) {
        await updateSession({ mobile: trimmed });
      }

      setTimeout(() => {
        fetchOrders(true);
      }, 600);
    } catch (err: any) {
      const apiMsg = err.response?.data?.message || err.message || "Failed to associate mobile number.";
      setMobileError(apiMsg);
    } finally {
      setSubmittingMobile(false);
    }
  };

  /* =======================================================
     SOCKET.IO
  ======================================================= */

  useEffect(() => {
    if (!deliveryBoyId) {
      return;
    }

    const socket = getSocket(deliveryBoyId);

    const handleConnect = () => {
      setSocketConnected(true);
      socket.emit("identity", deliveryBoyId);
      fetchOrders();
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleConnectError = () => {
      setSocketConnected(false);
    };

    const handleNewAssignment = () => {
      fetchOrders();
    };

    const handleOrderAccepted = () => {
      fetchOrders();
    };

    const handleOrderRejected = () => {
      fetchOrders();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("new-assignment", handleNewAssignment);
    socket.on("order-accepted", handleOrderAccepted);
    socket.on("order-rejected", handleOrderRejected);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("new-assignment", handleNewAssignment);
      socket.off("order-accepted", handleOrderAccepted);
      socket.off("order-rejected", handleOrderRejected);
    };
  }, [deliveryBoyId, fetchOrders]);

  /* =======================================================
     ACCEPT ORDER
  ======================================================= */

  const handleAccept = async (
    orderId: string,
    assignmentId?: string | null,
  ) => {
    if (acceptingId || !deliveryBoyId) {
      return;
    }

    const targetId = assignmentId || orderId;

    try {
      setAcceptingId(orderId);
      setError("");

      const response = await axios.post(
        `/api/delivery/assignment/${targetId}/accept-assignment`,
        {},
        { timeout: 10000 },
      );

      const acceptedOrderId =
        response.data?.order?.id || response.data?.order?._id || orderId;

      setOrders((previousOrders) =>
        previousOrders.filter((order) => order._id !== orderId),
      );

      router.push(`/delivery/order/${acceptedOrderId}`);
    } catch (error: unknown) {
      let message = "This delivery is no longer available.";
      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          message;
      }
      setError(message);
      await fetchOrders();
    } finally {
      setAcceptingId(null);
    }
  };

  /* =======================================================
     REJECT ORDER
  ======================================================= */

  const handleReject = async (
    orderId: string,
    assignmentId?: string | null,
  ) => {
    if (rejectingId || acceptingId || !deliveryBoyId) {
      return;
    }

    const targetId = assignmentId || orderId;

    try {
      setRejectingId(orderId);
      setError("");

      await axios.post(
        `/api/delivery/assignment/${targetId}/reject-assignment`,
        {},
        { timeout: 10000 },
      );

      setOrders((previousOrders) =>
        previousOrders.filter((order) => order._id !== orderId),
      );

      await fetchOrders();
    } catch (error: unknown) {
      let message = "Failed to reject delivery assignment.";
      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          message;
      }
      setError(message);
      await fetchOrders();
    } finally {
      setRejectingId(null);
    }
  };

  /* =======================================================
     AVAILABLE ORDERS
  ======================================================= */

  const availableOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "out of delivery" &&
        !!order.assignment &&
        !order.assignedDeliveryBoy,
    );
  }, [orders]);

  const formatDate = (date?: string) => {
    if (!date) return "Just now";
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <Loader2 size={22} className="animate-spin text-green-600" />
          <span className="font-medium text-slate-700">
            Loading delivery dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <div className="rounded-xl bg-green-100 p-2 text-green-600">
                <Bike size={22} />
              </div>

              <span className="font-medium text-green-600">
                Delivery Partner
              </span>

              {deliveryBoyMobile && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300">
                  <Smartphone size={13} />
                  Connected: {deliveryBoyMobile}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Delivery Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your assigned delivery orders in real-time
            </p>
          </div>

          {/* ONLINE / SOCKET STATUS */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
              socketConnected
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            {socketConnected ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
                <Wifi size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-green-700">Online</span>
              </>
            ) : (
              <>
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <WifiOff size={16} className="text-red-600" />
                <span className="text-sm font-semibold text-red-700">Connecting...</span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* ERROR ALERT */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DELIVERY BOY MOBILE NUMBER CONNECTION SECTION */}
        {(requiresMobile || !deliveryBoyMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 p-6 md:p-8 shadow-xl shadow-emerald-500/10"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 shadow-md shrink-0 mt-1">
                <Phone className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/15 border border-emerald-600/30 text-emerald-800 text-xs font-bold tracking-wide mb-2">
                  <ShieldCheck size={14} /> Action Required
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Associate Mobile Number to Receive Orders
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed mt-1 max-w-xl">
                  Delivery orders are assigned strictly based on your verified delivery partner mobile number. Enter your mobile number below to connect your account.
                </p>
              </div>
            </div>

            {mobileError && (
              <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-700">
                <AlertCircle size={18} className="shrink-0" />
                <span>{mobileError}</span>
              </div>
            )}

            {mobileSuccess && (
              <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{mobileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleConnectMobile} className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={inputMobile}
                    onChange={(e) => setInputMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className="w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingMobile}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 py-3.5 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
              >
                {submittingMobile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Mobile Number...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Connect & Enable Delivery Orders</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ACTIVE DELIVERIES BANNER */}
        {activeAssignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800">
                <Bike className="text-emerald-600" size={20} />
                <h3 className="font-bold">
                  Active Delivery ({activeAssignments.length} / 2)
                </h3>
              </div>
              <span className="rounded-full bg-emerald-200/60 px-3 py-1 text-xs font-semibold text-emerald-800">
                In Progress
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeAssignments.map((assign: any) => {
                const orderId = assign.order?._id || assign.order;
                const orderReqId = assign.order?.orderRequestId || String(orderId).slice(-6).toUpperCase();
                const customerName = assign.order?.user?.name || assign.order?.address?.fullName || "Customer";
                return (
                  <div
                    key={assign._id}
                    className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm"
                  >
                    <div>
                      <p className="text-xs text-slate-400">Order #{orderReqId}</p>
                      <p className="font-semibold text-slate-800">{customerName}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/delivery/order/${orderId}`)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 cursor-pointer"
                    >
                      View Delivery
                      <ExternalLink size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <Package className="mb-3 text-blue-500" size={24} />
            <p className="text-sm text-slate-500">Available Orders</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{availableOrders.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl border p-4 shadow-sm ${
              activeCount >= 2 ? "border-amber-200 bg-amber-50" : "bg-white"
            }`}
          >
            <Bike
              className={`mb-3 ${activeCount >= 2 ? "text-amber-600" : "text-emerald-500"}`}
              size={24}
            />
            <p className="text-sm text-slate-500">Active Deliveries</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900">{activeCount} / 2</p>
              {activeCount >= 2 && (
                <span className="text-xs font-semibold text-amber-600">Capacity Full</span>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <CheckCircle2 className="mb-3 text-green-500" size={24} />
            <p className="text-sm text-slate-500">Completed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">0</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <IndianRupee className="mb-3 text-emerald-500" size={24} />
            <p className="text-sm text-slate-500">Earnings</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">₹0</p>
          </motion.div>
        </div>

        {/* SECTION TITLE & REFRESH */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4 flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900">Available Deliveries</h2>
            <p className="text-sm text-slate-500">
              Choose any order that you want to deliver
            </p>
          </div>

          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || requiresMobile}
            className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </motion.div>

        {/* LISTING CONTENT */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-72 rounded-3xl bg-white"
              />
            ))}
          </div>
        ) : requiresMobile || !deliveryBoyMobile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-dashed border-amber-300 bg-amber-50/50 px-6 py-12 text-center"
          >
            <Phone size={36} className="mx-auto mb-3 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Mobile Connection Required
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Please enter and connect your mobile number in the form above to start receiving delivery orders.
            </p>
          </motion.div>
        ) : availableOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-dashed bg-white px-6 py-14 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600"
            >
              <Bike size={32} />
            </motion.div>

            <h3 className="text-lg font-bold text-slate-900">No available deliveries</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              New orders will appear here automatically when they become available.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-green-600">
              <Sparkles size={16} />
              Stay online to receive orders
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <AnimatePresence>
              {availableOrders.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -5 }}
                  className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="flex items-center justify-between border-b px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-green-100 p-2.5 text-green-600">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Order</p>
                        <p className="font-bold text-slate-900">
                          #{(item.orderRequestId || item._id).slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold capitalize text-orange-600">
                      Out for delivery
                    </span>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex gap-3">
                      <div className="mt-1 rounded-lg bg-purple-100 p-2 text-purple-600">
                        <ShoppingBag size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Customer</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {item.address.fullName}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-1 rounded-lg bg-blue-100 p-2 text-blue-600">
                        <MapPin size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">Delivery Address</p>
                        <p className="mt-1 line-clamp-3 text-sm font-medium text-slate-800">
                          {item.address.fullAddress}, {item.address.city},{" "}
                          {item.address.state} - {item.address.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-1 rounded-lg bg-green-100 p-2 text-green-600">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Customer Mobile</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {item.address.mobile}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-400">Order Total</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          ₹{item.totalAmount}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-400">Payment</p>
                        <p className="mt-1 font-semibold capitalize text-green-600">
                          {item.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={14} />
                      {formatDate(item.createdAt)}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{
                          scale:
                            acceptingId === item._id || rejectingId === item._id ? 1 : 1.01,
                        }}
                        onClick={() => handleAccept(item._id, item.assignment)}
                        disabled={
                          acceptingId !== null || rejectingId !== null || activeCount >= 2
                        }
                        title={
                          activeCount >= 2 ? "Maximum 2 active deliveries reached" : undefined
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                      >
                        {acceptingId === item._id ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Accepting...
                          </>
                        ) : activeCount >= 2 ? (
                          <>
                            <Bike size={18} />
                            Limit Reached (2/2)
                          </>
                        ) : (
                          <>
                            <Navigation size={18} />
                            Accept Delivery
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{
                          scale:
                            acceptingId === item._id || rejectingId === item._id ? 1 : 1.01,
                        }}
                        onClick={() => handleReject(item._id, item.assignment)}
                        disabled={acceptingId !== null || rejectingId !== null}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                      >
                        {rejectingId === item._id ? (
                          <>
                            <Loader2 size={18} className="animate-spin text-red-600" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle size={18} />
                            Reject
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;