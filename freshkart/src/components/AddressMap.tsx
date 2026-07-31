"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Locate, Loader2 } from "lucide-react";
import L from "leaflet";

// Fix default Leaflet marker icon paths
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper component to smoothly animate map view to new position
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
    }
  }, [lat, lng, map]);
  return null;
}

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
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={position.lat} lng={position.lng} />
        <Marker
          position={[position.lat, position.lng]}
          icon={defaultIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const newPos = marker.getLatLng();
              onMarkerDragEnd(newPos.lat, newPos.lng);
            },
          }}
        />
      </MapContainer>

      {/* Floating Circular GPS Locate Button (Blinkit / Google Maps Style) */}
      <button
        type="button"
        onClick={onLocateMe}
        disabled={isLocating}
        title="Re-center to Current Location"
        className="absolute top-4 right-4 z-[400] w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700/80 text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-400 shadow-xl shadow-black/50 backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 disabled:opacity-60"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Locate className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}