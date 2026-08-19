"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  MapPin,
  Package,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CreditCard,
  Check,
  RefreshCw,
  Navigation,
  ShoppingBag,
} from "lucide-react";
import dynamic from "next/dynamic";
import { getSocket } from "@/lib/socket";
import GeoUpdater from "@/components/GeoUpdater";
import type { ILocation } from "@/components/LiveMap";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
      <div className="text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Loading delivery map...</p>
      </div>
    </div>
  ),
});

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
  status: "pending" | "out of delivery" | "delivered";
  deliveryBoyCompleted?: boolean;
  deliveryBoyCompletedAt?: string;
  customerConfirmed?: boolean;
  customerConfirmedAt?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    mobile?: string;
  };
  createdAt?: string;
}

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function DeliveryOrderPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const deliveryBoyId = session?.user?.id;

  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  // Resolve route params
  useEffect(() => {
    let isMounted = true;
    const resolve = async () => {
      try {
        const resolved = await params;
        if (isMounted) {
          setOrderId(resolved.orderId);
        }
      } catch {
        if (isMounted) {
          setError("Failed to parse order ID");
          setLoading(false);
        }
      }
    };
    resolve();
    return () => {
      isMounted = false;
    };
  }, [params]);

  // Fetch Order details
  const fetchOrderDetails = useCallback(
    async (showRefresh = false) => {
      if (!orderId) return;

      try {
        if (showRefresh) {
          setRefreshing(true);
        }
        setError("");

        const res = await axios.get(`/api/delivery/order/${encodeURIComponent(orderId)}`, {
          timeout: 10000,
        });

        if (res.data?.success && res.data?.order) {
          setOrder(res.data.order);
          if (res.data.deliveryBoyLocation) {
            setDeliveryBoyLocation(res.data.deliveryBoyLocation);
          }
        } else {
          throw new Error(res.data?.message || "Delivery order not found");
        }
      } catch (err: any) {
        console.error("❌ Delivery order fetch error:", err);
        const msg = err.response?.data?.message || err.message || "Failed to load delivery order";
        setError(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!deliveryBoyId || !orderId) return;
    fetchOrderDetails();
  }, [sessionStatus, deliveryBoyId, orderId, fetchOrderDetails]);

  // Real-time Socket.IO Listeners
  useEffect(() => {
    if (!deliveryBoyId || !orderId) return;

    const socket = getSocket(deliveryBoyId);

    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleDeliveryLocation = (data: any) => {
      if (data?.userId === deliveryBoyId && typeof data?.latitude === "number") {
        setDeliveryBoyLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    };

    const handleDeliveryConfirmed = (data: any) => {
      console.log("🎉 Customer confirmed delivery:", data);
      if (String(data?.orderId) === String(orderId)) {
        fetchOrderDetails();
      }
    };

    const handleOrderStatusUpdate = (data: any) => {
      if (String(data?.orderId) === String(orderId)) {
        fetchOrderDetails();
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("update-deliveryBoy-location", handleDeliveryLocation);
    socket.on("delivery-confirmed", handleDeliveryConfirmed);
    socket.on("order-status-update", handleOrderStatusUpdate);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("update-deliveryBoy-location", handleDeliveryLocation);
      socket.off("delivery-confirmed", handleDeliveryConfirmed);
      socket.off("order-status-update", handleOrderStatusUpdate);
    };
  }, [deliveryBoyId, orderId, fetchOrderDetails]);

  // Also track HTML5 Geolocation locally if Leaflet needs instant coordinates
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setDeliveryBoyLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Handle Complete Order click
  const handleCompleteOrder = async () => {
    if (!orderId || completing) return;

    try {
      setCompleting(true);
      setError("");

      const res = await axios.post(
        `/api/delivery/order/${encodeURIComponent(orderId)}/complete`,
        {},
        { timeout: 10000 }
      );

      if (res.data?.success) {
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                deliveryBoyCompleted: true,
                deliveryBoyCompletedAt: new Date().toISOString(),
              }
            : prev
        );
      } else {
        setError(res.data?.message || "Failed to mark order completed");
      }
    } catch (err: any) {
      console.error("❌ Complete order error:", err);
      setError(err.response?.data?.message || "Failed to complete delivery");
    } finally {
      setCompleting(false);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <Loader2 size={22} className="animate-spin text-emerald-600" />
          <span className="font-medium text-slate-700">Loading delivery details...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Denied or Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">{error || "Could not access this order."}</p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <ArrowLeft size={18} />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const customerCoords: ILocation = {
    latitude: order.address?.latitude || 0,
    longitude: order.address?.longitude || 0,
  };

  const deliveryBoyCoords: ILocation = deliveryBoyLocation || {
    latitude: order.address?.latitude ? order.address.latitude - 0.005 : 0,
    longitude: order.address?.longitude ? order.address.longitude - 0.005 : 0,
  };

  const isDelivered = order.status === "delivered" && order.customerConfirmed;
  const isWaitingConfirmation = order.deliveryBoyCompleted && !isDelivered;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      {deliveryBoyId && <GeoUpdater userId={deliveryBoyId} />}

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600"
              >
                <ArrowLeft size={15} />
                Dashboard
              </Link>
              <span className="text-slate-300">•</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Active Delivery
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 md:text-3xl">
              Order #{order.orderRequestId || order._id.slice(-6).toUpperCase()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
                socketConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  socketConnected ? "animate-ping bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {socketConnected ? "Live Socket Active" : "Connecting..."}
            </div>

            <button
              onClick={() => fetchOrderDetails(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* STATUS BANNER */}
        {isDelivered ? (
          <div className="mb-6 flex items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Delivery Completed & Confirmed!</h2>
              <p className="text-sm text-emerald-700">
                Customer has confirmed receipt of order #{order.orderRequestId}. Active delivery slot freed!
              </p>
            </div>
          </div>
        ) : isWaitingConfirmation ? (
          <div className="mb-6 flex items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
              <Clock size={24} className="animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Waiting for Customer Confirmation</h2>
              <p className="text-sm text-amber-800">
                You marked this order completed. The customer must click <strong>Got Order</strong> to finalize delivery.
              </p>
            </div>
          </div>
        ) : null}

        {/* MAIN LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* MAP */}
          <div className="space-y-6">
            <LiveMap
              userLocation={customerCoords}
              deliveryBoyLocation={deliveryBoyCoords}
            />

            {/* ACTION CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 font-bold text-slate-900">Delivery Status Action</h3>
              <p className="mb-5 text-sm text-slate-500">
                Once you physically deliver the groceries to the customer's house, click <strong>Complete Order</strong>.
              </p>

              {isDelivered ? (
                <button
                  disabled
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-md opacity-90 cursor-default"
                >
                  <CheckCircle2 size={20} />
                  Order Delivered & Confirmed
                </button>
              ) : isWaitingConfirmation ? (
                <button
                  disabled
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-bold text-white shadow-md opacity-90 cursor-default"
                >
                  <Clock size={20} className="animate-spin" />
                  Waiting for Customer Confirmation...
                </button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={handleCompleteOrder}
                  disabled={completing}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {completing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Complete Order
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* SIDEBAR DETAILS */}
          <div className="space-y-5">
            {/* CUSTOMER DETAILS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Customer Details</h3>
                    <p className="text-xs text-slate-500">Recipients info</p>
                  </div>
                </div>

                {order.address?.mobile && (
                  <a
                    href={`tel:${order.address.mobile}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200"
                    title="Call Customer"
                  >
                    <Phone size={18} />
                  </a>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Customer Name</p>
                  <p className="font-semibold text-slate-900">{order.address?.fullName || order.user?.name}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Contact Number</p>
                  <p className="font-semibold text-slate-900">{order.address?.mobile}</p>
                </div>
              </div>
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Delivery Location</h3>
                  <p className="text-xs text-slate-500">Destination address</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium text-slate-800 leading-relaxed">
                  {order.address?.fullAddress}
                </p>
                <p className="text-slate-500">
                  {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                </p>
              </div>
            </div>

            {/* ORDER ITEMS & SUMMARY */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Order Summary</h3>
                    <p className="text-xs text-slate-500">{order.items?.length || 0} Items</p>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-600 text-lg">₹{order.totalAmount}</span>
              </div>

              {/* Items List */}
              <div className="mb-4 max-h-48 overflow-y-auto space-y-2.5 pr-1">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package size={16} className="m-auto text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{item.name}</p>
                        <p className="text-slate-400">{item.quantity} × ₹{item.price}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700">₹{Number(item.price) * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CreditCard size={14} />
                  Payment Method
                </span>
                <span className="font-bold uppercase text-slate-800">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
