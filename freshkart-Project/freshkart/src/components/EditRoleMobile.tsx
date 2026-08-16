'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  UserCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCog,
  User,
  Bike,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from "lucide-react";

const INITIAL_ROLES = [
  { 
    id: "user", 
    label: "User", 
    icon: User, 
    desc: "Browse products & place orders",
    badge: "Standard"
  },
  { 
    id: "deliveryBoy", 
    label: "Delivery Partner", 
    icon: Bike, 
    desc: "Pick up & deliver orders nearby",
    badge: "Active Orders" 
  },
  { 
    id: "admin", 
    label: "Administrator", 
    icon: UserCog, 
    desc: "Full management & analytics access",
    badge: "Restricted" 
  },
];

type PropType = {
  initialRole?: string;
  initialMobile?: string;
  userId?: string;
  previousStep?: (s: number) => void;
};

export default function EditRoleMobile({
  initialRole = "user",
  userId,
  previousStep,
}: PropType) {
  const router = useRouter();
  const { update } = useSession();

  // Roles state initialized with standard roles
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if admin exists on mount and filter options accordingly
  useEffect(() => {
    const checkForAdmin = async () => {
      try {
        const result = await axios.get("/api/check-for-admin");
        if (result.data?.adminExist) {
          setRoles((prev) => prev.filter((r) => r.id !== "admin"));
          // Fallback selected role if 'admin' was selected previously
          setSelectedRole((prev) => (prev === "admin" ? "user" : prev));
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkForAdmin();
  }, []);

  const handleBack = () => {
    if (previousStep) {
      previousStep(1);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      await axios.post("/api/user/edit-role-mobile", {
        userId,
        role: selectedRole,
      });

      // Update NextAuth session state synchronously
      if (update) {
        await update({ role: selectedRole, roleSelected: true });
      }

      setIsSuccess(true);

      // Perform redirect transition
      setTimeout(() => {
        if (previousStep) {
          previousStep(1);
        } else {
          window.location.href = "/";
        }
      }, 1000);

    } catch (err: unknown) {
      let apiError = "Role selection failed. Please try again.";
      if (axios.isAxiosError(err)) {
        apiError = err.response?.data?.message || err.message || apiError;
      } else if (err instanceof Error) {
        apiError = err.message;
      }
      setStatus({ type: "error", message: apiError });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05070C] p-4 text-white relative overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* Dynamic Animated Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.2, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 60, -60, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-emerald-400/10 rounded-full blur-[120px]"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Glass Navigation Bar */}
      <div className="fixed top-5 left-5 z-30">
        <motion.button
          type="button"
          onClick={handleBack}
          whileHover={{ x: -3, scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 px-4 py-2.5 text-slate-300 backdrop-blur-xl hover:bg-slate-800/80 hover:text-white transition-all shadow-xl cursor-pointer text-xs font-semibold tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back</span>
        </motion.button>
      </div>

      {/* Main Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-950/80 backdrop-blur-2xl border border-emerald-500/25 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(16,185,129,0.12)] [scrollbar-width:none] [-ms-overflow-style:none]"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            /* Success View */
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 flex flex-col items-center justify-center text-center space-y-5"
            >
              <div className="relative flex justify-center items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute w-28 h-28 rounded-full border-2 border-dashed border-emerald-500/30"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 15 }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="space-y-2"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" /> Role Saved
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Welcome Aboard!
                </h2>
                <p className="text-slate-400 text-xs max-w-xs mx-auto">
                  Setting up your dashboard experience...
                </p>
              </motion.div>

              {/* Dynamic Progress Meter */}
              <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-4 border border-slate-800">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400"
                />
              </div>
            </motion.div>
          ) : (
            /* Role Selection Form */
            <motion.div key="edit-form" className="space-y-6">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-13 h-13 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/25 p-3"
                >
                  <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
                </motion.div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Select Your Role
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Choose how you will be using the application to continue.
                </p>
              </div>

              {/* Feedback Alert */}
              <AnimatePresence mode="wait">
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl text-xs font-medium border ${
                      status.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{status.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Dynamic Role Selection Grid */}
                <div className="space-y-2.5">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;

                    return (
                      <motion.div
                        key={role.id}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedRole(role.id)}
                        className={`relative cursor-pointer rounded-2xl p-3.5 border transition-all duration-200 flex items-center gap-3.5 select-none ${
                          isSelected
                            ? "border-emerald-500/80 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                            : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-900/90 hover:text-slate-200"
                        }`}
                      >
                        {/* Active Selection Indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId="activeRoleIndicator"
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent rounded-2xl pointer-events-none border border-emerald-400/40"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}

                        {/* Role Icon Container */}
                        <div
                          className={`p-2.5 rounded-xl border transition-colors ${
                            isSelected
                              ? "bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/20"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Role Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-100 tracking-wide">
                              {role.label}
                            </p>
                            {role.badge && (
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${
                                  isSelected
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : "bg-slate-800/80 text-slate-400 border-slate-700"
                                }`}
                              >
                                {role.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {role.desc}
                          </p>
                        </div>

                        {/* Radio Check Circle */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-400"
                              : "border-slate-700 bg-slate-950"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-slate-950"
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Submit Action Button */}
                <motion.button
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  disabled={loading}
                  type="submit"
                  className={`w-full mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-xs flex items-center justify-center gap-2 ${
                    !loading
                      ? "cursor-pointer opacity-100 hover:shadow-emerald-500/30"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Saving Role...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Role & Continue</span>
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}