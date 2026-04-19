require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const socketHandler = require("./sockets/chat");

const app = express();
const server = http.createServer(app);

// DB connect
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// 🔥 Home route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Routes
app.use("/api", authRoutes);

// Socket setup
const io = new Server(server, {
  cors: { origin: "*" }
});

socketHandler(io);

// Server start
server.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
