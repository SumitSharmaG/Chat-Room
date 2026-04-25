const Message = require("../models/Message");

module.exports = (io) => {
  let onlineCount = 0;

  io.on("connection", (socket) => {
    onlineCount++;
    io.emit("updateUserCount", onlineCount);

    // 1. Message Send & Receive
    socket.on("sendMessage", async (data) => {
      // Free version: agar backend model crash ho to bhi msg jaye isliye fallback ID
      const finalData = {
        ...data,
        id: data.id || "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
      };
      
      try {
        const msg = await Message.create(finalData);
        io.emit("receiveMessage", msg);
      } catch (err) {
        io.emit("receiveMessage", finalData);
      }
    });

    // 2. Typing Indicator
    socket.on("typing", (data) => {
      socket.broadcast.emit("displayTyping", data);
    });

    socket.on("stopTyping", () => {
      socket.broadcast.emit("removeTyping");
    });

    // 3. Seen Feature Signal
    socket.on("messageSeenUpdate", (data) => {
      io.emit("userSeenTheMessage", data);
    });

    socket.on("clearAllChat", () => {
      io.emit("chatCleared");
    });

    socket.on("disconnect", () => {
      onlineCount--;
      io.emit("updateUserCount", onlineCount);
      socket.broadcast.emit("removeTyping");
    });
  });
};
