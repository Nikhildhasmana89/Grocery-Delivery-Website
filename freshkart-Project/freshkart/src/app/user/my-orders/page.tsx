"use client"

import { IOrder } from '@/models/order.model'
import UserOrderCard from '@/components/UserOrderCard' // Update path if needed
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Search, Sparkles, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation' // Use 'next/router' if using Pages router

const FILTERS = ['All Orders', 'Delivered', 'Out For Delivery', 'Processing', 'Cancelled']

function MyOrder() {
  const router = useRouter()
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<string>('All Orders')

  const getMyOrders = React.useCallback(async () => {
    try {
      setLoading(true)
      const result = await axios.get('/api/user/my-orders')
      setOrders(result.data.orders || [])
    } catch (error) {
      console.error('Error fetching my orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getMyOrders()
  }, [getMyOrders])

  // Handler for Buy Again button -> redirects to Home Page
  const handleBuyAgain = (order: IOrder) => {
    // You can optionally add items to cart state/localStorage here before redirecting
    router.push('/')
  }

  // Search & Filter Logic
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === 'All Orders' || order?.status === activeFilter

    const orderIdStr = String(order?._id || (order as any)?.id || '')
    const matchesSearch =
      orderIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.items?.some((item: any) =>
        (item?.name || item?.product?.name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )

    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Background Decor Elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <main className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Header with Back Button */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6"
        >
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  My Orders
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Track all your grocery orders in one place.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>FreshKart Instant Guarantee</span>
          </div>
        </motion.header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/60 dark:text-emerald-400/60" />
            <input
              type="text"
              placeholder="Search by order ID, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm backdrop-blur-xl transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterBg"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-md shadow-emerald-500/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{filter}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <motion.div layout className="space-y-4">
            {filteredOrders.map((order) => (
              <UserOrderCard
                key={order._id || (order as any).id}
                order={order}
                onBuyAgain={() => handleBuyAgain(order)}
                onOrderUpdated={getMyOrders}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No orders found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              We couldn't find any orders matching your selected criteria.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default MyOrder