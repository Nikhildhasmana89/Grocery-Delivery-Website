import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const server = http.createServer(app);
const port = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("identity", (userId) => {
    console.log("User ID:", userId);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
}); // ✅ Missing closing brace and parenthesis

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});