import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

const NEXT_BASE_URL =
  process.env.NEXT_BASE_URL || "http://127.0.0.1:3000";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.NEXT_BASE_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("================================");
  console.log("✅ New Client Connected");
  console.log("Socket ID:", socket.id);
  console.log("================================");

  // =========================
  // =========================
  // IDENTITY
  // =========================

  socket.on("identity", async (userId) => {
    try {
      console.log("📩 Identity Event Received");
      console.log("User ID:", userId);
      console.log("Socket ID:", socket.id);

      if (!userId) {
        console.log("❌ userId is undefined");
        return;
      }

      // Join user's personal room for persistent messaging
      socket.join(`user:${userId}`);

      const response = await axios.post(
        `${NEXT_BASE_URL}/api/socket/connect`,
        {
          userId,
          socketId: socket.id,
        }
      );

      console.log("✅ Database Updated");
      console.log(response.data);

      const userRole = response.data?.user?.role;
      if (
        userRole === "deliveryBoy" ||
        userRole === "deliveryboy" ||
        userRole === "delivery_boy"
      ) {
        socket.join("delivery-boys");
        console.log(`🛵 Socket ${socket.id} joined room "delivery-boys"`);
      }

      // Notify client that identity registration succeeded
      socket.emit("identity-confirmed", {
        success: true,
        userId,
        socketId: socket.id,
      });

      // Optional: notify other clients
      socket.broadcast.emit("deliveryBoy-online", {
        userId,
        socketId: socket.id,
      });
    } catch (error) {
      console.error(
        "❌ Error updating socket:",
        error.response?.data || error.message
      );

      socket.emit("identity-confirmed", {
        success: false,
        message: "Failed to register identity",
      });
    }
  });

  // =========================
  // UPDATE LOCATION
  // =========================

  socket.on(
    "update-location",
    async ({ userId, latitude, longitude }) => {
      try {
        console.log("📍 Update Location Event Received");
        console.log("User ID:", userId);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        if (!userId) {
          console.log("❌ userId missing");
          return;
        }

        if (
          latitude === undefined ||
          longitude === undefined
        ) {
          console.log("❌ Latitude or longitude missing");
          return;
        }

        const location = {
          type: "Point",
          coordinates: [longitude, latitude],
        };

        // Update database
        const response = await axios.post(
          `${NEXT_BASE_URL}/api/socket/update-location`,
          {
            userId,
            location,
          }
        );

        console.log("✅ Location updated");
        console.log(response.data);

        // =========================================
        // BROADCAST LOCATION
        // =========================================

        io.emit("update-deliveryBoy-location", {
          userId,
          location,
        });

        console.log(
          "📡 Location broadcasted to connected clients"
        );
      } catch (error) {
        console.error(
          "❌ Location update API error:",
          error.response?.data || error.message
        );
      }
    }
  );

  // =========================
  // CHAT ROOM EVENTS
  // =========================

  socket.on("join-room", (room) => {
    if (room) {
      socket.join(String(room));
      console.log(`💬 Socket ${socket.id} joined room "${room}"`);
    }
  });

  socket.on("leave-room", (room) => {
    if (room) {
      socket.leave(String(room));
      console.log(`💬 Socket ${socket.id} left room "${room}"`);
    }
  });

  socket.on("send-message", (data) => {
    if (data?.chatRoomId || data?.room) {
      const targetRoom = String(data.chatRoomId || data.room);
      io.to(targetRoom).emit("new-message", data.message || data);
      console.log(`💬 Socket message broadcasted to room "${targetRoom}"`);
    }
  });

  // =========================
  // DISCONNECT
  // =========================

  socket.on("disconnect", async (reason) => {
    console.log("❌ Client Disconnected:", socket.id);
    console.log("Reason:", reason);

    try {
      const response = await axios.post(
        `${NEXT_BASE_URL}/api/socket/disconnect`,
        {
          socketId: socket.id,
        }
      );

      console.log("✅ User marked offline");
      console.log(response.data);
    } catch (error) {
      console.error(
        "❌ Disconnect API Error:",
        error.response?.data || error.message
      );
    }
  });
});

// =========================
// NOTIFY
// =========================

app.post("/notify", (req, res) => {
  try {
    const { event, data, socketId, userId, room } = req.body;

    console.log("\n================================");
    console.log("📢 NOTIFICATION REQUEST");
    console.log("Event:", event);
    console.log("Target Room:", room);
    console.log("Target User ID:", userId);
    console.log("Socket ID:", socketId);
    console.log("Data:", data);
    console.log("================================");

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Event is required",
      });
    }

    // =========================================
    // SEND TO ROOM
    // =========================================
    if (room) {
      io.to(room).emit(event, data);
      console.log(`✅ Event "${event}" sent to room "${room}"`);
      return res.status(200).json({
        success: true,
        message: `Notification sent to room ${room}`,
        room,
        event,
      });
    }

    // =========================================
    // SEND TO USER ROOM
    // =========================================
    if (userId) {
      const userRoom = `user:${userId}`;
      io.to(userRoom).emit(event, data);
      console.log(`✅ Event "${event}" sent to user room "${userRoom}"`);
      return res.status(200).json({
        success: true,
        message: `Notification sent to user ${userId}`,
        userId,
        event,
      });
    }

    // =========================================
    // SEND TO SPECIFIC SOCKET
    // =========================================

    if (socketId) {
      const targetSocket =
        io.sockets.sockets.get(socketId);

      if (!targetSocket) {
        console.log(
          "⚠️ Socket not currently connected:",
          socketId
        );

        return res.status(200).json({
          success: true,
          delivered: false,
          message: "Socket is not currently connected",
          socketId,
        });
      }

      targetSocket.emit(event, data);

      console.log(
        `✅ Event "${event}" sent to socket ${socketId}`
      );

      return res.status(200).json({
        success: true,
        delivered: true,
        message: "Notification sent successfully",
        socketId,
        event,
      });
    }

    // =========================================
    // BROADCAST ALL
    // =========================================

    io.emit(event, data);

    console.log(
      `📢 Event "${event}" broadcasted`
    );

    return res.status(200).json({
      success: true,
      message: "Notification broadcasted",
      event,
    });
  } catch (error) {
    console.error("❌ Notify error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
    });
  }
});

// =========================
// HEALTH CHECK
// =========================

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Socket server is running",
  });
});

// =========================
// START SERVER
// =========================

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Socket Server Running on http://0.0.0.0:${PORT}`
  );
  console.log(
    `🔗 Next.js Server: ${NEXT_BASE_URL}`
  );
});