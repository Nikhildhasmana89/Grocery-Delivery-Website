"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

interface GeoUpdateProps {
  userId: string;
}

export default function GeoUpdater({ userId }: GeoUpdateProps) {
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket(userId);

    const handleConnectError = (err: Error) => {
      console.error("❌ Connect Error:", err.message);
    };

    socket.on("connect_error", handleConnectError);

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");

      return () => {
        socket.off("connect_error", handleConnectError);
      };
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        console.log("📍 Location:", lat, lon);

        if (!socket.connected) {
          console.log("⚠️ Socket not connected");
          return;
        }

        socket.emit("update-location", {
          userId,
          latitude: lat,
          longitude: lon,
        });
      },
      (err) => {
        console.error("❌ Error getting location:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
      socket.off("connect_error", handleConnectError);

      // Don't disconnect the singleton socket.
    };
  }, [userId]);

  return null;
}