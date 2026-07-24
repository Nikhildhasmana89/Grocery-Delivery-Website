'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import googleImage from "@/assets/google image.webp";
import axios from "axios";
import { signIn } from "next-auth/react";

type PropType = {
  previousStep?: (s: number) => void;
};

export default function RegisterForm({ previousStep }: PropType) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // Google Loading State
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  // Safe Navigation Handler
  const handleBack = () => {
    if (previousStep) {
      previousStep(1);
    } else {
      router.back(); // Fallback to browser back
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage("");
      await signIn("google", { callbackUrl: "/register" });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setErrorMessage("Failed to initialize Google Sign-In.");
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (mobile.trim() && !/^\d{10,15}$/.test(mobile.trim())) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        mobile,
        password,
      });

      console.log("Registration Successful:", response.data);
      setIsRegistered(true);

      setTimeout(() => {
        if (previousStep) {
          previousStep(1);
        } else {
          router.push("/login");
        }
      }, 3000);

    } catch (error: any) {
      const apiError = error.response?.data?.message || "Something went wrong. Please try again.";
      setErrorMessage(apiError);
      console.error("Registration Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.trim() && email.trim() && mobile.trim() && password && confirmPassword;

  return (
    <div className="min-h-screen w-full bg-[#07090E] p-4 text-white relative overflow-hidden flex flex-col items-center justify-center">
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
            backgroundSize: '24px 24px'
          }}
        />
      </div>

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

      {/* Main Form Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(16,185,129,0.1)] scrollbar-none"
      >
        <AnimatePresence mode="wait">
          {isRegistered ? (
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
                    opacity: [1, 1, 0] 
                  }}
                  transition={{ 
                    duration: 1.2, 
                    ease: "easeOut",
                    times: [0, 0.6, 1] 
                  }}
                  className="absolute h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg shadow-emerald-500/30"
                >
                  🛒
                </motion.div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 12 }}
                  className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="space-y-1"
              >
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Registered Successfully!
                </h2>
                <p className="text-slate-400 text-xs">Redirecting to login...</p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="registration-form">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-emerald-500/20">
                  🛒
                </div>
              </div>

              <h1 className="text-2xl font-black text-center text-white tracking-tight">
                Create Account
              </h1>

              <p className="text-center text-slate-400 text-xs mt-1 mb-4">
                Join FreshKart and start shopping fresh groceries.
              </p>

              {errorMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={googleLoading || loading}
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2 text-white placeholder-slate-600 outline-none focus:border-emerald-500 text-xs disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    disabled={googleLoading || loading}
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2 text-white placeholder-slate-600 outline-none focus:border-emerald-500 text-xs disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="1234567890"
                    disabled={googleLoading || loading}
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2 text-white placeholder-slate-600 outline-none focus:border-emerald-500 text-xs disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={googleLoading || loading}
                      className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2 pr-12 text-white placeholder-slate-600 outline-none focus:border-emerald-500 text-xs disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={googleLoading || loading}
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2 text-white placeholder-slate-600 outline-none focus:border-emerald-500 text-xs disabled:opacity-50"
                  />
                </div>

                <motion.button
                  whileHover={isFormValid && !loading && !googleLoading ? { scale: 1.01 } : {}}
                  whileTap={isFormValid && !loading && !googleLoading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={!isFormValid || loading || googleLoading}
                  className={`w-full mt-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2 ${
                    isFormValid && !loading && !googleLoading ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </form>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-800"></div>
                <span className="mx-3 text-slate-500 text-[10px] font-semibold">OR</span>
                <div className="flex-1 border-t border-slate-800"></div>
              </div>

              {/* Google Button with Animated Loading State */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className={`w-full border border-slate-800 rounded-xl py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 ${
                  googleLoading || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                {googleLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <Image src={googleImage} alt="Google Logo" width={16} height={16} className="w-4 h-4 object-contain" />
                    <span>Continue with Google</span>
                  </>
                )}
                </button>

              <p className="text-center text-slate-400 text-xs mt-3">
                Already have an account?{" "}
                {previousStep ? (
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    Login
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