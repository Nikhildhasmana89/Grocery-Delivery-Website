"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Package,
  Clock,
  User,
  MapPin,
  ChevronDown,
  CheckCircle2,
  Truck,
  Copy,
  Check,
  CreditCard,
  ImageIcon,
  Phone,
  Mail,
  Bike,
  UserCheck,
  Loader2,
} from "lucide-react";

import axios from "axios";

/* =========================================================
   TYPES
========================================================= */

export type OrderStatus =
  | "pending"
  | "out of delivery"
  | "delivered";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface DeliveryBoy {
  _id: string;
  name?: string;
  email?: string;
  mobile?: string;
  image?: string;
}

export interface AdminOrderCardProps {
  orderId?: string;

  customerName?: string;
  customerEmail?: string;

  shippingAddress?:
    | string
    | {
        fullAddress?: string;
      };

  orderDate?: string;

  status?: OrderStatus;

  paymentMethod?: string;

  items?: OrderItem[];

  totalAmount?: number;

  /* =========================================
     ASSIGNED DELIVERY BOY
  ========================================= */

  assignedDeliveryBoy?:
    | string
    | DeliveryBoy
    | null;

  assignedAt?: string | null;

  onStatusChange?: (
    newStatus: OrderStatus
  ) => void;
}

/* =========================================================
   DEFAULT ITEMS
========================================================= */

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

/* =========================================================
   STATUS STYLES
========================================================= */

const statusStyles: Record<
  OrderStatus,
  {
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
    glow: string;
  }
> = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/10",
    icon: (
      <Clock className="h-3.5 w-3.5" />
    ),
  },

  "out of delivery": {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
    icon: (
      <Truck className="h-3.5 w-3.5" />
    ),
  },

  delivered: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border:
      "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
    icon: (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ),
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminOrderCard({
  orderId = "ORD-8942-XJ",

  customerName = "Sarah Jenkins",

  customerEmail =
    "sarah.j@example.com",

  shippingAddress =
    "742 Evergreen Terrace, Springfield, OR 97477",

  orderDate =
    "Oct 24, 2026 • 14:32",

  status = "pending",

  paymentMethod =
    "Credit Card (•••• 4242)",

  items = defaultItems,

  totalAmount = 229.97,

  assignedDeliveryBoy = null,

  assignedAt = null,

  onStatusChange,
}: AdminOrderCardProps) {
  /* =======================================================
     STATE
  ======================================================= */

  const [isExpanded, setIsExpanded] =
    useState(false);

  const [currentStatus, setCurrentStatus] =
    useState<OrderStatus>(status);

  const [copied, setCopied] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  /* =======================================================
     SYNC STATUS
  ======================================================= */

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  /* =======================================================
     DELIVERY BOY
  ======================================================= */

  const deliveryBoy =
    typeof assignedDeliveryBoy ===
    "object"
      ? assignedDeliveryBoy
      : null;

  const isAssigned =
    !!assignedDeliveryBoy;

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (
    id: string,
    newStatus: OrderStatus
  ) => {
    try {
      setIsUpdating(true);

      console.log(
        "📦 Updating order:",
        id
      );

      console.log(
        "New status:",
        newStatus
      );

      const response =
        await axios.post(
          `/api/admin/update-order-status/${id}`,
          {
            status: newStatus,
          }
        );

      console.log(
        "✅ Status updated:",
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Update order error:",
        error
      );

      console.error(
        "Server:",
        error.response?.data
      );

      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /* =======================================================
     COPY ORDER ID
  ======================================================= */

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(
        orderId
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        2000
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  /* =======================================================
     STATUS SELECT
  ======================================================= */

  const handleStatusSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus =
      e.target.value as OrderStatus;

    if (
      newStatus === currentStatus
    ) {
      return;
    }

    const previousStatus =
      currentStatus;

    setCurrentStatus(newStatus);

    try {
      await updateStatus(
        orderId,
        newStatus
      );

      onStatusChange?.(
        newStatus
      );
    } catch {
      setCurrentStatus(
        previousStatus
      );

      alert(
        "Failed to update order status. Please try again."
      );
    }
  };

  /* =======================================================
     STATUS STYLE
  ======================================================= */

  const currentStatusStyle =
    statusStyles[currentStatus] ??
    statusStyles.pending;

  /* =======================================================
     ITEM COUNT
  ======================================================= */

  const totalItemCount =
    useMemo(() => {
      return items.reduce(
        (acc, item) =>
          acc +
          (item.quantity || 0),
        0
      );
    }, [items]);

  /* =======================================================
     ADDRESS
  ======================================================= */

  const formattedAddress =
    typeof shippingAddress ===
    "string"
      ? shippingAddress
      : shippingAddress?.fullAddress ??
        "No address provided";

  /* =======================================================
     ASSIGNED DATE
  ======================================================= */

  const formattedAssignedAt =
    assignedAt
      ? new Date(
          assignedAt
        ).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : null;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      whileHover={{
        y: -5,
      }}
      transition={{
        duration: 0.45,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      className="
        group relative w-full max-w-2xl
        overflow-hidden rounded-3xl
        border border-slate-200/80
        bg-white
        shadow-[0_8px_30px_rgba(15,23,42,0.06)]
        transition-shadow duration-500
        hover:shadow-[0_20px_50px_rgba(79,70,229,0.14)]
        dark:border-slate-800
        dark:bg-slate-950
      "
    >
      {/* =====================================================
          GLOW
      ====================================================== */}

      <motion.div
        className="
          pointer-events-none
          absolute -right-24 -top-24
          h-56 w-56
          rounded-full
          bg-indigo-500/10
          blur-3xl
        "
        animate={{
          scale: [
            1,
            1.15,
            1,
          ],
          opacity: [
            0.35,
            0.65,
            0.35,
          ],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* =====================================================
          TOP LINE
      ====================================================== */}

      <motion.div
        initial={{
          scaleX: 0,
        }}
        animate={{
          scaleX: 1,
        }}
        transition={{
          duration: 0.8,
          delay: 0.15,
        }}
        className="
          absolute left-0 right-0 top-0
          h-[2px]
          origin-left
          bg-gradient-to-r
          from-indigo-500
          via-violet-500
          to-blue-500
        "
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          relative
          flex flex-wrap
          items-center justify-between
          gap-4
          border-b
          border-slate-100
          bg-gradient-to-br
          from-slate-50
          via-white
          to-indigo-50/30
          p-5
          dark:border-slate-800
          dark:from-slate-900
          dark:via-slate-950
          dark:to-indigo-950/20
        "
      >
        {/* ORDER INFO */}

        <div className="flex items-center gap-3">
          <motion.div
            initial={{
              scale: 0,
              rotate: -20,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              delay: 0.15,
              type: "spring",
              stiffness: 220,
              damping: 14,
            }}
            className="
              relative
              flex h-12 w-12
              shrink-0
              items-center justify-center
              overflow-hidden
              rounded-2xl
              bg-gradient-to-br
              from-indigo-500
              to-violet-600
              text-white
              shadow-lg
              shadow-indigo-500/20
            "
          >
            <Package className="h-5 w-5" />
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                {orderId}
              </span>

              <button
                type="button"
                onClick={handleCopyId}
                className="
                  rounded-lg
                  p-1.5
                  text-slate-400
                  transition-colors
                  hover:bg-slate-200
                  hover:text-indigo-600
                  dark:hover:bg-slate-800
                "
              >
                <AnimatePresence
                  mode="wait"
                >
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      exit={{
                        scale: 0,
                      }}
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            <p
              className="
                mt-1 flex items-center
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              <Clock className="mr-1.5 h-3 w-3" />

              {orderDate}
            </p>
          </div>
        </div>

        {/* STATUS */}

        <div className="flex items-center gap-2">
          <AnimatePresence
            mode="wait"
          >
            <motion.div
              key={currentStatus}
              initial={{
                opacity: 0,
                scale: 0.75,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.75,
              }}
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-3
                py-1.5
                text-xs
                font-semibold
                shadow-sm
                ${currentStatusStyle.bg}
                ${currentStatusStyle.text}
                ${currentStatusStyle.border}
              `}
            >
              {currentStatusStyle.icon}

              {currentStatus}
            </motion.div>
          </AnimatePresence>

          <div className="relative">
            <select
              value={currentStatus}
              onChange={
                handleStatusSelect
              }
              disabled={isUpdating}
              className="
                appearance-none
                cursor-pointer
                rounded-xl
                border
                border-slate-200
                bg-white
                py-2
                pl-3
                pr-8
                text-xs
                font-semibold
                text-slate-700
                outline-none
                focus:ring-2
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
              "
            >
              <option value="pending">
                Set Pending
              </option>

              <option value="out of delivery">
                Set Out of Delivery
              </option>

              <option value="delivered">
                Set Delivered
              </option>
            </select>

            <ChevronDown
              className="
                pointer-events-none
                absolute
                right-2.5
                top-1/2
                h-3.5
                w-3.5
                -translate-y-1/2
                text-slate-400
              "
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          ASSIGNED DELIVERY BOY
      ====================================================== */}

      <AnimatePresence>
        {isAssigned && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -10,
            }}
            transition={{
              duration: 0.4,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="overflow-hidden"
          >
            <div
              className="
                mx-5 mt-5
                overflow-hidden
                rounded-2xl
                border
                border-emerald-200
                bg-gradient-to-br
                from-emerald-50
                via-white
                to-green-50
                dark:border-emerald-900/50
                dark:from-emerald-950/40
                dark:via-slate-950
                dark:to-green-950/20
              "
            >
              {/* ASSIGNMENT HEADER */}

              <div
                className="
                  flex items-center
                  justify-between
                  border-b
                  border-emerald-100
                  px-4 py-3
                  dark:border-emerald-900/40
                "
              >
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
                      repeat: Infinity,
                    }}
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl
                      bg-emerald-500
                      text-white
                      shadow-lg
                      shadow-emerald-500/20
                    "
                  >
                    <Truck className="h-4 w-4" />
                  </motion.div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Assigned Delivery Boy
                    </p>

                    <p className="text-[11px] text-emerald-600/70 dark:text-emerald-500">
                      Order accepted successfully
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex items-center gap-1.5
                    rounded-full
                    bg-emerald-500/10
                    px-2.5 py-1
                    text-[10px]
                    font-bold
                    text-emerald-600
                    dark:text-emerald-400
                  "
                >
                  <UserCheck className="h-3 w-3" />

                  ASSIGNED
                </div>
              </div>

              {/* DELIVERY BOY INFO */}

              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* AVATAR */}

                  <div className="relative">
                    <div
                      className="
                        flex h-14 w-14
                        items-center justify-center
                        overflow-hidden
                        rounded-2xl
                        bg-gradient-to-br
                        from-emerald-500
                        to-green-600
                        text-white
                        shadow-lg
                        shadow-emerald-500/20
                      "
                    >
                      {deliveryBoy?.image ? (
                        <img
                          src={
                            deliveryBoy.image
                          }
                          alt={
                            deliveryBoy.name ||
                            "Delivery Boy"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Bike className="h-6 w-6" />
                      )}
                    </div>

                    <span
                      className="
                        absolute
                        -bottom-1
                        -right-1
                        h-4 w-4
                        rounded-full
                        border-2
                        border-white
                        bg-emerald-500
                        dark:border-slate-950
                      "
                    />
                  </div>

                  {/* NAME */}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {deliveryBoy?.name ||
                        "Delivery Boy Assigned"}
                    </h3>

                    {deliveryBoy?.email && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Mail className="h-3 w-3" />

                        <span className="truncate">
                          {
                            deliveryBoy.email
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CALL */}

                  {deliveryBoy?.mobile && (
                    <a
                      href={`tel:${deliveryBoy.mobile}`}
                      className="
                        flex h-10 w-10
                        shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-emerald-500
                        text-white
                        shadow-md
                        shadow-emerald-500/20
                        transition
                        hover:bg-emerald-600
                      "
                      title="Call delivery boy"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* DETAILS */}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {deliveryBoy?.mobile && (
                    <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/60">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Mobile
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <Phone className="h-3 w-3 text-emerald-500" />

                        {
                          deliveryBoy.mobile
                        }
                      </p>
                    </div>
                  )}

                  {formattedAssignedAt && (
                    <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/60">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Accepted
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <Clock className="h-3 w-3 text-emerald-500" />

                        {formattedAssignedAt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          MAIN INFO
      ====================================================== */}

      <div className="relative grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {/* CUSTOMER */}

        <motion.div
          whileHover={{
            y: -2,
          }}
          className="
            rounded-2xl
            border
            border-slate-100
            bg-slate-50/70
            p-4
            dark:border-slate-800
            dark:bg-slate-900/60
          "
        >
          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-slate-400
            "
          >
            Customer
          </span>

          <div className="mt-2 flex items-center font-semibold text-slate-800 dark:text-slate-200">
            <div
              className="
                mr-2.5
                flex h-8 w-8
                items-center justify-center
                rounded-xl
                bg-white
                text-indigo-500
                shadow-sm
                dark:bg-slate-800
              "
            >
              <User className="h-4 w-4" />
            </div>

            <span>
              {customerName}
            </span>
          </div>

          <p className="mt-1.5 pl-10 text-xs text-slate-500 dark:text-slate-400">
            {customerEmail}
          </p>
        </motion.div>

        {/* ADDRESS */}

        <motion.div
          whileHover={{
            y: -2,
          }}
          className="
            rounded-2xl
            border
            border-slate-100
            bg-slate-50/70
            p-4
            dark:border-slate-800
            dark:bg-slate-900/60
          "
        >
          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-slate-400
            "
          >
            Shipping To
          </span>

          <div className="mt-2 flex items-start">
            <div
              className="
                mr-2.5
                flex h-8 w-8
                shrink-0
                items-center justify-center
                rounded-xl
                bg-white
                text-indigo-500
                shadow-sm
                dark:bg-slate-800
              "
            >
              <MapPin className="h-4 w-4" />
            </div>

            <span className="pt-1 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              {formattedAddress}
            </span>
          </div>
        </motion.div>
      </div>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      <div
        className="
          flex items-center
          justify-between
          border-b
          border-slate-100
          px-5 pb-5
          dark:border-slate-800
        "
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Products
          </span>

          <div className="flex -space-x-2">
            {items
              .slice(0, 3)
              .map(
                (
                  item,
                  idx
                ) => (
                  <motion.div
                    key={
                      item.id ||
                      idx
                    }
                    whileHover={{
                      scale: 1.15,
                      y: -4,
                      zIndex: 50,
                    }}
                    className="
                      relative
                      h-10 w-10
                      overflow-hidden
                      rounded-xl
                      border-2
                      border-white
                      bg-slate-100
                      shadow-md
                      dark:border-slate-950
                    "
                  >
                    {item.image ? (
                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.name
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </motion.div>
                )
              )}

            {items.length >
              3 && (
              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  border-2
                  border-white
                  bg-gradient-to-br
                  from-indigo-500
                  to-violet-600
                  text-xs
                  font-bold
                  text-white
                  shadow-md
                  dark:border-slate-950
                "
              >
                +
                {items.length -
                  3}
              </div>
            )}
          </div>
        </div>

        <span
          className="
            rounded-full
            bg-slate-100
            px-3 py-1.5
            text-[11px]
            font-semibold
            text-slate-500
            dark:bg-slate-900
            dark:text-slate-400
          "
        >
          {totalItemCount}{" "}
          {totalItemCount ===
          1
            ? "Item"
            : "Items"}
        </span>
      </div>

      {/* =====================================================
          EXPAND
      ====================================================== */}

      <motion.button
        whileTap={{
          scale: 0.985,
        }}
        onClick={() =>
          setIsExpanded(
            !isExpanded
          )
        }
        className="
          flex w-full
          items-center
          justify-between
          border-b
          border-slate-100
          bg-slate-50/40
          px-5 py-4
          text-xs
          font-semibold
          text-slate-600
          hover:bg-indigo-50/60
          hover:text-indigo-600
          dark:border-slate-800
          dark:bg-slate-950/40
          dark:text-slate-300
        "
        type="button"
      >
        <span>
          {isExpanded
            ? "Hide Details"
            : "View Detailed Item List"}
        </span>

        <motion.div
          animate={{
            rotate: isExpanded
              ? 180
              : 0,
          }}
        >
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.div>
      </motion.button>

      {/* =====================================================
          EXPANDED ITEMS
      ====================================================== */}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="overflow-hidden"
          >
            <div
              className="
                space-y-3
                bg-gradient-to-b
                from-slate-50/80
                to-white
                px-5 py-4
                dark:from-slate-900/80
                dark:to-slate-950
              "
            >
              {items.map(
                (
                  item,
                  idx
                ) => (
                  <motion.div
                    key={
                      item.id ||
                      idx
                    }
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    className="
                      flex items-center
                      justify-between
                      gap-3
                      rounded-2xl
                      border
                      border-slate-200/70
                      bg-white/90
                      p-3
                      shadow-sm
                      dark:border-slate-800
                      dark:bg-slate-900/70
                    "
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="
                          flex h-12 w-12
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          dark:border-slate-700
                          dark:bg-slate-800
                        "
                      >
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {
                            item.name
                          }
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          ₹
                          {Number(
                            item.price ||
                              0
                          ).toFixed(
                            2
                          )}{" "}
                          ×{" "}
                          {
                            item.quantity
                          }
                        </p>
                      </div>
                    </div>

                    <span
                      className="
                        shrink-0
                        rounded-lg
                        bg-indigo-50
                        px-2.5 py-1.5
                        text-xs
                        font-bold
                        text-indigo-600
                        dark:bg-indigo-950/50
                        dark:text-indigo-400
                      "
                    >
                      ₹
                      {(
                        Number(
                          item.price ||
                            0
                        ) *
                        Number(
                          item.quantity ||
                            0
                        )
                      ).toFixed(
                        2
                      )}
                    </span>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div
        className="
          flex items-center
          justify-between
          gap-4
          border-t
          border-slate-100
          bg-gradient-to-r
          from-slate-50
          to-indigo-50/40
          p-5
          dark:border-slate-800
          dark:from-slate-900
          dark:to-indigo-950/20
        "
      >
        <div
          className="
            flex min-w-0
            items-center
            text-xs
            text-slate-500
            dark:text-slate-400
          "
        >
          <div
            className="
              mr-2.5
              flex h-8 w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white
              text-slate-400
              shadow-sm
              dark:bg-slate-800
            "
          >
            <CreditCard className="h-3.5 w-3.5" />
          </div>

          <span className="truncate">
            {paymentMethod}
          </span>
        </div>

        <div className="shrink-0 text-right">
          <span className="mr-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Total
          </span>

          <span
            className="
              bg-gradient-to-r
              from-indigo-600
              to-violet-600
              bg-clip-text
              text-lg
              font-extrabold
              text-transparent
            "
          >
            ₹
            {Number(
              totalAmount || 0
            ).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}