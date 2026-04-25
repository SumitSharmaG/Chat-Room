const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("sendMessage", async (data) => {
      const msg = await Message.create(data);

      io.emit("receiveMessage", msg);
    });
  });
};
