import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("================================");
  console.log("✅ New Client Connected");
  console.log("Socket ID:", socket.id);
  console.log("================================");

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
        `${process.env.NEXT_BASE_URL}/api/socket/connect`,
        {
          userId,
          socketId: socket.id,
        }
      );

      console.log("✅ Database Updated");
      console.log(response.data);
    } catch (error) {
      console.error("❌ Error updating socket:", error.response?.data || error.message);
    }
  });

  socket.on("update-location",({userId,latitude,longitude})=>{
    console.log("📩 Update Location Event Received");
    console.log("User ID:", userId);
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
  });

  socket.on("disconnect", async () => {
    console.log("❌ Client Disconnected:", socket.id);

    try {
      await axios.post(
        `${process.env.NEXT_BASE_URL}/api/socket/disconnect`,
        {
          socketId: socket.id,
        }
      );
    } catch (error) {
      console.log("Disconnect API Error:", error.response?.data || error.message);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket Server Running on http://localhost:${PORT}`);
});