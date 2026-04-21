require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const axios = require("axios"); // Axios add kiya ping ke liye
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

// 🔥 Home route
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

// 🛠️ --- SELF-PING LOGIC (KEEP-ALIVE) --- 🛠️
// Har 13 minute mein ye khud ko ping karega
const URL = `https://chat-backend-gtg5.onrender.com`; // Aapka Backend URL
setInterval(() => {
  axios.get(URL)
    .then(() => console.log("Ping successful: Keeping the server awake 🚀"))
    .catch((err) => console.error("Ping failed:", err.message));
}, 13 * 60 * 1000); // 13 minutes in milliseconds
// ------------------------------------------

// Server start
server.listen(process.env.PORT || 5000, () => {
  console.log("Server running and Keep-Alive active");
});
           
