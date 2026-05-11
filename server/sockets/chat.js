const Message = require("../models/Message");
const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    
    socket.on("userJoined", (username) => {
      socket.username = username;
      if (!onlineUsers.has(username)) {
        onlineUsers.set(username, new Set([socket.id]));
      } else {
        onlineUsers.get(username).add(socket.id);
      }
      io.emit("updateUserCount", onlineUsers.size);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const msg = await Message.create(data);
        
        if (data.receiver === "world") {
          // Sabko bhej do
          io.emit("receiveMessage", msg);
        } else {
          // Sirf sender aur receiver ko bhej do
          const targetSockets = onlineUsers.get(data.receiver);
          const senderSockets = onlineUsers.get(data.username);
          
          if (targetSockets) targetSockets.forEach(id => io.to(id).emit("receiveMessage", msg));
          if (senderSockets) senderSockets.forEach(id => io.to(id).emit("receiveMessage", msg));
        }
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    socket.on("typing", (username) => {
      socket.broadcast.emit("userTyping", username);
    });

    socket.on("stopTyping", (username) => {
      socket.broadcast.emit("userStopTyping", username);
    });

    socket.on("messageSeen", async ({ messageId, username }) => {
      try {
        const msg = await Message.findById(messageId);
        if (msg && !msg.seenBy.includes(username)) {
          msg.seenBy.push(username);
          await msg.save();
          io.emit("updateSeen", { messageId, seenBy: msg.seenBy });
        }
      } catch (err) {}
    });

    socket.on("clearAllChat", async () => {
      try {
        await Message.deleteMany({});
        io.emit("chatCleared");
      } catch (err) {}
    });

    socket.on("disconnect", () => {
      const username = socket.username;
      if (username && onlineUsers.has(username)) {
        onlineUsers.get(username).delete(socket.id);
        if (onlineUsers.get(username).size === 0) onlineUsers.delete(username);
      }
      io.emit("updateUserCount", onlineUsers.size);
    });
  });
};
              
