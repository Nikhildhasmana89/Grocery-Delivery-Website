'use client';

import { motion, AnimatePresence } from "framer-motion";
import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import googleImage from "@/assets/google image.webp";
import { signIn, getSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import { UserThemeProvider } from "@/context/ThemeContext";

type PropType = {
  nextStep?: (s: number) => void;
  previousStep?: (s: number) => void;
};

export default function Login({ nextStep, previousStep }: PropType) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper function to resolve target route based on user state
  const getRedirectPath = (roleSelected?: boolean, role?: string) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "deliveryBoy":
        return "/delivery";
      case "user":
      default:
        return "/";
    }
  };

  const handleBack = () => {
    if (previousStep) {
      previousStep(1);
    } else {
      router.back();
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage("");
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setErrorMessage("Failed to connect with Google.");
      setGoogleLoading(false);
    }
  };

  // Credentials Login Handler
  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          setErrorMessage("Invalid email or password. Please try again.");
        } else {
          setErrorMessage(res.error);
        }
        setIsLoggedIn(false);
      } else if (res?.ok) {
        setIsLoggedIn(true);

        // Fetch fresh session token details
        const updatedSession = await getSession();
        const user = updatedSession?.user as any;

        console.log("Session User:", user);

        // Save user in Redux
        dispatch(
          setUserData({
            _id: user.id || user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            image: user.image,
          })
        );

        const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const callbackUrl = searchParams?.get("callbackUrl");

        const defaultPath = getRedirectPath(user?.roleSelected, user?.role);
        const targetPath = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : defaultPath;

        setTimeout(() => {
          router.replace(targetPath);
          router.refresh();
        }, 1200);
      }
    } catch (error: any) {
      setErrorMessage("Something went wrong. Please try again later.");
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Boolean(email.trim() && password);

  return (
    <UserThemeProvider>
      <div className="min-h-screen w-full p-4 relative overflow-hidden flex flex-col items-center justify-center font-sans">
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
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(16,185,129,0.1)] [scrollbar-width:none] [-ms-overflow-style:none]"
      >
        <AnimatePresence mode="wait">
          {isLoggedIn ? (
            <motion.div
              key="success-login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-10 flex flex-col items-center justify-center text-center space-y-4"
            >
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
              <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="login-form">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-emerald-500/20">
                  🛒
                </div>
              </div>
              <h1 className="text-2xl font-black text-center text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-center text-slate-400 text-xs mt-1 mb-5">
                Sign in to continue on FreshKart.
              </p>

              {errorMessage && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
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
                    disabled={loading || googleLoading}
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 text-white placeholder-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-xs disabled:opacity-50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || googleLoading}
                      className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 pr-12 text-white placeholder-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-xs disabled:opacity-50"
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

                <motion.button
                  whileHover={isFormValid && !loading && !googleLoading ? { scale: 1.01 } : {}}
                  whileTap={isFormValid && !loading && !googleLoading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={!isFormValid || loading || googleLoading}
                  className={`w-full mt-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs flex items-center justify-center gap-2 ${
                    isFormValid && !loading && !googleLoading
                      ? "cursor-pointer opacity-100"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </motion.button>
              </form>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-800"></div>
                <span className="mx-3 text-slate-500 text-[10px] font-semibold">
                  OR
                </span>
                <div className="flex-1 border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className={`w-full border border-slate-800 rounded-xl py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 transition-all flex items-center justify-center gap-2 ${
                  loading || googleLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                {googleLoading ? (
                  <span>Connecting to Google...</span>
                ) : (
                  <>
                    <Image
                      src={googleImage}
                      alt="Google Logo"
                      width={16}
                      height={16}
                      className="w-4 h-4 object-contain"
                    />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <p className="text-center text-slate-400 text-xs mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Create one
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </div>
    </UserThemeProvider>
  );
}