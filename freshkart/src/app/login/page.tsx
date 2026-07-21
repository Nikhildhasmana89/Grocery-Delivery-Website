'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import googleImage from "@/assets/google image.webp";
import axios from "axios";

// 1. Added optional prop type support for multi-step flows
type PropType = {
  nextStep?: (s: number) => void;
  previousStep?: (s: number) => void;
};

export default function Login({ nextStep, previousStep }: PropType) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 2. Safe Back Button Navigation
  const handleBack = () => {
    if (previousStep) {
      previousStep(1);
    } else {
      router.back();
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      console.log("Login Successful:", response.data);

      setIsLoggedIn(true);

      // Redirect or advance step after 2s
      setTimeout(() => {
        if (nextStep) {
          nextStep(2);
        } else {
          router.push("/dashboard");
        }
      }, 2000);

    } catch (error: any) {
      const apiError =
        error.response?.data?.message || "Invalid email or password. Please try again.";
      setErrorMessage(apiError);
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() && password;

  return (
    <div className="min-h-screen w-full bg-[#07090E] p-4 text-white relative overflow-hidden flex flex-col items-center justify-center">
      {/* Back Button */}
      <motion.button
        type="button"
        onClick={handleBack}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-5 left-5 z-30 flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-700/60 px-4 py-2 text-slate-200 backdrop-blur-md hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </motion.button>

      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Form Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(16,185,129,0.1)] scrollbar-none"
      >
        <AnimatePresence mode="wait">
          {isLoggedIn ? (
            /* Success State Screen */
            <motion.div
              key="success-login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-10 flex flex-col items-center justify-center text-center space-y-4"
            >
              {/* Checkmark Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </motion.div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                Welcome Back!
              </h2>

              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Login successful. Redirecting to your dashboard...
              </p>

              {/* Progress Bar Indicator */}
              <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                />
              </div>
            </motion.div>
          ) : (
            /* Login Form View */
            <motion.div key="login-form">
              {/* Logo */}
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-emerald-500/20">
                  🛒
                </div>
              </div>

              <h1 className="text-2xl font-black text-center text-white tracking-tight">
                Welcome Back
              </h1>

              <p className="text-center text-slate-400 text-xs mt-1 mb-5">
                Sign in to continue shopping on FreshKart.
              </p>

              {/* Error Alert Display */}
              {errorMessage && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Email Field */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-xs"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-[10px] text-emerald-400 hover:underline font-medium"
                    >
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 pr-12 text-white placeholder-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-[11px] font-medium cursor-pointer select-none"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <motion.button
                  whileHover={isFormValid && !loading ? { scale: 1.01 } : {}}
                  whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={!isFormValid || loading}
                  className={`w-full mt-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs flex items-center justify-center gap-2 ${
                    isFormValid && !loading
                      ? "cursor-pointer opacity-100"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-slate-950"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-800"></div>
                <span className="mx-3 text-slate-500 text-[10px] font-semibold">
                  OR
                </span>
                <div className="flex-1 border-t border-slate-800"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                className="w-full border border-slate-800 rounded-xl py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Image
                  src={googleImage}
                  alt="Google Logo"
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
                <span>Continue with Google</span>
              </button>

              {/* Redirect to Register Page */}
              <p className="text-center text-slate-400 text-xs mt-4">
                Don&apos;t have an account?{" "}
                {nextStep ? (
                  <button
                    type="button"
                    onClick={() => nextStep(2)}
                    className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Create one
                  </button>
                ) : (
                  <Link
                    href="/register"
                    className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Create one
                  </Link>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}