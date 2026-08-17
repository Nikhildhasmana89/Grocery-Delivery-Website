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
  const { data: session, status: sessionStatus } =
    useSession();

  const deliveryBoyId =
    session?.user?.id;

  /* =======================================================
     STATE
  ======================================================= */

  const [orders, setOrders] =
    useState<Order[]>([]);

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

        const response = await axios.get(
          "/api/delivery/get-assignment",
          {
            timeout: 10000,
          },
        );

        console.log(
          "📦 Delivery API response:",
          response.data,
        );

        /*
         * Backend returns:
         *
         * {
         *   assignment: [...]
         * }
         *
         * NOT:
         *
         * {
         *   orders: [...]
         * }
         */

        const assignments: DeliveryAssignment[] =
          Array.isArray(
            response.data?.assignment,
          )
            ? response.data.assignment
            : [];

        /*
         * Convert assignments → orders
         *
         * Only broadcasted assignments should
         * appear in the available-orders list.
         */

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

                /*
                 * IMPORTANT:
                 * Keep the assignment ID.
                 */

                assignment:
                  assignment._id,

                /*
                 * Nobody has accepted yet.
                 */

                assignedDeliveryBoy:
                  assignment.assignedTo ??
                  null,
              };
            });

        console.log(
          "✅ Available delivery orders:",
          availableOrders,
        );

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
     SOCKET.IO
  ======================================================= */

  useEffect(() => {
    if (!deliveryBoyId) {
      return;
    }

    console.log(
      "🔌 Initializing delivery socket:",
      deliveryBoyId,
    );

    const socket =
      getSocket(deliveryBoyId);

    /* -----------------------------------------------
       CONNECT
    ------------------------------------------------ */

    const handleConnect = () => {
      console.log(
        "✅ Delivery socket connected:",
        socket.id,
      );

      setSocketConnected(true);

      /*
       * Your socket server expects:
       *
       * socket.on("identity", userId)
       */

      socket.emit(
        "identity",
        deliveryBoyId,
      );

      /*
       * Refresh once after connecting.
       * This protects against missing an event
       * while the page was loading.
       */

      fetchOrders();
    };

    /* -----------------------------------------------
       DISCONNECT
    ------------------------------------------------ */

    const handleDisconnect = (
      reason: string,
    ) => {
      console.log(
        "❌ Delivery socket disconnected:",
        reason,
      );

      setSocketConnected(false);
    };

    /* -----------------------------------------------
       CONNECT ERROR
    ------------------------------------------------ */

    const handleConnectError = (
     error: Error,
    ) => {
      console.error(
        "❌ Socket connection error:",
        error,
      );

      setSocketConnected(false);
    };

    /* -----------------------------------------------
       NEW ASSIGNMENT
    ------------------------------------------------ */

    const handleNewAssignment = (
      data: unknown,
    ) => {
      console.log(
        "📦 NEW DELIVERY ASSIGNMENT RECEIVED:",
        data,
      );

      /*
       * Don't trust socket payload as the source
       * of truth.
       *
       * Fetch the latest MongoDB state.
       */

      fetchOrders();
    };

    /* -----------------------------------------------
       ORDER ACCEPTED BY SOMEONE ELSE
    ------------------------------------------------ */

    const handleOrderAccepted = (
      data: unknown,
    ) => {
      console.log(
        "🚚 ORDER ACCEPTED EVENT:",
        data,
      );

      /*
       * Refresh because another delivery boy
       * may have claimed one of our visible orders.
       */

      fetchOrders();
    };

    const handleOrderRejected = (
      data: unknown,
    ) => {
      console.log(
        "❌ ORDER REJECTED EVENT:",
        data,
      );
      fetchOrders();
    };

    /* -----------------------------------------------
       LISTENERS
    ------------------------------------------------ */

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "disconnect",
      handleDisconnect,
    );

    socket.on(
      "connect_error",
      handleConnectError,
    );

    socket.on(
      "new-assignment",
      handleNewAssignment,
    );

    socket.on(
      "order-accepted",
      handleOrderAccepted,
    );

    socket.on(
      "order-rejected",
      handleOrderRejected,
    );

    /*
     * If getSocket() returns an already-connected
     * socket, connect may already have happened
     * before our listener was attached.
     */

    if (socket.connected) {
      handleConnect();
    } else {
      console.log("🔌 Initiating Socket.IO connection for delivery boy...");
      socket.connect();
    }

    /* -----------------------------------------------
       CLEANUP
    ------------------------------------------------ */

    return () => {
      console.log(
        "🧹 Cleaning delivery socket listeners",
      );

      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "disconnect",
        handleDisconnect,
      );

      socket.off(
        "connect_error",
        handleConnectError,
      );

      socket.off(
        "new-assignment",
        handleNewAssignment,
      );

      socket.off(
        "order-accepted",
        handleOrderAccepted,
      );

      socket.off(
        "order-rejected",
        handleOrderRejected,
      );
    };
  }, [
    deliveryBoyId,
    fetchOrders,
  ]);

  /* =======================================================
     ACCEPT ORDER
  ======================================================= */

  const handleAccept = async (
    orderId: string,
    assignmentId?: string | null,
  ) => {
    if (
      acceptingId ||
      !deliveryBoyId
    ) {
      return;
    }

    const targetId = assignmentId || orderId;

    try {
      setAcceptingId(orderId);
      setError("");

      console.log(
        "🚚 Accepting order:",
        orderId,
        "Assignment:",
        targetId,
      );

      const response =
        await axios.post(
          `/api/delivery/assignment/${targetId}/accept-assignment`,
          {},
          {
            timeout: 10000,
          },
        );

      console.log(
        "✅ Order accepted:",
        response.data,
      );

      /*
       * Immediately remove it from UI.
       */

      setOrders(
        (previousOrders) =>
          previousOrders.filter(
            (order) =>
              order._id !== orderId,
          ),
      );

      /*
       * Then confirm the actual database
       * state.
       */

      await fetchOrders();
    } catch (error: unknown) {
      console.error(
        "❌ Accept order error:",
        error,
      );

      let message =
        "This delivery is no longer available.";

      if (
        axios.isAxiosError(error)
      ) {
        message =
          error.response?.data
            ?.message ||
          error.response?.data
            ?.error ||
          message;
      }

      setError(message);

      /*
       * Another delivery boy may have accepted
       * the order first.
       */

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
    if (
      rejectingId ||
      acceptingId ||
      !deliveryBoyId
    ) {
      return;
    }

    const targetId = assignmentId || orderId;

    try {
      setRejectingId(orderId);
      setError("");

      console.log(
        "❌ Rejecting order assignment:",
        orderId,
        "Assignment:",
        targetId,
      );

      const response =
        await axios.post(
          `/api/delivery/assignment/${targetId}/reject-assignment`,
          {},
          {
            timeout: 10000,
          },
        );

      console.log(
        "✅ Assignment rejected:",
        response.data,
      );

      /*
       * Immediately remove it from UI.
       */

      setOrders(
        (previousOrders) =>
          previousOrders.filter(
            (order) =>
              order._id !== orderId,
          ),
      );

      await fetchOrders();
    } catch (error: unknown) {
      console.error(
        "❌ Reject order error:",
        error,
      );

      let message =
        "Failed to reject delivery assignment.";

      if (
        axios.isAxiosError(error)
      ) {
        message =
          error.response?.data
            ?.message ||
          error.response?.data
            ?.error ||
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

  const availableOrders =
    useMemo(() => {
      return orders.filter(
        (order) =>
          /*
           * Broadcasted orders have:
           *
           * status = out of delivery
           * assignment = assignment ID
           * assignedDeliveryBoy = null
           */

          order.status ===
            "out of delivery" &&
          !!order.assignment &&
          !order.assignedDeliveryBoy,
      );
    }, [orders]);

  /* =======================================================
     DATE
  ======================================================= */

  const formatDate = (
    date?: string,
  ) => {
    if (!date) {
      return "Just now";
    }

    try {
      return new Date(
        date,
      ).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  /* =======================================================
     SESSION LOADING
  ======================================================= */

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <Loader2
            size={22}
            className="animate-spin text-green-600"
          />

          <span className="font-medium text-slate-700">
            Loading delivery dashboard...
          </span>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: -25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
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
              Choose an available order and
              start your delivery
            </p>
          </div>

          {/* ONLINE / SOCKET STATUS */}

          <motion.div
            whileHover={{
              scale: 1.03,
            }}
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

                <Wifi
                  size={16}
                  className="text-green-600"
                />

                <span className="text-sm font-semibold text-green-700">
                  Online
                </span>
              </>
            ) : (
              <>
                <span className="h-3 w-3 rounded-full bg-red-500" />

                <WifiOff
                  size={16}
                  className="text-red-600"
                />

                <span className="text-sm font-semibold text-red-700">
                  Connecting...
                </span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* =================================================
            ERROR
        ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <AlertCircle size={20} />

              <p className="text-sm font-medium">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          {/* AVAILABLE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <Package
              className="mb-3 text-blue-500"
              size={24}
            />

            <p className="text-sm text-slate-500">
              Available Orders
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {availableOrders.length}
            </p>
          </motion.div>

          {/* PENDING */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <Clock
              className="mb-3 text-orange-500"
              size={24}
            />

            <p className="text-sm text-slate-500">
              Pending
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {availableOrders.length}
            </p>
          </motion.div>

          {/* COMPLETED */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <CheckCircle2
              className="mb-3 text-green-500"
              size={24}
            />

            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              0
            </p>
          </motion.div>

          {/* EARNINGS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <IndianRupee
              className="mb-3 text-emerald-500"
              size={24}
            />

            <p className="text-sm text-slate-500">
              Earnings
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              ₹0
            </p>
          </motion.div>
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
          }}
          className="mb-4 flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Available Deliveries
            </h2>

            <p className="text-sm text-slate-500">
              Choose any order that you want to
              deliver
            </p>
          </div>

          <button
            onClick={() =>
              fetchOrders(true)
            }
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </motion.div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map(
              (item) => (
                <motion.div
                  key={item}
                  animate={{
                    opacity: [
                      0.5,
                      1,
                      0.5,
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="h-72 rounded-3xl bg-white"
                />
              ),
            )}
          </div>
        ) : availableOrders.length ===
          0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-3xl border border-dashed bg-white px-6 py-14 text-center"
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [
                  0,
                  -3,
                  3,
                  0,
                ],
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
              No available deliveries
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              New orders will appear here
              automatically when they become
              available.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-green-600">
              <Sparkles size={16} />

              Stay online to receive orders
            </div>
          </motion.div>
        ) : (
          /* =================================================
             ORDERS
          ================================================= */

          <div className="grid gap-5 md:grid-cols-2">
            <AnimatePresence>
              {availableOrders.map(
                (item, index) => (
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
                      delay:
                        index * 0.05,
                      duration: 0.4,
                    }}
                    whileHover={{
                      y: -5,
                    }}
                    className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition-shadow hover:shadow-xl"
                  >
                    {/* HEADER */}

                    <div className="flex items-center justify-between border-b px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-green-100 p-2.5 text-green-600">
                          <Package size={20} />
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Order
                          </p>

                          <p className="font-bold text-slate-900">
                            #
                            {(
                              item.orderRequestId ||
                              item._id
                            )
                              .slice(-8)
                              .toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold capitalize text-orange-600">
                        Out for delivery
                      </span>
                    </div>

                    {/* BODY */}

                    <div className="space-y-4 p-5">

                      {/* CUSTOMER */}

                      <div className="flex gap-3">
                        <div className="mt-1 rounded-lg bg-purple-100 p-2 text-purple-600">
                          <ShoppingBag
                            size={18}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">
                            Customer
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {
                              item.address
                                .fullName
                            }
                          </p>
                        </div>
                      </div>

                      {/* ADDRESS */}

                      <div className="flex gap-3">
                        <div className="mt-1 rounded-lg bg-blue-100 p-2 text-blue-600">
                          <MapPin
                            size={18}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">
                            Delivery Address
                          </p>

                          <p className="mt-1 line-clamp-3 text-sm font-medium text-slate-800">
                            {
                              item.address
                                .fullAddress
                            }
                            ,{" "}
                            {
                              item.address
                                .city
                            }
                            ,{" "}
                            {
                              item.address
                                .state
                            }{" "}
                            -{" "}
                            {
                              item.address
                                .pincode
                            }
                          </p>
                        </div>
                      </div>

                      {/* PHONE */}

                      <div className="flex gap-3">
                        <div className="mt-1 rounded-lg bg-green-100 p-2 text-green-600">
                          <Phone
                            size={18}
                          />
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Customer Mobile
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {
                              item.address
                                .mobile
                            }
                          </p>
                        </div>
                      </div>

                      {/* ORDER INFO */}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs text-slate-400">
                            Order Total
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            ₹
                            {
                              item.totalAmount
                            }
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs text-slate-400">
                            Payment
                          </p>

                          <p className="mt-1 font-semibold capitalize text-green-600">
                            {
                              item.paymentMethod
                            }
                          </p>
                        </div>
                      </div>

                      {/* TIME */}

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} />

                        {formatDate(
                          item.createdAt,
                        )}
                      </div>

                      {/* ACCEPT & REJECT BUTTONS */}

                      <div className="flex items-center gap-3 pt-2">
                        <motion.button
                          whileTap={{
                            scale: 0.97,
                          }}
                          whileHover={{
                            scale:
                              acceptingId === item._id || rejectingId === item._id
                                ? 1
                                : 1.01,
                          }}
                          onClick={() =>
                            handleAccept(
                              item._id,
                              item.assignment,
                            )
                          }
                          disabled={
                            acceptingId !== null || rejectingId !== null
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {acceptingId === item._id ? (
                            <>
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />

                              Accepting...
                            </>
                          ) : (
                            <>
                              <Navigation
                                size={18}
                              />

                              Accept Delivery
                            </>
                          )}
                        </motion.button>

                        <motion.button
                          whileTap={{
                            scale: 0.97,
                          }}
                          whileHover={{
                            scale:
                              acceptingId === item._id || rejectingId === item._id
                                ? 1
                                : 1.01,
                          }}
                          onClick={() =>
                            handleReject(
                              item._id,
                              item.assignment,
                            )
                          }
                          disabled={
                            acceptingId !== null || rejectingId !== null
                          }
                          className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 hover:dark:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {rejectingId === item._id ? (
                            <>
                              <Loader2
                                size={18}
                                className="animate-spin text-red-600"
                              />

                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle
                                size={18}
                              />

                              Reject
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ),
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;