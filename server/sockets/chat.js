const Message = require("../models/Message");

module.exports = (io) => {
  let onlineCount = 0;

  io.on("connection", (socket) => {
    onlineCount++;
    io.emit("updateUserCount", onlineCount);

    socket.on("sendMessage", async (data) => {
      const finalData = {
        ...data,
        id: data.id || "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
      };
      
      // Pehle broadcast karo taaki screen par turant dikhe
      io.emit("receiveMessage", finalData);

      // Save to DB (Only if not a system alert)
      try {
        if (Message && data.username !== "SYSTEM") {
          await Message.create(finalData);
        }
      } catch (err) {
        console.log("DB Storage skipped/error:", err.message);
      }
    });

    socket.on("typing", (data) => socket.broadcast.emit("displayTyping", data));
    socket.on("stopTyping", () => socket.broadcast.emit("removeTyping"));
    socket.on("messageSeenUpdate", (data) => io.emit("userSeenTheMessage", data));
    socket.on("clearAllChat", () => io.emit("chatCleared"));

    socket.on("disconnect", () => {
      onlineCount--;
      io.emit("updateUserCount", onlineCount);
    });
  });
};
