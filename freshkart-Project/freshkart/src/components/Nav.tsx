'use client';

import Link from "next/link";
import { 
  Search, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  ChevronDown, 
  X, 
  ShoppingBag, 
  ShoppingCart,
  PlusCircle, 
  LayoutGrid, 
  ClipboardList,
  Sun,
  Moon
} from "lucide-react";
import { useUserTheme } from "@/context/ThemeContext";
import { signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import mongoose from "mongoose";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export interface UserInterface {
  _id?: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  roleSelected?: boolean;
  image?: string;
}

export default function Nav({ user: initialUser }: { user?: UserInterface }) {
  const [open, setOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false); 
  const profileDropDown = useRef<HTMLDivElement>(null);
  
  // Get cart items count safely from Redux
  const { cartData } = useSelector((state: RootState) => state.cart);
  const cartCount = cartData?.length || 0;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || searchParams.get("search") || ""
  );

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("search") || "";
    setSearchQuery(q);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    const params = new URLSearchParams(window.location.search);
    if (val.trim()) {
      params.set("q", val);
    } else {
      params.delete("q");
      params.delete("search");
    }
    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.pushState({}, "", newUrl);
    window.dispatchEvent(new Event("popstate"));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(window.location.search);
    params.delete("q");
    params.delete("search");
    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.pushState({}, "", newUrl);
    window.dispatchEvent(new Event("popstate"));
  };

  const { theme, toggleTheme } = useUserTheme();
  const isLight = theme === "light";

  const { data: session } = useSession();
  const user = (session?.user as UserInterface) || initialUser;
  const isUser = !user || user.role === "user";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropDown.current && !profileDropDown.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    setIsSigningOut(true);
    await signOut({ 
      callbackUrl: "/register",
      redirect: true 
    });
  };

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
    <header className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors duration-300 font-sans ${
      isLight
        ? "bg-white/95 border-slate-200 shadow-sm text-slate-900"
        : "bg-slate-950/90 border-slate-800/80 text-slate-100"
    }`}>
      {/* Top Main Navigation Row */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 px-4 md:px-8 py-2.5 relative">
        
        {/* Logo Link */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group cursor-pointer shrink-0"
        >
          <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 text-sm font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            🛒
          </div>
          <span className={`text-lg font-black tracking-tight transition-colors ${
            isLight ? "text-slate-900 group-hover:text-emerald-600" : "text-white group-hover:text-emerald-400"
          }`}>
            Fresh<span className="text-emerald-500">Kart</span>
          </span>
        </Link>

        {/* SEARCH BAR — STANDARD USERS */}
        {isUser && (
          <form onSubmit={(e) => e.preventDefault()} className="hidden md:flex flex-1 max-w-lg relative mx-2 sm:mx-4">
            <div className="relative w-full flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search fresh groceries, fruits, snacks..."
                className={`w-full text-xs rounded-xl pl-9 pr-9 py-2 outline-none transition-all placeholder:text-slate-400 ${
                  isLight
                    ? "bg-slate-100 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white"
                    : "bg-slate-900/90 border border-slate-800 text-white focus:border-emerald-500/60 focus:bg-slate-900"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* ADMIN NAVIGATION */}
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              Manage Orders
            </Link>
          </nav>
        )}

        {/* Right Action Icons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Light / Dark Mode Toggle Button */}
          {isUser && (
            <button
              type="button"
              onClick={toggleTheme}
              title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200"
                  : "bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/30"
              }`}
              aria-label="Toggle theme"
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          )}

          {/* Mobile Search Toggle Button */}
          {isUser && (
            <button
              type="button"
              onClick={() => setShowMobileSearch(true)}
              className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:text-emerald-600"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400"
              }`}
              aria-label="Open Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* 🛒 PROMINENT CART BUTTON */}
          {isUser && (
            <Link
              href="/user/cart"
              className={`relative p-2 md:px-3 md:py-2 rounded-xl border flex items-center gap-2 transition-all group ${
                isLight
                  ? "bg-slate-100 border-slate-200 text-slate-800 hover:border-emerald-500/50 hover:text-emerald-600"
                  : "bg-slate-900 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-400"
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2.5 -right-2.5 bg-emerald-500 text-slate-950 text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-slate-950 shadow-md shadow-emerald-500/30"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-bold transition-colors">
                Cart
              </span>
            </Link>
          )}

          {/* User Account State */}
          {user ? (
            <div className="relative" ref={profileDropDown}>
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`flex items-center gap-2 p-1.5 md:px-2.5 md:py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? "bg-slate-100 border-slate-200 hover:border-emerald-500/50 text-slate-800"
                    : "bg-slate-900 border-slate-800 hover:border-emerald-500/50 text-slate-200"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : user.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span
                    title={roleBadge.title}
                    className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${roleBadge.bg} ${roleBadge.text} text-[9px] font-black flex items-center justify-center border-2 border-slate-950 shadow-md ring-1 ring-slate-800`}
                  >
                    {roleBadge.label}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold line-clamp-1">{user.name}</p>
                  <p className="text-[10px] text-emerald-500 font-medium capitalize">{user.role}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-xl p-2 z-50 flex flex-col gap-1 ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-800 shadow-slate-200/80"
                        : "bg-slate-900 border-slate-800 text-slate-300 shadow-slate-950/50"
                    }`}
                  >
                    {isUser && (
                      <Link
                        href="/user/my-orders"
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                          isLight ? "hover:bg-slate-100 text-slate-800" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        My Orders
                      </Link>
                    )}
                    {isAdmin && (
                      <div className="md:hidden border-b border-slate-800 pb-1 mb-1">
                        <Link
                          href="/admin/add-grocery"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-500" />
                          Add Grocery
                        </Link>
                        <Link
                          href="/admin/view-grocery"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <LayoutGrid className="w-4 h-4 text-emerald-500" />
                          View Grocery
                        </Link>
                        <Link
                          href="/admin/manage-orders"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4 text-emerald-500" />
                          Manage Orders
                        </Link>
                      </div>
                    )}
                    <Link
                      href="/edit-profile"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                        isLight ? "hover:bg-slate-100 text-slate-800" : "hover:bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <Settings className="w-4 h-4 text-emerald-500" />
                      Edit Profile / Role
                    </Link>

                    <button
                      type="button"
                      disabled={isSigningOut}
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors w-full text-left cursor-pointer disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {isSigningOut ? "Signing out..." : "Sign Out"}
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

        {/* Mobile Search Overlay Input */}
        {isUser && (
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className={`absolute inset-0 flex items-center gap-2 z-50 md:hidden px-4 ${
                  isLight ? "bg-white" : "bg-slate-950"
                }`}
              >
                <form onSubmit={(e) => e.preventDefault()} className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search fresh groceries..."
                    className={`w-full text-xs rounded-xl pl-10 pr-9 py-2.5 outline-none ${
                      isLight
                        ? "bg-slate-100 border border-slate-200 text-slate-900"
                        : "bg-slate-900 border border-slate-800 text-white"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
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