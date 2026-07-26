'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Phone,
  UserCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCog,
  User,
  Bike,
  ArrowLeft,
} from "lucide-react";

// Define roles outside component to prevent re-creation on re-renders
const ROLES = [
  { id: "admin", label: "Admin", icon: UserCog, desc: "Full access & management" },
  { id: "user", label: "User", icon: User, desc: "Standard app functionality" },
  { id: "deliveryBoy", label: "Delivery Boy", icon: Bike, desc: "Order pickup & delivery" },
];

type PropType = {
  initialRole?: string;
  initialMobile?: string;
  userId?: string;
  previousStep?: (s: number) => void;
};

export default function EditRoleMobile({
  initialRole = "user",
  initialMobile = "",
  userId,
  previousStep,
}: PropType) {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [mobile, setMobile] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Navigation Handler
  const handleBack = () => {
    if (previousStep) {
      previousStep(1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mobile.trim() && !/^\d{10,15}$/.test(mobile.trim())) {
      setStatus({ type: "error", message: "Please enter a valid mobile number (10-15 digits)." });
      return;
    }

    setStatus(null);
    setLoading(true);

    try {
      const response = await axios.post("/api/user/update-role-mobile", {
        userId,
        role: selectedRole,
        mobile,
      });

      console.log("Profile updated:", response.data);
      setIsSuccess(true);

      setTimeout(() => {
        if (previousStep) {
          previousStep(1);
        } else {
          // Redirect to Home page instead of /dashboard
          router.push("/");
        }
      }, 2500);
    } catch (err: any) {
      const apiError =
        err.response?.data?.message || err.message || "Failed to update profile. Please try again.";
      setStatus({ type: "error", message: apiError });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Boolean(mobile.trim());

  return (
    <div className="min-h-screen w-full bg-[#07090E] p-4 text-white relative overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Dynamic Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, -60, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px]"
        />

        <motion.div
          animate={{
            x: [0, -90, 70, 0],
            y: [0, 80, -80, 0],
            scale: [1, 0.85, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-[140px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[160px]"
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Back Button */}
      <motion.button
        type="button"
        onClick={handleBack}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-5 left-5 z-30 flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-700/60 px-4 py-2 text-slate-200 backdrop-blur-md hover:bg-slate-800 transition-colors shadow-lg cursor-pointer text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </motion.button>

      {/* Main Form Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(16,185,129,0.1)] scrollbar-none"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            /* Success Screen Animation */
            <motion.div
              key="success-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="relative h-24 w-full flex justify-center items-center overflow-visible">
                <motion.div
                  initial={{ y: 20, scale: 0.8, opacity: 0 }}
                  animate={{
                    y: [-10, -60, -90],
                    scale: [1, 1.2, 0.9],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    times: [0, 0.6, 1],
                  }}
                  className="absolute h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30"
                >
                  <UserCheck className="w-7 h-7 stroke-[2.5]" />
                </motion.div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 12,
                  }}
                  className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="space-y-1"
              >
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Updated Successfully!
                </h2>
                <p className="text-slate-400 text-xs">
                  Applying account configuration changes...
                </p>
              </motion.div>
            </motion.div>
          ) : (
            /* Main Form View */
            <motion.div key="edit-form" className="space-y-5">
              {/* Header */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-lg shadow-emerald-500/20"
                >
                  <UserCheck className="w-6 h-6 stroke-[2.5]" />
                </motion.div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Update Details
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Select your primary account role and contact phone number.
                </p>
              </div>

              {/* Status Alert Toast */}
              <AnimatePresence mode="wait">
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium border ${
                      status.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{status.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Card Selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Select Role
                  </label>
                  <div className="space-y-2">
                    {ROLES.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;

                      return (
                        <motion.div
                          key={role.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedRole(role.id)}
                          className={`relative cursor-pointer rounded-xl p-3 border transition-all flex items-center gap-3 ${
                            isSelected
                              ? "bg-emerald-500/10 border-emerald-500/60 text-white"
                              : "bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="activeRoleGlow"
                              className="absolute inset-0 bg-emerald-500/10 rounded-xl pointer-events-none"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}

                          <div
                            className={`p-2 rounded-lg border ${
                              isSelected
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-100">{role.label}</p>
                            <p className="text-[11px] text-slate-400">{role.desc}</p>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-emerald-400 bg-emerald-400" : "border-slate-700"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Input Field */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      disabled={loading}
                      required
                      className="w-full bg-slate-900/90 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={isFormValid && !loading ? { scale: 1.01 } : {}}
                  whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
                  disabled={!isFormValid || loading}
                  type="submit"
                  className={`w-full mt-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2 ${
                    isFormValid && !loading
                      ? "cursor-pointer opacity-100"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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