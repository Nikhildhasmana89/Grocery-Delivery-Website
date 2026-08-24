"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Package,
  MapPin,
  Bike,
  Clock,
  CheckCircle2,
  Truck,
  Phone,
  Navigation,
  AlertCircle,
  RefreshCw,
  CreditCard,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import dynamic from "next/dynamic";
import type { ILocation } from "@/components/LiveMap";
import CustomerChat from "@/components/CustomerChat";

const LiveMap = dynamic(
  () => import("@/components/LiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p className="text-sm font-semibold text-slate-600">
            Loading live map...
          </p>
        </div>
      </div>
    ),
  },
);

/* =========================================================
   TYPES
========================================================= */
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

interface OrderItem {
  grocery: string;
  quantity: number;
  name: string;
  price: string;
  image: string;
  unit: string;
}

interface Order {
  _id: string;
  orderRequestId: string;
  items: OrderItem[];
  totalAmount: string;
  paymentMethod: "cod" | "online";
  isPaid: boolean;
  address: OrderAddress;
  assignment: string | null;
  assignedDeliveryBoy: string | null;
  status:
    | "pending"
    | "out of delivery"
    | "delivered"
    | "cancelled";
  deliveryBoyCompleted?: boolean;
  customerConfirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TrackOrderResponse {
  success: boolean;
  message?: string;
  order: Order;
  deliveryBoyLocation?: ILocation | null;
  deliveryBoy?: {
    _id: string;
    name?: string;
    mobile?: string;
    image?: string;
  } | null;
}

/* =========================================================
   PROPS
========================================================= */
interface TrackOrderProps {
  params: Promise<{
    orderId: string;
  }>;
}

/* =========================================================
   STATUS NORMALIZATION
========================================================= */
const normalizeOrderStatus = (
  status?: string,
): Order["status"] => {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "pending":
    case "processing":
      return "pending";

    case "out for delivery":
    case "out of delivery":
    case "shipped":
      return "out of delivery";

    case "delivered":
      return "delivered";

    case "cancelled":
    case "canceled":
      return "cancelled";

    default:
      return "pending";
  }
};

/* =========================================================
   STATUS CONFIG (LIGHT MODE)
========================================================= */
const statusConfig: Record<
  Order["status"],
  {
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    color: string;
    bg: string;
    border: string;
  }
