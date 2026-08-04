"use client"

import { IOrder } from '@/app/models/order.model'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PackageCheck,
  Truck,
  Clock,
  XCircle,
  ChevronDown,
  RotateCcw,
  ExternalLink,
  MapPin,
  CreditCard,
} from 'lucide-react'

// Container & item animation variants for staggered children
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.8, 0.25, 1],
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

function UserOrderCard({ order }: { order: IOrder }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Status configuration mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return {
          label: 'Delivered',
          bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: PackageCheck,
          dot: 'bg-emerald-500',
        }
      case 'Out For Delivery':
        return {
          label: 'Out For Delivery',
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: Truck,
          dot: 'bg-amber-500 animate-pulse',
        }
      case 'Cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: XCircle,
          dot: 'bg-rose-500',
        }
      default:
        return {
          label: 'Processing',
          bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: Clock,
          dot: 'bg-blue-500 animate-ping',
        }
    }
  }

  const statusConfig = getStatusBadge(order?.status || 'Processing')
  const StatusIcon = statusConfig.icon
  const totalItemsCount = order?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0
  const firstItem = order?.items?.[0]

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 backdrop-blur-xl overflow-hidden transition-shadow"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-100">
              Order ID: #{String(order?._id || order?.id || '').slice(-6).toUpperCase()}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
            </span>
          </div>

          {/* Animated Status Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </motion.div>
        </div>

        {/* Card Body */}
        <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Item Preview Image */}
          <div className="relative flex-shrink-0">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={firstItem?.image || firstItem?.product?.image || '/placeholder-grocery.png'}
              alt={firstItem?.name || firstItem?.product?.name || 'Grocery Item'}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
            />
            {totalItemsCount > 1 && (
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                x{totalItemsCount} items
              </span>
            )}
          </div>

          {/* Item Details */}
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base line-clamp-1">
              {firstItem?.name || firstItem?.product?.name || 'Grocery Package'}
              {order?.items?.length > 1 && (
                <span className="text-slate-400 font-normal text-xs ml-1.5">
                  +{order.items.length - 1} more items
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {firstItem?.brand || 'FreshKart Direct'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{order?.totalAmount || order?.pricing?.total || 0}
              </span>
              <span className="text-xs text-slate-400">
                • {order?.paymentMethod || 'Online Payment'}
              </span>
            </div>
          </div>

          {/* Action Buttons with Tap Animations */}
          <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/50 dark:border-emerald-800/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Track Order
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Buy Again
            </motion.button>
          </div>
        </div>

        {/* Expand Trigger */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Details & Summary'}</span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Expandable Order Details Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 space-y-4"
          >
            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Delivery Address
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
  {order?.address
    ? `${order.address.fullAddress}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
    : "Address on file"}
</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Payment & Status
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  Method: {order?.paymentMethod || 'Online'}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Status: {order?.paymentStatus || 'Paid'}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Order Items</h4>
              <div className="divide-y divide-slate-200/60 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 p-2">
                {order?.items?.map((item: any, idx: number) => (
                  <motion.div
                    key={item?._id || idx}
                    variants={itemVariants}
                    className="py-2 px-2 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item?.image || item?.product?.image || '/placeholder-grocery.png'}
                        alt={item?.name || item?.product?.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {item?.name || item?.product?.name || 'Item'}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Qty: {item?.quantity || 1} x ₹{item?.price || item?.unitPrice || 0}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ₹{(item?.quantity || 1) * (item?.price || item?.unitPrice || 0)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default UserOrderCard