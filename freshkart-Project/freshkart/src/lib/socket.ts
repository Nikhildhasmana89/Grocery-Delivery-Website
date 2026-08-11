import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUserId: string | null = null;

export const getSocket = (userId?: string): Socket => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!socketUrl) {
      throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined");
    }

    console.log("🔌 Connecting Socket.IO to:", socketUrl);

    socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      autoConnect: true,
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket Connected:", socket?.id);

      if (currentUserId) {
        console.log("📤 Sending identity:", currentUserId);
        socket?.emit("identity", currentUserId);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket Error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket Disconnected:", reason);
    });
  }

  if (userId) {
    currentUserId = userId;

    if (socket.connected) {
      console.log("📤 Sending identity:", userId);
      socket.emit("identity", userId);
    }
  }

  return socket;
};