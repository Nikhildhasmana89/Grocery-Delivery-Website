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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

io.on("connection", (socket) => {
  console.log("================================");
  console.log("✅ New Client Connected");
  console.log("Socket ID:", socket.id);
  console.log("================================");

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

      const response = await axios.post(
        `${NEXT_BASE_URL}/api/socket/connect`,
        {
          userId,
          socketId: socket.id,
        }
      );

      console.log("✅ Database Updated");
      console.log(response.data);
    } catch (error) {
      console.error(
        "❌ Error updating socket:",
        error.response?.data || error.message
      );
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

        const response = await axios.post(
          `${NEXT_BASE_URL}/api/socket/update-location`,
          {
            userId,
            location,
          }
        );

        console.log("✅ Location updated");
        console.log(response.data);
      } catch (error) {
        console.error(
          "❌ Location update API error:",
          error.response?.data || error.message
        );
      }
    }
  );

  // =========================
  // DISCONNECT
  // =========================

  socket.on("disconnect", async () => {
    console.log("❌ Client Disconnected:", socket.id);

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
    const { event, data, socketId } = req.body;

    console.log("📢 Notification request");
    console.log("Event:", event);
    console.log("Socket ID:", socketId);

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Event is required",
      });
    }

    if (socketId) {
      io.to(socketId).emit(event, data);

      console.log(
        `✅ Event "${event}" sent to socket ${socketId}`
      );
    } else {
      io.emit(event, data);

      console.log(
        `📢 Event "${event}" broadcasted`
      );
    }

    return res.status(200).json({
      success: true,
      message: socketId
        ? "Notification sent to socket"
        : "Notification broadcasted",
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
// START SERVER
// =========================

server.listen(PORT, () => {
  console.log(
    `🚀 Socket Server Running on http://localhost:${PORT}`
  );

  console.log(
    `🔗 Next.js Server: ${NEXT_BASE_URL}`
  );
});