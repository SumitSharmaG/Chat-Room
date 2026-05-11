const Message = require("../models/Message"); 

// These stay outside the module.exports to persist across all socket connections
const onlineUsers = new Map(); 
const typingUsers = new Set();

module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ================== USER JOIN ==================
    socket.on("userJoined", (username) => {
      // Standardize username to avoid "Asheesh" vs "asheesh" issues
      const cleanName = username.toLowerCase();
      socket.username = cleanName;

      if (onlineUsers.has(cleanName)) {
        onlineUsers.get(cleanName).add(socket.id);
      } else {
        onlineUsers.set(cleanName, new Set([socket.id]));
      }

      console.log(`User Joined: ${cleanName} | Total Active: ${onlineUsers.size}`);
      emitOnlineUsers(io, onlineUsers);
    });

    socket.on("requestOnlineUsers", () => {
      emitOnlineUsers(io, onlineUsers);
    });

    // ================== SEND MESSAGE ==================
    socket.on("sendMessage", async (data) => {
      try {
        const msg = await Message.create(data);
        
        const receiverSockets = onlineUsers.get(data.receiver.toLowerCase());
        const senderSockets = onlineUsers.get(data.sender.toLowerCase());

        // Private Routing: Only send to the two parties involved
        if (receiverSockets) {
            receiverSockets.forEach(id => io.to(id).emit("receiveMessage", msg));
        }
        if (senderSockets) {
            senderSockets.forEach(id => io.to(id).emit("receiveMessage", msg));
        }

      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // ================== CONNECT REQUEST ==================
    socket.on("connectRequest", ({ from, to }) => {
      const receiverSockets = onlineUsers.get(to.toLowerCase());
      if (receiverSockets) {
        receiverSockets.forEach(id => io.to(id).emit("connectRequest", { from }));
      }
    });

    // ================== CONNECT RESPONSE ==================
    socket.on("connectResponse", ({ from, to, accepted }) => {
      const originalRequesterSockets = onlineUsers.get(to.toLowerCase());
      if (originalRequesterSockets) {
        originalRequesterSockets.forEach(id => {
            io.to(id).emit("connectResponse", { from, accepted });
        });
      }
    });

    // ================== TYPING & SEEN ==================
    socket.on("typing", (username) => {
      if (!typingUsers.has(username)) {
        typingUsers.add(username);
        socket.broadcast.emit("userTyping", username);
      }
    });

    socket.on("stopTyping", (username) => {
      if (typingUsers.has(username)) {
        typingUsers.delete(username);
        socket.broadcast.emit("userStopTyping", username);
      }
    });

    socket.on("messageSeen", async ({ messageId, username }) => {
      try {
        const msg = await Message.findById(messageId);
        if (msg) {
          if (!msg.seenBy) msg.seenBy = [];
          if (!msg.seenBy.includes(username)) {
            msg.seenBy.push(username);
            await msg.save();
          }
          io.emit("updateSeen", { messageId, seenBy: msg.seenBy });
        }
      } catch (err) { console.error(err); }
    });

    // ================== DISCONNECT ==================
    socket.on("disconnect", () => {
      const username = socket.username;

      if (username && onlineUsers.has(username)) {
        const set = onlineUsers.get(username);
        set.delete(socket.id);

        if (set.size === 0) {
          onlineUsers.delete(username);
        }
      }

      if (username && typingUsers.has(username)) {
        typingUsers.delete(username);
        socket.broadcast.emit("userStopTyping", username);
      }

      emitOnlineUsers(io, onlineUsers);
      console.log("User disconnected:", socket.id);
    });

    socket.on("clearAllChat", async () => {
      try {
        await Message.deleteMany({});
        io.emit("chatCleared");
      } catch (err) { console.error(err); }
    });
  });
};

// ================== HELPERS ==================
function emitOnlineUsers(io, onlineUsersMap) {
  if (!onlineUsersMap) return;
  // Convert Map keys to an array for the frontend to consume
  const users = Array.from(onlineUsersMap.keys());
  io.emit("onlineUsers", users);
}
