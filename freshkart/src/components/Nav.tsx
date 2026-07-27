'use client';

import Link from "next/link";
import { Search, User as UserIcon, LogOut, Settings, ChevronDown, X, ShoppingBag, PlusCircle, LayoutGrid, ClipboardList } from "lucide-react";
import { signOut } from "next-auth/react";
import mongoose from "mongoose";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface UserInterface {
  _id?: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

export default function Nav({ user }: { user?: UserInterface }) {
  const [open, setOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const profileDropDown = useRef<HTMLDivElement>(null);

  // Role Checks: Default to standard user view if unauthenticated
  const isUser = !user || user.role === "user";
  const isAdmin = user?.role === "admin";
  const isDeliveryBoy = user?.role === "deliveryBoy";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropDown.current && !profileDropDown.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to map role to short letter badge and styling
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return { label: "A", bg: "bg-red-500", text: "text-white", title: "Admin" };
      case "deliveryBoy":
        return { label: "D", bg: "bg-amber-500", text: "text-slate-950", title: "Delivery Partner" };
      default:
        return { label: "U", bg: "bg-emerald-500", text: "text-slate-950", title: "User" };
    }
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-emerald-500/20 px-4 md:px-8 py-3 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">
        
        {/* Logo Link */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group cursor-pointer shrink-0"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 text-base font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            🛒
          </div>
          <span className="text-lg font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
            Fresh<span className="text-emerald-400">Kart</span>
          </span>
        </Link>

        {/* 1. SEARCH BAR — ONLY VISIBLE TO USERS */}
        {isUser && (
          <form className="hidden md:flex flex-1 max-w-md relative mx-4">
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full bg-slate-900/90 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </form>
        )}

        {/* 2. ADMIN NAVIGATION — ONLY VISIBLE TO ADMINS */}
        {isAdmin && (
          <nav className="hidden md:flex items-center gap-1 mx-4">
            <Link
              href="/admin/add-grocery"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Add Grocery
            </Link>
            <Link
              href="/admin/view-grocery"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              View Grocery
            </Link>
            <Link
              href="/admin/manage-orders"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            >
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              Manage Orders
            </Link>
          </nav>
        )}

        {/* Right Action Icons & User Menu */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          
          {/* Mobile Search Toggle Button — ONLY VISIBLE TO USERS */}
          {isUser && (
            <button
              type="button"
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              aria-label="Open Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* User Account State */}
          {user ? (
            <div className="relative" ref={profileDropDown}>
              {/* Profile Toggle Button */}
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-1.5 md:px-3 md:py-1.5 rounded-xl transition-all cursor-pointer"
              >
                {/* Avatar with Role Badge */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Top Right Role Indicator Badge */}
                  <span
                    title={roleBadge.title}
                    className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${roleBadge.bg} ${roleBadge.text} text-[9px] font-black flex items-center justify-center border-2 border-slate-950 shadow-md ring-1 ring-slate-800`}
                  >
                    {roleBadge.label}
                  </span>
                </div>

                {/* Visible on Desktop */}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 font-medium capitalize">{user.role}</p>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              {/* Animated Slide-Down Dropdown Menu */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-950/50 p-2 z-50 flex flex-col gap-1"
                  >
                    {/* MY ORDERS LINK — ONLY VISIBLE TO REGULAR USERS */}
                    {isUser && (
                      <Link
                        href="/my-orders"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        My Orders
                      </Link>
                    )}

                    {/* MOBILE ADMIN NAVIGATION LINKS (Shows inside dropdown on small screens) */}
                    {isAdmin && (
                      <div className="md:hidden border-b border-slate-800 pb-1 mb-1">
                        <Link
                          href="/admin/add-grocery"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-400" />
                          Add Grocery
                        </Link>
                        <Link
                          href="/admin/view-grocery"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <LayoutGrid className="w-4 h-4 text-emerald-400" />
                          View Grocery
                        </Link>
                        <Link
                          href="/admin/manage-orders"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4 text-emerald-400" />
                          Manage Orders
                        </Link>
                      </div>
                    )}

                    <Link
                      href="/edit-profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-emerald-400" />
                      Edit Profile
                    </Link>

                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity shrink-0"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Search Overlay Input — ONLY VISIBLE TO USERS */}
        {isUser && (
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-slate-950 flex items-center gap-2 z-50 md:hidden"
              >
                <form className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search items..."
                    className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 placeholder:text-slate-500"
                  />
                </form>
                <button
                  type="button"
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close Search"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </div>
    </header>
  );
}