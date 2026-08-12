"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";

// --- Types ---
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

export interface AdminOrderCardProps {
  orderId?: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: string | { fullAddress?: string };
  orderDate?: string;
  status?: OrderStatus;
  paymentMethod?: string;
  items?: OrderItem[];
  totalAmount?: number;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

// --- Default Mock Data ---
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

// --- Status badge styling map ---
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
    icon: <Clock className="w-3.5 h-3.5" />,
  },

  "out of delivery": {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
    icon: <Truck className="w-3.5 h-3.5" />,
  },

  delivered: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

export default function AdminOrderCard({
  orderId = "ORD-8942-XJ",
  customerName = "Sarah Jenkins",
  customerEmail = "sarah.j@example.com",
  shippingAddress = "742 Evergreen Terrace, Springfield, OR 97477",
  orderDate = "Oct 24, 2026 • 14:32",
  status = "pending",
  paymentMethod = "Credit Card (•••• 4242)",
  items = defaultItems,
  totalAmount = 229.97,
  onStatusChange,
}: AdminOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] =
    useState<OrderStatus>(status);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state if external status prop changes
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  // --------------------------------------------------
  // Update order status
  // --------------------------------------------------
  const updateStatus = async (
    id: string,
    newStatus: OrderStatus
  ) => {
    try {
      setIsUpdating(true);

      console.log("📦 Updating order:");
      console.log("Order ID:", id);
      console.log("New Status:", newStatus);

      const response = await axios.post(
        `/api/admin/update-order-status/${id}`,
        {
          status: newStatus,
        }
      );

      console.log("✅ API RESPONSE:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ UPDATE ORDER ERROR:", error);

      console.error(
        "❌ SERVER RESPONSE:",
        error.response?.data
      );

      console.error(
        "❌ STATUS:",
        error.response?.status
      );

      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // --------------------------------------------------
  // Copy order ID
  // --------------------------------------------------
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy order ID:", error);
    }
  };

  // --------------------------------------------------
  // Status dropdown
  // --------------------------------------------------
  const handleStatusSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as OrderStatus;

    if (newStatus === currentStatus) return;

    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);

    try {
      await updateStatus(orderId, newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      setCurrentStatus(previousStatus);
      alert(
        "Failed to update order status. Please try again."
      );
    }
  };

  const currentStatusStyle =
    statusStyles[currentStatus] ?? statusStyles.pending;

  const totalItemCount = items.reduce(
    (acc, item) => acc + (item.quantity || 0),
    0
  );

  const formattedAddress =
    typeof shippingAddress === "string"
      ? shippingAddress
      : shippingAddress?.fullAddress ??
        "No address provided";

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
        ease: [0.22, 1, 0.36, 1],
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
      {/* Ambient animated glow */}
      <motion.div
        className="
          pointer-events-none
          absolute -right-24 -top-24
          h-56 w-56
          rounded-full
          bg-indigo-500/10
          blur-3xl
          dark:bg-indigo-500/10
        "
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Top gradient line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.15,
          ease: "easeOut",
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

      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

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
        <div className="flex items-center gap-3">
          {/* Package Icon */}
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
            whileHover={{
              scale: 1.08,
              rotate: 3,
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

            <motion.div
              className="
                absolute inset-0
                bg-white/20
              "
              initial={{
                x: "-100%",
              }}
              animate={{
                x: "100%",
              }}
              transition={{
                duration: 1.2,
                delay: 0.6,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Order Information */}
          <div>
            <div className="flex items-center gap-2">
              <motion.span
                initial={{
                  opacity: 0,
                  x: -8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.25,
                }}
                className="
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                {orderId}
              </motion.span>

              {/* Copy */}
              <motion.button
                whileHover={{
                  scale: 1.15,
                }}
                whileTap={{
                  scale: 0.85,
                }}
                onClick={handleCopyId}
                className="
                  rounded-lg
                  p-1.5
                  text-slate-400
                  transition-colors
                  hover:bg-slate-200
                  hover:text-indigo-600
                  dark:hover:bg-slate-800
                  dark:hover:text-indigo-400
                "
                title="Copy Order ID"
                type="button"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{
                        scale: 0,
                        rotate: -90,
                      }}
                      animate={{
                        scale: 1,
                        rotate: 0,
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
              </motion.button>
            </div>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.35,
              }}
              className="
                mt-1
                flex items-center
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              <Clock className="mr-1.5 h-3 w-3" />
              {orderDate}
            </motion.p>
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex items-center gap-2">
          {/* Animated Status Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStatus}
              initial={{
                opacity: 0,
                scale: 0.75,
                y: -5,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.75,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
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
                ${currentStatusStyle.glow}
              `}
            >
              <motion.span
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {currentStatusStyle.icon}
              </motion.span>

              {currentStatus}
            </motion.div>
          </AnimatePresence>

          {/* Select */}
          <motion.div
            whileHover={{
              scale: 1.02,
            }}
            className="relative"
          >
            <select
              value={currentStatus}
              onChange={handleStatusSelect}
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
                transition-all
                hover:border-indigo-300
                hover:bg-indigo-50
                focus:border-indigo-400
                focus:ring-2
                focus:ring-indigo-500/20
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:border-indigo-700
                dark:hover:bg-indigo-950/40
                dark:focus:border-indigo-500
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
          </motion.div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* MAIN INFO */}
      {/* -------------------------------------------------- */}

      <div className="relative grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {/* Customer */}
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
          whileHover={{
            y: -2,
          }}
          className="
            rounded-2xl
            border
            border-slate-100
            bg-slate-50/70
            p-4
            transition-all
            hover:border-indigo-100
            hover:bg-indigo-50/40
            dark:border-slate-800
            dark:bg-slate-900/60
            dark:hover:border-indigo-900
            dark:hover:bg-indigo-950/20
          "
        >
          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-slate-400
              dark:text-slate-500
            "
          >
            Customer
          </span>

          <div
            className="
              mt-2
              flex items-center
              font-semibold
              text-slate-800
              dark:text-slate-200
            "
          >
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

            <span>{customerName}</span>
          </div>

          <p
            className="
              mt-1.5
              pl-10
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            {customerEmail}
          </p>
        </motion.div>

        {/* Shipping */}
        <motion.div
          initial={{
            opacity: 0,
            x: 15,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          whileHover={{
            y: -2,
          }}
          className="
            rounded-2xl
            border
            border-slate-100
            bg-slate-50/70
            p-4
            transition-all
            hover:border-indigo-100
            hover:bg-indigo-50/40
            dark:border-slate-800
            dark:bg-slate-900/60
            dark:hover:border-indigo-900
            dark:hover:bg-indigo-950/20
          "
        >
          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-slate-400
              dark:text-slate-500
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

            <span
              className="
                pt-1
                text-xs
                font-medium
                leading-relaxed
                text-slate-600
                dark:text-slate-300
              "
            >
              {formattedAddress}
            </span>
          </div>
        </motion.div>
      </div>

      {/* -------------------------------------------------- */}
      {/* PRODUCTS PREVIEW */}
      {/* -------------------------------------------------- */}

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
          <span
            className="
              text-xs
              font-semibold
              text-slate-500
              dark:text-slate-400
            "
          >
            Products
          </span>

          <div className="flex items-center -space-x-2">
            {items.slice(0, 3).map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{
                  opacity: 0,
                  scale: 0.6,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.35 + idx * 0.08,
                  type: "spring",
                  stiffness: 250,
                  damping: 18,
                }}
                whileHover={{
                  scale: 1.18,
                  y: -5,
                  zIndex: 50,
                }}
                className="
                  relative
                  z-10
                  h-10 w-10
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border-2
                  border-white
                  bg-slate-100
                  shadow-md
                  dark:border-slate-950
                  dark:bg-slate-800
                "
                title={`${item.name} ($${(
                  Number(item.price || 0) *
                  Number(item.quantity || 0)
                ).toFixed(2)})`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      h-full w-full
                      object-cover
                      transition-transform
                      duration-300
                      hover:scale-110
                    "
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <Package className="h-3.5 w-3.5" />
                  </div>
                )}
              </motion.div>
            ))}

            {items.length > 3 && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.6,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: 0.6,
                  type: "spring",
                }}
                className="
                  relative
                  z-20
                  flex h-10 w-10
                  shrink-0
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
                +{items.length - 3}
              </motion.div>
            )}
          </div>
        </div>

        <motion.span
          initial={{
            opacity: 0,
            x: 10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.4,
          }}
          className="
            rounded-full
            bg-slate-100
            px-3
            py-1.5
            text-[11px]
            font-semibold
            text-slate-500
            dark:bg-slate-900
            dark:text-slate-400
          "
        >
          {totalItemCount}{" "}
          {totalItemCount === 1 ? "Item" : "Items"} Total
        </motion.span>
      </div>

      {/* -------------------------------------------------- */}
      {/* EXPAND BUTTON */}
      {/* -------------------------------------------------- */}

      <motion.button
        whileTap={{
          scale: 0.985,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          group/expand
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
          transition-all
          duration-300
          hover:bg-indigo-50/60
          hover:text-indigo-600
          dark:border-slate-800
          dark:bg-slate-950/40
          dark:text-slate-300
          dark:hover:bg-indigo-950/30
          dark:hover:text-indigo-400
        "
        type="button"
      >
        <span className="flex items-center gap-2">
          <motion.span
            animate={{
              scale: isExpanded ? 1.03 : 1,
            }}
          >
            {isExpanded
              ? "Hide Details"
              : "View Detailed Item List"}
          </motion.span>

          <AnimatePresence mode="wait">
            {!isExpanded && (
              <motion.span
                initial={{
                  opacity: 0,
                  x: -5,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -5,
                }}
                className="
                  rounded-full
                  bg-indigo-100
                  px-2
                  py-0.5
                  text-[9px]
                  text-indigo-600
                  dark:bg-indigo-950
                  dark:text-indigo-400
                "
              >
                {items.length}
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        <motion.div
          animate={{
            rotate: isExpanded ? 180 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="
            rounded-lg
            p-1
            transition-colors
            group-hover/expand:bg-indigo-100
            dark:group-hover/expand:bg-indigo-950
          "
        >
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.div>
      </motion.button>

      {/* -------------------------------------------------- */}
      {/* EXPANDED ITEMS */}
      {/* -------------------------------------------------- */}

      <AnimatePresence mode="popLayout">
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
            transition={{
              height: {
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                duration: 0.2,
              },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
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
              {items.map((item, idx) => (
                <motion.div
                  key={item.id || idx}
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: -15,
                    },
                    visible: {
                      opacity: 1,
                      x: 0,
                    },
                  }}
                  whileHover={{
                    x: 4,
                    scale: 1.01,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-2xl
                    border
                    border-slate-200/70
                    bg-white/90
                    p-3
                    shadow-sm
                    transition-shadow
                    hover:shadow-md
                    dark:border-slate-800
                    dark:bg-slate-900/70
                  "
                >
                  {/* Item Info */}
                  <div className="flex min-w-0 items-center gap-3">
                    <motion.div
                      whileHover={{
                        scale: 1.08,
                      }}
                      className="
                        flex
                        h-12 w-12
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
                          src={item.image}
                          alt={item.name}
                          className="
                            h-full w-full
                            object-cover
                            transition-transform
                            duration-300
                            hover:scale-110
                          "
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </motion.div>

                    <div className="min-w-0">
                      <p
                        className="
                          line-clamp-1
                          text-xs
                          font-semibold
                          text-slate-800
                          dark:text-slate-200
                        "
                      >
                        {item.name}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          text-slate-400
                        "
                      >
                        ${Number(item.price || 0).toFixed(2)}
                        {" × "}
                        {Number(item.quantity || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <motion.span
                    whileHover={{
                      scale: 1.05,
                    }}
                    className="
                      shrink-0
                      rounded-lg
                      bg-indigo-50
                      px-2.5
                      py-1.5
                      text-xs
                      font-bold
                      text-indigo-600
                      dark:bg-indigo-950/50
                      dark:text-indigo-400
                    "
                  >
                    $
                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 0)
                    ).toFixed(2)}
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------- */}
      {/* FOOTER */}
      {/* -------------------------------------------------- */}

      <div
        className="
          relative
          flex
          items-center
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
        {/* Payment */}
        <motion.div
          initial={{
            opacity: 0,
            x: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.45,
          }}
          className="
            flex
            min-w-0
            items-center
            text-xs
            text-slate-500
            dark:text-slate-400
          "
        >
          <div
            className="
              mr-2.5
              flex
              h-8 w-8
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
        </motion.div>

        {/* Total */}
        <motion.div
          key={totalAmount}
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="shrink-0 text-right"
        >
          <span
            className="
              mr-2
              text-[11px]
              font-medium
              text-slate-500
              dark:text-slate-400
            "
          >
            Total
          </span>

          <motion.span
            whileHover={{
              scale: 1.04,
            }}
            className="
              bg-gradient-to-r
              from-indigo-600
              to-violet-600
              bg-clip-text
              text-lg
              font-extrabold
              text-transparent
              dark:from-indigo-400
              dark:to-violet-400
            "
          >
            ${Number(totalAmount || 0).toFixed(2)}
          </motion.span>
        </motion.div>
      </div>

      {/* Bottom subtle shine */}
      <motion.div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-px
          w-full
          bg-gradient-to-r
          from-transparent
          via-indigo-500/30
          to-transparent
        "
        animate={{
          opacity: [0.2, 0.7, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}