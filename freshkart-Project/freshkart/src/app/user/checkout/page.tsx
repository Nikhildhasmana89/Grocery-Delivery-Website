"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Search,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Building,
  Home,
  Briefcase,
  Loader2,
  AlertCircle,
  CreditCard,
  Banknote,
  User,
  Phone,
  Sparkles,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { clearCart } from "@/redux/CardSlice";

// Dynamically import Map component with SSR disabled
const AddressMap = dynamic(() => import("@/components/AddressMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-500 text-xs gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
      <span>Loading Interactive Map...</span>
    </div>
  ),
});

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Extract Cart Data & User Info from Redux Store
  const cartData =
    useSelector(
      (state: RootState) => state.cart?.cartData || (state as any).card?.cardData
    ) || [];

  const currentUser = useSelector(
  (state: RootState) => (state as any).user?.user || (state as any).auth?.user
);
  const { data: session } = useSession();

console.log("Redux User:", currentUser);
console.log("Session User:", session?.user);

  // Form States
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [city, setCity] = useState("Delhi");
  const [stateName, setStateName] = useState("Delhi");
  const [pincode, setPincode] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [addressType, setAddressType] = useState<"home" | "work" | "other">("home");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online");
  
  // Map States
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.209,
  });
  const [address, setAddress] = useState<string>("Move marker or search location");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Status & Loading States
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const isProcessingRef = useRef(false);

  const orderRequestIdRef = useRef(
  typeof crypto !== "undefined" ? crypto.randomUUID() : ""
);

  // Reverse Geocoding
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        if (data.address) {
          if (data.address.city || data.address.town || data.address.state_district) {
            setCity(data.address.city || data.address.town || data.address.state_district || "Delhi");
          }
          if (data.address.state) setStateName(data.address.state);
          if (data.address.postcode) setPincode(data.address.postcode);
        }
      }
    } catch {
      setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    }
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    fetchAddress(lat, lng);
  };

  // Robust Geolocation Handler
  const handleLocateMe = () => {
    setErrorMessage("");
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        fetchAddress(newPos.lat, newPos.lng);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setErrorMessage("Location permission denied or timed out.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Search Location
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMessage("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=in&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const newPos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setPosition(newPos);
        setAddress(data[0].display_name);
      } else {
        setErrorMessage("Location not found.");
      }
    } catch {
      setErrorMessage("Failed to search location.");
    } finally {
      setIsSearching(false);
    }
  };

  // Pricing Calculation
  const subtotal = cartData.reduce((acc: number, item: any) => {
    const price = typeof item.price === "number" ? item.price : parseFloat(item.price) || 0;
    return acc + price;
  }, 0);
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryFee + tax;

  // Process Order API Integration (Supports Stripe & COD)
 const handlePlaceOrder = async () => {
  if (isProcessingRef.current) {
    return;
  }

  setErrorMessage("");

  if (!cartData.length) {
    setErrorMessage("Your cart is empty!");
    return;
  }

  isProcessingRef.current = true;
  setIsSubmitting(true);

    const formattedItems = cartData.map((item: any) => ({
      grocery: item._id,
      quantity: item.quantity || 1,
      name: item.name,
      price: String(item.price),
      image: item.image || "",
      unit: item.unit || "pcs",

    }));

    const fullAddressString = [houseNo, landmark, address].filter(Boolean).join(", ");
    console.log("Redux User:", currentUser);
console.log("Session User:", session?.user);
console.log("Redux User ID:", currentUser?._id);
console.log("Session User ID:", (session?.user as any)?.id);

   const orderPayload = {
  orderRequestId: orderRequestIdRef.current,

  userId: currentUser?._id || (session?.user as any)?.id,
  items: formattedItems,
  totalAmount: String(grandTotal),
  paymentMethod,
  address: {
    fullName: fullName || "Guest User",
    mobile: mobile || "0000000000",
    city: city || "Delhi",
    state: stateName || "Delhi",
    pincode: pincode || "000000",
    fullAddress: fullAddressString,
    latitude: position.lat,
    longitude: position.lng,
  },
  status: "pending",
};

    try {
      const res = await fetch("/api/user/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success) {
        dispatch(clearCart());

        if (paymentMethod === "online" && data.url) {
          // Redirect user directly to Stripe Checkout hosted page
          window.location.href = data.url;
        } else {
          // COD Success Modal
          setOrderSuccess(true);
        }
      } else {
        setErrorMessage(data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Order process error:", err);
      setErrorMessage("Something went wrong while connecting to the server.");
    } finally {
      isProcessingRef.current = false;
  setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      
      {/* Success Modal Overlay with Framer Motion */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full text-center space-y-5 shadow-2xl shadow-emerald-500/10"
            >
              <div className="relative w-20 h-20 mx-auto bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
                <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Order Confirmed!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your groceries are being packed and will be delivered in 10 minutes.
                </p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Back to Shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
          <Link
            href="/user/cart"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors group"
          >
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-emerald-500/40">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Back to Cart</span>
          </Link>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Truck className="w-4 h-4" />
            <span>10 Min Instant Delivery</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Map & Delivery Details */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Map Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Select Delivery Location
                </h2>
                <p className="text-xs text-slate-400">
                  Pin your exact building on the map for fast delivery
                </p>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Search Input Form */}
              <form onSubmit={handleSearchLocation} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search locality or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-24 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-[11px] font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-60"
                >
                  {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Search"}
                </button>
              </form>

              {/* Leaflet Dynamic Map Container */}
              <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <AddressMap
                  position={position}
                  onMarkerDragEnd={handleMarkerDragEnd}
                  onLocateMe={handleLocateMe}
                  isLocating={isLocating}
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl backdrop-blur-md z-10 pointer-events-none">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Pinned Address
                  </p>
                  <p className="text-xs font-semibold text-white line-clamp-1">
                    {address}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Details Form */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Receiver & Address Info
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Nikhil Dhasmana"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="10 digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    House / Flat / Block No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Block B"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 110001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Station / Park"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Tag Selection */}
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-2">
                  Save Address As
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { id: "home", label: "Home", icon: Home },
                    { id: "work", label: "Work", icon: Briefcase },
                    { id: "other", label: "Other", icon: Building },
                  ].map((tag) => {
                    const TagIcon = tag.icon;
                    const isActive = addressType === tag.id;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setAddressType(tag.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isActive
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <TagIcon className="w-3.5 h-3.5" />
                        <span>{tag.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Select Payment Mode
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    paymentMethod === "online"
                      ? "bg-emerald-500/10 border-emerald-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-5 h-5 ${paymentMethod === "online" ? "text-emerald-400" : "text-slate-500"}`} />
                    <div className="text-left">
                      <p className="text-xs font-bold">UPI / Cards / Net Banking (Stripe)</p>
                      <p className="text-[10px] text-slate-500">Instant & 100% Secure</p>
                    </div>
                  </div>
                  {paymentMethod === "online" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    paymentMethod === "cod"
                      ? "bg-emerald-500/10 border-emerald-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className={`w-5 h-5 ${paymentMethod === "cod" ? "text-emerald-400" : "text-slate-500"}`} />
                    <div className="text-left">
                      <p className="text-xs font-bold">Cash on Delivery</p>
                      <p className="text-[10px] text-slate-500">Pay at your doorstep</p>
                    </div>
                  </div>
                  {paymentMethod === "cod" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-xl space-y-5">
              <h2 className="text-base font-black text-white tracking-tight border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Payment Summary</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {cartData.length} Items
                </span>
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery Charge</span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-400">FREE</span>
                  ) : (
                    <span className="font-bold text-white">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Taxes & Service Charge</span>
                  <span className="font-bold text-white">₹{tax}</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400">To Pay</p>
                  <p className="text-[10px] text-slate-500">Inclusive of all taxes</p>
                </div>
                <p className="text-xl font-black text-emerald-400">₹{grandTotal}</p>
              </div>

              {/* Submit CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {paymentMethod === "online" ? "Proceed to Stripe Payment" : "Confirm COD Order"}
                    </span>
                  </>
                )}
              </motion.button>

              <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Safe & Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>10 Min Guaranteed</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}