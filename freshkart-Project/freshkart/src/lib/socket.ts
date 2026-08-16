import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentUserId: string | null = null;

export const getSocket = (
  userId?: string,
): Socket => {
  // --------------------------------------------
  // Keep latest user ID
  // --------------------------------------------

  if (userId) {
    currentUserId = String(userId);
  }

  // --------------------------------------------
  // Reuse existing singleton
  // --------------------------------------------

  if (socket) {
    return socket;
  }

  // --------------------------------------------
  // Socket URL
  // --------------------------------------------

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
    "http://localhost:4000";

  console.log(
    "🔌 Creating Socket.IO connection:",
    socketUrl,
  );

  // --------------------------------------------
  // CREATE SOCKET
  //
  // IMPORTANT:
  // autoConnect=false
  //
  // getSocket() DOES NOT call connect().
  // DeliveryBoy.tsx registers all listeners first,
  // then explicitly calls socket.connect().
  // --------------------------------------------

  socket = io(socketUrl, {
    transports: [
      "polling",
      "websocket",
    ],

    autoConnect: false,

    withCredentials: true,

    reconnection: true,

    reconnectionAttempts: Infinity,

    reconnectionDelay: 1000,

    reconnectionDelayMax: 5000,
  });

  // ============================================
  // SOCKET CONNECTED
  // ============================================

  socket.on("connect", () => {
    console.log(
      "========================================",
    );

    console.log(
      "🟢 SOCKET CONNECTED",
    );

    console.log(
      "Socket ID:",
      socket?.id,
    );

    console.log(
      "User ID:",
      currentUserId,
    );

    console.log(
      "========================================",
    );

    if (
      !currentUserId ||
      !socket?.id
    ) {
      console.warn(
        "⚠️ Cannot send identity:",
        {
          userId: currentUserId,
          socketId: socket?.id,
        },
      );

      return;
    }

    // ------------------------------------------
    // Identity is sent ONLY here.
    //
    // Do NOT send identity again from
    // DeliveryBoy.tsx.
    // ------------------------------------------

    console.log(
      "📤 Sending socket identity:",
      currentUserId,
    );

    socket.emit(
      "identity",
      currentUserId,
    );
  });

  // ============================================
  // IDENTITY CONFIRMED
  // ============================================

  socket.on(
    "identity-confirmed",
    (data) => {
      console.log(
        "🪪 SOCKET IDENTITY CONFIRMED:",
        data,
      );
    },
  );

  // ============================================
  // CONNECTION ERROR
  // ============================================

  socket.on(
    "connect_error",
    (error) => {
      console.error(
        "========================================",
      );

      console.error(
        "❌ SOCKET CONNECTION ERROR",
      );

      console.error(
        "Message:",
        error.message,
      );

      console.error(
        "URL:",
        socketUrl,
      );

      console.error(
        "========================================",
      );
    },
  );

  // ============================================
  // DISCONNECT
  // ============================================

  socket.on(
    "disconnect",
    (reason) => {
      console.log(
        "🔴 SOCKET DISCONNECTED:",
        reason,
      );

      console.log(
        "Socket ID:",
        socket?.id,
      );

      console.log(
        "User ID:",
        currentUserId,
      );
    },
  );

  // ============================================
  // RECONNECTING
  // ============================================

  socket.io.on(
    "reconnect_attempt",
    (attempt) => {
      console.log(
        "🔄 SOCKET RECONNECT ATTEMPT:",
        attempt,
      );
    },
  );

  socket.io.on(
    "reconnect",
    (attempt) => {
      console.log(
        "🟢 SOCKET RECONNECTED",
        {
          attempt,
          socketId: socket?.id,
          userId: currentUserId,
        },
      );
    },
  );

  socket.io.on(
    "reconnect_error",
    (error) => {
      console.error(
        "❌ SOCKET RECONNECT ERROR:",
        error,
      );
    },
  );

  return socket;
};

// ==================================================
// CONNECT SOCKET
// ==================================================

export const connectSocket = (
  userId?: string,
): Socket => {
  const currentSocket =
    getSocket(userId);

  if (userId) {
    currentUserId = String(userId);
  }

  if (!currentSocket.connected) {
    console.log(
      "🔌 Connecting Socket.IO...",
    );

    currentSocket.connect();
  } else {
    console.log(
      "🟢 Socket already connected:",
      currentSocket.id,
    );
  }

  return currentSocket;
};

// ==================================================
// DISCONNECT SOCKET
// ==================================================

export const disconnectSocket =
  (): void => {
    if (!socket) {
      return;
    }

    if (socket.connected) {
      console.log(
        "🔌 Disconnecting Socket.IO:",
        socket.id,
      );

      socket.disconnect();
    }
  };

// ==================================================
// GET CURRENT SOCKET
// ==================================================

export const getCurrentSocket =
  (): Socket | null => {
    return socket;
  };

// ==================================================
// GET CURRENT USER ID
// ==================================================

export const getCurrentSocketUserId =
  (): string | null => {
    return currentUserId;
  };