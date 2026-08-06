"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix standard Leaflet marker icons breaking in Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AddressMapProps {
  position: { lat: number; lng: number };
  onMarkerDragEnd: (lat: number, lng: number) => void;
  onLocateMe: () => void;
  isLocating: boolean;
}

export default function AddressMap({
  position,
  onMarkerDragEnd,
  onLocateMe,
  isLocating,
}: AddressMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // 1. Initialize Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance before re-creating (protects against React Strict Mode)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current).setView([position.lat, position.lng], 15);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([position.lat, position.lng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", () => {
      const latLng = marker.getLatLng();
      onMarkerDragEnd(latLng.lat, latLng.lng);
    });

    // CRITICAL: Proper Cleanup on unmount/remount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // 2. Update view/marker when position prop changes externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([position.lat, position.lng], 15);
      markerRef.current.setLatLng([position.lat, position.lng]);
    }
  }, [position.lat, position.lng]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <button
        type="button"
        onClick={onLocateMe}
        disabled={isLocating}
        className="absolute top-3 right-3 z-[400] bg-slate-900/90 border border-slate-700 text-xs text-white px-3 py-2 rounded-xl shadow-md hover:bg-slate-800 transition-colors"
      >
        {isLocating ? "Locating..." : "📍 Locate Me"}
      </button>
    </div>
  );
}