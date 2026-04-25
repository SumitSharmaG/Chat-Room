const Message = require("../models/Message");

module.exports = (io) => {
  let onlineCount = 0;

  io.on("connection", (socket) => {
    onlineCount++;
    io.emit("updateUserCount", onlineCount);

    // 1. Message Handling
    socket.on("sendMessage", async (data) => {
      const msgWithId = {
        ...data,
        id: data.id || "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
      };

      // Pehle message sabko bhej do (Taaki screen par turant dikhe)
      io.emit("receiveMessage", msgWithId);

      // Background mein save karne ki koshish karo (Server crash nahi hoga)
      try {
        if (Message) {
          await Message.create(msgWithId);
        }
      } catch (err) {
        console.error("DB Save Error (Ignored for stability):", err.message);
      }
    });

    // 2. Typing Indicator
    socket.on("typing", (data) => {
      socket.broadcast.emit("displayTyping", data);
    });

    socket.on("stopTyping", () => {
      socket.broadcast.emit("removeTyping");
    });

    // 3. Seen Logic
    socket.on("messageSeenUpdate", (data) => {
      io.emit("userSeenTheMessage", data);
    });

    // 4. Clear Chat
    socket.on("clearAllChat", () => {
      io.emit("chatCleared");
    });

    socket.on("disconnect", () => {
      onlineCount--;
      io.emit("updateUserCount", onlineCount);
    });
  });
};
              
