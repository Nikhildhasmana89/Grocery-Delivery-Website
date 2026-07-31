"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

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
  const cartData = useSelector(
    (state: RootState) => state.cart?.cartData || (state as any).card?.cardData
  ) || [];

  // Default Location: New Delhi / NCR
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.209,
  });

  const [address, setAddress] = useState<string>("Move marker or use current location");
  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");
  const [addressType, setAddressType] = useState<"home" | "work" | "other">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reverse Geocoding with custom User-Agent header
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
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
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage("Location permission denied. Please allow location access in browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setErrorMessage("Location request timed out. Please try again.");
            break;
          default:
            setErrorMessage("An unknown error occurred while retrieving location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Search Location with Nominatim API
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMessage("");
    try {
      // Searches prioritized for India (countrycodes=in)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=in&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const newPos = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        setPosition(newPos);
        setAddress(data[0].display_name);
      } else {
        setErrorMessage("Location not found. Please try searching with a city or landmark name.");
      }
    } catch {
      setErrorMessage("Failed to search location. Please check your network connection.");
    } finally {
      setIsSearching(false);
    }
  };

  // Pricing Math
  const subtotal = cartData.reduce((acc: number, item: any) => {
    const price = typeof item.price === "number" ? item.price : parseFloat(item.price) || 0;
    return acc + price;
  }, 0);
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryFee + tax;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
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
            <span>10 Min Delivery to Your Doorstep</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Map & Address Details */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Map Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Select Delivery Location
                </h2>
                <p className="text-xs text-slate-400">
                  Pin your exact building or house on the map for fast delivery
                </p>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Search Location Input Form */}
              <form onSubmit={handleSearchLocation} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search sector, locality, or landmark (e.g. Rohini, Noida...)"
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
                Complete Address Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    House / Flat / Block No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Block B"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Station"
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

              <button
                type="button"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Address & Proceed to Pay</span>
              </button>

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