> = {
  pending: {
    label: "Order Processing",
    icon: Clock,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  "out of delivery": {
    label: "Out for Delivery",
    icon: Truck,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Order Cancelled",
    icon: AlertCircle,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

/* =========================================================
   COMPONENT
========================================================= */
export default function TrackOrder({ params }: TrackOrderProps) {
  const { data: session } = useSession();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] =
    useState<ILocation | null>(null);
  const [deliveryBoy, setDeliveryBoy] = useState<
    TrackOrderResponse["deliveryBoy"]
  >(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  /* =======================================================
     CUSTOMER CONFIRM DELIVERY ("GOT ORDER")
  ======================================================= */
  const handleConfirmDelivery = async () => {
    if (!orderId || confirmingDelivery) return;

    try {
      setConfirmingDelivery(true);
      setError("");

      const res = await axios.post(
        `/api/user/order/${encodeURIComponent(orderId)}/confirm-delivery`
      );

      if (res.data?.success) {
        setOrder((previous) =>
          previous
            ? {
                ...previous,
                status: "delivered",
                customerConfirmed: true,
              }
            : previous
        );
        fetchOrder(true);
      } else {
        setError(res.data?.message || "Failed to confirm delivery");
      }
    } catch (err: any) {
      console.error("❌ Confirm delivery error:", err);
      setError(err.response?.data?.message || "Failed to confirm delivery");
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

  /* =======================================================
     GET ORDER ID
  ======================================================= */
  useEffect(() => {
    let isMounted = true;
    const resolveParams = async () => {
      try {
        const resolved = await params;
        if (isMounted) {
          setOrderId(resolved.orderId);
        }
      } catch {
        if (isMounted) {
          setError("Unable to read order ID.");
          setLoading(false);
        }
      }
    };
    resolveParams();
    return () => {
      isMounted = false;
    };
  }, [params]);

  /* =======================================================
     FETCH ORDER API
  ======================================================= */
  const fetchOrder = useCallback(
    async (showRefresh = false) => {
      if (!orderId) return;

      try {
        if (showRefresh) {
          setRefreshing(true);
        }
        setError("");

        const response = await axios.get<TrackOrderResponse>(
          `/api/user/get-order/${encodeURIComponent(orderId)}`,
          { timeout: 30000 }
        );

        const data = response.data;
        if (!data?.success || !data?.order) {
          throw new Error(data?.message || "Order data not found.");
        }

        const normalizedOrder: Order = {
          ...data.order,
          _id: String(data.order._id),
          orderRequestId: String(data.order.orderRequestId ?? ""),
          status: normalizeOrderStatus(data.order.status),
        };

        setOrder(normalizedOrder);
        setDeliveryBoy(data.deliveryBoy ?? null);
        if (data.deliveryBoyLocation) {
          setDeliveryBoyLocation(data.deliveryBoyLocation);
          setLastLocationUpdate(new Date());
        }
      } catch (err: unknown) {
        console.error("❌ Track order error:", err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "Unable to load this order."
          );
        } else if (err instanceof Error) {
          setError(err.message || "Unable to load this order.");
        } else {
          setError("Unable to load this order.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */
  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId, fetchOrder]);

  /* =======================================================
     SOCKET.IO REAL-TIME UPDATES
  ======================================================= */
  useEffect(() => {
    if (!orderId || !session?.user?.id) {
      return;
    }

    const socket = getSocket(session.user.id);

    const handleConnect = () => {
      setSocketConnected(true);
      socket.emit("track-order", orderId);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleConnectError = (err: Error) => {
      console.error("❌ Tracking socket error:", err);
      setSocketConnected(false);
    };

    const handleDeliveryLocation = (data: unknown) => {
      const payload = data as {
        userId?: string;
        orderId?: string;
        latitude?: number;
        longitude?: number;
        location?: {
          type?: string;
          coordinates?: [number, number];
        };
      };

      // Security check: Only update if event belongs to assigned delivery boy
      const assignedBoyId =
        deliveryBoy?._id ||
        (order?.assignedDeliveryBoy && typeof order.assignedDeliveryBoy === "object"
          ? String((order.assignedDeliveryBoy as any)._id)
          : order?.assignedDeliveryBoy ? String(order.assignedDeliveryBoy) : null);

      if (payload.userId && assignedBoyId && String(payload.userId) !== String(assignedBoyId)) {
        return;
      }

      if (payload.orderId && String(payload.orderId) !== String(orderId)) {
        return;
      }

      // Stop tracking if order is delivered or cancelled
      if (order?.status === "delivered" || order?.status === "cancelled") {
        return;
      }

      let lat: number | undefined;
      let lon: number | undefined;

      if (typeof payload.latitude === "number" && typeof payload.longitude === "number") {
        lat = payload.latitude;
        lon = payload.longitude;
      } else if (
        payload.location?.coordinates &&
        Array.isArray(payload.location.coordinates) &&
        payload.location.coordinates.length === 2
      ) {
        lon = payload.location.coordinates[0];
        lat = payload.location.coordinates[1];
      }

      if (typeof lat === "number" && typeof lon === "number" && (lat !== 0 || lon !== 0)) {
        setDeliveryBoyLocation({
          latitude: lat,
          longitude: lon,
        });
        setLastLocationUpdate(new Date());
      }
    };

    const handleOrderStatus = (data: unknown) => {
      const payload = data as {
        orderId?: string;
        status?: string;
      };

      if (
        payload.orderId &&
        String(payload.orderId) !== String(orderId)
      ) {
        return;
      }

      if (payload.status) {
        const normalizedStatus = normalizeOrderStatus(payload.status);
        setOrder((previous) =>
          previous
            ? {
                ...previous,
                status: normalizedStatus,
              }
            : previous
        );
      }

      fetchOrder();
    };

    const handleOrderAssigned = (data: unknown) => {
      const payload = data as { orderId?: string };
      if (
        payload?.orderId &&
        String(payload.orderId) !== String(orderId)
      ) {
        return;
      }
      fetchOrder();
    };

    const handleDeliveryCompleted = () => {
      fetchOrder();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("delivery-location", handleDeliveryLocation);
    socket.on("delivery-location-update", handleDeliveryLocation);
    socket.on("update-deliveryBoy-location", handleDeliveryLocation);
    socket.on("order-status-update", handleOrderStatus);
    socket.on("order-assigned", handleOrderAssigned);
    socket.on("delivery-completed", handleDeliveryCompleted);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("delivery-location", handleDeliveryLocation);
      socket.off("delivery-location-update", handleDeliveryLocation);
      socket.off("update-deliveryBoy-location", handleDeliveryLocation);
      socket.off("order-status-update", handleOrderStatus);
      socket.off("order-assigned", handleOrderAssigned);
      socket.off("delivery-completed", handleDeliveryCompleted);
    };
  }, [orderId, session?.user?.id, fetchOrder, deliveryBoy?._id, order?.assignedDeliveryBoy, order?.status]);

  /* =======================================================
     LOADING SKELETON
  ======================================================= */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-white px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-[520px] animate-pulse rounded-3xl bg-slate-50" />
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-3xl bg-slate-50" />
              <div className="h-56 animate-pulse rounded-3xl bg-slate-50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR UI
  ======================================================= */
  if (error || !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white px-4 text-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Order Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "We couldn't find this order."}
          </p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => fetchOrder(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
            <Link
              href="/user/my-orders"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
              Back
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* =======================================================
     STATUS METADATA SAFE RESOLUTION
  ======================================================= */
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const hasLiveTracking =
    order.status === "out of delivery" && !!deliveryBoyLocation;

  /* =======================================================
     MAIN PAGE UI (FULL SCREEN WHITE COVER)
  ======================================================= */
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white px-4 py-6 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            HEADER
        ================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <div className="flex items-center gap-2">
              <Package size={20} className="text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                FreshKart
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-slate-900">
              Track Your Order
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Order #{order.orderRequestId}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/user/my-orders"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={15} />
              Back
            </Link>

            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                socketConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  socketConnected
                    ? "animate-pulse bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />
              {socketConnected
                ? lastLocationUpdate
                  ? `Partner Live (Updated ${lastLocationUpdate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })})`
                  : "Live Tracking"
                : "Connecting"}
            </div>

            <button
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* =================================================
            CUSTOMER GOT ORDER CONFIRMATION BANNER
        ================================================= */}
        {order.deliveryBoyCompleted && order.status !== "delivered" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    Handed Over
                  </span>
                  <h2 className="mt-0.5 text-lg font-extrabold text-slate-900">
                    Delivery partner completed your order!
                  </h2>
                  <p className="text-xs text-slate-600">
                    Please confirm that you have received your grocery items.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmDelivery}
                disabled={confirmingDelivery}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-extrabold text-white shadow-lg transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 shrink-0"
              >
                {confirmingDelivery ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Got Order
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* =================================================
            STATUS BADGE
        ================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 flex items-center gap-4 rounded-3xl border p-5 ${status.bg} ${status.border}`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <StatusIcon className={status.color} size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Status
            </p>
            <h2 className={`text-lg font-bold ${status.color}`}>
              {status.label}
            </h2>
          </div>
          {order.status === "out of delivery" && (
            <div className="ml-auto hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-blue-600 shadow-sm sm:flex">
              <Navigation size={14} />
              On the way
            </div>
          )}
        </motion.div>

        {/* =================================================
            MAIN CONTENT (MAP & SIDEBAR)
        ================================================= */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* MAP CONTAINER */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {hasLiveTracking ? (
              <LiveMap
                userLocation={{
                  latitude: order.address.latitude,
                  longitude: order.address.longitude,
                }}
                deliveryBoyLocation={deliveryBoyLocation}
              />
            ) : (
              <div className="flex h-[520px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="max-w-sm px-6 text-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"
                  >
                    {order.status === "delivered" ? (
                      <CheckCircle2 size={32} />
                    ) : (
                      <Bike size={32} />
                    )}
                  </motion.div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {order.status === "delivered"
                      ? "Order Delivered"
                      : order.status === "cancelled"
                      ? "Order Cancelled"
                      : "Preparing Your Delivery"}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {order.status === "delivered"
                      ? "Your order has been successfully delivered."
                      : order.status === "cancelled"
                      ? "This order was cancelled and live tracking is unavailable."
                      : "Live map tracking will appear here once your order is assigned to a delivery partner and out for delivery."}
                  </p>
                </div>
              </div>
            )}
          </motion.section>

          {/* SIDEBAR DETAILS */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            {/* DELIVERY BOY CARD */}
            <AnimatePresence mode="wait">
              {deliveryBoy && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">
                      Delivery Partner
                    </h3>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      Live
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-emerald-600">
                      {deliveryBoy.image ? (
                        <img
                          src={deliveryBoy.image}
                          alt={deliveryBoy.name || "Delivery partner"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Bike size={23} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">
                        {deliveryBoy.name || "Delivery Partner"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Your delivery partner
                      </p>
                    </div>
                    {deliveryBoy.mobile && (
                      <a
                        href={`tel:${deliveryBoy.mobile}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200"
                      >
                        <Phone size={17} />
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* REAL-TIME CUSTOMER ↔ DELIVERY PARTNER CHAT */}
            {session?.user?.id && (
              <CustomerChat
                orderId={order._id}
                currentUserId={session.user.id}
                deliveryBoyName={deliveryBoy?.name || "Delivery Partner"}
                deliveryBoyPhone={deliveryBoy?.mobile}
              />
            )}

            {/* DELIVERY ADDRESS */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-500">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Delivery Address
                  </h3>
                  <p className="text-xs text-slate-500">
                    Delivering to
                  </p>
                </div>
              </div>
              <p className="font-semibold text-slate-800">
                {order.address.fullName}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {order.address.fullAddress}
                <br />
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4 text-sm text-slate-500">
                <Phone size={15} />
                {order.address.mobile}
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-900">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Items</span>
                  <span className="font-semibold text-slate-800">
                    {order.items.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Payment</span>
                  <span className="flex items-center gap-1.5 font-semibold capitalize text-slate-800">
                    <CreditCard size={14} />
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">
                      Total
                    </span>
                    <span className="text-xl font-black text-emerald-600">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* =================================================
            ORDERED ITEMS LIST
        ================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Package size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Ordered Items
                </h3>
                <p className="text-xs text-slate-500">
                  {order.items.length} unique item types
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {order.items.map((item, index) => (
              <motion.div
                key={`${item.grocery}-${index}`}
                whileHover={{ y: -3 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package size={20} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.quantity} × ₹{item.price}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}