"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

interface GeoUpdateProps {
  userId: string;
}

export default function GeoUpdater({ userId }: GeoUpdateProps) {
  const socket = getSocket();

  useEffect(() => {
    if (!userId) return;

    socket.on("connect", () => {
      console.log("✅ Connected");
      console.log("Socket ID:", socket.id);

      console.log("📤 Sending Identity:", userId);
      socket.emit("identity", userId);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connect Error:", err.message);
    });

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        console.log("📍 Location:", lat, lon);

        socket.emit("update-location", {
          userId,
          latitude: lat,
          longitude: lon,
        });
      },
      (err) => {
        console.error("Error getting location:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [userId]);

  return null;
}